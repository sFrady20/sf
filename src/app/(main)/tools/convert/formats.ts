//image formats the converter can write, every from/to pair = one seo page

export type ImageFormat = {
  slug: string;
  label: string;
  mime: string;
  lossy: boolean;
  //a couple of plain sentences for the seo prose under the tool
  about: string;
};

export const imageFormats: ImageFormat[] = [
  {
    slug: "png",
    label: "PNG",
    mime: "image/png",
    lossy: false,
    about:
      "PNG is lossless with full alpha support. Screenshots, UI assets, and anything with sharp edges or text stay pixel-perfect — the tradeoff is large files for photographs.",
  },
  {
    slug: "jpg",
    label: "JPG",
    mime: "image/jpeg",
    lossy: true,
    about:
      "JPG is the long-standing lossy photo format. It compresses smooth gradients and photographic detail well, but it has no transparency and shows artifacts around sharp edges at lower quality settings.",
  },
  {
    slug: "webp",
    label: "WebP",
    mime: "image/webp",
    lossy: true,
    about:
      "WebP typically lands 25–35% smaller than JPG at similar quality, supports transparency and animation, and every current browser reads it — which makes it a safe default for the web.",
  },
  {
    slug: "avif",
    label: "AVIF",
    mime: "image/avif",
    lossy: true,
    about:
      "AVIF is the newest of the four, built on the AV1 codec. It usually produces the smallest files, handles transparency and wide color, and is supported by all modern browsers — encoding just takes longer.",
  },
];

export const getFormat = (slug: string) =>
  imageFormats.find((f) => f.slug === slug);

export const getFormatByMime = (mime: string) =>
  imageFormats.find(
    (f) => f.mime === mime || (f.slug === "jpg" && mime === "image/jpg"),
  );

export type ConversionPair = {
  slug: string;
  from: ImageFormat;
  to: ImageFormat;
};

export const conversionPairs: ConversionPair[] = imageFormats.flatMap((from) =>
  imageFormats
    .filter((to) => to.slug !== from.slug)
    .map((to) => ({ slug: `${from.slug}-to-${to.slug}`, from, to })),
);

export const getPair = (slug: string) =>
  conversionPairs.find((p) => p.slug === slug);
