'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Caught by error.tsx:", error);
  }, [error]);

  return (
    <div className="p-8 bg-red-900/20 text-red-500 rounded-xl m-8 ring-1 ring-red-500">
      <h2 className="text-xl font-bold mb-4">Something went wrong!</h2>
      <pre className="text-sm font-mono whitespace-pre-wrap">{error.message}</pre>
      <pre className="text-xs font-mono mt-4 opacity-50">{error.stack}</pre>
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
