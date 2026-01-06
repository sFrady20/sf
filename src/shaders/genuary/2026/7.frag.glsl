/*
Boolean algebra.
Get inspired by Boolean algebra, in any way.
https://en.wikipedia.org/wiki/Boolean_algebra
*/

uniform float time;
uniform float seed;
uniform vec2 resolution;

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec4 color=vec4(uv,sin(time),1.);
  gl_FragColor=color;
}
