import { subDays, format } from 'date-fns';

function generateTimeSeries(days = 30) {
  const data = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const baseSpend = 800 + Math.random() * 400;
    const baseConversions = 40 + Math.random() * 30;
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      dateLabel: format(date, 'MMM d'),
      spend: Math.round(baseSpend * 100) / 100,
      impressions: Math.round(baseSpend * 85 + Math.random() * 5000),
      reach: Math.round(baseSpend * 60 + Math.random() * 3000),
      clicks: Math.round(baseSpend * 1.2 + Math.random() * 100),
      conversions: Math.round(baseConversions),
      revenue: Math.round(baseConversions * 45 + Math.random() * 500),
    });
  }
  return data;
}

export function getMockKPIs() {
  return {
    _mock: true,
    spend: 28456.78,
    impressions: 2345678,
    reach: 1876543,
    cpm: 12.12,
    ctr: 1.87,
    cpc: 0.65,
    clicks: 43780,
    conversions: 1234,
    cpa: 23.06,
    roas: 4.32,
    revenue: 122890.50,
    frequency: 1.25,
    spendTrend: 8.3,
    impressionsTrend: 12.1,
    reachTrend: 5.7,
    cpmTrend: -2.3,
    ctrTrend: 3.4,
    cpcTrend: -5.1,
    conversionsTrend: 15.2,
    cpaTrend: -8.6,
    roasTrend: 6.8,
  };
}

export function getMockTimeSeries() {
  return { _mock: true, data: generateTimeSeries(30) };
}

export function getMockCampaignBreakdown() {
  return {
    _mock: true,
    data: [
      { id: '1', name: 'Summer Sale - Conversions', objective: 'Sales', status: 'ACTIVE', spend: 8456.32, impressions: 654321, clicks: 12345, conversions: 456, cpa: 18.54, roas: 5.21, ctr: 1.89, cpm: 12.92 },
      { id: '2', name: 'Brand Awareness Q1', objective: 'Awareness', status: 'ACTIVE', spend: 5234.10, impressions: 987654, clicks: 8765, conversions: 123, cpa: 42.56, roas: 2.34, ctr: 0.89, cpm: 5.30 },
      { id: '3', name: 'Retargeting - Cart Abandoners', objective: 'Sales', status: 'ACTIVE', spend: 3421.56, impressions: 234567, clicks: 6789, conversions: 345, cpa: 9.92, roas: 8.76, ctr: 2.89, cpm: 14.59 },
      { id: '4', name: 'Lead Gen - Whitepaper', objective: 'Leads', status: 'PAUSED', spend: 2345.80, impressions: 345678, clicks: 4567, conversions: 210, cpa: 11.17, roas: 3.45, ctr: 1.32, cpm: 6.79 },
      { id: '5', name: 'App Install - iOS', objective: 'App Promotion', status: 'ACTIVE', spend: 4567.00, impressions: 567890, clicks: 7890, conversions: 89, cpa: 51.31, roas: 1.87, ctr: 1.39, cpm: 8.04 },
      { id: '6', name: 'Holiday Promo 2025', objective: 'Sales', status: 'DELETED', spend: 1234.00, impressions: 123456, clicks: 2345, conversions: 67, cpa: 18.42, roas: 4.10, ctr: 1.90, cpm: 10.00 },
    ],
  };
}

export function getMockPlatformSplit() {
  return {
    _mock: true,
    data: [
      { name: 'Facebook', value: 18234.56, fill: '#1877F2' },
      { name: 'Instagram', value: 10222.22, fill: '#E4405F' },
    ],
  };
}

export function getMockPlacementBreakdown() {
  return {
    _mock: true,
    data: [
      { placement: 'Feed', spend: 12345.67, impressions: 987654, ctr: 2.1, cpa: 19.50 },
      { placement: 'Stories', spend: 6789.01, impressions: 543210, ctr: 1.8, cpa: 22.30 },
      { placement: 'Reels', spend: 4567.89, impressions: 345678, ctr: 2.5, cpa: 17.80 },
      { placement: 'Explore', spend: 2345.67, impressions: 234567, ctr: 1.3, cpa: 28.90 },
      { placement: 'Audience Network', spend: 1234.56, impressions: 123456, ctr: 0.8, cpa: 35.60 },
      { placement: 'Right Column', spend: 678.90, impressions: 98765, ctr: 0.5, cpa: 45.20 },
    ],
  };
}

