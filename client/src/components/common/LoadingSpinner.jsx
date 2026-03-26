import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function LoadingSpinner({ size = 20, className = '' }) {
  return (
    <Loader2
      size={size}
      className={clsx('animate-spin text-primary-500', className)}
    />
  );
}
