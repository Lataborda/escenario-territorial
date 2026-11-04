// Especies de la vegetación natural, de la pastura y del silvopastoreo (etapa 5.c), con el realismo de maqueta de
// especies.js: nivel «cerca» con ramas y racimos de hojas; «lejos» con una copa suave y pocas caras. Base en y = 0.
// Cada especie trae su escala, la proporción de la copa [ancho, alto], los tintes por instancia y la distancia de
// detalle (umbral). Sombra 'cerca': en los rodales densos solo proyecta sombra el nivel cercano. La mata de caña está en mata.js.
import { DoubleSide } from 'three';
import { VEGETACION as V } from './tipos.js';
import { racimo, tallo, hoja, fruto, cono, unir, arco } from './formas.js';
import { crearAzar } from '../util/azar.js';

const HOJAS = { vertexColors: true, roughness: 0.85 };
const DOBLE = { ...HOJAS, side: DoubleSide };
const VERDES = [0xffffff, 0xf1f6e4, 0xe8f1ea, 0xfaf3e0, 0xf3efd8];
const SECOS = [0xffffff, 0xf4efd2, 0xfbe8c4, 0xe8ecd6, 0xf0dcb8];

// Racimos de una copa en puntos dados: [x, y, z, radio]; el último índice de claros va con el color claro.
const copa = (puntos, { color, claro, claros = [], relieve = 0.24, escala = [1, 0.85, 1], semilla }) =>
  puntos.map(([x, y, z, r], k) => racimo({ radio: r, relieve, escala, en: [x, y, z], color: claros.includes(k) ? claro : color, semilla: semilla + k }));

const ramas = (desde, puntas, radio, color = V.tronco) =>
  puntas.map((p) => tallo({ desde, hacia: p, radio, caras: 5, color }));

// Samán de potrero: tronco corto, ramas abiertas y copa en sombrilla ancha.
function saman(cerca) {
  const tronco = tallo({ hacia: [0, 2.4, 0], radio: [0.5, 0.38], caras: cerca ? 8 : 5, color: V.tronco });
  const ao = { oclusion: 0.42, radio: 5.5, desde: 4.2, hasta: 6.6 };
  if (!cerca) return unir([tronco, racimo({ radio: 1, relieve: 0.1, escala: [5.2, 1.6, 5.2], en: [0, 5.6, 0], color: V.saman, semilla: 101 })], ao);
  const puntas = [0, 1, 2, 3].map((k) => [Math.cos(k * 1.62 + 0.4) * 3.2, 4.7, Math.sin(k * 1.62 + 0.4) * 3.2]);
  const anillo = [...Array(8)].map((_, k) => {
    const a = (k / 8) * Math.PI * 2 + 0.2;
    const r = k % 2 ? 3.9 : 3.3;
    return [Math.cos(a) * r, 5.2 + 0.3 * (k % 2), Math.sin(a) * r, 1.7 + 0.2 * (k % 3)];
  });
  return unir([tronco, ...ramas([0, 2.2, 0], puntas, [0.26, 0.13]), ...copa([...anillo, [0, 5.9, 0, 2.6]], { color: V.saman, escala: [1.25, 0.55, 1.25], semilla: 102 })], ao);
}

// Árbol del bosque seco: copa irregular de varios racimos, con partes más claras (follaje que cambia en la sequía).
function seco(cerca) {
  const tronco = tallo({ hacia: [0, 3, 0], radio: [0.3, 0.2], caras: cerca ? 7 : 5, color: V.tronco });
  const ao = { oclusion: 0.38, radio: 2.6, desde: 3.4, hasta: 6.4 };
  if (!cerca) return unir([tronco, racimo({ radio: 1, relieve: 0.2, escala: [2.4, 1.9, 2.3], en: [0.2, 5.1, 0.1], color: V.seco, semilla: 121 })], ao);
  const puntas = [0.3, 2.4, 4.4].map((a) => [Math.cos(a) * 1.4, 4.6, Math.sin(a) * 1.4]);
  const puntos = [[1.3, 4.7, 0.3, 1.3], [-1, 4.9, 1.1, 1.45], [-0.4, 4.6, -1.4, 1.6], [0.2, 6, 0.2, 1.3], [1, 5.7, -0.9, 1.45], [-1.2, 5.8, -0.2, 1.3]];
  return unir([tronco, ...ramas([0, 2.7, 0], puntas, [0.15, 0.08]), ...copa(puntos, { color: V.seco, claro: V.secoClaro, claros: [4], escala: [1, 0.8, 1], semilla: 123 })], ao);
}

