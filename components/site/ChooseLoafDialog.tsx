'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import FleurDeLis from './FleurDeLis';

/**
 * Shown when someone tries to review an order that has add-ons but no base
 * loaf. Add-ons are folded through a loaf, so an order without one is not
 * something the bakery can fill — better to say so here than to hand WhatsApp
 * an order that has to be corrected by hand.
 */
export default function ChooseLoafDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    confirmRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);

    // Stop the page behind the dialog scrolling under it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-walnut/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="choose-loaf-title"
        aria-describedby="choose-loaf-body"
        // Clicks inside must not reach the backdrop's close handler.
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-cream-50 p-8 text-center shadow-soft-lg"
      >
        <FleurDeLis className="mx-auto h-6 w-6 text-gold" />

        <h2 id="choose-loaf-title" className="mt-4 font-display text-2xl text-walnut">
          Choose your loaf first
        </h2>
        <p id="choose-loaf-body" className="mt-3 font-display text-base italic text-walnut-400">
          Your add-ons are folded through a sourdough base — pick a Classic or Whole Wheat loaf to
          build on.
        </p>

        <Link
          href="/menu#base-loaves"
          onClick={onClose}
          className="mt-7 block w-full rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold tracking-wide text-walnut transition hover:bg-gold-300"
        >
          Pick a loaf
        </Link>

        <button
          ref={confirmRef}
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-lg border border-walnut/25 px-6 py-3 text-sm font-semibold tracking-wide text-walnut transition hover:border-walnut hover:bg-walnut/5"
        >
          Back to my order
        </button>
      </div>
    </div>
  );
}
