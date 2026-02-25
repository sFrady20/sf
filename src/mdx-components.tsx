import type { MDXComponents } from "mdx/types";
import { cn } from "./utils/cn";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props: any) => (
      <h1
        {...props}
        className={cn(
          "text-5xl font-title my-[1em] font-bold",
          props.className,
        )}
      />
    ),
    h2: (props: any) => (
      <h2
        {...props}
        className={cn(
          "text-4xl font-title my-[1em] font-bold",
          props.className,
        )}
      />
    ),
    p: (props: any) => (
      <p {...props} className={cn("my-[1em]", props.className)} />
    ),
    a: (props: any) => (
      <a
        {...props}
        className={cn("underline hover:no-underline", props.className)}
        target="_blank"
      />
    ),
    code: (props: any) => (
      <code
        {...props}
        className={cn("bg-foreground/10 px-2 py-1 rounded-xs", props.className)}
      />
    ),
    ...components,
  };
}
