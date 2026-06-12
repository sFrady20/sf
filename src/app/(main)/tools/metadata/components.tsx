"use client";

import { FileInput } from "@/components/file-input";
import { Button, ButtonProps } from "earthling-ui/button";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { ComponentProps, useEffect, useState } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { zipSync } from "fflate";
import { TextInput } from "@/components/text-input";
import { Code } from "@/components/code";

type FMTFileStatus = {
  isProcessing: boolean;
  dataUrl?: string;
};

const fmtStore = create(
  immer<{
    title: string;
    description: string;
    image: File | null;
    loadedFiles: Record<string, FMTFileStatus>;
  }>((get, set) => ({
    title: "",
    description: "",
    image: null,
    loadedFiles: {},
  }))
);

const processFile = async function (
  fileProperties: FMTFileProperties,
  file: File
) {
  switch (fileProperties.type) {
    case "image":
      const form = new FormData();
      form.append("file", file);
      form.append("width", `${fileProperties.width}`);
      form.append("height", `${fileProperties.height}`);

      const result = await fetch(`/api/images/resize`, {
        method: "post",
        body: form,
      });

      return URL.createObjectURL(
        new Blob([Buffer.from(await result.arrayBuffer())], {
          type: "image/webp",
        })
      );
      break;
  }
  return "";
};

export const FMTTitleInput = function () {
  const title = fmtStore((x) => x.title);
  return (
    <TextInput
      onChange={(e) => {
        fmtStore.setState((x) => {
          x.title = e.target.value;
        });
      }}
    />
  );
};

export const FMTDescriptionInput = function () {
  const description = fmtStore((x) => x.description);
  return (
    <TextInput
      onChange={(e) => {
        fmtStore.setState((x) => {
          x.description = e.target.value;
        });
      }}
    />
  );
};

export const FMTFileInput = function () {
  return (
    <FileInput
      accept="image/*"
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
          fmtStore.setState((x) => {
            x.image = null;
            x.loadedFiles = {};
          });
          return;
        }

        fmtStore.setState((x) => {
          x.image = file || null;
          x.loadedFiles = {};
        });

        let processedFiles: Record<string, string> = {};
        for (let fileProperties of fileMap) {
          fmtStore.setState((x) => {
            x.loadedFiles![fileProperties.filepath] = {
              isProcessing: true,
            };
          });
          const processedFileUrl = await processFile(fileProperties, file);
          fmtStore.setState((x) => {
            x.loadedFiles![fileProperties.filepath] = {
              isProcessing: false,
              dataUrl: processedFileUrl,
            };
          });
        }
      }}
    >
      Choose File...
    </FileInput>
  );
};

export const FMTFilePreview = function () {
  const file = fmtStore((x) => x.image);

  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    (async () => {
      if (!file) {
        setDataUrl("");
        return;
      }

      const reader = new FileReader();
      reader.onload = function () {
        setDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    })();
  }, [file]);

  if (!dataUrl) return null;

  return (
    <div className="rounded-xl bg-foreground/10 p-3 border flex flex-row gap-4">
      <img
        src={dataUrl}
        className="border rounded-md max-w-[33%] max-h-[400px]"
      />
      <div className="flex flex-col flex-1">
        <div className="flex flex-row">
          <div className="flex-1 flex flex-col">
            <div className="font-medium">{file?.name}</div>
            <div className="text-xs opacity-60">
              {file?.size.toLocaleString("en-US")} bytes
            </div>
          </div>
          <div className="">
            <Button
              material={"ghost"}
              shape={"icon"}
              onClick={() => {
                fmtStore.setState((x) => {
                  x.image = null;
                  x.loadedFiles = {};
                });
              }}
            >
              <i className="icon-[ri--delete-bin-line]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FMTImageSize = function (props: { size: number }) {
  const { size } = props;

  const file = fmtStore((x) => x.image);

  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    (async () => {
      if (!file) {
        setDataUrl("");
        return;
      }

      const form = new FormData();
      form.append("file", file);
      form.append("size", size.toString());

      const result = await fetch(`/api/images/resize`, {
        method: "post",
        body: form,
      });

      setDataUrl(
        URL.createObjectURL(
          new Blob([Buffer.from(await result.arrayBuffer())], {
            type: "image/webp",
          })
        )
      );
    })();
  }, [file]);

  if (!dataUrl) return null;

  return <img src={dataUrl} className="bg-foreground/10 rounded border" />;
};

type FMTFileProperties = { filepath: string } & (
  | { type: "image"; width: number; height: number }
  | { type: "json" }
);

