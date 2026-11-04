// Material de las teselas: color por vértice y caras planas. En las unidades con caña (atributo «cana», de 0 a 1),
// la tapa muestra hileras y surcos con el rumbo del lote, follaje y, en la caña madura, espigas; la cara del borde
// muestra tallos con nudos y una franja de hojas arriba. El dibujo depende de la edad del lote (atributo «marca»:
// rumbo x, rumbo z, edad, arriba). Cada dibujo se atenúa hacia su promedio cuando su periodo ocupa pocos píxeles:
// sin parpadeo a distancia. Sin texturas: todo se calcula en el sombreador.
import * as THREE from 'three';

export const PERIODO_SURCO = 4; // separación entre hileras, en unidades de escena (exagerada, como en una maqueta)
const PERIODO_TALLO = 0.42;
const f = (x) => x.toFixed(3);

const VERTICE_PARS = /* glsl */ `
attribute vec4 marca;
attribute float cana;
varying vec3 vMundo;
varying vec4 vMarca;
varying float vCana;
`;

const VERTICE = /* glsl */ `
#include <begin_vertex>
vMundo = (modelMatrix * vec4(transformed, 1.0)).xyz;
vMarca = marca;
vCana = cana;
`;

const FRAGMENTO_PARS = /* glsl */ `
varying vec3 vMundo;
varying vec4 vMarca;
varying float vCana;
float azarCana(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p)) + 32768);
  uint h = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  h = h * 1597334677u;
  h ^= h >> 16u;
  return float(h) / 4294967295.0;
}
float ruidoCana(vec2 p) {
  vec2 i = floor(p);
  vec2 g = fract(p);
  g = g * g * (3.0 - 2.0 * g);
  float a = azarCana(i);
  float b = azarCana(i + vec2(1.0, 0.0));
  float c = azarCana(i + vec2(0.0, 1.0));
  float d = azarCana(i + vec2(1.0, 1.0));
  return mix(mix(a, b, g.x), mix(c, d, g.x), g.y);
}
// Contraste de un dibujo según el periodo en pantalla: 1 nítido, 0 promedio (ancho: periodos por píxel).
float nitidez(float ancho) { return 1.0 - smoothstep(0.28, 0.65, ancho); }
vec3 normalMundo() { return normalize(cross(dFdx(vMundo), dFdy(vMundo))); }
`;

const COLOR = /* glsl */ `
#include <color_fragment>
if (vCana > 0.002) {
  vec3 nM = normalMundo();
  vec3 base = diffuseColor.rgb;
  vec3 color = base;
  float edad = vMarca.z;
  if (abs(nM.y) > 0.6) {
    // Tapa: hileras (crestas) y entresurcos, follaje a lo largo de la hilera.
    vec2 d = vMarca.xy;
    float s = dot(vMundo.xz, vec2(-d.y, d.x)) / ${f(PERIODO_SURCO)};
    float t = dot(vMundo.xz, d);
    float cresta = mix(0.5, 0.5 - 0.5 * cos(6.2832 * s), nitidez(fwidth(s)));
    vec2 q = vec2(t * 0.7, s * 3.0);
    float follaje = mix(0.5, ruidoCana(q) * 0.6 + ruidoCana(q * 2.3 + 7.0) * 0.4, nitidez(fwidth(q.x) * 0.8));
    if (edad < 0.5) {
      // Recién cortada: rastrojo pajizo en las hileras y suelo entre ellas.
      color = mix(vec3(0.42, 0.34, 0.25), base, smoothstep(0.2, 0.8, cresta)) * (0.9 + 0.2 * follaje);
    } else if (edad < 1.5) {
      // En crecimiento: hileras verdes y entresurco abierto.
      color = base * mix(0.6, 1.1, cresta) * (0.86 + 0.28 * follaje);
    } else {
      // Madura: dosel cerrado y espigas claras.
      color = base * mix(0.84, 1.06, cresta) * (0.82 + 0.36 * follaje);
      vec2 pe = vMundo.xz * 0.8;
      float espiga = mix(0.1, smoothstep(0.7, 0.86, ruidoCana(pe + 31.0)), nitidez(fwidth(pe.x) * 0.7));
      color = mix(color, vec3(0.8, 0.77, 0.74), espiga * 0.32);
    }
  } else if (edad < 0.5) {
    color = base * 0.82;
  } else {
    // Cara del borde: tallos verticales con nudos, franja de hojas arriba y pie en sombra.
    float u = (abs(nM.x) > abs(nM.z) ? vMundo.z : vMundo.x) / ${f(PERIODO_TALLO)};
    float k = nitidez(fwidth(u));
    float tallo = mix(0.6, 1.0 - smoothstep(0.5, 0.85, abs(fract(u) - 0.5) * 2.0), k);
    float nudo = k * smoothstep(0.86, 0.96, fract(vMundo.y / 0.45 + azarCana(vec2(floor(u), 3.0))));
    vec3 tallos = mix(base * 0.36, mix(base, vec3(0.78, 0.72, 0.46), 0.45), tallo) * (1.0 - 0.3 * nudo);
    float franja = 0.7 + 0.18 * (ruidoCana(vec2(u * 0.35, 5.0)) - 0.5);
    vec3 dosel = base * (0.78 + 0.3 * ruidoCana(vec2(u * 0.5, vMundo.y * 2.0)));
    color = mix(tallos, dosel, smoothstep(franja - 0.04, franja + 0.04, vMarca.w)) * mix(0.55, 1.0, smoothstep(0.12, 0.45, vMarca.w));
  }
  diffuseColor.rgb = mix(base, color, vCana);
}
`;

// Relieve de las hileras en la luz: la normal se inclina a través del surco.
const NORMAL = /* glsl */ `
#include <normal_fragment_begin>
if (vCana > 0.002 && abs(normalMundo().y) > 0.6) {
  vec2 perp = vec2(-vMarca.y, vMarca.x);
  float s = dot(vMundo.xz, perp) / ${f(PERIODO_SURCO)};
  float fuerza = (vMarca.z < 1.5 ? 0.45 : 0.18) * nitidez(fwidth(s)) * vCana;
  vec3 p = (viewMatrix * vec4(perp.x, 0.0, perp.y, 0.0)).xyz;
  normal = normalize(normal - p * sin(6.2832 * s) * fuerza);
}
`;

export function crearMaterialSuperficie() {
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 });
  material.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace('#include <common>', `#include <common>\n${VERTICE_PARS}`).replace('#include <begin_vertex>', VERTICE);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENTO_PARS}`)
      .replace('#include <color_fragment>', COLOR)
      .replace('#include <normal_fragment_begin>', NORMAL);
  };
  material.customProgramCacheKey = () => 'superficie-cana';
  return material;
}
