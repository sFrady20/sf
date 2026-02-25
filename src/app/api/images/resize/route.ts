import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const POST = async function (req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const width = parseInt(formData.get("width") as string);
  const height = parseInt(formData.get("height") as string);

  const image = sharp(await file.arrayBuffer())
    .resize(width, height, { fit: "cover" })
    .webp();

  const buffer = await image.toBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/webp" },
  });
};
