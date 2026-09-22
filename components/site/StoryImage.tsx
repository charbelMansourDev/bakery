import Image from 'next/image';
import FleurDeLis from './FleurDeLis';

/**
 * One photograph in the Our Story section. Falls back to a warm placeholder
 * when no file has been set yet, so the layout never shows a broken image.
 */
export default function StoryImage({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-walnut-700">
        <FleurDeLis className="h-7 w-7 text-gold/30" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={src.startsWith('/api/media/')}
      className="object-cover"
    />
  );
}
