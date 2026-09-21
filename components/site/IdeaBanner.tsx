'use client';

import { useState } from 'react';

/**
 * Front-end only by design: no persistence, no email. Submitting just
 * acknowledges the idea.
 */
export default function IdeaBanner() {
  const [idea, setIdea] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!idea.trim()) return;
    setSubmitted(true);
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
            {submitted ? (
              <div
                role="status"
                className="rounded-lg border border-gold/50 bg-cream/5 px-6 py-5 text-center"
              >
                <p className="font-display text-2xl text-gold">Thanks!</p>
                <p className="mt-1 text-sm text-cream/75">
                  We&rsquo;ve noted your idea — keep an eye on the menu.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
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
                  className="min-w-0 flex-1 rounded-lg border border-cream/20 bg-cream/95 px-4 py-3.5 text-sm text-walnut placeholder:text-walnut-400/70 focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold tracking-wide text-walnut transition hover:bg-gold-300 disabled:opacity-50"
                  disabled={!idea.trim()}
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
