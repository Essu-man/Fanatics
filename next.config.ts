import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'www.premierleague.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.laliga.com',
      },
      {
        protocol: 'https',
        hostname: 'www.legaseriea.it',
      },
      {
        protocol: 'https',
        hostname: 'www.bundesliga.com',
      },
      {
        protocol: 'https',
        hostname: 'www.ligue1.com',
      },
      {
        protocol: 'https',
        hostname: 'www.uefa.com',
      },
      {
        protocol: 'https',
        hostname: 'static.www.nfl.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.nba.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.wnba.com',
      },
      {
        protocol: 'https',
        hostname: 'www.euroleaguebasketball.net',
      },
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
      },
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'logonoid.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.worldvectorlogo.com',
      },
      {
        protocol: 'https',
        hostname: 'www.freepnglogos.com',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
