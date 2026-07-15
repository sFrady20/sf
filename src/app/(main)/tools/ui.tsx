"use client";

import { cn } from "@/utils/cn";
import {
  ComponentProps,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

//shared control vocabulary for every tool page - one panel language,
//fixed-height headers, consistent inputs

export function ToolHeader(props: { title: ReactNode; description: ReactNode }) {
  const { title, description } = props;
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-title font-bold text-2xl md:text-3xl text-balance">
        {title}
      </h1>
      <p className="opacity-70 text-sm max-w-[65ch]">{description}</p>
    </div>
  );
}

export function Panel(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  return (
    <div
      {...rest}
      className={cn(
        "rounded-xl border border-foreground/10 bg-foreground/[0.04] overflow-hidden flex flex-col",
        "focus-within:border-foreground/25 transition-colors",
        className,
      )}
    />
  );
}

//every header is exactly h-11 so side-by-side panels always line up
export function PanelHeader(props: {
  label: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { label, meta, children, className } = props;
  return (
    <div
      className={cn(
        "h-11 flex-none flex flex-row items-center gap-3 px-4 border-b border-foreground/10 bg-foreground/[0.04]",
        className,
      )}
    >
      <div className="font-title text-[11px] uppercase tracking-widest opacity-60">
        {label}
      </div>
      {meta !== undefined && (
        <div className="text-[11px] opacity-40 tabular-nums">{meta}</div>
      )}
      <div className="flex-1" />
      {children}
    </div>
  );
}

export function Select(props: ComponentProps<"select">) {
  const { className, children, ...rest } = props;
  return (
    <span className={cn("relative inline-flex", className)}>
      <select
        {...rest}
        //the native popup paints itself, so options and group labels need an
        //opaque bg+fg pair of their own or they inherit into invisibility
        className="h-9 appearance-none rounded-md border border-foreground/15 bg-foreground/5 hover:bg-foreground/10 cursor-pointer pl-3 pr-8 text-sm outline-none focus-visible:border-foreground/40 transition-colors [&_option]:bg-background [&_option]:text-foreground [&_optgroup]:bg-background [&_optgroup]:text-foreground [&_optgroup]:font-semibold"
      >
        {children}
      </select>
      <i className="icon-[ri--arrow-down-s-line] absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
    </span>
  );
}

export function NumberInput(props: ComponentProps<"input">) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      type="number"
      className={cn(
        "h-9 rounded-md border border-foreground/15 bg-foreground/5 px-3 text-sm font-mono tabular-nums outline-none focus-visible:border-foreground/40 transition-colors w-[90px]",
        className,
      )}
    />
  );
}

//labeled control, keeps option rows reading as one system
export function Field(props: { label: ReactNode; children: ReactNode }) {
  const { label, children } = props;
  return (
    <label className="flex flex-row items-center gap-2.5 text-sm">
      <span className="opacity-60 whitespace-nowrap">{label}</span>
      {children}
    </label>
  );
}

export const prettySize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

//drop target that becomes a compact file row once something's loaded
export function ImageDrop(props: {
  file: File | null;
  onFile: (file: File | null) => void;
  hint?: string;
  meta?: ReactNode;
  className?: string;
}) {
  const { file, onFile, hint, meta, className } = props;

  //remount the input after every pick so re-selecting the same file fires
  const [inputKey, setInputKey] = useState(0);

  const thumbUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );
  useEffect(
    () => () => {
      if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    },
    [thumbUrl],
  );

  return (
    <div className={cn("relative", className)}>
      <input
        key={inputKey}
        type="file"
        accept="image/*"
        aria-label={hint ?? "Choose an image"}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        onChange={(e) => {
          onFile(e.target.files?.[0] ?? null);
          setInputKey((k) => k + 1);
        }}
      />
      {file ? (
        <div className="flex flex-row items-center gap-4 rounded-xl border border-foreground/10 bg-foreground/[0.04] hover:bg-foreground/[0.08] transition-colors p-3 h-full">
          <img
            src={thumbUrl}
            alt=""
            className="w-14 h-14 rounded-lg object-cover border border-foreground/10 bg-foreground/5 flex-none"
          />
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="text-sm truncate">{file.name}</div>
            <div className="text-xs opacity-50 tabular-nums">
              {meta ?? `${file.type || "unknown"} · ${prettySize(file.size)}`}
            </div>
          </div>
          <div className="ml-auto text-xs opacity-50 whitespace-nowrap max-md:hidden">
            Click to replace
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-foreground/20 bg-foreground/[0.03] hover:bg-foreground/[0.07] hover:border-foreground/30 transition-colors px-6 py-10 h-full">
          <i className="icon-[ri--image-add-line] text-2xl opacity-50" />
          <div className="text-sm opacity-70">
            {hint ?? "Choose an image or drop it here"}
          </div>
        </div>
      )}
    </div>
  );
}
