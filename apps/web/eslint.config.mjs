import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    ignores: ["convex/_generated/**"],
  },
];

export default config;
