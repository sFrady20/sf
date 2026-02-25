import { ImageResponse } from "next/og";
import { shaderData } from "@/data/shaders";
import { NextRequest } from "next/server";
import { headers } from "next/headers";

export const runtime = "edge";

export const GET = async function (
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ ["shader-path"]: string[] }>;
  }
) {
  const { "shader-path": shaderPath } = await params;
  const data = shaderData[shaderPath.join("/")];

  const headersList = await headers();

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          backgroundColor: "#111111",
          backgroundImage: `url(http://${headersList.get(
            "host"
          )}/shaders/${shaderPath.join("/")}.png)`,
          backgroundSize: "100% 100%",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            padding: "32px",
          }}
        >
          {/* {data?.title && (
            <h1
              style={{
                color: "white",
                fontSize: "40px",
                lineHeight: "40px",
                margin: 0,
                fontWeight: 700,
              }}
            >
              {data?.title}
            </h1>
          )}
          {data?.subtitle && (
            <h2
              style={{
                color: "white",
                fontSize: "18px",
                lineHeight: "18px",
                margin: 0,
                fontWeight: "bold",
              }}
            >
              {data?.subtitle}
            </h2>
          )} */}
          <h3
            style={{
              color: "white",
              fontSize: "16px",
              lineHeight: "16px",
              margin: 0,
              fontWeight: "bold",
              background: "rgba(0,0,0,0.85)",
              opacity: 0.6,
              backdropFilter: "blur(16px)",
              borderRadius: "8px",
              padding: "4px 6px",
            }}
          >
            www.stevenfrady.com
          </h3>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
};
