// Especies del mosaico campesino y del silvopastoreo con dos niveles de detalle: «cerca», con racimos de hojas, ramas, frutos y hojas
// plegadas; «lejos», con una copa suave y pocas caras. Base en y = 0. Escala 1: cafeto de 1,7 unidades de alto.
import { DoubleSide } from 'three';
import { VEGETACION as V } from './tipos.js';
import { racimo, tallo, hoja, fruto, cono, caja, unir } from './formas.js';
import { crearAzar } from '../util/azar.js';

const HOJAS = { vertexColors: true, roughness: 0.82 };
const DOBLE = { ...HOJAS, side: DoubleSide };
const SUELO = { vertexColors: true, roughness: 1 };

// Frutos repartidos sobre la superficie de una copa esférica.
function frutos(n, { centro, radio, color, semilla, tamano = 0.12 }) {
  const azar = crearAzar(semilla);
  const lista = [];
  for (let k = 0; k < n; k++) {
    const a = azar() * Math.PI * 2;
    const y = -0.35 + azar() * 0.9;
    const r = Math.sqrt(1 - y * y) * radio;
    lista.push(fruto({ radio: tamano, en: [centro[0] + Math.cos(a) * r, centro[1] + y * radio, centro[2] + Math.sin(a) * r], color }));
  }
  return lista;
}

// Guamo (árbol de sombrío del café): copa en sombrilla ancha sobre tres ramas.
function guamo(cerca) {
  const tronco = tallo({ hacia: [0, 3, 0], radio: [0.34, 0.24], caras: cerca ? 7 : 5, color: V.tronco });
  const ao = { oclusion: 0.35, radio: 3.2, desde: 3.4, hasta: 5.6 };
  if (!cerca) return unir([tronco, racimo({ radio: 1, relieve: 0.12, escala: [3, 1.15, 3], en: [0, 4.5, 0], color: V.guamo, semilla: 3 })], ao);
  const partes = [tronco];
  for (const a of [0.2, 2.3, 4.3]) {
    partes.push(tallo({ desde: [0, 2.6, 0], hacia: [Math.cos(a) * 1.9, 4.1, Math.sin(a) * 1.9], radio: [0.17, 0.09], caras: 5, color: V.tronco }));
  }
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    const r = k % 2 ? 2.2 : 1.9;
    partes.push(racimo({ radio: 1.25 + 0.15 * (k % 3), escala: [1.15, 0.62, 1.15], en: [Math.cos(a) * r, 4.35 + 0.25 * (k % 2), Math.sin(a) * r], color: V.guamo, semilla: 10 + k }));
  }
  partes.push(racimo({ radio: 1.6, escala: [1.2, 0.6, 1.2], en: [0, 4.95, 0], color: V.guamo, semilla: 20 }));
  return unir(partes, ao);
}

// Cafeto: arbusto en pisos de follaje oscuro, con cerezas rojas.
function cafeto(cerca) {
  if (!cerca) return racimo({ radio: 0.62, detalle: 0, relieve: 0.1, escala: [1, 1.4, 1], en: [0, 0.82, 0], color: V.cafeto, semilla: 31 });
  const partes = [
    tallo({ hacia: [0, 0.5, 0], radio: [0.06, 0.05], caras: 4, color: V.tronco }),
    racimo({ radio: 0.62, escala: [1, 0.8, 1], en: [0, 0.62, 0], color: V.cafeto, semilla: 32 }),
    racimo({ radio: 0.5, detalle: 0, relieve: 0.15, escala: [1, 0.85, 1], en: [0.05, 1.08, 0.02], color: V.cafeto, semilla: 33 }),
    racimo({ radio: 0.32, detalle: 0, en: [0, 1.48, 0], color: V.cafeto, semilla: 34 }),
  ];
  for (let k = 0; k < 4; k++) {
    const a = k * 1.7 + 0.3;
    partes.push(fruto({ radio: 0.075, en: [Math.cos(a) * 0.58, 0.55 + 0.12 * k, Math.sin(a) * 0.58], color: V.cereza }));
  }
  return unir(partes, { oclusion: 0.3, radio: 0.7, desde: 0.2, hasta: 1.6 });
}

