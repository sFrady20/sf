//icon set presets, sizes + the json configs that reference them

export type IconFile = {
  path: string;
  size: number;
  //fraction of the canvas reserved as safe-zone padding on each side
  padding?: number;
};

export type IconConfig = {
  path: string;
  language: string;
  content: (name: string) => string;
};

export type IconPreset = {
  slug: string;
  label: string;
  description: string;
  files: IconFile[];
  configs: IconConfig[];
};

export const iconPresets: IconPreset[] = [
  {
    slug: "pwa",
    label: "Web / PWA",
    description:
      "Favicons, apple touch icon, and PWA manifest icons with a ready-to-use site.webmanifest.",
    files: [
      { path: "favicon-16x16.png", size: 16 },
      { path: "favicon-32x32.png", size: 32 },
      { path: "apple-touch-icon.png", size: 180 },
      { path: "icon-192.png", size: 192 },
      { path: "icon-512.png", size: 512 },
      { path: "icon-maskable-512.png", size: 512, padding: 0.1 },
    ],
    configs: [
      {
        path: "site.webmanifest",
        language: "json",
        content: (name) =>
          JSON.stringify(
            {
              name,
              short_name: name,
              icons: [
                { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
                { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
                {
                  src: "/icon-maskable-512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "maskable",
                },
              ],
              theme_color: "#171717",
              background_color: "#171717",
              display: "standalone",
              start_url: "/",
            },
            null,
            2,
          ),
      },
      {
        path: "head-snippet.html",
        language: "html",
        content: () =>
          [
            `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />`,
            `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />`,
            `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
            `<link rel="manifest" href="/site.webmanifest" />`,
          ].join("\n"),
      },
    ],
  },
  {
    slug: "expo",
    label: "Expo / React Native",
    description:
      "Icon, adaptive icon, splash icon, and web favicon sized for Expo, plus the app.json snippet.",
    files: [
      { path: "assets/icon.png", size: 1024 },
      { path: "assets/adaptive-icon.png", size: 1024, padding: 0.16 },
      { path: "assets/splash-icon.png", size: 1024, padding: 0.25 },
      { path: "assets/favicon.png", size: 48 },
    ],
    configs: [
      {
        path: "app.json (snippet)",
        language: "json",
        content: (name) =>
          JSON.stringify(
            {
              expo: {
                name,
                icon: "./assets/icon.png",
                android: {
                  adaptiveIcon: {
                    foregroundImage: "./assets/adaptive-icon.png",
                    backgroundColor: "#171717",
                  },
                },
                web: { favicon: "./assets/favicon.png" },
                splash: {
                  image: "./assets/splash-icon.png",
                  resizeMode: "contain",
                  backgroundColor: "#171717",
                },
              },
            },
            null,
            2,
          ),
      },
    ],
  },
  {
    slug: "android",
    label: "Android Launcher",
    description:
      "Launcher icon mipmaps for every density bucket, ready to drop into res/.",
    files: [
      { path: "res/mipmap-mdpi/ic_launcher.png", size: 48 },
      { path: "res/mipmap-hdpi/ic_launcher.png", size: 72 },
      { path: "res/mipmap-xhdpi/ic_launcher.png", size: 96 },
      { path: "res/mipmap-xxhdpi/ic_launcher.png", size: 144 },
      { path: "res/mipmap-xxxhdpi/ic_launcher.png", size: 192 },
      { path: "playstore-icon.png", size: 512 },
    ],
    configs: [],
  },
];

export const getIconPreset = (slug: string) =>
  iconPresets.find((p) => p.slug === slug);
