// Parámetros de la dirección (hash), por ejemplo #p=P06&paso=1&ex=2.5&anclas=1&captura=1. Luz de diorama: #ao, #mini y
// #viento regulan la oclusión ambiental, la miniatura y el viento (0 apaga; 1 por defecto). #cps= fija el tope de
// cuadros por segundo con la cámara quieta (30 por defecto; ritmo.js). #calidad=alta, media o liviana fija la calidad
// (sin ella, la detección de src/escena/deteccion.js puede bajarla un nivel); #deteccion= cambia el umbral de esa
// detección en cuadros por segundo (0 la apaga).
import { limitar } from './util/interpolar.js';
import { CPS } from './escena/ritmo.js';
import { esNivel } from './calidad.js';

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
  const cps = parseFloat(p.get('cps'));
  const deteccion = parseFloat(p.get('deteccion'));
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
    cps: Number.isFinite(cps) ? limitar(cps, CPS.minimo, CPS.maximo) : CPS.reposo,
    // null: sin calidad en el hash (vale la alta y la detección puede bajarla).
    calidad: esNivel(p.get('calidad')) ? p.get('calidad') : null,
    // null: umbral por defecto, y sin detección en la verificación automática ni con #captura=1.
    deteccion: Number.isFinite(deteccion) && deteccion >= 0 ? deteccion : null,
  };
}

// Escribe valores en el hash sin recargar y sin tocar los demás parámetros (null o undefined borra la clave).
function escribir(valores) {
  const p = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor == null) p.delete(clave);
    else p.set(clave, String(valor));
  }
  const nuevo = `#${p.toString()}`;
  if (nuevo !== window.location.hash) history.replaceState(null, '', nuevo);
}

export const escribirParada = (parada, paso) => escribir({ p: parada, paso: paso > 0 ? paso : null });

// La calidad elegida (tecla V, presentador o detección) queda en el hash y sobrevive a la recarga.
export const escribirCalidad = (calidad) => escribir({ calidad });
