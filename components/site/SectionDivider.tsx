import FleurDeLis from './FleurDeLis';

/**
 * Thin gold hairline with the fleur-de-lis centred in it.
 * `full` stretches across the container; the default is a short centred accent.
 */
export default function SectionDivider({
  full = false,
  className = '',
}: {
  full?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-4 ${full ? 'w-full' : 'mx-auto w-40'} ${className}`}
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
      <FleurDeLis className="h-4 w-4 shrink-0 text-gold" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
    </div>
  );
}
