/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
      API_KEY: process.env.API_KEY,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
      PROJECT_ID: process.env.PROJECT_ID,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
      APP_ID: process.env.APP_ID,
      INFURA: process.env.INFURA,
      COINMARKET: process.env.COINMARKET,
      APY_KEY_OPENAI : process.env.APY_KEY_OPENAI,
      // MEASUREMENT_ID: process.env.MEASUREMENT_ID,
  },
  images: {
      domains: ['primefaces.org'],
  },
  
};

export default nextConfig;
