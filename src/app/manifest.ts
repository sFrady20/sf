import type { MetadataRoute } from "next";

type Icon = NonNullable<MetadataRoute.Manifest["icons"]>[number];

//pngs come out of scripts/generate-icons.mjs, rerun with `bun run icons`
const png = (src: string, size: number, purpose: Icon["purpose"]): Icon => ({
  src,
  sizes: `${size}x${size}`,
  type: "image/png",
  purpose,
});

//full bleed tiles pull double duty as plain and maskable
const tile = (slug: string) =>
  [96, 192].flatMap((size) => [
    png(`/icons/shortcut-${slug}-${size}.png`, size, "any"),
    png(`/icons/shortcut-${slug}-${size}.png`, size, "maskable"),
  ]);

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SF26",
    short_name: "SF26",
    description: "Shaders, tools, and projects by Steven Frady.",
    icons: [
      png("/icons/icon-192.png", 192, "any"),
      png("/icons/icon-512.png", 512, "any"),
      png("/icons/icon-maskable-192.png", 192, "maskable"),
      png("/icons/icon-maskable-512.png", 512, "maskable"),
    ],
    //long press the app icon. keep in sync with the generator script
    shortcuts: [
      {
        name: "Shaders",
        description: "GLSL fragment shaders from Genuary and beyond",
        url: "/shaders",
        icons: tile("shaders"),
      },
      {
        name: "Tools",
        description: "Converters, generators, and dev utilities",
        url: "/tools",
        icons: tile("tools"),
      },
    ],
    theme_color: "#171717",
    background_color: "#171717",
    display: "standalone",
    start_url: "/?source=pwa",
    scope: "/",
    orientation: "portrait",
  };
}
