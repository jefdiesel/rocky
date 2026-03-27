import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, Image, Video, X, Eye, Plus, Copy, Edit, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import PageGuide from '../components/common/PageGuide.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import Modal from '../components/common/Modal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { formatDate, formatCurrency, formatPercent } from '../utils/format.js';
import { CTA_OPTIONS } from '../utils/constants.js';
import api, { isAuthenticated } from '../services/api.js';
import { getMockCreatives } from '../mocks/dashboardData.js';

const PREVIEW_MODES = [
  { value: 'fb_feed', label: 'FB Feed' },
  { value: 'ig_feed', label: 'IG Feed' },
  { value: 'ig_stories', label: 'IG Stories' },
  { value: 'ig_reels', label: 'IG Reels' },
  { value: 'fb_stories', label: 'FB Stories' },
];

const DEFAULT_VARIANTS = [
  { id: 1, headline: 'Summer Sale - 50% Off', body: 'Shop now and save big on all items', cta: 'Shop Now', ctr: 2.45, cpa: 18.30 },
  { id: 2, headline: 'Limited Time Offer', body: 'Don\'t miss out on incredible deals', cta: 'Learn More', ctr: 1.89, cpa: 22.10 },
  { id: 3, headline: 'Free Shipping Today', body: 'Order today for free express delivery', cta: 'Shop Now', ctr: 3.12, cpa: 15.60 },
];

