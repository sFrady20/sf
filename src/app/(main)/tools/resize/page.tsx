import { Metadata } from "next";
import { ToolShell } from "../shell";
import { ImageResizer } from "./components";

export const metadata: Metadata = {
  title: "Free Online Image Resizer - Steven Frady",
  description:
    "Resize images to exact pixel dimensions online for free. Crop, letterbox, or stretch and download as WebP, PNG, JPG, or AVIF — no signup, files never stored.",
  keywords:
    "image resizer, resize image online, scale image, crop image, resize png, resize jpg",
  alternates: { canonical: "https://www.stevenfrady.com/tools/resize" },
};

export default async function () {
  return (
    <ToolShell>
      <ImageResizer />
    </ToolShell>
  );
}
