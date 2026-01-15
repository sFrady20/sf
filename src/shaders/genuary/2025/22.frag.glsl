/*
Gradients only.
*/

#pragma glslify:simplex3D=require('../../includes/noise/simplex-3d')
#pragma glslify:sigmoid=require('../../includes/math/sigmoid')

#define PI 3.141592653589793

uniform float time;
uniform float seed;
uniform vec2 resolution;
uniform vec2 pointer;

const float SPEED = 0.1;
const float EPS = 0.001;

// https://www.stevenfrady.com/tools/palette?p=[[0.5,0.5,0.5],[0.5,0.5,0.5],[1,1,1],[0,0.33,0.67]]
vec3 palette(float t){
  vec3 a=vec3(0.5,0.5,0.5);
  vec3 b=vec3(0.5,0.5,0.5);
  vec3 c=vec3(1,1,1);
  vec3 d=vec3(0,0.33,0.67);
  return a+b*cos(6.28318*(c*t+d));
}

// https://github.com/glslify/glsl-easings/blob/master/quartic-in-out.glsl
float quarticInOut(float t) {
  return t < 0.5
    ? +8.0 * pow(t, 4.0)
    : -8.0 * pow(t - 1.0, 4.0) + 1.0;
}

float map(vec2 p, float t) {
  //return smoothstep(0., 1., (sin(p.x * 20. + t) * 0.5 + 0.5) + cos(p.y * 20. + t));
  return pow(simplex3D(vec3(p.xy * 10., t)) * 0.5 + 0.5, 0.5);
}

void main(){
  float t = floor(time*SPEED) + quarticInOut(fract(time*SPEED)) + seed + time * SPEED;
  
  vec2 uv=gl_FragCoord.xy/resolution.xy;

  vec2 aspect = max(vec2(resolution.x/resolution.y,1.),vec2(1.,resolution.y/resolution.x));
  uv*=aspect;

  uv -= vec2(0.5);

  //uv *= 0.1;
  //uv.x += sin(uv.y + time * 0.03);
  //uv.y += cos(uv.x + 0.03);

  vec3 p = vec3(uv, 0.);
  p.z = map(p.xy, t);

  vec3 normal =  vec3(
    map(p.xy - vec2(EPS, 0.0), t) - map(p.xy + vec2(EPS, 0.0), t),
    map(p.xy - vec2(0.0, EPS), t) - map(p.xy + vec2(0.0, EPS), t),
    0.
  );

  float l = dot(
    normal,
    normalize(vec3(0., 0., -1.))
  );

  vec3 color = vec3(0.);
  color += normal;
  color.z += p.z;
  color += vec3(l);

  //color = palette(smoothstep(0., 1., p.z)) * l;
  
  gl_FragColor=vec4(color, 1.);
}