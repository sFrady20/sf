uniform float time;
uniform float seed;
uniform vec2 resolution;

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  
  //normalize uv
  uv-=vec2(.5);
  uv*=max(vec2(resolution.x/resolution.y,1.),vec2(1.,resolution.y/resolution.x));

  vec3 col=vec3(uv,sin(time));
  
  gl_FragColor=vec4(col, 1.);
}