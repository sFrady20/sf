"use client";

import { Shader } from "@/components/shader";
import { Vector2, Vector3 } from "three";
import { Updater, useImmer } from "use-immer";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Code } from "@/components/code";
import { Slider } from "@/components/slider";
import frag from "@/shaders/palette-generator/debug.frag.glsl";
import exampleFrag1 from "@/shaders/palette-generator/example-1.frag.glsl";
import exampleFrag2 from "@/shaders/palette-generator/example-2.frag.glsl";
import exampleFrag3 from "@/shaders/palette-generator/example-3.frag.glsl";
import exampleFrag4 from "@/shaders/palette-generator/example-4.frag.glsl";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Button } from "earthling-ui/button";
import { immer } from "zustand/middleware/immer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CopyToClipboard,
  CopyToClipboardIcon,
} from "@/components/copy-to-clipboard";

/*
vec3 a=vec3(0,0.21,0.17);
vec3 b=vec3(0,0.51,0.44);
vec3 c=vec3(0,0.62,0.46);
vec3 d=vec3(0,0,0);
*/

/*
Cool one
vec3 a=vec3(0.56,0.53,0.86);
vec3 b=vec3(0.79,0.22,0.29);
vec3 c=vec3(0.84,1,1);
vec3 d=vec3(0.49,0.33,0.67);
*/

/*
phantasm
vec3 palette(float t){
  vec3 a=vec3(0.38,0.21,0.83);
  vec3 b=vec3(0.35,0.5,0.48);
  vec3 c=vec3(0.53,0.79,0.32);
  vec3 d=vec3(0.47,0.4,0.47);
  return a+b*cos(6.28318*(c*t+d));
}
*/

const defaultUniforms = {
  palette: {
    value: [
      new Vector3(0.5, 0.5, 0.5),
      new Vector3(0.5, 0.5, 0.5),
      new Vector3(1.0, 1.0, 1.0),
      new Vector3(0.0, 0.33, 0.67),
    ],
  },
};
const defaultPalette = [
  ...defaultUniforms.palette.value.map((x) => [
    x.getComponent(0),
    x.getComponent(1),
    x.getComponent(2),
  ]),
];

const localPaletteToolStore = create(
  immer(
    persist<{ savedPalettes: number[][][] }>(
      (get, set) => ({
        savedPalettes: [],
      }),
      { name: "sf-palette-tool" }
    )
  )
);

const PaletteToolContext = createContext({
  palette: defaultPalette,
  updatePalette: (() => {}) as Updater<number[][]>,
  uniforms: defaultUniforms,
  localStore: localPaletteToolStore,
});

