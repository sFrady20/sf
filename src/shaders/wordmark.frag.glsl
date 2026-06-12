/*
the FRADY mark under liquid glass. smooth lens refraction + per-channel
dispersion + a cool prismatic sheen (cyan->violet only, no red). the glyphs
themselves stay put - the glass does the moving.
*/

uniform float time;
uniform float seed;
uniform vec2 resolution;
uniform vec2 pointer;
uniform sampler2D wordmark;
uniform float texAspect;
uniform vec3 tint;

#pragma glslify:noise=require('./includes/noise/simplex-3d')

vec2 fitUv(vec2 uv){
  //aspect-fit the texture inside the canvas region
  float rAspect=resolution.x/resolution.y;
  if(rAspect>texAspect){
    uv.x=(uv.x-.5)*rAspect/texAspect+.5;
  }else{
    uv.y=(uv.y-.5)*texAspect/rAspect+.5;
  }
  return uv;
}

float glyph(vec2 uv){
  return texture2D(wordmark,uv).a;
}

//cool-only iridescence ramp: cyan -> violet -> mint
vec3 prism(float k){
  k=fract(k);
  vec3 a=vec3(.35,.85,1.);
  vec3 b=vec3(.7,.5,1.);
  vec3 c=vec3(.45,.95,.85);
  return k<.5?mix(a,b,k*2.):mix(b,c,k*2.-1.);
}

void main(){
  vec2 uv=fitUv(gl_FragCoord.xy/resolution.xy);

  //pointer tilt, resting at center until the mouse shows up
  vec2 m=pointer==vec2(0.)
    ?vec2(0.)
    :clamp(pointer/resolution-.5,vec2(-.5),vec2(.5));

  float t=time*.15;

  //big slow lens blobs - a normal field, not grit
  float n1=noise(vec3(uv*vec2(1.4,2.8)+seed*10.,t));
  float n2=noise(vec3(uv*vec2(1.4,2.8)+4.2+seed*10.,t+3.));
  vec2 N=vec2(n1,n2);

  //refraction bend: subtle, nudged by the pointer
  vec2 bend=N*.005+m*.012;

  //dispersion: same bend, increasing index per channel
  float aR=glyph(uv+bend*.75);
  float aG=glyph(uv+bend*1.1);
  float aB=glyph(uv+bend*1.5);
  float body=aG;

  //mild extrusion sliding away from the pointer
  vec2 dir=normalize(vec2(.3,-1.)+m*1.2)*.0038;
  float depth=0.;
  for(int i=1;i<=6;i++){
    depth=max(depth,glyph(uv+bend+dir*float(i))*(1.-float(i)*.14));
  }
  float back=depth*(1.-body);

  //prismatic sheen where the lens actually separates the channels
  float disp=clamp(abs(aR-aB)*2.5,0.,1.);
  vec3 iri=prism(n1*.35+uv.x*.5+t*.6);

  //glass shading: faces angled by the lens catch light
  float shade=.86+N.x*.1+N.y*.05;
  float glint=pow(max(0.,1.-abs(N.x+N.y)),6.)*.22;

  vec3 col=tint*shade*body+tint*.25*back;
  col+=iri*disp*.4;
  col+=glint*body;

  //soft prismatic halo just outside the glyph edge
  float halo=max(max(aR,aB)-body,0.);
  col+=iri*halo*.5;

  float alpha=clamp(body+back*.8+halo*.55,0.,1.);
  gl_FragColor=vec4(col,alpha);
}
