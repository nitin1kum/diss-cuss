import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    domains: ['m.media-amazon.com', 'image.tmdb.org'], // add other domains as needed
  },
  eslint : {
    ignoreDuringBuilds : true
  }
};

export default nextConfig;
