/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'plus.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.squarespace-cdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media.istockphoto.com', pathname: '/**' },
      { protocol: 'https', hostname: 'theteacancompany.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.theteacancompany.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
