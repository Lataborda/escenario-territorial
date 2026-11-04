// Coordenadas del plano (u, v entre 0 y 1) y de la escena (x, z); rejilla del terreno; zonas de territorio.json.
import territorio from '../../contenido/territorio.json';
import { MEDIDAS } from '../escena/maqueta.js';

export const ENTIDADES = territorio.entidades;

export const aMundoX = (u) => (u - 0.5) * MEDIDAS.ancho;
export const aMundoZ = (v) => (v - 0.5) * MEDIDAS.fondo;
export const aPlanoU = (x) => x / MEDIDAS.ancho + 0.5;
export const aPlanoV = (z) => z / MEDIDAS.fondo + 0.5;

export const BORDE = { x: MEDIDAS.ancho / 2, z: MEDIDAS.fondo / 2 };
export const dentro = (x, z) => Math.abs(x) <= BORDE.x + 1e-6 && Math.abs(z) <= BORDE.z + 1e-6;

// Zonas del plano ordenadas de occidente a oriente: { id, desde, hasta }.
export const ZONAS = ENTIDADES.filter((e) => e.tipo === 'zona' && Array.isArray(e.x))
  .map((e) => ({ id: e.id, desde: e.x[0], hasta: e.x[1] }))
  .sort((a, b) => a.desde - b.desde);

export function zona(id) {
  return ZONAS.find((z) => z.id === id);
}

// Rejilla regular de vértices; índice = fila * columnas + columna.
export function crearRejilla(paso) {
  const columnas = Math.round(MEDIDAS.ancho / paso) + 1;
  const filas = Math.round(MEDIDAS.fondo / paso) + 1;
  return {
    paso,
    columnas,
    filas,
    total: columnas * filas,
    x0: -BORDE.x,
    z0: -BORDE.z,
    x: (i) => -BORDE.x + i * paso,
    z: (j) => -BORDE.z + j * paso,
  };
}

// Interpolación sobre la rejilla con la misma triangulación de la malla (diagonal de b a c).
export function crearConsulta(rejilla, valores) {
  const { columnas, filas, paso, x0, z0 } = rejilla;
  return function consultar(x, z) {
    const fx = Math.min(Math.max((x - x0) / paso, 0), columnas - 1.000001);
    const fz = Math.min(Math.max((z - z0) / paso, 0), filas - 1.000001);
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    const tx = fx - i;
    const tz = fz - j;
    const a = valores[j * columnas + i];
    const b = valores[j * columnas + i + 1];
    const c = valores[(j + 1) * columnas + i];
    const d = valores[(j + 1) * columnas + i + 1];
    if (tx + tz <= 1) return a + (b - a) * tx + (c - a) * tz;
    return d + (c - d) * (1 - tx) + (b - d) * (1 - tz);
  };
}
