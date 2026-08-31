const fs = require('node:fs');
const path = require('node:path');

function readEnv(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

module.exports = ({ config }) => {
  const webEnv = readEnv(path.join(__dirname, '../web/.env.local'));

  return {
    ...config,
    extra: {
      ...config.extra,
      convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL ?? webEnv.NEXT_PUBLIC_CONVEX_URL,
      authUrl: process.env.EXPO_PUBLIC_AUTH_URL ?? webEnv.NEXT_PUBLIC_CONVEX_SITE_URL,
    },
  };
};
