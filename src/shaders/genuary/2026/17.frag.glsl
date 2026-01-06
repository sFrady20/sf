/*
Wallpaper group.
There are only 17 ways to cover a plane with a repeating pattern,
choose your favourite: https://en.wikipedia.org/wiki/Wallpaper_group

This is a great article about Classifying Symmetries that says there are
actually 35 tiling patterns! https://tiled.art/en/symmetryClassification/
*/

uniform float time;
uniform float seed;
uniform vec2 resolution;

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec4 color=vec4(uv,sin(time),1.);
  gl_FragColor=color;
}
