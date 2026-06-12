/*
page transition - melts the outgoing page into the next one.
with a snapshot (html-in-canvas) the old page drips + dissolves away.
without one it falls back to a noise-edged curtain sweep.
*/

uniform float time;
uniform vec2 resolution;
uniform float progress;
uniform float hasSnapshot;
uniform vec3 tint;
uniform sampler2D page;

#pragma glslify:noise=require('../includes/noise/simplex-3d')

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  float p=smoothstep(0.,1.,progress);

  if(hasSnapshot>.5){
    //big soft noise drives where the page lets go first
    float n=noise(vec3(uv*3.,p*1.5))*.5+.5;
    float n2=noise(vec3(uv*14.,p*3.))*.5+.5;

    //page slides down as it goes, unevenly
    vec2 suv=uv;
    suv.y+=p*p*(.35+.65*n);
    suv.x+=(n2-.5)*.06*p;

    vec4 pg=texture2D(page,suv);

    //dissolve threshold w/ grainy edge
    float a=1.-smoothstep(n-.25,n+.1,p*1.35+(n2-.5)*.2);
    a*=step(suv.y,1.);
    //fully opaque until the melt actually starts
    a=mix(1.,a,smoothstep(0.,.1,p));

    gl_FragColor=vec4(pg.rgb,pg.a*a);
  }else{
    //two-phase curtain: cover left->right, reveal left->right
    float edge=(noise(vec3(uv.y*4.,uv.x*2.,time*.5)))*.12;
    float q1=smoothstep(0.,1.,clamp(p*2.,0.,1.));
    float q2=smoothstep(0.,1.,clamp(p*2.-1.,0.,1.));
    float x=uv.x+edge;
    float covered=step(x,q1*1.2)*(1.-step(x,q2*1.2-.1));
    gl_FragColor=vec4(tint,covered);
  }
}
