// Azar con semilla fija (mulberry32) y ruido simplex reproducible.
import { createNoise2D } from 'simplex-noise';

export function crearAzar(semilla) {
  let a = semilla >>> 0;
  return function azar() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Varias funciones de ruido independientes a partir de una sola semilla.
export function crearRuidos(semilla, nombres) {
  const azar = crearAzar(semilla);
  const ruidos = {};
  for (const nombre of nombres) ruidos[nombre] = createNoise2D(azar);
  return ruidos;
}

// Ruido fractal en [-1, 1].
export function fractal(ruido, x, z, octavas, ganancia = 0.5) {
  let suma = 0;
  let amplitud = 1;
  let frecuencia = 1;
  let norma = 0;
  for (let o = 0; o < octavas; o++) {
    suma += ruido(x * frecuencia, z * frecuencia) * amplitud;
    norma += amplitud;
    amplitud *= ganancia;
    frecuencia *= 2;
  }
  return suma / norma;
}

// Ruido de crestas en [0, 1]: filos agudos y valles amplios.
export function crestas(ruido, x, z, octavas, ganancia = 0.5) {
  let suma = 0;
  let amplitud = 1;
  let frecuencia = 1;
  let norma = 0;
  for (let o = 0; o < octavas; o++) {
    const n = 1 - Math.abs(ruido(x * frecuencia, z * frecuencia));
    suma += n * n * amplitud;
    norma += amplitud;
    amplitud *= ganancia;
    frecuencia *= 2;
  }
  return suma / norma;
}

// Huella numérica (FNV-1a) de un arreglo de números, para comprobar que dos cargas coinciden.
export function huella(arreglos) {
  let h = 0x811c9dc5;
  for (const arreglo of arreglos) {
    const bytes = new Uint8Array(arreglo.buffer, arreglo.byteOffset, arreglo.byteLength);
    for (let i = 0; i < bytes.length; i++) {
      h ^= bytes[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  }
  return h.toString(16).padStart(8, '0');
}
