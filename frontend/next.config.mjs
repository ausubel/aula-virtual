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
  // Comentamos output: "export" para permitir renderizado en servidor
  // output: "export",
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/auth/:path*`,
      },
      {
        source: '/api/document/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/document/:path*`,
      },
      {
        source: '/api/user/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/user/:path*`,
      },
      {
        source: '/user/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/user/:path*`,
      },
      {
        source: '/document/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/document/:path*`,
      },
      {
        source: '/courses/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/courses/:path*`,
      },
      {
        source: '/api/certificate/public/:uuid',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/document/certificate/public/:uuid`,
      },
      {
        source: '/admin/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/admin/:path*`,
      },
      {
        source: '/api/admin/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/admin/:path*`,
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:3000 http://backend:3002 https://fonts.gstatic.com data: blob:; img-src 'self' data: blob:; worker-src 'self' blob:; frame-src 'self' blob: data:; media-src 'self' blob: data:; object-src 'self' blob: data:;"
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

mergeConfig(nextConfig, userConfig)

export default nextConfig
