// Hash #p=ID: abre una parada y se actualiza al navegar, para recargar sin perder el lugar.
import { suscribir } from '../estado.js';
import { leerParametros, escribirParada } from '../parametros.js';
import { irA } from './recorrido.js';

export function crearHash() {
  suscribir(['parada', 'paso'], (e) => {
    if (e.parada) escribirParada(e.parada, e.paso);
  });
  // Un cambio manual del hash (o de la verificación) lleva a esa parada.
  window.addEventListener('hashchange', () => {
    const { parada, paso, captura } = leerParametros();
    if (parada) irA(parada, { paso, instantanea: captura });
  });
}
