import withPWA from 'next-pwa';

let userConfig;
try {
  userConfig = await import('./v0-user-next.config');
  // If the module has a default export, use it.
  userConfig = userConfig.default || userConfig;
} catch (e) {
  // ignore error if the file doesn't exist
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};

mergeConfig(nextConfig, userConfig);

function mergeConfig(baseConfig, userConfig) {
  if (!userConfig) return;
  // If userConfig is an array, warn and merge the first element only
  if (Array.isArray(userConfig)) {
    console.warn('User config is an array; merging first element only.');
    userConfig = userConfig[0];
  }
  for (const key in userConfig) {
    // Skip numeric keys that may have come from an array-like object
    if (!isNaN(Number(key))) continue;
    if (
      typeof baseConfig[key] === 'object' &&
      baseConfig[key] !== null &&
      !Array.isArray(baseConfig[key])
    ) {
      baseConfig[key] = {
        ...baseConfig[key],
        ...userConfig[key],
      };
    } else {
      baseConfig[key] = userConfig[key];
    }
  }
}

// Optionally remove keys that might be causing issues (like 'eslint')
// This is optional: if you need ESLint settings only for Next.js and not passed to next-pwa, remove it.
const { eslint, ...cleanNextConfig } = nextConfig;

export default withPWA({
  dest: 'public', // output directory for service worker files
  register: true, // automatically register the service worker
  skipWaiting: true, // activate the new service worker immediately
  disable: process.env.NODE_ENV === 'development', // disable in development mode
  ...cleanNextConfig,
});
