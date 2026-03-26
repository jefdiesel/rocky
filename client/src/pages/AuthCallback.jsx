import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      navigate('/', { replace: true });
    } else {
      const err = searchParams.get('error') || 'No token received from Meta OAuth';
      setError(err);
    }
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="rounded-lg border border-red-500/30 bg-zinc-900 p-8 text-center">
          <p className="mb-2 text-sm font-semibold text-red-400">Authentication Failed</p>
          <p className="mb-4 text-xs text-zinc-500">{error}</p>
          <button
            onClick={() => navigate('/settings')}
            className="rounded-md bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-zinc-500">Completing authentication...</p>
      </div>
    </div>
  );
}
