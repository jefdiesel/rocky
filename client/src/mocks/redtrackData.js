export function getMockRedtrackCampaigns() {
  return {
    _mock: true,
    data: [
      { campaign_id: 'rt_001', campaign_name: 'Summer Sale - Traffic', clicks: 8420, conversions: 312, revenue: 9360, cost: 5840.50, profit: 3519.50, roi: 60.3, epc: 1.11 },
      { campaign_id: 'rt_002', campaign_name: 'Brand Awareness Q1', clicks: 15200, conversions: 89, revenue: 2670, cost: 4800, profit: -2130, roi: -44.4, epc: 0.18 },
      { campaign_id: 'rt_003', campaign_name: 'Retargeting - Warm', clicks: 3100, conversions: 245, revenue: 12250, cost: 2100, profit: 10150, roi: 483.3, epc: 3.95 },
      { campaign_id: 'rt_004', campaign_name: 'Lead Gen - Webinar', clicks: 5600, conversions: 420, revenue: 4200, cost: 3200, profit: 1000, roi: 31.3, epc: 0.75 },
      { campaign_id: 'rt_005', campaign_name: 'Holiday Push - DTC', clicks: 12800, conversions: 580, revenue: 23200, cost: 8500, profit: 14700, roi: 172.9, epc: 1.81 },
      { campaign_id: 'rt_006', campaign_name: 'App Install iOS', clicks: 6200, conversions: 890, revenue: 3560, cost: 4120, profit: -560, roi: -13.6, epc: 0.57 },
    ],
  };
}

export function getMockAlertHistory() {
  return {
    _mock: true,
    data: [
      { id: '1', campaign_id: 'rt_002', campaign_name: 'Brand Awareness Q1', roi: -44.4, threshold: 25, action: 'paused', created_at: '2026-03-26T14:30:00Z' },
      { id: '2', campaign_id: 'rt_006', campaign_name: 'App Install iOS', roi: -13.6, threshold: 25, action: 'snoozed', created_at: '2026-03-26T16:00:00Z' },
      { id: '3', campaign_id: 'rt_002', campaign_name: 'Brand Awareness Q1', roi: -38.2, threshold: 25, action: 'ignored', created_at: '2026-03-25T10:15:00Z' },
    ],
  };
}

export function getMockSnoozeState() {
  return {
    _mock: true,
    data: [
      { id: '1', campaign_id: 'rt_006', campaign_name: 'App Install iOS', snoozed_until: new Date(Date.now() + 3600000).toISOString() },
    ],
  };
}

export function getMockBotConfig() {
  return {
    _mock: true,
    data: {
      telegram_token_set: false,
      telegram_chat_id: '',
      redtrack_api_key_set: false,
      roi_threshold: 25,
    },
  };
}

export function getMockRedtrackMappings() {
  return {
    _mock: true,
    data: [
      { id: '1', redtrack_campaign_name: 'Summer Sale - Traffic', meta_campaign_id: 'mock_camp_1', meta_campaign_name: 'Summer Sale 2026' },
      { id: '2', redtrack_campaign_name: 'Retargeting - Warm', meta_campaign_id: 'mock_camp_3', meta_campaign_name: 'Retargeting Hot Audiences' },
    ],
  };
}
