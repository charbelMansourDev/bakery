import Image from 'next/image';
import FleurDeLis from './FleurDeLis';

/**
 * Seeded products point at static files in /public/images; images uploaded
 * through the CMS are served by /api/media. Those are written at runtime, so
 * they skip the build-time image optimizer.
 */
export default function ProductImage({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-cream-200">
        <FleurDeLis className="h-8 w-8 text-gold/40" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith('/api/media/')}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}
