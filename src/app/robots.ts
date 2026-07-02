import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      //cast is a chromecast receiver, api is machinery — neither is content
      disallow: ["/api/", "/cast"],
    },
    sitemap: "https://www.stevenfrady.com/sitemap.xml",
  };
}