export function getMockFrequencyData() {
  return {
    _mock: true,
    data: [
      { id: 'as1', name: 'Summer Sale - Broad', frequency: 1.8, reach: 234567, impressions: 421421 },
      { id: 'as2', name: 'Summer Sale - Lookalike', frequency: 2.4, reach: 123456, impressions: 296294 },
      { id: 'as3', name: 'Retarget - Website Visitors', frequency: 4.2, reach: 34567, impressions: 145181 },
      { id: 'as4', name: 'Retarget - Cart Abandon', frequency: 5.1, reach: 12345, impressions: 62960 },
      { id: 'as5', name: 'Brand - Interest Stack', frequency: 1.3, reach: 456789, impressions: 593826 },
      { id: 'as6', name: 'Lead Gen - Custom Audience', frequency: 3.5, reach: 23456, impressions: 82096 },
    ],
  };
}

export function getMockPacingData() {
  return {
    _mock: true,
    data: [
      { name: 'Summer Sale', budgetCap: 15000, actualSpend: 8456.32, projectedSpend: 14200, daysElapsed: 18, totalDays: 30 },
      { name: 'Brand Awareness', budgetCap: 10000, actualSpend: 5234.10, projectedSpend: 8700, daysElapsed: 18, totalDays: 30 },
      { name: 'Retargeting', budgetCap: 5000, actualSpend: 3421.56, projectedSpend: 5700, daysElapsed: 18, totalDays: 30 },
    ],
  };
}

export function getMockAccounts() {
  return {
    _mock: true,
    data: [
      { id: 'act_123456789', name: 'Rocky Main Account', currency: 'USD', timezone: 'America/New_York', status: 1 },
      { id: 'act_987654321', name: 'Rocky EU Account', currency: 'EUR', timezone: 'Europe/London', status: 1 },
      { id: 'act_555555555', name: 'Rocky Test Account', currency: 'USD', timezone: 'America/Los_Angeles', status: 2 },
    ],
  };
}

export function getMockCampaigns() {
  return {
    _mock: true,
    data: [
      {
        id: 'camp_1', name: 'Summer Sale - Conversions', objective: 'OUTCOME_SALES', status: 'ACTIVE',
        buying_type: 'AUCTION', daily_budget: 500, spend: 8456.32, results: 456, cpa: 18.54, roas: 5.21,
        adsets: [
          {
            id: 'as_1', name: 'Broad - 25-54', status: 'ACTIVE', daily_budget: 250, spend: 4200, results: 230, cpa: 18.26,
            ads: [
              { id: 'ad_1', name: 'Carousel - Products', status: 'ACTIVE', spend: 2100, results: 120, cpa: 17.50 },
              { id: 'ad_2', name: 'Video - Brand Story', status: 'ACTIVE', spend: 2100, results: 110, cpa: 19.09 },
            ],
          },
          {
            id: 'as_2', name: 'Lookalike 1% - Purchase', status: 'ACTIVE', daily_budget: 250, spend: 4256.32, results: 226, cpa: 18.83,
            ads: [
              { id: 'ad_3', name: 'Single Image - Promo', status: 'ACTIVE', spend: 4256.32, results: 226, cpa: 18.83 },
            ],
          },
        ],
      },
      {
        id: 'camp_2', name: 'Brand Awareness Q1', objective: 'OUTCOME_AWARENESS', status: 'ACTIVE',
        buying_type: 'AUCTION', daily_budget: 300, spend: 5234.10, results: 987654, cpa: 0.005, roas: 2.34,
        adsets: [
          {
            id: 'as_3', name: 'Interest - Fashion', status: 'ACTIVE', daily_budget: 300, spend: 5234.10, results: 987654, cpa: 0.005,
            ads: [
              { id: 'ad_4', name: 'Video - 15s Spot', status: 'ACTIVE', spend: 5234.10, results: 987654, cpa: 0.005 },
            ],
          },
        ],
      },
      {
        id: 'camp_3', name: 'Retargeting - Cart Abandoners', objective: 'OUTCOME_SALES', status: 'ACTIVE',
        buying_type: 'AUCTION', daily_budget: 200, spend: 3421.56, results: 345, cpa: 9.92, roas: 8.76,
        adsets: [],
      },
      {
        id: 'camp_4', name: 'Lead Gen - Whitepaper', objective: 'OUTCOME_LEADS', status: 'PAUSED',
        buying_type: 'AUCTION', daily_budget: 150, spend: 2345.80, results: 210, cpa: 11.17, roas: 3.45,
        adsets: [],
      },
      {
        id: 'camp_5', name: 'App Install - iOS', objective: 'OUTCOME_APP_PROMOTION', status: 'ACTIVE',
        buying_type: 'AUCTION', daily_budget: 250, spend: 4567.00, results: 89, cpa: 51.31, roas: 1.87,
        adsets: [],
      },
      {
        id: 'camp_6', name: 'Holiday Promo 2025', objective: 'OUTCOME_SALES', status: 'DELETED',
        buying_type: 'AUCTION', daily_budget: 0, spend: 1234.00, results: 67, cpa: 18.42, roas: 4.10,
        adsets: [],
      },
    ],
  };
}