const fileMap: FMTFileProperties[] = [
  {
    filepath: "src/icon.png",
    type: "image",
    width: 512,
    height: 512,
  },
  {
    filepath: "public/favicon/32x32.png",
    type: "image",
    width: 32,
    height: 32,
  },
  {
    filepath: "public/favicon/64x64.png",
    type: "image",
    width: 64,
    height: 64,
  },
  {
    filepath: "public/favicon/192x192.png",
    type: "image",
    width: 192,
    height: 192,
  },
  {
    filepath: "public/favicon/512x512.png",
    type: "image",
    width: 512,
    height: 512,
  },
];

export const FMTFileList = function () {
  return (
    <>
      {fileMap.map((x, i) => (
        <FMTFile key={x.filepath} fileProperties={x} />
      ))}
    </>
  );
};

export const FMTFile = function (props: { fileProperties: FMTFileProperties }) {
  const { fileProperties } = props;

  const fileStatus = fmtStore(
    (x) => x.loadedFiles?.[fileProperties.filepath]
  ) || { isProcessing: false };

  const OptionalLink = fileStatus.dataUrl ? Link : "div";

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-3 rounded-md py-2 px-4 group",
        !!fileStatus.dataUrl && "cursor-pointer hover:bg-foreground/5",
        !fileStatus.dataUrl && "text-foreground/30"
      )}
      key={fileProperties.filepath}
    >
      <OptionalLink href={fileStatus.dataUrl || ""} target="_blank">
        <i
          className={cn(
            fileStatus.isProcessing
              ? cn("icon-[svg-spinners--90-ring-with-bg]")
              : cn(
                  fileProperties.type === "image" &&
                    "icon-[ri--file-image-line]",
                  fileProperties.type === "json" && "icon-[ri--file-code-line]"
                )
          )}
        />
      </OptionalLink>
      <OptionalLink
        href={fileStatus.dataUrl || ""}
        target="_blank"
        className="overflow-hidden text-ellipsis text-nowrap flex-1"
      >
        {fileProperties.filepath.split("/").join(" / ")}
      </OptionalLink>
      {!!fileStatus.dataUrl && (
        <div
          className="hover:underline text-sm hidden group-hover:block cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();

            const a = document.createElement("a");
            a.href = fileStatus.dataUrl!;
            a.setAttribute(
              "download",
              fileProperties.filepath.split("/").slice(-1).join("-")
            );
            document.body.appendChild(a);
            a.click();
            a.parentNode?.removeChild(a);
          }}
        >
          Export
        </div>
      )}
    </div>
  );
};

export const FMTExport = function (props: ButtonProps) {
  const isEmpty = fmtStore((x) => Object.values(x.loadedFiles).length === 0);
  const isProcessing = fmtStore((x) =>
    Object.values(x.loadedFiles).some((x) => x.isProcessing)
  );

  return (
    <Button
      material={"outline"}
      disabled={isEmpty || isProcessing}
      {...props}
      className={cn("gap-2", props.className)}
      onClick={async (e) => {
        props.onClick?.(e);
        if (e.isDefaultPrevented()) return;

        const loadedFiles = fmtStore.getState().loadedFiles;

        const unzipped: Record<string, Uint8Array> = {};
        for (const filepath in loadedFiles) {
          const fileStatus = loadedFiles[filepath];
          const fileProperties = fileMap.find((x) => x.filepath === filepath)!;

          const blob = await fetch(fileStatus.dataUrl!).then(
            async (x) => new Uint8Array(await x.arrayBuffer())
          );
          unzipped[filepath] = blob;
        }

        const zipped = zipSync(unzipped);
        const zippedUrl = URL.createObjectURL(new Blob([new Uint8Array(zipped)]));

        const a = document.createElement("a");
        a.href = zippedUrl;
        a.setAttribute(
          "download",
          `favicon-export-${Math.random().toString(32).substring(7)}.zip`
        );
        document.body.appendChild(a);
        a.click();
        a.parentNode?.removeChild(a);
      }}
    >
      {isProcessing && <i className="icon-[svg-spinners--90-ring-with-bg]" />}
      <div>{isProcessing ? "Processing" : props.children}</div>
    </Button>
  );
};

export const FMTTemplatedCode = function (props: ComponentProps<typeof Code>) {
  const { children, ...rest } = props;

  const title = fmtStore((x) => x.title);
  const description = fmtStore((x) => x.description);

  return (
    <Code {...rest}>
      {children
        ?.replaceAll("<<TITLE>>", title)
        .replaceAll("<<DESCRIPTION>>", description)}
    </Code>
  );
};
