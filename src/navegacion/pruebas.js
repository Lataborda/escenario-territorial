// Funciones para la verificación automática: trayectorias entre paradas y bloque de la tecla C.
import { resolver, trayectoria, vistaDesde } from './camara.js';

// Vista final real de un bloque (la cámara puede subir sobre el relieve).
function vistaFinal(bloque) {
  const v = resolver(bloque);
  return vistaDesde(trayectoria(v, v)(1).posicion, v.objetivo);
}

/**
 * Muestrea el vuelo entre paradas consecutivas. Un salto es un paso de muestreo
 * mucho mayor que el paso medio, o un extremo que no coincide con la vista de la parada.
 */
export function revisarTrayectorias(bloques, muestras = 240) {
  const resultado = [];
  for (let i = 0; i + 1 < bloques.length; i++) {
    const inicio = vistaFinal(bloques[i]);
    const fin = resolver(bloques[i + 1]);
    const camino = trayectoria(inicio, fin);
    const puntos = Array.from({ length: muestras + 1 }, (_, k) => camino(k / muestras).posicion);
    let total = 0;
    let maximo = 0;
    for (let k = 1; k < puntos.length; k++) {
      const d = puntos[k].distanceTo(puntos[k - 1]);
      total += d;
      maximo = Math.max(maximo, d);
    }
    const inicioReal = trayectoria(inicio, inicio)(1).posicion;
    const finReal = trayectoria(fin, fin)(1).posicion;
    resultado.push({
      tramo: i,
      longitud: Math.round(total),
      // Razón entre el paso mayor y el paso medio (2 en una aceleración suave pura).
      razon: total > 1e-6 ? Number(((maximo * muestras) / total).toFixed(2)) : 0,
      extremos: puntos[0].distanceTo(inicioReal) < 0.01 && puntos[muestras].distanceTo(finReal) < 0.01,
      finitos: puntos.every((p) => Number.isFinite(p.x + p.y + p.z)),
    });
  }
  return resultado;
}

// Distancia entre la cámara actual y la que produce un bloque (ida y vuelta de la tecla C).
export function desvioBloque(bloque, posicionActual) {
  const v = resolver(bloque);
  return trayectoria(v, v)(1).posicion.distanceTo(posicionActual);
}
