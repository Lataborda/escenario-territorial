// Parámetros de la dirección (hash), por ejemplo #ex=2.5&anclas=1.
import { limitar } from './util/interpolar.js';

// Exageración vertical del relieve.
export const EXAGERACION = { minima: 1.5, maxima: 3, inicial: 2 };

export function leerParametros(hash = window.location.hash) {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const ex = parseFloat(p.get('ex'));
  return {
    exageracion: Number.isFinite(ex) ? limitar(ex, EXAGERACION.minima, EXAGERACION.maxima) : EXAGERACION.inicial,
    anclas: p.get('anclas') === '1',
  };
}