// Ceiba emergente: fuste alto y claro con aletones, ramas casi horizontales y copa plana por encima del bosque.
function ceiba(cerca) {
  const partes = [tallo({ hacia: [0, 9, 0], radio: [0.75, 0.42], caras: cerca ? 9 : 6, color: V.troncoClaro })];
  const ao = { oclusion: 0.4, radio: 5, desde: 8.5, hasta: 11.5 };
  if (!cerca) return unir([...partes, racimo({ radio: 1, relieve: 0.1, escala: [5.4, 1.5, 5.4], en: [0, 10.6, 0], color: V.ceiba, semilla: 131 })], ao);
  for (let k = 0; k < 4; k++) {
    const a = k * 1.57 + 0.3;
    partes.push(cono({ radio: 0.5, alto: 2.2, en: [Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55], caras: 4, color: V.troncoClaro }));
  }
  const puntas = [0, 1, 2, 3, 4].map((k) => [Math.cos(k * 1.26 + 0.5) * 3.8, 10.1, Math.sin(k * 1.26 + 0.5) * 3.8]);
  partes.push(...ramas([0, 8.4, 0], puntas, [0.3, 0.14], V.troncoClaro));
  const puntos = [...puntas.map(([x, , z]) => [x, 10.6, z, 1.7]), [0, 11.1, 0, 2.2]];
  return unir([...partes, ...copa(puntos, { color: V.ceiba, escala: [1.35, 0.5, 1.35], semilla: 132 })], ao);
}

// Árbol ribereño: copa alta y ovalada, verde oscuro.
function ribereno(cerca) {
  const tronco = tallo({ hacia: [0, 3.6, 0], radio: [0.32, 0.22], caras: cerca ? 7 : 5, color: V.tronco });
  const ao = { oclusion: 0.38, radio: 2.4, desde: 3.8, hasta: 8.5 };
  if (!cerca) return unir([tronco, racimo({ radio: 1, relieve: 0.14, escala: [2.4, 3.1, 2.4], en: [0, 6.6, 0], color: V.ribereno, semilla: 141 })], ao);
  const puntas = [0.8, 2.9, 5].map((a) => [Math.cos(a) * 0.9, 5.4, Math.sin(a) * 0.9]);
  const puntos = [[0.9, 5, 0.4, 1.55], [-0.8, 5.3, 0.7, 1.55], [0.1, 5.1, -1, 1.45], [0.5, 6.7, 0.3, 1.45], [-0.6, 6.9, -0.4, 1.35], [0, 8.2, 0, 1.3]];
  return unir([tronco, ...ramas([0, 3.2, 0], puntas, [0.14, 0.08]), ...copa(puntos, { color: V.ribereno, escala: [1, 0.9, 1], semilla: 142 })], ao);
}

// Árbol altoandino: fuste esbelto, copa de cúpulas densas y oscuras con brotes claros arriba.
function andino(cerca) {
  const tronco = tallo({ hacia: [0, 4.4, 0], radio: [0.3, 0.2], caras: cerca ? 7 : 5, color: V.tronco });
  const ao = { oclusion: 0.42, radio: 2.4, desde: 4.5, hasta: 9.5 };
  if (!cerca) return unir([tronco, racimo({ radio: 1, relieve: 0.16, escala: [2.3, 2.9, 2.3], en: [0, 7.3, 0], color: V.andino, semilla: 151 })], ao);
  const puntas = [0.2, 2.3, 4.3].map((a) => [Math.cos(a) * 1, 6, Math.sin(a) * 1]);
  const puntos = [[1, 5.8, 0.3, 1.4], [-0.9, 6.1, 0.8, 1.45], [-0.2, 5.9, -1.1, 1.4], [0.4, 7.5, 0.2, 1.5], [-0.6, 7.8, -0.5, 1.3], [0.7, 9.1, -0.3, 1.05], [-0.3, 9.3, 0.4, 0.9]];
  return unir([tronco, ...ramas([0, 4, 0], puntas, [0.13, 0.08]), ...copa(puntos, { color: V.andino, claro: V.andinoClaro, claros: [5, 6], escala: [1, 0.9, 1], semilla: 153 })], ao);
}

