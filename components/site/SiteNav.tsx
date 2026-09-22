'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BAKERY, NAV_LINKS } from '@/lib/config';
import AccountButton from './AccountButton';

/**
 * `transparentOverHero` is a prop, not something derived from `window`, because
 * reading scroll position during render desynchronises the server HTML from the
 * first client render. `/` passes true; `/menu` passes false and is therefore
 * solid in the server HTML already — no flash, no hydration mismatch.
 */
export default function SiteNav({ transparentOverHero = false }: { transparentOverHero?: boolean }) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!transparentOverHero) return;

    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) {
      setScrolledPastHero(true);
      return;
    }

    // IntersectionObserver rather than a scroll listener: no per-frame work, it
    // reads the hero's real geometry instead of a magic pixel constant, and it
    // fires on observe — so a deep link that lands mid-page is correct straight
    // away instead of waiting for the first scroll.
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPastHero(!entry.isIntersecting),
      // Root is the strip below the nav, extended far past the fold: the
      // sentinel stops intersecting only once it rises ABOVE the nav, which is
      // exactly when the hero has finished passing behind it.
      { rootMargin: '-80px 0px 9999px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [transparentOverHero]);

  const solid = !transparentOverHero || scrolledPastHero || menuOpen;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        solid ? 'border-b border-gold/40 bg-cream/95 backdrop-blur-sm' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-6 lg:px-10">
        <Link href="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
          <span
            className={`block font-display text-xl leading-none tracking-tight transition-colors sm:text-2xl ${
              solid ? 'text-walnut' : 'text-cream'
            }`}
          >
            {BAKERY.name}
          </span>
          <span
            className={`mt-1 block font-display text-xs italic transition-colors ${
              solid ? 'text-walnut-400' : 'text-cream/75'
            }`}
          >
            {BAKERY.tagline}
          </span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href === pathname;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`eyebrow pb-1 transition-colors ${
                    active ? 'border-b border-gold' : 'border-b border-transparent'
                  } ${
                    solid
                      ? active
                        ? 'text-walnut'
                        : 'text-walnut-400 hover:text-walnut'
                      : active
                        ? 'text-cream'
                        : 'text-cream/75 hover:text-cream'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
          <AccountButton solid={solid} />

          <Link
            href="/menu"
            className="rounded-lg bg-gold px-4 py-2.5 text-xs font-semibold tracking-wide text-walnut transition hover:bg-gold-300 sm:px-6 sm:text-sm"
          >
            <span className="hidden sm:inline">Pre-Order Now</span>
            <span className="sm:hidden">Pre-Order</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition lg:hidden ${
              solid ? 'text-walnut hover:bg-walnut/5' : 'text-cream hover:bg-cream/10'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-gold/25 bg-cream lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="eyebrow block border-b border-cream-200 py-4 text-walnut-400 transition-colors hover:text-walnut"
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* The inline account control is hidden on small screens, so the
                mobile menu carries it instead. */}
            <AccountButton variant="menu" onNavigate={() => setMenuOpen(false)} />
          </ul>
        </div>
      )}
    </header>
  );
}
