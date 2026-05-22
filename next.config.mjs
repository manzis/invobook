/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@sparticuz/chromium', 'playwright-core', 'puppeteer-core'],
};

export default nextConfig;