export const PaletteProvider = function (props: {
  children?: ReactNode;
  defaultPalette?: number[][];
}) {
  const { defaultPalette: defaultPaletteProp, children } = props;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const defaults = useMemo(() => {
    const defaultValues = defaultPaletteProp || defaultPalette;

    const uniforms = {
      palette: {
        value: defaultValues.map(([...x]) => new Vector3(...x)),
      },
    };

    const palette = [...defaultValues];

    return { palette, uniforms };
  }, []);

  const [palette, updatePalette] = useImmer(defaults.palette);

  useEffect(() => {
    // Create a new URLSearchParams instance from the current params
    const params = new URLSearchParams(searchParams.toString());
    params.set("p", JSON.stringify(palette));
    const newURL = `${pathname}?${decodeURIComponent(params.toString())}`;
    router.replace(newURL, { scroll: false });
  }, [palette, searchParams]);

  return (
    <PaletteToolContext.Provider
      value={{
        palette,
        updatePalette,
        uniforms: defaults.uniforms,
        localStore: localPaletteToolStore,
      }}
    >
      {children}
    </PaletteToolContext.Provider>
  );
};
export const PaletteEditor = function () {
  const {
    palette,
    updatePalette,
    uniforms: uniformsCtx,
  } = useContext(PaletteToolContext);

  const uniforms = useMemo(
    () => ({ ...uniformsCtx, resolution: { value: new Vector2(100, 100) } }),
    []
  );

  useEffect(() => {
    uniforms.palette.value.forEach((x, i) => {
      x.set(palette[i][0], palette[i][1], palette[i][2]);
    });
  }, [palette]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row gap-2 justify-end">
        <Button
          material={"outline"}
          onClick={() => {
            updatePalette((x) => {
              for (let i = 0; i < x.length; i++) {
                for (let ii = 0; ii < x[i].length; ii++) {
                  const r = Math.round(Math.random() * 100) / 100;
                  x[i][ii] = r;
                }
              }
            });
          }}
        >
          <i className="icon-[ri--dice-line] mr-2" />
          <div>Randomize</div>
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {new Array(3).fill("").map((x, ii) => (
          <div
            key={ii}
            className="flex-1 flex flex-col gap-4 border-b border-foreground/20 md:border-none py-4"
          >
            {new Array(4).fill("").map((x, i) => (
              <div key={i} className="w-full flex flex-row gap-2">
                <Slider
                  max={1}
                  min={0}
                  step={0.01}
                  value={palette[i][ii]}
                  className="flex-1"
                  onChange={(e) => {
                    updatePalette((x) => {
                      const newValue = parseFloat(e.target.value);
                      x[i][ii] = newValue;
                    });
                  }}
                />
                <input
                  className="bg-background border rounded-md py-2 border-foreground/10 w-[60px] text-center"
                  type="number"
                  max={1}
                  min={0}
                  step={0.1}
                  value={palette[i][ii]}
                  onChange={(e) => {
                    updatePalette((x) => {
                      const newValue = parseFloat(e.target.value);
                      x[i][ii] = newValue;
                    });
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <Shader
        frag={frag}
        className="h-[10svh] rounded-lg overflow-hidden sticky md:relative top-[80px] md:top-0 z-[20] border-none"
        uniforms={uniforms}
      />
    </div>
  );
};

const PaletteExample = function (props: { frag: string }) {
  const { frag } = props;

  const { uniforms: uniformsCtx } = useContext(PaletteToolContext);

  const uniforms = useMemo(
    () => ({ ...uniformsCtx, resolution: { value: new Vector2(100, 100) } }),
    []
  );

  return (
    <Shader
      frag={frag}
      className="aspect-video rounded-lg overflow-hidden col-span-12 md:col-span-6"
      uniforms={uniforms}
    />
  );
};

export const PaletteExamples = function () {
  return (
    <div className="grid grid-cols-12 gap-6">
      <PaletteExample frag={exampleFrag2} />
      <PaletteExample frag={exampleFrag1} />
      <PaletteExample frag={exampleFrag4} />
      <PaletteExample frag={exampleFrag3} />
    </div>
  );
};

export const PaletteExport = function () {
  const { palette } = useContext(PaletteToolContext);

  const code = `// https://www.stevenfrady.com/tools/palette?p=${JSON.stringify(
    palette
  )}\nvec3 palette(float t){
  vec3 a=vec3(${palette[0][0]},${palette[0][1]},${palette[0][2]});
  vec3 b=vec3(${palette[1][0]},${palette[1][1]},${palette[1][2]});
  vec3 c=vec3(${palette[2][0]},${palette[2][1]},${palette[2][2]});
  vec3 d=vec3(${palette[3][0]},${palette[3][1]},${palette[3][2]});
  return a+b*cos(6.28318*(c*t+d));
}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 justify-end">
        <CopyToClipboard material={"outline"} content={code}>
          <CopyToClipboardIcon />
          <div>Copy To Clipboard</div>
        </CopyToClipboard>
      </div>
      <Code language="glsl" className="p-4 bg-foreground/10 rounded">
        {code}
      </Code>
    </div>
  );
};

export const SavedPalettes = function () {
  const { palette, uniforms, updatePalette, localStore } =
    useContext(PaletteToolContext);

  const saved = localStore((x) => x.savedPalettes);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Button
          material={"outline"}
          onClick={() => {
            localStore.setState((x) => {
              x.savedPalettes.push(palette);
            });
          }}
        >
          Save Palette
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {saved.map((x, i) => (
          <SavedPalette
            key={x.flat(2).join(",")}
            palette={x}
            onSelect={() => {
              updatePalette((xx) => {
                for (let a = 0; a < xx.length; ++a) {
                  for (let b = 0; b < xx[a].length; ++b) {
                    uniforms.palette.value[a].setComponent(b, x[a][b]);
                  }
                }
                return x;
              });
            }}
            onDelete={() => {
              localStore.setState((x) => {
                x.savedPalettes.splice(i, 1);
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SavedPalette = function (props: {
  palette: number[][];
  onSelect?: () => void;
  onDelete?: () => void;
}) {
  const { palette, onSelect, onDelete } = props;

  const { uniforms: uniformsCtx } = useContext(PaletteToolContext);

  const uniforms = useMemo(
    () => ({
      ...uniformsCtx,
      resolution: { value: new Vector2(100, 100) },
      palette: { value: palette.map((x) => new Vector3(x[0], x[1], x[2])) },
    }),
    []
  );

  return (
    <div className="flex flex-row items-center gap-2">
      <Shader
        frag={frag}
        className="h-[50px] rounded-lg overflow-hidden flex-1 cursor-pointer border-2 border-background hover:border-foreground/30"
        uniforms={uniforms}
        onClick={() => {
          onSelect?.();
        }}
      />
      <Button
        material={"ghost"}
        shape="icon"
        onClick={() => {
          onDelete?.();
        }}
      >
        <i className="icon-[ri--delete-bin-fill]" />
      </Button>
    </div>
  );
};
