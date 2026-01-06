/*
Twelve principles of animation.
A video here is probably even better than reading the Wikipedia page:
12 Principles of Animation (on youtube): https://www.youtube.com/watch?v=uDqjIdI4bF4
*/

uniform float time;
uniform float seed;
uniform vec2 resolution;

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec4 color=vec4(uv,sin(time),1.);
  gl_FragColor=color;
}
