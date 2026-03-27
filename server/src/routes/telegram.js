const { Router } = require('express');
const TelegramBot = require('../services/telegram');
const MetaAPI = require('../services/meta');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');
const { decrypt } = require('../services/crypto');

const router = Router();

// ── POST /telegram/webhook — Receive Telegram updates (NO auth — from Telegram) ─
router.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    if (!update) return res.sendStatus(200);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return res.sendStatus(200);

    const bot = new TelegramBot(botToken, chatId);

    // Handle callback queries (inline keyboard buttons)
    if (update.callback_query) {
      const { id: queryId, data, message } = update.callback_query;
      const [action, campaignId] = (data || '').split(':');

      if (action === 'pause' && campaignId) {
        await handlePause(bot, campaignId, queryId, message?.message_id);
      } else if (action === 'snooze' && campaignId) {
        await handleSnooze(bot, campaignId, queryId, message?.message_id);
      } else if (action === 'ignore' && campaignId) {
        await handleIgnore(bot, campaignId, queryId, message?.message_id);
      }

      return res.sendStatus(200);
    }

    // Handle text commands
    if (update.message?.text) {
      const text = update.message.text.trim().toLowerCase();

      if (text === 'status' || text === '/status') {
        await handleStatusCommand(bot);
      } else if (text === 'summary' || text === '/summary') {
        await handleSummaryCommand(bot);
      } else if (text.startsWith('pause ') || text.startsWith('/pause ')) {
        const name = text.replace(/^\/?pause\s+/, '');
        await handlePauseByName(bot, name);
      } else if (text.startsWith('resume ') || text.startsWith('/resume ')) {
        const name = text.replace(/^\/?resume\s+/, '');
        await handleResumeByName(bot, name);
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('[telegram] Webhook error:', err.message);
    return res.sendStatus(200); // Always 200 to Telegram
  }
});

// ── GET /telegram/status — Check bot connection ──────────────────────────────
router.get('/status', verifyToken, async (req, res) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return res.json({ data: { connected: false, reason: 'TELEGRAM_BOT_TOKEN not set' } });

  try {
    const bot = new TelegramBot(botToken, '');
    const result = await bot.call('getMe');
    return res.json({ data: { connected: result.success, bot: result.data || null } });
  } catch (err) {
    return res.json({ data: { connected: false, reason: err.message } });
  }
});

// ── POST /telegram/test — Send test alert ────────────────────────────────────
router.post('/test', verifyToken, async (req, res) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return res.status(503).json({ error: 'Telegram not configured.' });

  const bot = new TelegramBot(botToken, chatId);
  const result = await bot.sendMessage('✅ <b>Test Alert</b>\n\nRemi is connected and working.');
  return res.json({ data: { sent: result.success } });
});

// ── Handlers ─────────────────────────────────────────────────────────────────

