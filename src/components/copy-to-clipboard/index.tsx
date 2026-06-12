import { Component, ComponentProps, useState } from "react";
import { Button } from "earthling-ui/button";
import { cn } from "@/utils/cn";

export const CopyToClipboard = ({
  className,
  onClick,
  timeout = 2000,
  content,
  ...rest
}: ComponentProps<typeof Button> & { timeout?: number; content: string }) => {
  const [isCopied, setCopied] = useState(false);
  return (
    <Button
      {...rest}
      className={cn("group gap-2", className)}
      data-copied={isCopied}
      onClick={async (e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        await window.navigator.clipboard.writeText(content);

        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, timeout);
      }}
    />
  );
};

export const CopyToClipboardIcon = ({
  className,
  ...rest
}: ComponentProps<"i">) => {
  const [isCopied, setCopied] = useState(false);
  return (
    <i
      {...rest}
      className={cn(
        "icon-[ri--file-copy-2-line] group-data-[copied=true]:icon-[ri--file-check-line] group-data-[copied=true]:text-green-500",
        className
      )}
    />
  );
};
