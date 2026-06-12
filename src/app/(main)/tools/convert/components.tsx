"use client";

import { FileInput } from "@/components/file-input";
import { makeStore } from "@/utils/make-store";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { fileConversionMap } from "./data";
import { Button } from "earthling-ui/button";
import { downloadFile } from "@/utils/download-file";

type CVT_Store = {
  input: {
    file?: File;
  };
  output: {
    type: string;
  };
};

const CVT = makeStore<CVT_Store>((get) => ({
  input: {
    file: undefined,
  },
  output: {
    type: "",
  },
}));

export const CVT_Provider = function (props: { children?: ReactNode }) {
  return <CVT.Provider {...props} />;
};

export const CVT_Input = function (props: { children?: ReactNode }) {
  const { children } = props;

  const store = CVT.use();

  return (
    <>
      <FileInput
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            store.setState((x) => {
              x.input.file = file;
            });
          } else {
            store.setState((x) => {
              x.input.file = undefined;
            });
          }
        }}
      >
        {children}
      </FileInput>
    </>
  );
};

export const CVT_Preview = function (props: { children?: ReactNode }) {
  const { children } = props;

  const store = CVT.use();

  const file = store((x) => x.input.file);

  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    (async () => {
      setDataUrl(
        file ? URL.createObjectURL(new Blob([await file.arrayBuffer()])) : ""
      );
    })();
  }, [file]);

  return (
    <>
      <img src={dataUrl} className="max-w-[200px]" />
      <div>{file?.type}</div>
    </>
  );
};

export const CVT_Options = function (props: {}) {
  const store = CVT.use();

  const inputType = store((x) => x.input.file?.type);

  const options = useMemo(
    () => (inputType && fileConversionMap[inputType]) || [],
    [inputType]
  );

  const outputType = store((x) => x.output.type);

  if (options.length == 0) return null;

  return (
    <>
      <select
        className="bg-foreground/5 hover:bg-foreground/10 rounded border cursor-pointer p-2"
        value={outputType}
        onChange={(e) => {
          store.setState((x) => {
            x.output.type = e.target.value;
          });
        }}
      >
        {options.map((x) => (
          <option key={x} value={x} className="text-background">
            {x}
          </option>
        ))}
      </select>
    </>
  );
};

export const CVT_ActionButton = function (props: {}) {
  const store = CVT.use();

  const outputType = store((x) => x.output.type);

  if (!outputType) return null;

  return (
    <>
      <Button
        material={"outline"}
        onClick={async () => {
          const file = store.getState().input.file;
          if (!file) return;

          const formData = new FormData();
          formData.append("file", file);
          const result = await fetch(
            `/api/convert/to/${outputType.split("/")[1]}`,
            {
              method: "post",
              body: formData,
            }
          );
          if (result.status === 200)
            await downloadFile(
              await result.blob(),
              `${file.name.split(".").slice(0, -1).join(".")}.${
                outputType.split("/")[1]
              }`
            );
        }}
      >
        Convert
      </Button>
    </>
  );
};
