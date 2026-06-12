"use client";

import { Button } from "earthling-ui/button";
import { ComponentProps } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "earthling-ui/tooltip";
import { setColorScheme } from "@/actions/set-color-scheme";
import { useRouter } from "next/navigation";

const colorSchemes = ["dark", "light", "favorite"];

export function ColorSchemeToggle(
  props: ComponentProps<typeof Button> & { colorScheme: string }
) {
  const { className, children, colorScheme, ...rest } = props;

  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          shape="icon"
          material="ghost"
          aria-label="Change theme"
          {...rest}
          onClick={async () => {
            await setColorScheme(
              colorSchemes[
                (Math.max(0, colorSchemes.indexOf(colorScheme)) + 1) %
                  colorSchemes.length
              ]
            );
            router.refresh();
          }}
          className={cn("grid rounded-full", className)}
        >
          <AnimatePresence initial={false}>
            {colorScheme === "light" && (
              <motion.i
                key="light"
                initial={{ rotate: "-90deg", opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: "90deg", opacity: 0 }}
                className="icon-[ri--sun-fill] text-lg col-start-1 row-start-1"
              />
            )}
            {colorScheme === "dark" && (
              <motion.i
                key="dark"
                initial={{ rotate: "-90deg", opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: "90deg", opacity: 0 }}
                className="icon-[ri--moon-fill] text-lg col-start-1 row-start-1"
              />
            )}
            {colorScheme === "system" && (
              <motion.i
                key="system"
                initial={{ rotate: "-90deg", opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: "90deg", opacity: 0 }}
                className="icon-[ri--computer-fill] text-lg col-start-1 row-start-1"
              />
            )}
            {colorScheme === "favorite" && (
              <motion.i
                key="system"
                initial={{ rotate: "-90deg", opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: "90deg", opacity: 0 }}
                className="icon-[ri--aliens-fill] text-lg col-start-1 row-start-1"
              />
            )}
            {colorScheme === "holiday" && (
              <motion.i
                key="holiday"
                initial={{ rotate: "-90deg", opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: "90deg", opacity: 0 }}
                className="text-lg col-start-1 row-start-1"
              >
                💘
              </motion.i>
            )}
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-title">
        {colorScheme === "favorite" ? "alien" : colorScheme} theme
      </TooltipContent>
    </Tooltip>
  );
}
