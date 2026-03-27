import { useQuery } from '@tanstack/react-query';
import { Video, Image, Clock } from 'lucide-react';
import PageGuide from '../components/common/PageGuide.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { formatNumber } from '../utils/format.js';
import api from '../services/api.js';

export default function TikTokCreative() {
  const advertiserId = localStorage.getItem('selected_account_id');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tiktok-creative', advertiserId],
    queryFn: async () => {
      const res = await api.tiktok.getCreatives(advertiserId);
      return res.data || [];
    },
  });

  const assets = data || [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-3 text-sm text-red-400">Failed to load TikTok creative</p>
        <button onClick={() => refetch()} className="rounded bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageGuide
        pageKey="tiktok-creative"
        title="TikTok Creative Library"
        tips={[
          'TikTok ads primarily use vertical video (9:16 aspect ratio)',
          'Spark Ads let you boost organic TikTok posts from your account or creators',
          'Recommended video length is 15-60 seconds for best performance',
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">TikTok Creative</h1>
        <span className="text-2xs text-zinc-500">{assets.length} assets</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
      ) : assets.length === 0 ? (
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-10 text-center">
          <Video size={32} className="mx-auto mb-3 text-zinc-600" />
          <p className="text-sm text-zinc-400">No creative assets found</p>
          <p className="text-2xs text-zinc-600">Upload videos or images to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <div key={asset.material_id} className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 overflow-hidden">
              <div className="aspect-[9/16] bg-zinc-900 flex items-center justify-center relative">
                {asset.url ? (
                  <img src={asset.url} alt={asset.material_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    {asset.material_type === 'VIDEO' ? <Video size={24} className="mx-auto text-zinc-600" /> : <Image size={24} className="mx-auto text-zinc-600" />}
                  </div>
                )}
                {asset.material_type === 'VIDEO' && asset.duration && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5">
                    <Clock size={10} className="text-zinc-400" />
                    <span className="text-2xs text-zinc-300">{asset.duration}s</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-zinc-200">{asset.material_name}</p>
                <div className="mt-1 flex items-center gap-2 text-2xs text-zinc-500">
                  <span className={asset.material_type === 'VIDEO' ? 'text-pink-400' : 'text-blue-400'}>
                    {asset.material_type}
                  </span>
                  <span>{asset.width}x{asset.height}</span>
                  {asset.file_size && <span>{(asset.file_size / 1024 / 1024).toFixed(1)}MB</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
