//image formats the converter can write, every from/to pair = one seo page

export type ImageFormat = {
  slug: string;
  label: string;
  mime: string;
  lossy: boolean;
};

export const imageFormats: ImageFormat[] = [
  { slug: "png", label: "PNG", mime: "image/png", lossy: false },
  { slug: "jpg", label: "JPG", mime: "image/jpeg", lossy: true },
  { slug: "webp", label: "WebP", mime: "image/webp", lossy: true },
  { slug: "avif", label: "AVIF", mime: "image/avif", lossy: true },
];

export const getFormat = (slug: string) =>
  imageFormats.find((f) => f.slug === slug);

export const getFormatByMime = (mime: string) =>
  imageFormats.find((f) => f.mime === mime || (f.slug === "jpg" && mime === "image/jpg"));

export type ConversionPair = { slug: string; from: ImageFormat; to: ImageFormat };

export const conversionPairs: ConversionPair[] = imageFormats.flatMap((from) =>
  imageFormats
    .filter((to) => to.slug !== from.slug)
    .map((to) => ({ slug: `${from.slug}-to-${to.slug}`, from, to })),
);

export const getPair = (slug: string) =>
  conversionPairs.find((p) => p.slug === slug);
