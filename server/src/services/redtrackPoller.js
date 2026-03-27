const cron = require('node-cron');
const RedTrackAPI = require('./redtrack');
const TelegramBot = require('./telegram');
const supabase = require('./supabase');

let isRunning = false;

async function pollRedTrack() {
  if (isRunning) return;
  isRunning = true;

  try {
    const apiKey = process.env.REDTRACK_API_KEY;
    if (!apiKey || !supabase) return;

    console.log('[poller] Syncing RedTrack data...');
    const rt = new RedTrackAPI(apiKey);
    const result = await rt.getCampaigns();

    if (!result.success) {
      console.error('[poller] RedTrack fetch failed:', result.error.message);
      return;
    }

    const rows = RedTrackAPI.normalize(result.data);
    if (rows.length === 0) return;

    // Upsert into cache
    const { error } = await supabase.from('redtrack_cache').insert(
      rows.map((r) => ({
        campaign_id: r.campaign_id,
        campaign_name: r.campaign_name,
        epc: r.epc,
        roi: r.roi,
        profit: r.profit,
        clicks: r.clicks,
        conversions: r.conversions,
        revenue: r.revenue,
        cost: r.cost,
      }))
    );

    if (error) console.error('[poller] Cache insert error:', error.message);
    else console.log(`[poller] Cached ${rows.length} RedTrack campaigns`);

    // Check ROI alerts
    await checkAlerts(rows);
  } catch (err) {
    console.error('[poller] Error:', err.message);
  } finally {
    isRunning = false;
  }
}

async function checkAlerts(rows) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const threshold = parseFloat(process.env.ROI_ALERT_THRESHOLD || '25');

  if (!botToken || !chatId || !supabase) return;

  const bot = new TelegramBot(botToken, chatId);

  // Get snoozed campaigns
  const { data: snoozed } = await supabase
    .from('snooze_state')
    .select('campaign_id, snoozed_until');

  const snoozedIds = new Set();
  for (const s of (snoozed || [])) {
    if (new Date(s.snoozed_until) > new Date()) {
      snoozedIds.add(s.campaign_id);
    }
  }

  // Get campaign mappings to find Meta campaign IDs
  const { data: mappings } = await supabase.from('campaign_mapping').select('*');
  const mappingByRT = {};
  for (const m of (mappings || [])) {
    mappingByRT[m.redtrack_campaign_name] = m.meta_campaign_id;
  }

  for (const row of rows) {
    if (snoozedIds.has(row.campaign_id)) continue;
    if (row.roi < threshold && row.cost > 0) {
      const metaCampaignId = mappingByRT[row.campaign_name] || row.campaign_id;

      const result = await bot.sendAlert({
        ...row,
        threshold,
        meta_campaign_id: metaCampaignId,
      });

      // Log alert
      if (result.success) {
        await supabase.from('alert_history').insert({
          campaign_id: row.campaign_id,
          campaign_name: row.campaign_name,
          roi: row.roi,
          threshold,
          action: 'pending',
          telegram_message_id: result.data?.message_id?.toString() || null,
        });
      }
    }
  }
}

function startPolling() {
  if (!process.env.REDTRACK_API_KEY) {
    console.log('[poller] REDTRACK_API_KEY not set — polling disabled');
    return;
  }

  // Run immediately on startup
  pollRedTrack();

  // Then every 15 minutes
  cron.schedule('*/15 * * * *', pollRedTrack);
  console.log('[poller] RedTrack polling started (every 15 min)');
}

module.exports = { startPolling, pollRedTrack };