// Plátano: pseudotallo y hojas largas en arco; las viejas cuelgan y se secan en el borde. Cerca: racimo y bellota.
function platano(cerca) {
  const alto = 2;
  const partes = [tallo({ hacia: [0, alto, 0], radio: [0.22, 0.15], caras: cerca ? 7 : 5, color: V.pseudotallo })];
  const n = cerca ? 7 : 5;
  for (let k = 0; k < n; k++) {
    const vieja = k / (n - 1);
    partes.push(
      hoja({
        largo: 2.3 + 0.4 * vieja,
        ancho: 0.8,
        segmentos: cerca ? 5 : 2,
        inclinacion: 1.2 - 0.6 * vieja,
        caida: 1.2 + 1.2 * vieja,
        pliegue: cerca ? 0.3 : 0,
        giro: k * 2.4,
        altura: alto - 0.05 * k,
        color: V.platano,
        seca: cerca ? 0.8 * vieja : 0,
      }),
    );
  }
  if (cerca) {
    partes.push(tallo({ desde: [0.1, alto - 0.1, 0], hacia: [0.45, alto - 0.4, 0.05], radio: [0.05, 0.04], caras: 4, color: V.pseudotallo }));
    partes.push(racimo({ radio: 0.26, detalle: 0, relieve: 0.3, escala: [1, 1.7, 1], en: [0.48, alto - 0.78, 0.05], color: V.racimoPlatano, semilla: 41 }));
    partes.push(cono({ radio: 0.09, alto: 0.3, en: [0.5, alto - 1.2, 0.05], color: V.bellota, abajo: true }));
  }
  return unir(partes);
}

// Cítrico: copa redonda y densa con frutos naranja.
function citrico(cerca) {
  const tronco = tallo({ hacia: [0, 1.2, 0], radio: [0.16, 0.12], caras: cerca ? 6 : 4, color: V.tronco });
  const centro = [0, 2.3, 0];
  const ao = { oclusion: 0.3, radio: 1.5, desde: 1.2, hasta: 3.5 };
  if (!cerca) {
    const copa = racimo({ radio: 1.45, relieve: 0.12, escala: [1, 0.92, 1], en: centro, color: V.citrico, semilla: 51 });
    return unir([tronco, copa, ...frutos(4, { centro, radio: 1.38, color: V.naranja, semilla: 52, tamano: 0.16 })], ao);
  }
  const partes = [tronco, racimo({ radio: 1.05, en: [0, 2.45, 0], color: V.citrico, semilla: 53 })];
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    partes.push(racimo({ radio: 0.82, detalle: 0, relieve: 0.18, en: [Math.cos(a) * 0.72, 2.05 + 0.2 * (k % 2), Math.sin(a) * 0.72], color: V.citrico, semilla: 54 + k }));
  }
  return unir([...partes, ...frutos(10, { centro, radio: 1.45, color: V.naranja, semilla: 58 })], ao);
}

// Mango: copa en cúpula, oscura, con brotes nuevos de color bronce.
function mango(cerca) {
  const tronco = tallo({ hacia: [0, 1.6, 0], radio: [0.3, 0.2], caras: cerca ? 7 : 5, color: V.tronco });
  const ao = { oclusion: 0.38, radio: 2.4, desde: 1.8, hasta: 4.4 };
  if (!cerca) return unir([tronco, racimo({ radio: 2.1, relieve: 0.12, escala: [1, 0.82, 1], en: [0, 3.05, 0], color: V.mango, semilla: 61 })], ao);
  const partes = [tronco];
  for (const a of [0.5, 2.6, 4.6]) partes.push(tallo({ desde: [0, 1.4, 0], hacia: [Math.cos(a) * 1.1, 2.6, Math.sin(a) * 1.1], radio: [0.15, 0.09], caras: 5, color: V.tronco }));
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    partes.push(racimo({ radio: 1.3, detalle: k % 2, relieve: 0.18, escala: [1, 0.85, 1], en: [Math.cos(a) * 1.4, 2.7, Math.sin(a) * 1.4], color: V.mango, semilla: 62 + k }));
  }
  partes.push(racimo({ radio: 1.45, en: [0, 3.45, 0], color: V.mango, semilla: 66 }));
  partes.push(racimo({ radio: 0.7, en: [0.9, 3.75, -0.5], color: V.mangoNuevo, semilla: 67 }));
  return unir(partes, ao);
}

