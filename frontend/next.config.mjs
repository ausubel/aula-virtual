let userConfig = undefined
try {
  const userConfigModule = await import('./v0-user-next.config.js');
  userConfig = userConfigModule.default || userConfigModule;
} catch (e) {
  // ignore error
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
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:3000/auth/:path*',
      },
      {
        source: '/api/document/:path*',
        destination: 'http://localhost:3000/document/:path*',
      },
      {
        source: '/api/user/:path*',
        destination: 'http://localhost:3000/user/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:3000 https://fonts.gstatic.com data: blob:; img-src 'self' data: blob:; worker-src 'self' blob:; frame-src 'self' blob: data:; media-src 'self' blob: data:; object-src 'self' blob: data:;"
          }
        ]
      }
    ]
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  ...(userConfig?.port ? {
    devIndicators: {
      port: userConfig.port,
    },
  } : {}),
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
