import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const fits = ["cover", "contain", "fill", "inside", "outside"] as const;
type Fit = (typeof fits)[number];

export const POST = async function (req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("file");
  if (!(file instanceof File))
    return new NextResponse("No file provided", { status: 400 });

  const width = parseInt(formData.get("width") as string);
  const height = parseInt(formData.get("height") as string);
  if ((isNaN(width) || width <= 0) && (isNaN(height) || height <= 0))
    return new NextResponse("Provide a width or height", { status: 400 });

  //defaults preserve the original behavior (webp, cover)
  const fitRaw = formData.get("fit") as string;
  const fit: Fit = fits.includes(fitRaw as Fit) ? (fitRaw as Fit) : "cover";

  const qualityRaw = parseInt(formData.get("quality") as string);
  const quality = isNaN(qualityRaw)
    ? 80
    : Math.min(100, Math.max(1, qualityRaw));

  const format = (formData.get("format") as string) || "webp";

  try {
    let image = sharp(await file.arrayBuffer()).resize(
      isNaN(width) || width <= 0 ? undefined : width,
      isNaN(height) || height <= 0 ? undefined : height,
      { fit, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    );

    let mime = "image/webp";
    switch (format) {
      case "png":
        image = image.png();
        mime = "image/png";
        break;
      case "jpg":
      case "jpeg":
        image = image.jpeg({ quality });
        mime = "image/jpeg";
        break;
      case "avif":
        image = image.avif({ quality });
        mime = "image/avif";
        break;
      default:
        image = image.webp({ quality });
    }

    const buffer = await image.toBuffer();
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": mime },
    });
  } catch (e) {
    return new NextResponse("Input file type not supported", { status: 400 });
  }
};
