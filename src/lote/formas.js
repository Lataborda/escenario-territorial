// Formas propias del lote (etapa 7) y sombreador del resaltado por nivel de organización. Fríjol voluble: guía que
// sube en espiral por la caña central del maíz (en su mismo puesto, giro y escala) con hojas trifoliadas y vainas.
// Apagado: un atributo por instancia (0 a 1) lleva el color de la planta hacia un tono pálido y gris; las plantas del
// nivel resaltado conservan su color.
import * as THREE from 'three';
import { tallo, hoja, fruto, racimo, unir } from '../coberturas/formas.js';
import { crearAzar } from '../util/azar.js';

const COLOR = { guia: 0x6d7a3a, hoja: 0x55883a, vaina: 0x8a9a3c };
const EJE = [0.25, 0]; // caña central de la forma del maíz (coberturas/especies.js)

// Fríjol: base en y = 0; alto aproximado 1,8 en escala 1.
export function frijol(cerca) {
  const [ex, ez] = EJE;
  const azar = crearAzar(53);
  if (!cerca) {
    return unir([0.55, 1.05, 1.5].map((y, k) => racimo({ radio: 0.2, detalle: 0, relieve: 0.15, escala: [1, 0.8, 1], en: [ex + 0.1 * Math.cos(k * 2.3), y, ez + 0.1 * Math.sin(k * 2.3)], color: COLOR.hoja, semilla: 61 + k })));
  }
  const partes = [];
  const vueltas = 9;
  let previo = [ex + 0.07, 0, ez];
  for (let k = 1; k <= vueltas * 2; k++) {
    const t = k / (vueltas * 2);
    const a = t * vueltas * Math.PI;
    const punto = [ex + 0.07 * Math.cos(a), 1.85 * t, ez + 0.07 * Math.sin(a)];
    partes.push(tallo({ desde: previo, hacia: punto, radio: [0.018, 0.016], caras: 3, color: COLOR.guia }));
    previo = punto;
  }
  // Hojas trifoliadas: tres folíolos desde un mismo punto de la guía.
  for (let k = 0; k < 6; k++) {
    const y = 0.35 + 0.24 * k;
    const giro = k * 2.4 + azar();
    for (const d of [-0.7, 0, 0.7]) {
      const h = hoja({ largo: 0.24, ancho: 0.17, segmentos: 2, inclinacion: 0.5, caida: 1.1, pliegue: 0.15, giro: giro + d, altura: y, color: COLOR.hoja, nervio: 0x8fb06a });
      h.translate(ex + 0.07 * Math.cos(giro), 0, ez + 0.07 * Math.sin(giro));
      partes.push(h);
    }
  }
  for (let k = 0; k < 4; k++) {
    const a = k * 1.9;
    partes.push(fruto({ radio: 0.035, alargado: 3.2, en: [ex + 0.13 * Math.cos(a), 0.5 + 0.28 * k, ez + 0.13 * Math.sin(a)], color: COLOR.vaina }));
  }
  return unir(partes);
}

// Agrega el apagado a un material (encadena el onBeforeCompile previo, como conViento).
export function conApagado(material, intensidad = 0.82) {
  const previo = material.onBeforeCompile;
  const propia = Object.prototype.hasOwnProperty.call(material, 'customProgramCacheKey');
  const clave = propia ? material.customProgramCacheKey() : previo.toString();
  material.onBeforeCompile = (s, renderizador) => {
    previo.call(material, s, renderizador);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float apagado;\nvarying float vApagado;')
      .replace('#include <color_vertex>', '#include <color_vertex>\nvApagado = apagado;');
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vApagado;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
float grisApagado = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(grisApagado) * 0.45 + vec3(0.44, 0.43, 0.39), vApagado * ${intensidad.toFixed(2)});`,
      );
  };
  material.customProgramCacheKey = () => `${clave}|apagado`;
  return material;
}

// Atributo de apagado por instancia en una geometría (cantidad de instancias n).
export function atributoApagado(geometria, n) {
  const a = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(n, 1)), 1);
  a.setUsage(THREE.DynamicDrawUsage);
  geometria.setAttribute('apagado', a);
  return a;
}
