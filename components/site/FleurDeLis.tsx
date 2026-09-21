/** Small gold ornament used in section dividers and as a brand accent. */
export default function FleurDeLis({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" className={className}>
      {/* centre petal */}
      <path d="M16 2.6c-2 2.9-3 5.3-3 7.5 0 2.1 1 3.9 3 5.8 2-1.9 3-3.7 3-5.8 0-2.2-1-4.6-3-7.5z" />
      {/* side petals */}
      <path d="M13.9 15.7c-2.4-1.5-4.6-2.6-6.5-3.1-2.5-.6-4.3.4-4.6 2.4-.3 2 1.1 3.6 3.5 3.9 2 .3 4.6-.8 7.6-3.2z" />
      <path d="M18.1 15.7c2.4-1.5 4.6-2.6 6.5-3.1 2.5-.6 4.3.4 4.6 2.4.3 2-1.1 3.6-3.5 3.9-2 .3-4.6-.8-7.6-3.2z" />
      {/* binding band */}
      <rect x="10.6" y="16.4" width="10.8" height="2.6" rx="1.3" />
      {/* base */}
      <path d="M16 19.9c-1.7 3.3-2.8 6-2.8 7.9 0 1.8 1 2.9 2.8 2.9s2.8-1.1 2.8-2.9c0-1.9-1.1-4.6-2.8-7.9z" />
    </svg>
  );
}
