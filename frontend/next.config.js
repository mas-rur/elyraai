const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // wagmi's Base Account connector optionally supports Coinbase's x402
    // micro-payments protocol via dynamic import(). Elyra never uses it,
    // but webpack still tries to statically resolve those paths and fails
    // since the (genuinely optional) @x402/* packages aren't installed.
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// }));

    // Standard, well-known no-ops in a browser/Next.js context: pino-pretty
    // is a Node-only log formatter WalletConnect's logger optionally uses,
    // and MetaMask SDK's async-storage fallback is React-Native-only.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};

module.exports = nextConfig;
