//shared render cap for the canvasui effects. they each ship with a hardcoded
//dpr of 2, which on a retina screen means 4x the pixels (and 4x the gpu memory)
//of the css size - fine alone, not fine next to a page full of shader canvases.
//
//if you re-vendor a component from the registry, re-apply this: swap its
//`Math.min(window.devicePixelRatio || 1, 2)` for MAX_DPR.
export const MAX_DPR = 1.25;
