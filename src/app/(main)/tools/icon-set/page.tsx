import { Metadata } from "next";
import { ToolShell } from "../shell";
import { IconSetTool } from "./components";

export const metadata: Metadata = {
  title: "App Icon Set Generator (PWA, Expo, Android) - Steven Frady",
  description:
    "Generate complete app icon sets from one image — PWA favicons with site.webmanifest, Expo / React Native assets with app.json, and Android launcher mipmaps. Free, runs entirely in your browser.",
  keywords:
    "app icon generator, pwa icon generator, expo icon generator, react native app icon, android launcher icon, site.webmanifest generator",
  alternates: { canonical: "https://www.stevenfrady.com/tools/icon-set" },
};

export default async function () {
  return (
    <ToolShell>
      <IconSetTool />
    </ToolShell>
  );
}
