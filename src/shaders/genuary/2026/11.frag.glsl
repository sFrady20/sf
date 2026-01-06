/*
Quine.
A Quine is a form of code poetry, it's a computer program that
outputs exactly its own source code.
https://en.wikipedia.org/wiki/Quine_(computing)
*/

uniform float time;
uniform float seed;
uniform vec2 resolution;

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec4 color=vec4(uv,sin(time),1.);
  gl_FragColor=color;
}
