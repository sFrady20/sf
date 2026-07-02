import type { MetadataRoute } from "next";
import { shaderData } from "@/data/shaders";

const base = "https://www.stevenfrady.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shaders",
    "/tools",
    "/tools/palette",
    "/tools/metadata",
    "/tools/convert",
    "/tools/shader-fn-lib",
    "/blog",
    "/uses",
    "/colophon",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  //every published shader page
  const shaderRoutes: MetadataRoute.Sitemap = Object.keys(shaderData).map(
    (path) => ({
      url: `${base}/shaders/${path}`,
      changeFrequency: "yearly",
      priority: 0.4,
    }),
  );

  return [...staticRoutes, ...shaderRoutes];
}
