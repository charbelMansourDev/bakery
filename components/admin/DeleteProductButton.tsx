'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteProductButton({
  id,
  name,
  variant = 'link',
}: {
  id: string;
  name: string;
  variant?: 'link' | 'button';
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;

    setBusy(true);
    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      window.alert('Could not delete this product.');
      setBusy(false);
      return;
    }

    router.push('/admin/products');
    router.refresh();
  }

  const className =
    variant === 'button'
      ? 'rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-50'
      : 'text-sm text-red-600 transition hover:text-red-800 hover:underline disabled:opacity-50';

  return (
    <button type="button" onClick={handleDelete} disabled={busy} className={className}>
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  );
}
