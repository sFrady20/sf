/*
slow monochrome smoke for the hero. meant to sit behind the wordmark
with css blending so it works on every theme.
*/

uniform float time;
uniform float seed;
uniform vec2 resolution;

#pragma glslify:noise=require('./includes/noise/simplex-3d')

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec2 p=uv*vec2(resolution.x/resolution.y,1.)*1.6+seed*10.;

  float t=time*.05;

  //domain-warped fbm
  vec2 q=p+vec2(noise(vec3(p,t)),noise(vec3(p+4.7,t)))*.6;
  float n=0.;
  float amp=.55;
  for(int i=0;i<5;i++){
    n+=amp*noise(vec3(q,t));
    q*=2.03;
    amp*=.5;
  }
  n=n*.5+.5;

  float v=smoothstep(.3,.9,n);
  gl_FragColor=vec4(vec3(v),v);
}
