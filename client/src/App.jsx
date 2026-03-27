import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Campaigns from './pages/Campaigns.jsx';
import CampaignBuilder from './pages/CampaignBuilder.jsx';
import Audiences from './pages/Audiences.jsx';
import Creative from './pages/Creative.jsx';
import Pixels from './pages/Pixels.jsx';
import Settings from './pages/Settings.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import DataDeletion from './pages/DataDeletion.jsx';
import Landing from './pages/Landing.jsx';

import CreativeStudio from './pages/CreativeStudio.jsx';

// TikTok pages
import TikTokCampaigns from './pages/TikTokCampaigns.jsx';
import TikTokCampaignBuilder from './pages/TikTokCampaignBuilder.jsx';
import TikTokDashboard from './pages/TikTokDashboard.jsx';
import TikTokAudiences from './pages/TikTokAudiences.jsx';
import TikTokCreative from './pages/TikTokCreative.jsx';
import TikTokPixels from './pages/TikTokPixels.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/privacy" element={<Layout />}><Route index element={<Privacy />} /></Route>
      <Route path="/terms" element={<Layout />}><Route index element={<Terms />} /></Route>
      <Route path="/data-deletion" element={<Layout />}><Route index element={<DataDeletion />} /></Route>
      <Route element={<Layout />}>
        {/* Meta routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/new" element={<CampaignBuilder />} />
        <Route path="/campaigns/:campaignId/edit" element={<CampaignBuilder />} />
        <Route path="/audiences" element={<Audiences />} />
        <Route path="/creative" element={<Creative />} />
        <Route path="/pixels" element={<Pixels />} />
        <Route path="/studio" element={<CreativeStudio />} />
        <Route path="/settings" element={<Settings />} />
        {/* TikTok routes */}
        <Route path="/tiktok/dashboard" element={<TikTokDashboard />} />
        <Route path="/tiktok/campaigns" element={<TikTokCampaigns />} />
        <Route path="/tiktok/campaigns/new" element={<TikTokCampaignBuilder />} />
        <Route path="/tiktok/campaigns/:campaignId/edit" element={<TikTokCampaignBuilder />} />
        <Route path="/tiktok/audiences" element={<TikTokAudiences />} />
        <Route path="/tiktok/creative" element={<TikTokCreative />} />
        <Route path="/tiktok/pixels" element={<TikTokPixels />} />
      </Route>
    </Routes>
  );
}