export default function Creative() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [previewMode, setPreviewMode] = useState('fb_feed');
  const [viewMode, setViewMode] = useState('mobile');
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState(DEFAULT_VARIANTS);
  const fileInputRef = useRef(null);

  // Fetch UTM templates from API, fall back to defaults
  const { data: utmTemplates } = useQuery({
    queryKey: ['utm-templates'],
    queryFn: async () => {
      try {
        const res = await api.getUtmTemplates();
        const templates = res.data || res;
        return templates.length > 0 ? templates : [];
      } catch {
        return [];
      }
    },
  });

  const utmTemplateList = utmTemplates && utmTemplates.length > 0 ? utmTemplates : [
    { id: 1, name: 'Default Campaign', source: 'facebook', medium: 'paid_social', campaign: '{campaign_name}', content: '{ad_name}' },
    { id: 2, name: 'Retargeting', source: 'facebook', medium: 'retargeting', campaign: '{campaign_name}', content: '{ad_set_name}' },
  ];

  const handleFileUpload = async (files) => {
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const isVideo = file.type.startsWith('video/');
        isVideo ? await api.uploadVideo(formData) : await api.uploadImage(formData);
      }
      refetch();
    } catch (err) {
      console.error('Upload failed:', err.message);
    } finally {
      setUploading(false);
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['creatives'],
    queryFn: async () => {
      if (!isAuthenticated()) return getMockCreatives().data;
      const res = await api.getCreatives();
      return res.data || res;
    },
  });

  const creatives = data || [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-3 text-sm text-red-400">Failed to load creative assets</p>
        <button onClick={() => refetch()} className="rounded bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageGuide
        pageKey="creative"
        title="Creative Studio Quick Guide"
        tips={[
          'Upload images and videos to your Meta ad account asset library',
          'Preview how your ads look across FB Feed, IG Feed, Stories, and Reels',
          'Track copy variant performance to find winning headline/body combinations',
          'UTM templates auto-tag your destination URLs for clean attribution',
        ]}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Creative Studio</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Assets'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files.length) handleFileUpload(Array.from(e.target.files)); }}
        />
      </div>

      {/* Upload Area */}
      <div
        className="drop-zone flex flex-col items-center justify-center rounded-lg py-10 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFileUpload(Array.from(e.dataTransfer.files)); }}
      >
        <Upload size={28} className="mb-2 text-zinc-500" />
        <p className="text-xs text-zinc-400">Drag and drop images or videos here</p>
        <p className="text-2xs text-zinc-600">JPEG, PNG, MP4, MOV up to 4GB</p>
      </div>

      {/* Asset Grid + Detail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Asset Grid */}
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Asset Library</h3>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center"><LoadingSpinner /></div>
          ) : creatives.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50">
              <p className="text-sm text-zinc-500">No assets uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {creatives.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={clsx(
                    'group relative overflow-hidden rounded-lg border transition-all',
                    selectedAsset?.id === asset.id
                      ? 'border-primary-500 ring-1 ring-primary-500'
                      : 'border-zinc-700/50 hover:border-zinc-600'
                  )}
                >
                  {/* Thumbnail */}
                  <div className="flex aspect-square items-center justify-center bg-zinc-800">
                    {asset.type === 'video' ? (
                      <Video size={28} className="text-zinc-600" />
                    ) : (
                      <Image size={28} className="text-zinc-600" />
                    )}
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="truncate text-2xs font-medium text-white">{asset.name}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xs text-zinc-400">{asset.width}x{asset.height}</span>
                      <span className="text-2xs text-zinc-500">{asset.size}</span>
                    </div>
                  </div>
                  {/* Status */}
                  <div className="absolute right-1 top-1">
                    <StatusBadge status={asset.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50">
          {selectedAsset ? (
            <div>
              {/* Preview */}
              <div className="flex aspect-video items-center justify-center border-b border-zinc-700 bg-zinc-900">
                {selectedAsset.type === 'video' ? (
                  <Video size={40} className="text-zinc-600" />
                ) : (
                  <Image size={40} className="text-zinc-600" />
                )}
              </div>
              {/* Metadata */}
              <div className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-zinc-200">{selectedAsset.name}</h4>
                <table className="table-dense w-full">
                  <tbody>
                    {[
                      ['Format', selectedAsset.format],
                      ['Dimensions', `${selectedAsset.width} x ${selectedAsset.height}`],
                      ['File Size', selectedAsset.size],
                      ['Type', selectedAsset.type],
                      ['Created', formatDate(selectedAsset.created)],
                      ['Status', null],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-zinc-700/30">
                        <td className="text-zinc-500">{label}</td>
                        <td className="text-zinc-300">
                          {label === 'Status' ? <StatusBadge status={selectedAsset.status} /> : value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-700 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                >
                  <Eye size={14} /> Preview as Ad
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-xs text-zinc-500">Select an asset to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Phone Frame Preview Modal */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Ad Preview"
        size="lg"
      >
        <div className="flex gap-6">
          <div>
            <div className="mb-3 flex gap-1 flex-wrap">
              {PREVIEW_MODES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPreviewMode(value)}
                  className={clsx(
                    'rounded px-2.5 py-1 text-2xs font-medium transition-colors',
                    previewMode === value ? 'bg-zinc-600 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mb-2 flex gap-2">
              <button
                onClick={() => setViewMode('mobile')}
                className={clsx('rounded px-2 py-1 text-2xs', viewMode === 'mobile' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500')}
              >
                Mobile
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={clsx('rounded px-2 py-1 text-2xs', viewMode === 'desktop' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500')}
              >
                Desktop
              </button>
            </div>
            <div className={clsx('phone-frame', viewMode === 'desktop' && 'w-[500px] rounded-lg')}>
              <div className="phone-frame-content">
                {previewMode.includes('stories') || previewMode.includes('reels') ? (
                  <div className="flex h-full flex-col bg-black text-white">
                    <div className="flex items-center gap-2 p-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <div>
                        <p className="text-xs font-semibold">Your Brand</p>
                        <p className="text-2xs text-zinc-400">Sponsored</p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-center justify-center bg-zinc-800">
                      {selectedAsset?.type === 'video'
                        ? <Video size={40} className="text-zinc-600" />
                        : <Image size={40} className="text-zinc-600" />
                      }
                    </div>
                    <div className="p-3 text-center">
                      <div className="rounded bg-zinc-700 py-2">
                        <p className="text-xs font-semibold">Learn More</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col bg-white text-black">
                    <div className="flex items-center gap-2 border-b border-gray-200 p-3">
                      <div className={clsx('h-8 w-8 rounded-full', previewMode === 'ig_feed' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-blue-500')} />
                      <div>
                        <p className="text-xs font-semibold">Your Brand</p>
                        <p className="text-2xs text-gray-500">Sponsored</p>
                      </div>
                    </div>
                    <div className="flex aspect-square items-center justify-center bg-gray-100">
                      {selectedAsset?.type === 'video'
                        ? <Video size={40} className="text-gray-300" />
                        : <Image size={40} className="text-gray-300" />
                      }
                    </div>
                    <div className="border-t border-gray-200 px-3 py-2">
                      <p className="text-xs font-semibold">Your Headline Here</p>
                      <p className="text-2xs text-gray-500">Your description</p>
                    </div>
                    <div className="mx-3 mb-3 rounded bg-blue-500 py-2 text-center">
                      <p className="text-xs font-semibold text-white">Learn More</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Copy Variant Manager */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Copy Variant Manager</h3>
          <button className="flex items-center gap-1 rounded px-2 py-1 text-2xs text-primary-400 hover:bg-zinc-700">
            <Plus size={12} /> Add Variant
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-700/50">
          <table className="table-dense w-full">
            <thead>
              <tr className="border-b border-zinc-700/50 bg-zinc-800/60">
                <th className="text-left">Headline</th>
                <th className="text-left">Body</th>
                <th className="text-left">CTA</th>
                <th className="text-right">CTR</th>
                <th className="text-right">CPA</th>
                <th className="w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b border-zinc-700/30 hover:bg-zinc-800/50">
                  <td className="text-zinc-300">{v.headline}</td>
                  <td className="max-w-xs truncate text-zinc-400">{v.body}</td>
                  <td className="text-zinc-400">{v.cta}</td>
                  <td className="text-right tabular-nums text-zinc-300">{formatPercent(v.ctr)}</td>
                  <td className="text-right tabular-nums text-zinc-300">{formatCurrency(v.cpa)}</td>
                  <td>
                    <div className="flex justify-center gap-1">
                      <button className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300">
                        <Edit size={12} />
                      </button>
                      <button className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300">
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UTM Templates */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">UTM Templates</h3>
          <button className="flex items-center gap-1 rounded px-2 py-1 text-2xs text-primary-400 hover:bg-zinc-700">
            <Plus size={12} /> New Template
          </button>
        </div>
        <div className="space-y-2">
          {utmTemplateList.map((tpl) => (
            <div key={tpl.id} className="flex items-center justify-between rounded border border-zinc-700/30 bg-zinc-900/50 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-300">{tpl.name}</p>
                <p className="truncate text-2xs text-zinc-500">
                  source={tpl.source} &middot; medium={tpl.medium} &middot; campaign={tpl.campaign} &middot; content={tpl.content}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                <button className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300">
                  <Edit size={12} />
                </button>
                <button className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300">
                  <Copy size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