// Helecho arbóreo del bosque altoandino: tallo delgado y corona de frondas en arco.
function helecho(cerca) {
  const partes = [tallo({ hacia: [0, 4.6, 0], radio: [0.2, 0.15], caras: cerca ? 6 : 4, color: V.tronco })];
  const n = cerca ? 11 : 6;
  for (let k = 0; k < n; k++) {
    partes.push(hoja({ largo: 2.9, ancho: 0.75, segmentos: cerca ? 4 : 2, inclinacion: 0.75, caida: 1.7, pliegue: cerca ? 0.25 : 0, giro: k * 2.4, altura: 4.5, color: V.helecho, nervio: 0x8a9a50 }));
  }
  return unir(partes);
}

// Guadual: macolla de culmos que se arquean hacia afuera, con follaje fino en la mitad alta.
function guadua(cerca) {
  const azar = crearAzar(cerca ? 161 : 162);
  const n = cerca ? 11 : 6;
  const partes = [];
  for (let k = 0; k < n; k++) {
    const rumbo = (k / n) * Math.PI * 2 + azar() * 0.5;
    const r = 0.25 + 0.35 * azar();
    const desde = [Math.cos(rumbo) * r, 0, Math.sin(rumbo) * r];
    const culmo = arco({ desde, alto: 9.5 + 3 * azar(), inclinacion: 0.35 + 0.35 * azar(), rumbo, tramos: cerca ? 4 : 2, radio: [0.13, 0.07], caras: cerca ? 5 : 3, color: V.guadua });
    partes.push(...culmo.partes);
    if (!cerca) continue;
    culmo.puntos.slice(2).forEach((en, i) => partes.push(racimo({ radio: 0.85, detalle: 0, relieve: 0.3, escala: [1.5, 0.7, 1.5], en, color: V.guaduaHoja, semilla: 163 + k * 3 + i })));
  }
  if (!cerca) partes.push(racimo({ radio: 1, relieve: 0.18, escala: [2.6, 3.4, 2.6], en: [0, 8.6, 0], color: V.guaduaHoja, semilla: 170 }));
  return unir(partes, { oclusion: 0.3, radio: 2.5, desde: 2, hasta: 10 });
}

// Frailejón: tallo cubierto por la falda de hojas secas, roseta de hojas lanosas y plateadas, inflorescencias.
function frailejon(cerca) {
  const partes = [
    tallo({ hacia: [0, 0.35, 0], radio: [0.22, 0.22], caras: cerca ? 6 : 4, color: V.frailejonTallo }),
    tallo({ desde: [0, 0.3, 0], hacia: [0, 1.65, 0], radio: [0.26, 0.34], caras: cerca ? 7 : 5, color: V.frailejonFalda }),
  ];
  if (!cerca) return unir([...partes, racimo({ radio: 1, detalle: 0, relieve: 0.12, escala: [0.95, 0.5, 0.95], en: [0, 1.85, 0], color: V.frailejonHoja, semilla: 181, luz: 1.25 })]);
  for (let k = 0; k < 20; k++) {
    partes.push(hoja({ largo: 1.15 - 0.12 * (k % 3), ancho: 0.3, segmentos: 2, inclinacion: 1.05 - 0.08 * (k % 4), caida: 0.9, pliegue: 0.3, giro: k * 2.4, altura: 1.6, color: V.frailejonHoja, nervio: 0xdfe2c8 }));
  }
  partes.push(racimo({ radio: 0.28, detalle: 0, en: [0, 1.78, 0], color: V.frailejonHoja, semilla: 182 }));
  for (const a of [0.6, 3.4]) {
    partes.push(tallo({ desde: [0, 1.7, 0], hacia: [Math.cos(a) * 0.4, 2.7, Math.sin(a) * 0.4], radio: [0.03, 0.02], caras: 4, color: V.frailejonHoja }));
    partes.push(fruto({ radio: 0.1, en: [Math.cos(a) * 0.43, 2.75, Math.sin(a) * 0.43], color: V.frailejonFlor }));
  }
  return unir(partes);
}

