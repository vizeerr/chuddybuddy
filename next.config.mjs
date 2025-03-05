import withPWA from 'next-pwa';

let userConfig;
try {
  userConfig = await import('./v0-user-next.config');
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
  // If userConfig is an array, log a warning and use the first element.
  if (Array.isArray(userConfig)) {
    console.warn('User config is an array; merging first element only.');
    userConfig = userConfig[0];
  }
  for (const key in userConfig) {
    // Skip numeric keys if any exist
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

// Remove keys that are not valid for the GenerateSW plugin.
const { eslint, typescript, ...cleanNextConfig } = nextConfig;

export default withPWA({
  dest: 'public', // output directory for service worker files
  register: true, // automatically register the service worker
  skipWaiting: true, // activate the new service worker immediately
  disable: process.env.NODE_ENV === 'development', // disable in development mode
  ...cleanNextConfig,
});
