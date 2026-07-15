import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const outputs: Record<
  string,
  { mime: string; encode: (img: sharp.Sharp, quality?: number) => sharp.Sharp }
> = {
  png: { mime: "image/png", encode: (img) => img.png() },
  jpg: {
    mime: "image/jpeg",
    encode: (img, quality) => img.jpeg({ quality: quality ?? 80 }),
  },
  jpeg: {
    mime: "image/jpeg",
    encode: (img, quality) => img.jpeg({ quality: quality ?? 80 }),
  },
  webp: {
    mime: "image/webp",
    encode: (img, quality) => img.webp({ quality: quality ?? 80 }),
  },
  avif: {
    mime: "image/avif",
    encode: (img, quality) => img.avif({ quality: quality ?? 60 }),
  },
};

export const POST = async function (
  req: NextRequest,
  { params }: { params: Promise<{ ["output-file-type"]: string }> },
) {
  const { "output-file-type": outputFileType } = await params;

  const output = outputs[outputFileType];
  if (!output)
    return new NextResponse("Output file type not supported", { status: 400 });

  const formdata = await req.formData();

  const file = formdata.get("file");
  if (!(file instanceof File))
    return new NextResponse("No file provided", { status: 400 });

  const qualityRaw = parseInt(formdata.get("quality") as string);
  const quality =
    isNaN(qualityRaw) ? undefined : Math.min(100, Math.max(1, qualityRaw));

  try {
    //sharp figures out the input format itself, no need to gatekeep mimes
    const image = sharp(await file.arrayBuffer());
    const buf = await output.encode(image, quality).toBuffer();
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": output.mime },
    });
  } catch (e) {
    return new NextResponse("Input file type not supported", { status: 400 });
  }
};
