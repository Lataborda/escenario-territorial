// Lado de la vista principal: publica el estado del recorrido y ejecuta las órdenes del presentador.
// Las órdenes pasan por las mismas funciones que el teclado, de modo que el almacén sigue siendo la única vía.
import { obtener, cambiar, suscribir } from '../estado.js';
import { siguiente, anterior, irA, irAMomento, alternarLibre } from '../navegacion/recorrido.js';
import { crearCanal, CLAVES_PUBLICADAS, ALTERNABLES } from './canal.js';

const resumen = (e) => Object.fromEntries(CLAVES_PUBLICADAS.map((k) => [k, e[k]]));

const ORDENES = {
  siguiente: () => siguiente(),
  anterior: () => anterior(),
  irA: (m) => typeof m.parada === 'string' && irA(m.parada, { paso: Number.isInteger(m.paso) ? m.paso : 0 }),
  momento: (m) => Number.isInteger(m.n) && irAMomento(m.n),
  libre: () => alternarLibre(),
  alternar: (m) => ALTERNABLES.includes(m.clave) && cambiar({ [m.clave]: !obtener()[m.clave] }),
};

export function crearSincronia() {
  const canal = crearCanal();
  if (!canal.activo) return null;
  const publicar = () => canal.enviar({ tipo: 'estado', estado: resumen(obtener()) });

  canal.alRecibir((m) => {
    if (m.tipo === 'hola') return publicar();
    if (m.tipo !== 'orden') return;
    const orden = ORDENES[m.accion];
    if (!orden) return console.warn(`Orden desconocida del presentador: ${m.accion}`);
    orden(m);
  });
  suscribir(CLAVES_PUBLICADAS, publicar);
  // Aviso de llegada, por si el presentador abrió primero.
  publicar();
  return canal;
}
