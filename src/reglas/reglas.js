// Teoría de cambio en el estado (etapa 10.a). Con la capa del panel encendida, deriva de «condiciones» el escenario y
// las capas de la maqueta (motor.js, con las reglas de contenido/condiciones.json) y los propone al almacén: las
// capas de la parada más las de los efectos presentes. Sin la capa, no interviene. El cambio de escenario lo anima
// src/coberturas/coberturas.js. Ningún temporizador activa condiciones: solo responde al panel, a la tecla T y al hash.
import datos from '../../contenido/condiciones.json';
import { obtener, cambiar, suscribir } from '../estado.js';
import { buscarParada, estadoDe } from '../navegacion/recorrido.js';
import { crearMotor } from './motor.js';

export const CAPA = 'teoria_cambio';
export const motor = crearMotor(datos);

const iguales = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const capasDeParada = (e) => {
  const p = buscarParada(e.parada);
  return p ? estadoDe(p, e.paso).capas : [];
};
export const panelAbierto = (e = obtener()) => e.capas.includes(CAPA);

/** Activa o desactiva una condición (panel de condiciones). */
export function alternarCondicion(id) {
  const { condiciones } = obtener();
  const nuevas = condiciones.includes(id) ? condiciones.filter((c) => c !== id) : [...condiciones, id];
  cambiar({ condiciones: motor.ordenar(nuevas) });
}

/** Aplica un preajuste del contenido. */
export function aplicarPreajuste(id) {
  const condiciones = motor.preajuste(id);
  if (condiciones) cambiar({ condiciones });
}

/** Abre el panel (si no lo está) con las condiciones dadas (hash #c=). */
export function abrirCon(ids) {
  const e = obtener();
  cambiar({ capas: panelAbierto(e) ? e.capas : [...e.capas, CAPA], condiciones: motor.ordenar(ids) });
}

// Tecla T: abre el panel sobre la parada actual, con el preajuste de su escenario; otra vez T restituye el estado
// de la parada. En una parada que ya trae el panel (la actividad), T devuelve las condiciones a las de la parada.
export function alternarPanel() {
  const e = obtener();
  const p = buscarParada(e.parada);
  if (!panelAbierto(e)) {
    return cambiar({ capas: [...e.capas, CAPA], condiciones: motor.preajusteDe(e.escenario) ?? [] });
  }
  if (!p) return cambiar({ capas: e.capas.filter((c) => c !== CAPA), condiciones: [] });
  const { modo, ...propio } = estadoDe(p, e.paso);
  cambiar({ ...propio, condiciones: motor.ordenar(propio.condiciones) });
}

export function crearReglas() {
  function derivar(e) {
    if (!panelAbierto(e)) return;
    const r = motor.evaluar(e.condiciones);
    const capas = [...new Set([...capasDeParada(e), CAPA, ...r.capas])];
    const cambio = {};
    if (r.escenario && e.escenario !== r.escenario) cambio.escenario = r.escenario;
    if (!iguales(e.capas, capas)) cambio.capas = capas;
    if (Object.keys(cambio).length) cambiar(cambio);
  }
  suscribir(['condiciones', 'capas', 'parada', 'paso'], derivar);
  derivar(obtener());

  return {
    // Verificación: derivación de las condiciones actuales y de una lista cualquiera, sin cambiar el estado.
    datos: () => ({ abierto: panelAbierto(), ...motor.evaluar(obtener().condiciones), preajuste: motor.preajusteVigente(obtener().condiciones) }),
    evaluar: (ids) => motor.evaluar(ids),
  };
}