// Junco y enea del humedal: hojas finas casi verticales y espigas pardas.
function junco(cerca) {
  if (!cerca) {
    const mata = racimo({ radio: 1, detalle: 0, relieve: 0.2, escala: [0.5, 0.95, 0.5], en: [0, 0.85, 0], color: V.junco, semilla: 191 });
    return unir([mata, tallo({ desde: [0.15, 0.8, 0], hacia: [0.18, 2, 0.05], radio: [0.05, 0.05], caras: 3, color: V.enea })]);
  }
  const partes = [];
  for (let k = 0; k < 9; k++) {
    partes.push(hoja({ largo: 1.5 + 0.3 * (k % 3), ancho: 0.09, segmentos: 2, inclinacion: 1.45, caida: 0.7, pliegue: 0, giro: k * 2.4, color: V.junco, nervio: V.junco }));
  }
  for (const [x, z, h] of [[0.1, 0.05, 2.1], [-0.12, 0.1, 1.85]]) {
    partes.push(tallo({ desde: [x, 0, z], hacia: [x, h, z], radio: [0.025, 0.02], caras: 3, color: V.junco }));
    partes.push(tallo({ desde: [x, h - 0.5, z], hacia: [x, h - 0.1, z], radio: [0.07, 0.07], caras: 5, color: V.enea }));
  }
  return unir(partes);
}

// escala: [mínima, máxima]; ancho y alto: proporción de la copa; umbral: distancia de la cámara del nivel «cerca».
const una = (fn, material = HOJAS, extra = {}) => () => [{ lejos: fn(false), cerca: fn(true), material, sombra: true, recibe: true, colorInstancia: true, ...extra }];
export const ARBOLES = {
  saman: { umbral: 260, escala: [0.8, 1.15], ancho: [1, 1.15], alto: [0.9, 1.1], tintes: VERDES, mallas: una(saman) },
  seco: { umbral: 220, escala: [0.85, 1.2], ancho: [0.9, 1.15], alto: [0.85, 1.1], tintes: SECOS, mallas: una(seco, HOJAS, { sombra: 'cerca' }) },
  ceiba: { umbral: 300, escala: [0.9, 1.15], ancho: [0.95, 1.1], alto: [0.95, 1.1], tintes: VERDES, mallas: una(ceiba) },
  ribereno: { umbral: 220, escala: [0.8, 1.15], ancho: [0.9, 1.15], alto: [0.85, 1.15], tintes: VERDES, mallas: una(ribereno, HOJAS, { sombra: 'cerca' }) },
  guadua: { umbral: 220, escala: [0.85, 1.15], ancho: [0.9, 1.1], alto: [0.9, 1.1], tintes: VERDES, mallas: una(guadua, HOJAS, { sombra: 'cerca' }) },
  andino: { umbral: 220, escala: [0.85, 1.2], ancho: [0.9, 1.1], alto: [0.95, 1.25], tintes: VERDES, mallas: una(andino, HOJAS, { sombra: 'cerca' }) },
  helecho: { umbral: 200, escala: [0.85, 1.15], ancho: [1, 1], alto: [0.85, 1.15], tintes: VERDES, mallas: una(helecho, DOBLE, { sombra: false }) },
  frailejon: { umbral: 200, escala: [1.1, 1.6], ancho: [1, 1], alto: [0.85, 1.2], tintes: VERDES, mallas: una(frailejon, DOBLE, { sombra: false }) },
  junco: { umbral: 150, escala: [0.8, 1.3], ancho: [1, 1], alto: [0.85, 1.15], tintes: VERDES, mallas: una(junco, DOBLE, { sombra: false }) },
};
