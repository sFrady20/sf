import type { MetadataRoute } from "next";
import { shaderData } from "@/data/shaders";
import { toolRoutes } from "@/data/tools";

const base = "https://www.stevenfrady.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shaders",
    "/blog",
    "/uses",
    "/colophon",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  //every tool page, incl. the per-transform/pair/generator seo routes
  const tools: MetadataRoute.Sitemap = toolRoutes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "/tools" ? 0.6 : 0.5,
  }));

  //every published shader page
  const shaderRoutes: MetadataRoute.Sitemap = Object.keys(shaderData).map(
    (path) => ({
      url: `${base}/shaders/${path}`,
      changeFrequency: "yearly",
      priority: 0.4,
    }),
  );

  return [...staticRoutes, ...tools, ...shaderRoutes];
}
