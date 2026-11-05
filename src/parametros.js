// Parámetros de la dirección (hash), por ejemplo #p=P06&paso=1&ex=2.5&anclas=1&captura=1. Luz de diorama: #ao, #mini y
// #viento regulan la oclusión ambiental, la miniatura y el viento (0 apaga; 1 por defecto).
import { limitar } from './util/interpolar.js';

// Exageración vertical del relieve.
export const EXAGERACION = { minima: 1.5, maxima: 3, inicial: 2 };

// Intensidad de un efecto entre 0 y el máximo; 1 si falta o no es un número.
function intensidad(valor, maxima = 2) {
  const x = parseFloat(valor);
  return Number.isFinite(x) ? limitar(x, 0, maxima) : 1;
}

export function leerParametros(hash = window.location.hash) {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const ex = parseFloat(p.get('ex'));
  const paso = parseInt(p.get('paso'), 10);
  return {
    exageracion: Number.isFinite(ex) ? limitar(ex, EXAGERACION.minima, EXAGERACION.maxima) : EXAGERACION.inicial,
    anclas: p.get('anclas') === '1',
    parada: p.get('p'),
    paso: Number.isInteger(paso) && paso >= 0 ? paso : 0,
    // Transiciones instantáneas para la verificación automática.
    captura: p.get('captura') === '1',
    oclusion: intensidad(p.get('ao')),
    miniatura: intensidad(p.get('mini')),
    viento: intensidad(p.get('viento'), 3),
  };
}

// Escribe parada y paso en el hash sin recargar y sin tocar los demás parámetros.
export function escribirParada(parada, paso) {
  const p = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  p.set('p', parada);
  if (paso > 0) p.set('paso', String(paso));
  else p.delete('paso');
  const nuevo = `#${p.toString()}`;
  if (nuevo !== window.location.hash) history.replaceState(null, '', nuevo);
}
