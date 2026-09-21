'use client';

import { useRef, useState } from 'react';

/**
 * Uploads immediately on file choice and hands the stored path back to the
 * parent form, so saving the product is a plain JSON request.
 */
export default function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);

    const body = new FormData();
    body.append('file', file);

    const response = await fetch('/api/upload', { method: 'POST', body });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? 'Upload failed.');
    } else {
      onChange(data.url);
    }

    setBusy(false);
    // Allow re-selecting the same file after a failure.
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">Image</span>

      <div className="mt-2 flex items-start gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {value ? (
            // Plain <img>: uploads are written at runtime, and the src may be
            // either a static /images path or a runtime /api/media path.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Product preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              None
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={busy}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-slate-800 disabled:opacity-50"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {busy ? 'Uploading…' : 'JPEG, PNG or WebP, up to 4 MB.'}
          </p>

          {value && (
            <p className="mt-1 truncate text-xs text-slate-400" title={value}>
              {value}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-1.5 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
