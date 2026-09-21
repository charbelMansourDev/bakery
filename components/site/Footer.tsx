import { BAKERY } from '@/lib/config';

function Icon({ path, label }: { path: string; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/25 text-cream/70 transition hover:border-gold hover:text-gold"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d={path} />
      </svg>
    </a>
  );
}

const INSTAGRAM =
  'M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.42.4.68.8.9 1.4.17.4.36 1 .42 2.2.07 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2a3.9 3.9 0 01-.9 1.4c-.4.42-.8.68-1.4.9-.4.17-1 .36-2.2.42-1.3.07-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42a3.9 3.9 0 01-1.4-.9 3.9 3.9 0 01-.9-1.4c-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.22-.6.48-1 .9-1.4.4-.42.8-.68 1.4-.9.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1018.6 12 6.6 6.6 0 0012 5.4zm0 10.9A4.3 4.3 0 1116.3 12 4.3 4.3 0 0112 16.3zm6.9-11.1a1.55 1.55 0 11-1.55-1.55A1.55 1.55 0 0118.9 5.2z';
const FACEBOOK =
  'M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0022 12z';
const SHARE =
  'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z';

export default function Footer() {
  return (
    <footer className="bg-walnut text-cream">
      {/* pb-28 keeps the last row clear of the fixed order bar. */}
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-28 lg:px-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-3xl tracking-tight">{BAKERY.name}</p>
            <p className="eyebrow mt-3 text-gold">{BAKERY.footerTagline}</p>
          </div>
          <div className="flex gap-3">
            <Icon path={INSTAGRAM} label="Instagram" />
            <Icon path={FACEBOOK} label="Facebook" />
            <Icon path={SHARE} label="Share" />
          </div>
        </div>

        <div className="mt-10 h-px w-full bg-cream/15" />

        <div className="mt-6 flex flex-col gap-3 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {BAKERY.email} · {BAKERY.phone} · {BAKERY.address}
          </p>
          <p>© {new Date().getFullYear()} {BAKERY.legal}</p>
        </div>
      </div>
    </footer>
  );
}
