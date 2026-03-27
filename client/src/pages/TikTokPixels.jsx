import { useQuery } from '@tanstack/react-query';
import { Activity, ExternalLink } from 'lucide-react';
import PageGuide from '../components/common/PageGuide.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import api from '../services/api.js';

// TikTok pixel mock — the mock mode returns creative data for this endpoint
// In production this would hit /tiktok/pixels/:advertiserId
// For now we show a setup guide since the TikTok Pixel API works differently

export default function TikTokPixels() {
  return (
    <div className="space-y-4">
      <PageGuide
        pageKey="tiktok-pixels"
        title="TikTok Pixel"
        tips={[
          'TikTok Pixel tracks conversions on your website',
          'Use the Events Manager in TikTok Ads Manager to set up events',
          'Standard events: ViewContent, AddToCart, Purchase, CompleteRegistration',
        ]}
      />

      <h1 className="text-lg font-semibold text-zinc-100">TikTok Pixel & Events</h1>

      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/15">
            <Activity size={24} className="text-pink-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-zinc-200">TikTok Pixel Setup</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Install the TikTok Pixel on your website to track conversions and optimize ad delivery.
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
                <h4 className="text-xs font-medium text-zinc-300 mb-2">Step 1: Get your Pixel code</h4>
                <p className="text-2xs text-zinc-500">Go to TikTok Ads Manager → Assets → Events → Web Events → Manage</p>
              </div>
              <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
                <h4 className="text-xs font-medium text-zinc-300 mb-2">Step 2: Install the base code</h4>
                <p className="text-2xs text-zinc-500">Add the TikTok Pixel base code to the &lt;head&gt; of every page on your website</p>
              </div>
              <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
                <h4 className="text-xs font-medium text-zinc-300 mb-2">Step 3: Set up events</h4>
                <p className="text-2xs text-zinc-500">Add event code for key actions: ViewContent, AddToCart, CompletePayment, SubmitForm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Events Reference */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Standard Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-500">
                <th className="pb-2 text-left font-medium">Event Name</th>
                <th className="pb-2 text-left font-medium">Trigger</th>
                <th className="pb-2 text-left font-medium">Parameters</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'ViewContent', trigger: 'Product page view', params: 'content_id, content_type, value, currency' },
                { name: 'AddToCart', trigger: 'Item added to cart', params: 'content_id, content_type, value, currency, quantity' },
                { name: 'CompletePayment', trigger: 'Purchase completed', params: 'content_id, value, currency, quantity' },
                { name: 'SubmitForm', trigger: 'Form submitted', params: 'content_id' },
                { name: 'ClickButton', trigger: 'CTA button clicked', params: 'content_id' },
                { name: 'Download', trigger: 'App or file downloaded', params: 'content_id' },
                { name: 'CompleteRegistration', trigger: 'User registered', params: 'content_id' },
                { name: 'Subscribe', trigger: 'Subscription started', params: 'content_id, value, currency' },
              ].map((event) => (
                <tr key={event.name} className="border-b border-zinc-700/50">
                  <td className="py-2 font-mono text-pink-400">{event.name}</td>
                  <td className="py-2 text-zinc-300">{event.trigger}</td>
                  <td className="py-2 text-zinc-500">{event.params}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
