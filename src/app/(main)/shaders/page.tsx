import { ShaderCard } from "@/components/shader";
import { shaderData } from "@/data/shaders";

export default async function ShadersPage() {
  const frags = Object.fromEntries(
    await Promise.all(
      Object.keys(shaderData).map(async (shaderId) => [
        shaderId,
        (
          await import(`@/shaders/${shaderId}.frag.glsl`)
        ).default,
      ])
    )
  );

  return (
    <div className="grid grid-cols-12 w-full mt-[100px] md:mt-[132px]">
      <h1 className="sr-only">Shaders</h1>
      {Object.entries(shaderData)
        .reverse()
        .map(([shaderId, shader]) => (
          <ShaderCard
            key={shaderId}
            frag={frags[shaderId]}
            title={shader.title}
            subtitle={shader.subtitle}
            shaderPath={shaderId}
            className="col-span-12 md:col-span-6 xl:col-span-4 relative"
          />
        ))}
    </div>
  );
}
