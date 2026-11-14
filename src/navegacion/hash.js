// Hash #p=ID: abre una parada y se actualiza al navegar, para recargar sin perder el lugar. La calidad (#calidad=)
// se escribe cuando cambia y se lee al cambiar el hash a mano.
import { cambiar, suscribir } from '../estado.js';
import { leerParametros, escribirParada, escribirCalidad } from '../parametros.js';
import { irA } from './recorrido.js';

export function crearHash() {
  suscribir(['parada', 'paso'], (e) => {
    if (e.parada) escribirParada(e.parada, e.paso);
  });
  suscribir('calidad', (e) => escribirCalidad(e.calidad));
  // Un cambio manual del hash (o de la verificación) lleva a esa parada.
  window.addEventListener('hashchange', () => {
    const { parada, paso, captura, calidad } = leerParametros();
    if (calidad) cambiar({ calidad });
    if (parada) irA(parada, { paso, instantanea: captura });
  });
}
