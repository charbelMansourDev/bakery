'use client';

import { useState } from 'react';
import { buildIdeaMessage, whatsappUrl } from '@/lib/whatsapp';

/**
 * Sends the idea to the bakery over WhatsApp, the same channel as orders. No
 * account needed and nothing is stored: submitting opens WhatsApp with the idea
 * already written, and it reaches the bakery when the visitor presses send
 * there — so the confirmation says exactly that rather than claiming it has
 * already arrived.
 */
export default function IdeaBanner() {
  const [idea, setIdea] = useState('');
  /** The link we opened, kept as a fallback in case the browser blocked it. */
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = idea.trim();
    if (!text) return;

    const url = whatsappUrl(buildIdeaMessage(text));
    // Opened inside the submit handler — a user gesture — so browsers allow it.
    window.open(url, '_blank', 'noopener,noreferrer');
    setSentUrl(url);
    setIdea('');
  }

  return (
    <section id="have-an-idea" className="bg-walnut text-cream">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow text-gold">Your loaf, your imagination</p>
            <h2 className="mt-4 font-display text-4xl lg:text-5xl">Have an Idea?</h2>
            <p className="mt-4 font-display text-lg italic text-cream/75">
              Tell us your favorite flavor combination — your idea could become our next sourdough
            </p>
          </div>

          <div>
            {sentUrl ? (
              <div
                role="status"
                className="rounded-lg border border-gold/50 bg-cream/5 px-6 py-5 text-center"
              >
                <p className="font-display text-2xl text-gold">Thanks!</p>
                <p className="mt-1 text-sm text-cream/75">
                  WhatsApp opened with your idea — press send there and it comes straight to us.
                </p>
                <p className="mt-3 text-xs text-cream/60">
                  Didn&rsquo;t open?{' '}
                  <a
                    href={sentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold underline underline-offset-4 transition hover:text-gold-300"
                  >
                    Open WhatsApp
                  </a>
                </p>
                <button
                  type="button"
                  onClick={() => setSentUrl(null)}
                  className="mt-4 text-xs font-semibold tracking-wide text-gold underline underline-offset-4 transition hover:text-gold-300"
                >
                  Share another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="idea" className="sr-only">
                  Your flavor combination
                </label>
                <input
                  id="idea"
                  name="idea"
                  value={idea}
                  onChange={(event) => setIdea(event.target.value)}
                  placeholder="Your flavor combination"
                  maxLength={500}
                  className="min-w-0 flex-1 rounded-lg border border-cream/20 bg-cream/95 px-4 py-3.5 text-sm text-walnut placeholder:text-walnut-400/70 focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold tracking-wide whitespace-nowrap text-walnut transition hover:bg-gold-300 disabled:opacity-50"
                  disabled={!idea.trim()}
                >
                  Send via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