// Era de la huerta: cama de suelo (sin tinte) y hortalizas en zigzag (tinte por instancia).
const cama = () => caja({ ancho: 1, alto: 0.6, fondo: 3.6, base: -0.42, color: V.suelo, tapa: V.sueloClaro });
function hortalizas(cerca) {
  if (!cerca) return racimo({ radio: 1, detalle: 0, relieve: 0.1, escala: [0.4, 0.2, 1.65], en: [0, 0.2, 0], color: 0xffffff, semilla: 71 });
  const partes = [];
  for (let k = 0; k < 6; k++) {
    partes.push(racimo({ radio: 0.27, detalle: 0, relieve: 0.35, escala: [1, 0.6, 1], en: [k % 2 ? 0.2 : -0.2, 0.24, -1.5 + k * 0.6], color: 0xffffff, semilla: 72 + k }));
  }
  return unir(partes);
}

// Maíz: tres cañas con hojas largas y espiga.
function maiz(cerca) {
  const pies = [[-0.3, -0.4], [0.25, 0], [-0.1, 0.45]];
  const partes = [];
  pies.forEach(([x, z], i) => {
    if (!cerca) return partes.push(cono({ radio: 0.22, alto: 2.1, en: [x, 0, z], caras: 4, color: V.maiz }));
    partes.push(tallo({ desde: [x, 0, z], hacia: [x, 2.1, z], radio: [0.05, 0.035], caras: 4, color: V.maiz }));
    for (let k = 0; k < 4; k++) {
      const h = hoja({ largo: 0.8, ancho: 0.14, segmentos: 3, inclinacion: 0.7, caida: 1.6, pliegue: 0.2, giro: k * 1.9 + i, altura: 0.5 + 0.35 * k, color: V.maiz });
      h.translate(x, 0, z);
      partes.push(h);
    }
    partes.push(cono({ radio: 0.06, alto: 0.35, en: [x, 2.1, z], caras: 4, color: V.espiga }));
  });
  return unir(partes);
}

// Leucaena del silvopastoreo intensivo: arbusto de follaje fino en setos densos.
function leucaena(cerca) {
  const ao = { oclusion: 0.25, radio: 0.9, desde: 1, hasta: 2.8 };
  const tronco = tallo({ hacia: [0.05, 1.4, 0], radio: [0.07, 0.05], caras: 4, color: V.tronco });
  if (!cerca) return unir([racimo({ radio: 1, detalle: 0, relieve: 0.2, escala: [0.85, 1.3, 0.85], en: [0, 1.65, 0], color: V.leucaena, semilla: 81 })], ao);
  const partes = [tronco, tallo({ desde: [0, 0.6, 0], hacia: [-0.4, 1.7, 0.2], radio: [0.05, 0.03], caras: 4, color: V.tronco })];
  for (const [x, y, z, r, semilla] of [[0.2, 2.3, 0, 0.66, 82], [-0.35, 1.8, 0.2, 0.58, 83], [0.1, 2.75, -0.15, 0.48, 85]]) {
    partes.push(racimo({ radio: r, relieve: 0.32, en: [x, y, z], color: V.leucaena, semilla }));
  }
  return unir(partes, ao);
}

// umbral: distancia de la cámara (unidades de escena) por debajo de la cual se dibuja el nivel «cerca».
const una = (fn, material, extra = {}) => () => [{ lejos: fn(false), cerca: fn(true), material, sombra: true, recibe: true, colorInstancia: true, ...extra }];
export const ESPECIES = {
  guamo: { umbral: 480, mallas: una(guamo, HOJAS) },
  cafeto: { umbral: 200, mallas: una(cafeto, HOJAS, { sombra: false }) },
  platano: { umbral: 400, mallas: una(platano, DOBLE) },
  citrico: { umbral: 420, mallas: una(citrico, HOJAS) },
  mango: { umbral: 420, mallas: una(mango, HOJAS) },
  era: {
    umbral: 220,
    mallas: () => {
      const c = cama();
      return [
        { lejos: c, cerca: c, material: SUELO, recibe: true },
        { lejos: hortalizas(false), cerca: hortalizas(true), material: HOJAS, recibe: true, colorInstancia: true },
      ];
    },
  },
  maiz: { umbral: 220, mallas: una(maiz, DOBLE, { sombra: false }) },
  leucaena: { umbral: 200, mallas: una(leucaena, HOJAS, { sombra: false }) },
};

// Árbol de plaza y de patio para la ciudad y las cabeceras (guamo en el nivel simple: son pequeños en pantalla).
export const arbolUrbano = () => ({ geometria: guamo(false), material: HOJAS });
