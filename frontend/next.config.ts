/** @type {import('next').NextConfig} */
const nextConfig = {
  // TEMPORARY WORKAROUND: Ignore TypeScript build errors to unblock deployment
  // Remove this once Next.js type generation bug is fixed
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // ...other config options
};

module.exports = nextConfig;