export function getMockAudiences() {
  return {
    _mock: true,
    data: [
      { id: 'aud_1', name: 'Website Visitors - 30d', type: 'WEBSITE', size: 125000, status: 'READY', updated: '2026-03-20' },
      { id: 'aud_2', name: 'Purchase Lookalike 1%', type: 'LOOKALIKE', size: 2100000, status: 'READY', updated: '2026-03-18' },
      { id: 'aud_3', name: 'Email Subscribers', type: 'CUSTOMER_LIST', size: 45000, status: 'READY', updated: '2026-03-15' },
      { id: 'aud_4', name: 'Video Viewers 75%', type: 'ENGAGEMENT', size: 89000, status: 'READY', updated: '2026-03-22' },
      { id: 'aud_5', name: 'Add to Cart - 14d', type: 'WEBSITE', size: 23000, status: 'POPULATING', updated: '2026-03-25' },
      { id: 'aud_6', name: 'High Value Customers', type: 'CUSTOMER_LIST', size: 8500, status: 'READY', updated: '2026-03-10' },
    ],
  };
}

export function getMockPixels() {
  return {
    _mock: true,
    data: [
      {
        id: 'px_123456', name: 'Rocky Main Pixel', status: 'ACTIVE',
        events: [
          { name: 'PageView', count_24h: 45678, match_rate: 67.8, status: 'healthy' },
          { name: 'ViewContent', count_24h: 12345, match_rate: 72.3, status: 'healthy' },
          { name: 'AddToCart', count_24h: 3456, match_rate: 65.4, status: 'healthy' },
          { name: 'InitiateCheckout', count_24h: 1234, match_rate: 78.9, status: 'healthy' },
          { name: 'Purchase', count_24h: 567, match_rate: 82.1, status: 'healthy' },
          { name: 'Lead', count_24h: 89, match_rate: 45.6, status: 'warning' },
          { name: 'CompleteRegistration', count_24h: 23, match_rate: 34.2, status: 'warning' },
        ],
      },
      {
        id: 'px_789012', name: 'Rocky Staging Pixel', status: 'INACTIVE',
        events: [
          { name: 'PageView', count_24h: 0, match_rate: 0, status: 'error' },
          { name: 'ViewContent', count_24h: 0, match_rate: 0, status: 'error' },
        ],
      },
    ],
  };
}

export function getMockCreatives() {
  return {
    _mock: true,
    data: [
      { id: 'cr_1', name: 'summer-hero.jpg', type: 'image', format: 'JPEG', width: 1200, height: 628, size: '245 KB', status: 'ACTIVE', url: null, created: '2026-03-10' },
      { id: 'cr_2', name: 'product-carousel-1.jpg', type: 'image', format: 'JPEG', width: 1080, height: 1080, size: '189 KB', status: 'ACTIVE', url: null, created: '2026-03-12' },
      { id: 'cr_3', name: 'brand-story.mp4', type: 'video', format: 'MP4', width: 1080, height: 1920, size: '12.4 MB', status: 'ACTIVE', url: null, created: '2026-03-14' },
      { id: 'cr_4', name: 'promo-banner.png', type: 'image', format: 'PNG', width: 1200, height: 628, size: '312 KB', status: 'ACTIVE', url: null, created: '2026-03-16' },
      { id: 'cr_5', name: 'story-template.jpg', type: 'image', format: 'JPEG', width: 1080, height: 1920, size: '278 KB', status: 'DRAFT', url: null, created: '2026-03-18' },
      { id: 'cr_6', name: 'ugc-video.mp4', type: 'video', format: 'MP4', width: 1080, height: 1080, size: '8.7 MB', status: 'ACTIVE', url: null, created: '2026-03-20' },
    ],
  };
}
