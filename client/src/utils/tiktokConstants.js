import { Globe, Download, Smartphone, Eye, Video, FileText, ShoppingCart } from 'lucide-react';

export const TT_OBJECTIVES = [
  { value: 'TRAFFIC', label: 'Traffic', description: 'Drive traffic to your website or app', icon: Globe },
  { value: 'CONVERSIONS', label: 'Conversions', description: 'Drive valuable actions on your site', icon: ShoppingCart },
  { value: 'APP_INSTALL', label: 'App Install', description: 'Get more app installs', icon: Download },
  { value: 'REACH', label: 'Reach', description: 'Show your ad to the most people', icon: Eye },
  { value: 'VIDEO_VIEWS', label: 'Video Views', description: 'Get more video views', icon: Video },
  { value: 'LEAD_GENERATION', label: 'Lead Generation', description: 'Collect leads with instant forms', icon: FileText },
  { value: 'CATALOG_SALES', label: 'Catalog Sales', description: 'Show products from your catalog', icon: ShoppingCart },
];

export const TT_PLACEMENTS = [
  { value: 'PLACEMENT_TIKTOK', label: 'TikTok' },
  { value: 'PLACEMENT_PANGLE', label: 'Pangle' },
  { value: 'PLACEMENT_GLOBAL_APP_BUNDLE', label: 'Global App Bundle' },
];

export const TT_BID_STRATEGIES = [
  { value: 'BID_TYPE_NO_BID', label: 'Lowest Cost (No Bid)' },
  { value: 'BID_TYPE_CUSTOM', label: 'Cost Cap', hasInput: true, inputLabel: 'Cost cap amount' },
  { value: 'BID_TYPE_MAX', label: 'Bid Cap', hasInput: true, inputLabel: 'Maximum bid' },
];

export const TT_CTA_OPTIONS = [
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'APPLY_NOW', label: 'Apply Now' },
  { value: 'GET_QUOTE', label: 'Get Quote' },
  { value: 'SUBSCRIBE', label: 'Subscribe' },
  { value: 'WATCH_NOW', label: 'Watch Now' },
  { value: 'BOOK_NOW', label: 'Book Now' },
];

export const TT_OPTIMIZATION_GOALS = [
  { value: 'CLICK', label: 'Clicks' },
  { value: 'CONVERT', label: 'Conversions' },
  { value: 'INSTALL', label: 'App Installs' },
  { value: 'REACH', label: 'Reach' },
  { value: 'IMPRESSION', label: 'Impressions' },
  { value: 'VIDEO_VIEW', label: 'Video Views (6s)' },
  { value: 'LEAD_GENERATION', label: 'Lead Generation' },
  { value: 'VALUE', label: 'Value Optimization' },
];

export const TT_AD_FORMATS = [
  { value: 'SINGLE_VIDEO', label: 'Single Video' },
  { value: 'SINGLE_IMAGE', label: 'Single Image' },
  { value: 'CAROUSEL', label: 'Carousel' },
  { value: 'SPARK_ADS', label: 'Spark Ads' },
  { value: 'COLLECTION', label: 'Collection Ads' },
];

export const TT_STATUS_MAP = {
  ENABLE: { label: 'Active', color: 'emerald' },
  DISABLE: { label: 'Paused', color: 'amber' },
  DELETE: { label: 'Deleted', color: 'red' },
};

export function mapTTStatus(status) {
  return TT_STATUS_MAP[status] || { label: status, color: 'zinc' };
}
