import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // There is an unrelated package-lock.json in the home directory, which makes
  // Next infer ~/ as the workspace root and trace the wrong files. Pin it to
  // this project. (`next build` always runs from the project root.)
  outputFileTracingRoot: path.resolve(process.cwd()),
};

export default nextConfig;
