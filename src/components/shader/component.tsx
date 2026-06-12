"use client";

import { HTMLAttributes, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import Slice from "@/components/slice";
import { useIntersectionObserver } from "usehooks-ts";
import { useSize } from "./size";
import { cn } from "@/utils/cn";
import { IUniform, Vector2, Vector3 } from "three";
import defaultsDeep from "lodash/defaultsDeep";

const DisableRender = () => useFrame(() => null, 1000);

export interface ShaderProps extends HTMLAttributes<HTMLDivElement> {
  frag?: string;
  paused?: boolean;
  seed?: number;
  uniforms?: Record<string, IUniform<any>>;
  //lets frags with alpha composite over the page
  transparent?: boolean;
}

export const Shader = function (props: ShaderProps) {
  const {
    frag,
    paused,
    className,
    seed,
    uniforms: uniformsProp = {},
    transparent,
    ...rest
  } = props;

  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  const uniforms = useRef(
    defaultsDeep(uniformsProp, {
      resolution: { value: new Vector2(100, 100) },
      time: { value: 0 },
      pointer: {
        value: [0, 0],
      },
      pointers: {
        value: Array(10)
          .fill("")
          .map(() => new Vector2(0, 0)),
      },
      seed: { value: seed || Math.random() },
      palette: {
        value: [
          new Vector3(0.5, 0.5, 0.5),
          new Vector3(0.5, 0.5, 0.5),
          new Vector3(1.0, 1.0, 1.0),
          new Vector3(0.0, 0.33, 0.67),
        ],
      },
    })
  ).current;

  const [firstRender, setFirstRender] = useState(true);
  const { isIntersecting, ref: containerRef } = useIntersectionObserver();

  useEffect(() => {
    if (!firstRender && (paused || !isIntersecting)) return;
    let frame = 0;
    const cb = (now: number) => {
      uniforms.time.value = now / 1000;
      frame = requestAnimationFrame(cb);
    };
    frame = requestAnimationFrame(cb);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [paused, isIntersecting, firstRender]);

  const size = useSize(containerEl || undefined);

  useEffect(() => {
    if (!size[0] && !size[1]) return;
    uniforms.resolution.value.set(size[0], size[1]);
  }, [size, containerEl]);

  return (
    <div
      ref={(r) => {
        setContainerEl(r);
        containerRef(r);
      }}
      {...rest}
      className={cn("bg-black relative", className)}
      onPointerMove={(e) => {
        const bounds = (e.target as HTMLCanvasElement).getBoundingClientRect();

        uniforms.pointer.value[0] = e.clientX - bounds.x;
        uniforms.pointer.value[1] = -e.clientY + bounds.y + bounds.height;

        const pointerIndex = Math.max(0, Math.min(e.pointerId - 1, 9));
        uniforms.pointers.value[pointerIndex].set(
          e.clientX - bounds.x,
          -e.clientY + bounds.y + bounds.height
        );
      }}
    >
      {firstRender && (
        <i className="icon-[svg-spinners--90-ring-with-bg] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 color-[white]" />
      )}
      <div className="w-full h-full">
        <Canvas dpr={[1, 1]}>
          {!firstRender && (paused || !isIntersecting) && <DisableRender />}
          {frag && (
            <Slice key={frag}>
              <shaderMaterial
                fragmentShader={frag}
                transparent={transparent}
                uniforms={uniforms}
                onUpdate={() => {}}
                onBeforeRender={() => {
                  if (firstRender) setFirstRender(false);
                }}
              />
            </Slice>
          )}
        </Canvas>
      </div>
    </div>
  );
};

//same thing, kept as a named export for callsites that want to be explicit
//about owning their own canvas (transition overlay, cast receiver)
export const ShaderCanvas = Shader;