async function handlePause(bot, campaignId, queryId, messageId) {
  try {
    // Find a user with access token to make the Meta API call
    const user = await getFirstUser();
    if (!user) {
      await bot.answerCallbackQuery(queryId, 'No authenticated user found.');
      return;
    }

    const meta = new MetaAPI(decrypt(user.access_token));
    const result = await meta.updateCampaign(campaignId, { status: 'PAUSED' });

    if (result.success) {
      await bot.answerCallbackQuery(queryId, 'Campaign paused!');
      if (messageId) await bot.editMessageText(messageId, `⏸ <b>PAUSED</b> — Campaign ${campaignId} has been paused.`);
      await logAlert(campaignId, null, null, null, 'paused');
    } else {
      await bot.answerCallbackQuery(queryId, 'Failed to pause: ' + (result.error?.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('[telegram] Pause error:', err.message);
    await bot.answerCallbackQuery(queryId, 'Error pausing campaign.');
  }
}

async function handleSnooze(bot, campaignId, queryId, messageId) {
  try {
    const snoozedUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    if (supabase) {
      await supabase.from('snooze_state').upsert({
        campaign_id: campaignId,
        snoozed_until: snoozedUntil.toISOString(),
      }, { onConflict: 'campaign_id' });
    }

    await bot.answerCallbackQuery(queryId, 'Snoozed for 1 hour.');
    if (messageId) await bot.editMessageText(messageId, `😴 <b>SNOOZED</b> — Alerts for ${campaignId} suppressed until ${snoozedUntil.toLocaleTimeString()}.`);
    await logAlert(campaignId, null, null, null, 'snoozed');
  } catch (err) {
    console.error('[telegram] Snooze error:', err.message);
    await bot.answerCallbackQuery(queryId, 'Error snoozing.');
  }
}

async function handleIgnore(bot, campaignId, queryId, messageId) {
  await bot.answerCallbackQuery(queryId, 'Alert dismissed.');
  if (messageId) await bot.editMessageText(messageId, `✖ <b>IGNORED</b> — Alert for ${campaignId} dismissed.`);
  await logAlert(campaignId, null, null, null, 'ignored');
}

async function handleStatusCommand(bot) {
  try {
    if (!supabase) return bot.sendMessage('Database unavailable.');

    const { data: cache } = await supabase.from('redtrack_cache').select('*').order('synced_at', { ascending: false }).limit(50);
    const seen = new Set();
    const campaigns = [];
    for (const row of (cache || [])) {
      if (!seen.has(row.campaign_id)) {
        seen.add(row.campaign_id);
        campaigns.push({
          campaign_name: row.campaign_name || row.campaign_id,
          spend: row.cost,
          roi: row.roi,
          status: 'ACTIVE',
        });
      }
    }

    await bot.sendStatus(campaigns);
  } catch (err) {
    console.error('[telegram] Status command error:', err.message);
    await bot.sendMessage('Failed to fetch status.');
  }
}

async function handleSummaryCommand(bot) {
  try {
    if (!supabase) return bot.sendMessage('Database unavailable.');

    const { data: cache } = await supabase.from('redtrack_cache').select('*').order('synced_at', { ascending: false }).limit(50);
    const seen = new Set();
    let totalSpend = 0, totalRevenue = 0, totalProfit = 0;
    let topProfit = -Infinity, topName = null;

    for (const row of (cache || [])) {
      if (!seen.has(row.campaign_id)) {
        seen.add(row.campaign_id);
        totalSpend += Number(row.cost || 0);
        totalRevenue += Number(row.revenue || 0);
        totalProfit += Number(row.profit || 0);
        if (Number(row.profit || 0) > topProfit) {
          topProfit = Number(row.profit || 0);
          topName = row.campaign_name || row.campaign_id;
        }
      }
    }

    await bot.sendSummary({
      total_spend: totalSpend,
      total_revenue: totalRevenue,
      total_profit: totalProfit,
      blended_roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0,
      top_performer: topName ? { name: topName, profit: topProfit } : null,
    });
  } catch (err) {
    console.error('[telegram] Summary command error:', err.message);
    await bot.sendMessage('Failed to generate summary.');
  }
}

async function handlePauseByName(bot, name) {
  try {
    const user = await getFirstUser();
    if (!user) return bot.sendMessage('No authenticated user found.');

    const meta = new MetaAPI(decrypt(user.access_token));
    // Search campaigns by name
    const accountId = await getFirstAccountId(user.id);
    if (!accountId) return bot.sendMessage('No ad account found.');

    const campResult = await meta.getCampaigns(accountId);
    if (!campResult.success) return bot.sendMessage('Failed to fetch campaigns.');

    const campaigns = campResult.data?.data || [];
    const match = campaigns.find((c) => c.name.toLowerCase().includes(name));
    if (!match) return bot.sendMessage(`No campaign matching "${name}" found.`);

    const result = await meta.updateCampaign(match.id, { status: 'PAUSED' });
    if (result.success) {
      await bot.sendMessage(`⏸ <b>PAUSED</b>: "${match.name}"`);
    } else {
      await bot.sendMessage(`Failed to pause "${match.name}": ${result.error?.message}`);
    }
  } catch (err) {
    await bot.sendMessage('Error pausing campaign.');
  }
}

async function handleResumeByName(bot, name) {
  try {
    const user = await getFirstUser();
    if (!user) return bot.sendMessage('No authenticated user found.');

    const meta = new MetaAPI(decrypt(user.access_token));
    const accountId = await getFirstAccountId(user.id);
    if (!accountId) return bot.sendMessage('No ad account found.');

    const campResult = await meta.getCampaigns(accountId);
    if (!campResult.success) return bot.sendMessage('Failed to fetch campaigns.');

    const campaigns = campResult.data?.data || [];
    const match = campaigns.find((c) => c.name.toLowerCase().includes(name));
    if (!match) return bot.sendMessage(`No campaign matching "${name}" found.`);

    const result = await meta.updateCampaign(match.id, { status: 'ACTIVE' });
    if (result.success) {
      await bot.sendMessage(`▶️ <b>RESUMED</b>: "${match.name}"`);
    } else {
      await bot.sendMessage(`Failed to resume "${match.name}": ${result.error?.message}`);
    }
  } catch (err) {
    await bot.sendMessage('Error resuming campaign.');
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getFirstUser() {
  if (!supabase) return null;
  const { data } = await supabase.from('users').select('id, access_token').not('access_token', 'is', null).limit(1).single();
  return data;
}

async function getFirstAccountId(userId) {
  if (!supabase) return null;
  const { data } = await supabase.from('ad_accounts').select('account_id').eq('user_id', userId).limit(1).single();
  return data?.account_id ? (data.account_id.startsWith('act_') ? data.account_id : `act_${data.account_id}`) : null;
}

async function logAlert(campaignId, campaignName, roi, threshold, action) {
  if (!supabase) return;
  try {
    await supabase.from('alert_history').insert({
      campaign_id: campaignId,
      campaign_name: campaignName,
      roi, threshold, action,
    });
  } catch {}
}

module.exports = router;
