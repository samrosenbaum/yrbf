export const nextConfig = {
    reactStrictMode: true,
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      SESSION_SECRET: process.env.SESSION_SECRET,
    },
  };
  
  export default nextConfig;
  