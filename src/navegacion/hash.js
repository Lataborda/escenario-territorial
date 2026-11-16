// Hash #p=ID: abre una parada y se actualiza al navegar, para recargar sin perder el lugar. La calidad (#calidad=)
// se escribe cuando cambia y se lee al cambiar el hash a mano. Con el panel de condiciones abierto, #c= guarda las
// condiciones activas (sin la clave en la parada que trae el panel y no tiene ninguna activa).
import { cambiar, suscribir } from '../estado.js';
import { leerParametros, escribirParada, escribirCalidad, escribirCondiciones } from '../parametros.js';
import { irA, buscarParada, estadoDe } from './recorrido.js';
import { CAPA, panelAbierto, abrirCon } from '../reglas/reglas.js';

const paradaTraePanel = (e) => {
  const p = buscarParada(e.parada);
  return Boolean(p && estadoDe(p, e.paso).capas.includes(CAPA));
};

export function crearHash() {
  suscribir(['parada', 'paso'], (e) => {
    if (e.parada) escribirParada(e.parada, e.paso);
  });
  suscribir('calidad', (e) => escribirCalidad(e.calidad));
  suscribir(['condiciones', 'capas', 'parada', 'paso'], (e) =>
    escribirCondiciones(panelAbierto(e) && (e.condiciones.length || !paradaTraePanel(e)) ? e.condiciones : null),
  );
  // Un cambio manual del hash (o de la verificación) lleva a esa parada.
  window.addEventListener('hashchange', () => {
    const { parada, paso, captura, calidad, condiciones } = leerParametros();
    if (calidad) cambiar({ calidad });
    if (parada) irA(parada, { paso, instantanea: captura });
    if (condiciones) abrirCon(condiciones);
  });
}
