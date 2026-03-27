const fetch = require('node-fetch');

const API_BASE = 'https://api.telegram.org/bot';

class TelegramBot {
  constructor(token, chatId) {
    this.token = token;
    this.chatId = chatId;
    this.base = `${API_BASE}${token}`;
  }

  async call(method, body = {}) {
    try {
      const res = await fetch(`${this.base}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) {
        console.error(`[telegram] ${method} failed:`, data.description);
        return { success: false, error: data.description };
      }
      return { success: true, data: data.result };
    } catch (err) {
      console.error(`[telegram] ${method} error:`, err.message);
      return { success: false, error: err.message };
    }
  }

  async sendMessage(text, options = {}) {
    return this.call('sendMessage', {
      chat_id: this.chatId,
      text,
      parse_mode: 'HTML',
      ...options,
    });
  }

  async sendAlert(campaign) {
    const roiStr = campaign.roi != null ? campaign.roi.toFixed(1) : '0.0';
    const text =
      `🔴 <b>ALERT:</b> "${campaign.campaign_name}" ROI dropped to ${roiStr}%\n` +
      `Threshold: ${campaign.threshold}%\n\n` +
      `Spend: $${fmt(campaign.cost)} | Revenue: $${fmt(campaign.revenue)}\n` +
      `Profit: $${fmt(campaign.profit)} | EPC: $${fmt(campaign.epc)}`;

    const keyboard = {
      inline_keyboard: [[
        { text: '⏸ Pause', callback_data: `pause:${campaign.meta_campaign_id || campaign.campaign_id}` },
        { text: '😴 Snooze 1hr', callback_data: `snooze:${campaign.campaign_id}` },
        { text: '✖ Ignore', callback_data: `ignore:${campaign.campaign_id}` },
      ]],
    };

    return this.sendMessage(text, { reply_markup: keyboard });
  }

  async sendStatus(campaigns) {
    if (!campaigns.length) return this.sendMessage('No active campaigns found.');

    const lines = campaigns.map((c) => {
      const emoji = c.status === 'ACTIVE' ? '🟢' : c.status === 'PAUSED' ? '🟡' : '⚪';
      const roi = c.roi != null ? `${c.roi.toFixed(1)}%` : 'N/A';
      return `${emoji} <b>${c.campaign_name}</b>\n   Spend: $${fmt(c.spend)} | ROI: ${roi}`;
    });

    return this.sendMessage(`📊 <b>Campaign Status</b>\n\n${lines.join('\n\n')}`);
  }

  async sendSummary(summary) {
    const text =
      `📋 <b>Daily Summary</b>\n\n` +
      `Total Spend: $${fmt(summary.total_spend)}\n` +
      `Total Revenue: $${fmt(summary.total_revenue)}\n` +
      `Total Profit: $${fmt(summary.total_profit)}\n` +
      `Blended ROI: ${summary.blended_roi?.toFixed(1) || '0.0'}%\n\n` +
      (summary.top_performer
        ? `🏆 Top Performer: "${summary.top_performer.name}" — $${fmt(summary.top_performer.profit)} profit`
        : 'No campaign data yet.');

    return this.sendMessage(text);
  }

  async answerCallbackQuery(callbackQueryId, text) {
    return this.call('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
    });
  }

  async editMessageText(messageId, text) {
    return this.call('editMessageText', {
      chat_id: this.chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
    });
  }

  async registerWebhook(url) {
    return this.call('setWebhook', { url });
  }

  async deleteWebhook() {
    return this.call('deleteWebhook');
  }
}

function fmt(n) {
  if (n == null) return '0.00';
  return Number(n).toFixed(2);
}

module.exports = TelegramBot;
