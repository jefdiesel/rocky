import {
  Eye, MousePointerClick, Heart, UserPlus, Smartphone, ShoppingCart,
} from 'lucide-react';

export const OBJECTIVES = [
  { value: 'OUTCOME_AWARENESS', label: 'Awareness', description: 'Reach people who are most likely to remember your ads.', icon: Eye },
  { value: 'OUTCOME_TRAFFIC', label: 'Traffic', description: 'Send people to a destination like a website or app.', icon: MousePointerClick },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement', description: 'Get more messages, video views, or post engagement.', icon: Heart },
  { value: 'OUTCOME_LEADS', label: 'Leads', description: 'Collect leads for your business via forms, calls, or chat.', icon: UserPlus },
  { value: 'OUTCOME_APP_PROMOTION', label: 'App Promotion', description: 'Find people who will install and take action in your app.', icon: Smartphone },
  { value: 'OUTCOME_SALES', label: 'Sales', description: 'Find people likely to purchase your product or service.', icon: ShoppingCart },
];

export const BID_STRATEGIES = [
  { value: 'LOWEST_COST_WITHOUT_CAP', label: 'Lowest Cost', description: 'Get the most results at the lowest cost.' },
  { value: 'LOWEST_COST_WITH_BID_CAP', label: 'Bid Cap', description: 'Set a max bid across auctions.', hasInput: true, inputLabel: 'Max Bid ($)' },
  { value: 'COST_CAP', label: 'Cost Cap', description: 'Get the most results near your target cost.', hasInput: true, inputLabel: 'Cost Cap ($)' },
  { value: 'LOWEST_COST_WITH_MIN_ROAS', label: 'ROAS Target', description: 'Set a minimum return on ad spend.', hasInput: true, inputLabel: 'Min ROAS' },
];

export const PLACEMENTS = {
  facebook: [
    { value: 'facebook_feed', label: 'Feed' },
    { value: 'facebook_stories', label: 'Stories' },
    { value: 'facebook_reels', label: 'Reels' },
    { value: 'facebook_marketplace', label: 'Marketplace' },
    { value: 'facebook_right_column', label: 'Right Column' },
    { value: 'facebook_search', label: 'Search Results' },
  ],
  instagram: [
    { value: 'instagram_feed', label: 'Feed' },
    { value: 'instagram_stories', label: 'Stories' },
    { value: 'instagram_reels', label: 'Reels' },
    { value: 'instagram_explore', label: 'Explore' },
  ],
  audience_network: [
    { value: 'audience_network_native', label: 'Native, Banner, Interstitial' },
    { value: 'audience_network_rewarded_video', label: 'Rewarded Video' },
  ],
};

export const CTA_OPTIONS = [
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'BOOK_NOW', label: 'Book Now' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'GET_OFFER', label: 'Get Offer' },
  { value: 'GET_QUOTE', label: 'Get Quote' },
  { value: 'SUBSCRIBE', label: 'Subscribe' },
  { value: 'APPLY_NOW', label: 'Apply Now' },
  { value: 'WATCH_MORE', label: 'Watch More' },
  { value: 'NO_BUTTON', label: 'No Button' },
];

export const SPECIAL_AD_CATEGORIES = [
  { value: 'CREDIT', label: 'Credit' },
  { value: 'EMPLOYMENT', label: 'Employment' },
  { value: 'HOUSING', label: 'Housing' },
  { value: 'SOCIAL_ISSUES', label: 'Social Issues, Elections or Politics' },
];

export const EVENT_TYPES = [
  { value: 'PageView', label: 'Page View' },
  { value: 'ViewContent', label: 'View Content' },
  { value: 'AddToCart', label: 'Add to Cart' },
  { value: 'InitiateCheckout', label: 'Initiate Checkout' },
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Lead', label: 'Lead' },
  { value: 'CompleteRegistration', label: 'Complete Registration' },
  { value: 'Search', label: 'Search' },
  { value: 'AddPaymentInfo', label: 'Add Payment Info' },
  { value: 'AddToWishlist', label: 'Add to Wishlist' },
];

export const PLACEMENT_LABELS = {
  facebook_feed: 'Facebook Feed',
  facebook_stories: 'Facebook Stories',
  facebook_reels: 'Facebook Reels',
  facebook_marketplace: 'Facebook Marketplace',
  facebook_right_column: 'Facebook Right Column',
  facebook_search: 'Facebook Search',
  instagram_feed: 'Instagram Feed',
  instagram_stories: 'Instagram Stories',
  instagram_reels: 'Instagram Reels',
  instagram_explore: 'Instagram Explore',
  audience_network_native: 'Audience Network',
  audience_network_rewarded_video: 'Rewarded Video',
};

export const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7d', label: 'Last 7 Days' },
  { value: 'last_14d', label: 'Last 14 Days' },
  { value: 'last_30d', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

export const AD_FORMATS = [
  { value: 'SINGLE_IMAGE', label: 'Single Image', icon: 'Image' },
  { value: 'CAROUSEL', label: 'Carousel', icon: 'GalleryHorizontal' },
  { value: 'VIDEO', label: 'Video', icon: 'Video' },
  { value: 'STORIES', label: 'Stories', icon: 'Smartphone' },
  { value: 'COLLECTION', label: 'Collection', icon: 'LayoutGrid' },
];

export const OPTIMIZATION_GOALS = [
  { value: 'LINK_CLICKS', label: 'Link Clicks' },
  { value: 'LANDING_PAGE_VIEWS', label: 'Landing Page Views' },
  { value: 'IMPRESSIONS', label: 'Impressions' },
  { value: 'REACH', label: 'Daily Unique Reach' },
  { value: 'OFFSITE_CONVERSIONS', label: 'Conversions' },
  { value: 'VALUE', label: 'Value' },
  { value: 'LEAD_GENERATION', label: 'Lead Generation' },
  { value: 'APP_INSTALLS', label: 'App Installs' },
];

export const ATTRIBUTION_WINDOWS = {
  click: [
    { value: '1d_click', label: '1-day click' },
    { value: '7d_click', label: '7-day click' },
    { value: '28d_click', label: '28-day click' },
  ],
  view: [
    { value: '1d_view', label: '1-day view' },
    { value: '7d_view', label: '7-day view' },
  ],
};
