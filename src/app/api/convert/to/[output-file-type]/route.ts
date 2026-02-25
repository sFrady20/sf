import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const POST = async function (
  req: NextRequest,
  { params }: { params: Promise<{ ["output-file-type"]: string }> }
) {
  const { "output-file-type": outputFileType } = await params;
  const formdata = await req.formData();

  const file = formdata.get("file") as File;

  const inputFileType = file.type;

  switch (inputFileType) {
    case "image/png":
    case "image/jpeg":
    case "image/webp":
      const image = sharp(await file.arrayBuffer());
      switch (outputFileType) {
        case "png": {
          const buf = await image.png().toBuffer();
          return new NextResponse(new Uint8Array(buf), {
            headers: { "Content-Type": "image/png" },
          });
        }
        case "jpeg": {
          const buf = await image.jpeg().toBuffer();
          return new NextResponse(new Uint8Array(buf), {
            headers: { "Content-Type": "image/jpeg" },
          });
        }
        case "webp": {
          const buf = await image.webp().toBuffer();
          return new NextResponse(new Uint8Array(buf), {
            headers: { "Content-Type": "image/webp" },
          });
        }
        default:
          return new NextResponse("Output file type not supported", {
            status: 400,
          });
      }
    default:
      return new NextResponse("Input file type not supported", { status: 400 });
  }

  return new NextResponse("Unknown Error", { status: 500 });
};
