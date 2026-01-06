/*
Self portrait.
For example, get started with a very basic human face, a few circles or oval shapes.
How far can you improve this by adding features that actually look like you.
Try adding eyes, eyelashes, hair, and make a few parameters or colors variable.
Even though you are aiming for a self portrait, it might be fun to render some
random variations as well.
*/

uniform float time;
uniform float seed;
uniform vec2 resolution;

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec4 color=vec4(uv,sin(time),1.);
  gl_FragColor=color;
}
