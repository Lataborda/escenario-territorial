// Ritmo del dibujo (etapa 7.c): decide en cada cuadro del navegador si la escena se dibuja. Con la cámara en
// movimiento (vuelos y modo libre), un pedido (pedidos.js) o un cambio reciente del estado, hasta 60 cuadros por
// segundo; con la cámara quieta y viento activo, 30 (#cps= lo ajusta); con la cámara quieta y sin viento, solo un
// cuadro de seguridad por segundo. Con el medidor visible (tecla R) no hay tope: la cifra muestra la capacidad real
// del equipo.
import { obtener, suscribir } from '../estado.js';
import { hayPedido, pedirCuadro } from './pedidos.js';

export const CPS = { movimiento: 60, reposo: 30, minimo: 5, maximo: 120 };
const HOLGURA_MS = 4; // tolerancia frente a la irregularidad de los cuadros del navegador
const TRAS_MOVIMIENTO_MS = 400; // la cámara recién detenida sigue al ritmo de movimiento
const TRAS_CAMBIO_MS = 400; // igual tras un cambio del estado
const SEGURIDAD_MS = 1000;

/** camara: cámara principal; reposo: tope con la cámara quieta; vientoActivo(): el vaivén está en marcha. */
export function crearRitmo(camara, { reposo = CPS.reposo, vientoActivo = () => false } = {}) {
  const previa = new Float64Array(23); // posición, giro y proyección del último cuadro revisado
  const actual = new Float64Array(23);
  let ultimo = -Infinity; // último dibujo
  let movimiento = -Infinity;
  let cambio = performance.now();
  // Todo cambio del estado se dibuja en el cuadro siguiente, aunque el equipo vaya lento.
  suscribir(null, () => {
    cambio = performance.now();
    pedirCuadro();
  });

  function seMovio() {
    camara.position.toArray(actual, 0);
    camara.quaternion.toArray(actual, 3);
    actual.set(camara.projectionMatrix.elements, 7);
    let distinta = false;
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== previa[i]) distinta = true;
      previa[i] = actual[i];
    }
    return distinta;
  }

  const paso = (cps) => 1000 / cps - HOLGURA_MS;

  return {
    /** true si toca dibujar en el instante «ahora» (ms); se llama una vez por cuadro del navegador. */
    toca(ahora) {
      if (seMovio()) movimiento = ahora;
      const desde = ahora - ultimo;
      let dibuja;
      if (obtener().medidor) dibuja = true;
      else if (hayPedido() || ahora - movimiento < TRAS_MOVIMIENTO_MS || ahora - cambio < TRAS_CAMBIO_MS) {
        dibuja = desde >= paso(Math.max(CPS.movimiento, reposo));
      } else if (vientoActivo()) dibuja = desde >= paso(reposo);
      else dibuja = desde >= SEGURIDAD_MS;
      if (dibuja) ultimo = ahora;
      return dibuja;
    },
    datos: () => ({ reposo, movimiento: Math.max(CPS.movimiento, reposo) }),
  };
}
