import { Shader } from "@/components/shader";
import { notFound } from "next/navigation";

export default async function (props: {
  params: Promise<{ ["shader-path"]: string[] }>;
}) {
  const { "shader-path": shaderPathSegments } = await props.params;

  let frag: string;
  const shaderPath = shaderPathSegments.join("/");

  try {
    frag = (
      await import(`@/shaders/${shaderPath}.frag.glsl`)
    ).default;
  } catch (err: any) {
    console.error(err);
    return notFound();
  }

  return (
    <Shader
      frag={typeof frag === "string" ? frag : ""}
      className="fixed left-0 top-0 w-full h-full"
    />
  );
}
