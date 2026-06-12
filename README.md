
![logo](https://github.com/sFrady20/sf23/assets/3497863/27286b3f-30f8-4cb5-a449-2c5321c314bb)

<p align="center">
  <samp>
    <a href="https://www.stevenfrady.com" target="sf-site">stevenfrady.com</a> ·
    <a href="https://www.linkedin.com/in/stevenfrady/" target="sf-linkedin">LinkedIn</a> ·
    <a href="https://twitter.com/slowjamsteve" target="sf-twitter">Twitter</a> ·
    <a href="mailto:sfrady20@gmail.com">Email</a>
  </samp>
</p>

# sf26

the 2026 edition of my personal portfolio. dark, stern, and full of shaders.

## stack

- [next.js](https://nextjs.org) (app router, turbopack) + react 19 + typescript
- [tailwind 4](https://tailwindcss.com) with [earthling-ui](https://ui.earthling.dev) — my own component library and design system (oklch theme utilities, semantic color schemes)
- [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) + glslify for the shader work
- bun for everything package-related

## the fun part

page navigations are real shader transitions. `src/components/transition` snapshots the
outgoing page with the experimental [html-in-canvas](https://github.com/WICG/html-in-canvas)
api (`<canvas layoutsubtree>` + `drawElementImage`), hands the pixels to a glsl dissolve
(`src/shaders/transitions/dissolve.frag.glsl`), and melts the old page into the new one.
browsers without the api get a noise-edged curtain sweep instead. reduced-motion gets
neither, on purpose.

## map

```
src/
  app/          routes (home, shaders, tools, cast, opengraph)
  components/   shader renderer, transitions, site chrome
  data/         projects + shader metadata
  shaders/      ~150 genuary frags (2022-2026) + the includes library
  utils/        fonts, stores, misc
```

## running it

```bash
bun install
bun dev
```

## theming

color schemes are earthling-ui style `theme-*` utilities in `src/globals.css`
(dark, light, favorite, holiday), picked via the toggle in the header and
persisted in a cookie.
