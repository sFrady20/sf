import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const config: NextConfig = {
  experimental: {
    mdxRs: true,
  },
  //ask chromium browsers to send their color scheme so the ssr theme guess
  //is right on first paint. critical-ch makes the very first request retry
  //with the hint attached. other browsers just fall back to the inline script
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "Accept-CH", value: "Sec-CH-Prefers-Color-Scheme" },
        { key: "Critical-CH", value: "Sec-CH-Prefers-Color-Scheme" },
        { key: "Vary", value: "Sec-CH-Prefers-Color-Scheme" },
      ],
    },
  ],
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [{ loader: "@svgr/webpack", options: { icon: true } }],
        as: "*.js",
      },
      "*.glsl": {
        loaders: ["raw-loader", "glslify-loader"],
        as: "*.js",
      },
      "*.txt": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
  webpack: (config, { isServer }) => {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.(".svg"),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: {
          not: [...fileLoaderRule.resourceQuery.not, /url/],
        }, // exclude if *.svg?url
        use: [{ loader: "@svgr/webpack", options: { icon: true } }],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    //glsl code
    config.module.rules.push({
      test: /\.glsl$/i,
      issuer: /\.[jt]sx?$/,
      use: ["raw-loader", "glslify-loader"],
    });

    //txt loading (for ai prompts)
    config.module.rules.push({
      test: /\.txt$/i,
      issuer: /\.[jt]sx?$/,
      use: "raw-loader",
    });

    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }

    return config;
  },
};

const withMDX = createMDX();

export default withMDX(config);
