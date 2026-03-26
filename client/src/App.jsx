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

export default function App() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/new" element={<CampaignBuilder />} />
        <Route path="/audiences" element={<Audiences />} />
        <Route path="/creative" element={<Creative />} />
        <Route path="/pixels" element={<Pixels />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
