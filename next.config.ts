import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // There is an unrelated package-lock.json in the home directory, which makes
  // Next infer ~/ as the workspace root and trace the wrong files. Pin it to
  // this project. (`next build` always runs from the project root.)
  outputFileTracingRoot: path.resolve(process.cwd()),

  images: {
    // CMS uploads live in Vercel Blob in production, so next/image has to be
    // told that host is allowed before it will optimise those URLs.
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
