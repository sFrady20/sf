"use client";

import Link from "next/link";
import { Shader } from "./component";
import { Button } from "earthling-ui/button";
import { HTMLAttributes, useState } from "react";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "motion/react";
import { useIntersectionObserver } from "usehooks-ts";

export interface ShaderCardProps extends HTMLAttributes<HTMLDivElement> {
  frag: string;
  title?: string;
  subtitle?: string;
  shaderPath?: string;
  autoplay?: boolean;
}

export function ShaderCard(props: ShaderCardProps) {
  const {
    frag,
    title,
    subtitle,
    shaderPath,
    autoplay,
    className,
    onPointerEnter,
    onPointerLeave,
    ...rest
  } = props;

  const [isHovering, setHovering] = useState(false);

  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <div
      {...rest}
      ref={ref}
      className={cn(
        "col-span-1 cursor-crosshair overflow-hidden h-0 pb-[72%] relative rounded-none",
        className
      )}
      onPointerEnter={(e) => {
        setHovering(true);
        onPointerEnter?.(e as any);
      }}
      onPointerLeave={(e) => {
        setHovering(false);
        onPointerLeave?.(e as any);
      }}
    >
      <AnimatePresence>
        {isIntersecting && (
          <motion.div
            key="shader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Shader
              frag={frag}
              paused={!autoplay && !isHovering}
              className="absolute left-0 top-0 w-full h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-row absolute left-0 bottom-0 z-[2] w-full items-center justify-between pointer-events-none p-4">
        <div className="flex flex-col">
          <div
            className="text-[white] leading-none font-title"
            style={{
              textShadow:
                "-1px -1px 2px #111, 1px -1px 2px #111, -1px 1px 2px #111, 1px 1px 2px #111",
            }}
          >
            {title}
          </div>
          <div
            className="text-[white]/60 leading-none text-sm font-title drop-shadow-md"
            style={{
              textShadow:
                "-1px -1px 2px #111, 1px -1px 2px #111, -1px 1px 2px #111, 1px 1px 2px #111",
            }}
          >
            {subtitle}
          </div>
        </div>
        <div className="flex flex-row">
          {shaderPath && (
            <>
              <Button material={"ghost"} asChild>
                <Link
                  href={`https://github.com/sFrady20/sf26/blob/main/src/shaders/${shaderPath}.frag.glsl`}
                  target={"_blank"}
                  className="pointer-events-auto cursor-alias text-[white]"
                  aria-label={`View source code for shader titled "${title}"`}
                >
                  <i className="icon-[ri--github-fill] text-lg" />
                </Link>
              </Button>
              <Button material={"ghost"} asChild>
                <Link
                  href={`/shaders/${shaderPath}`}
                  className="pointer-events-auto cursor-zoom-in text-[white]"
                  aria-label={`View shader titled "${title}" in fullscreen`}
                >
                  <i className="icon-[ri--fullscreen-fill] text-lg" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
