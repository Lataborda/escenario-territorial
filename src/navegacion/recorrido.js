// Recorrido por paradas: irA, siguiente, anterior, saltos por momento y modo libre.
// Nada avanza solo: cada función responde a una acción del presentador.
import contenido from '../../contenido/paradas.json';
import { obtener, cambiar } from '../estado.js';

export const PARADAS = contenido.paradas;
export const MOMENTOS = contenido.momentos;
const indice = new Map(PARADAS.map((p, i) => [p.id, i]));

export const buscarParada = (id) => PARADAS[indice.get(id)] ?? null;
export const numeroDe = (id) => (indice.has(id) ? indice.get(id) + 1 : null);
export const cantidadPasos = (parada) => Math.max(1, parada.pasos?.length ?? 0);

// Estado visual de una parada en un paso: el estado del paso se superpone al de la parada.
export function estadoDe(parada, paso = 0) {
  const e = { ...parada.estado, ...(parada.pasos?.[paso]?.estado ?? {}) };
  return {
    escenario: e.escenario ?? 'S0',
    capas: e.capas ?? [],
    lente: e.lente ?? null,
    anio: e.anio ?? 'hoy',
    condiciones: e.condiciones ?? [],
    modo: e.modo ?? 'recorrido',
  };
}

// Aplica una parada completa: estado, escala, punto de interés y cámara (duración 0 = sin vuelo).
export function irA(id, { paso = 0, instantanea = false } = {}) {
  const parada = buscarParada(id);
  if (!parada) {
    console.warn(`Parada desconocida: ${id}`);
    return false;
  }
  const k = Math.min(Math.max(paso, 0), cantidadPasos(parada) - 1);
  cambiar({
    parada: parada.id,
    paso: k,
    escala: parada.escala,
    foco: parada.camara.ancla,
    ...estadoDe(parada, k),
    camara: { ...parada.camara, duracion: instantanea ? 0 : parada.camara.duracion },
  });
  return true;
}

// Un paso cambia el estado visual y conserva cámara y modo.
function irAPaso(parada, k) {
  const { modo, ...resto } = estadoDe(parada, k);
  cambiar({ paso: k, ...resto });
  return true;
}

export function siguiente() {
  const { parada, paso } = obtener();
  const p = buscarParada(parada);
  if (!p) return irA(PARADAS[0].id);
  if (paso < cantidadPasos(p) - 1) return irAPaso(p, paso + 1);
  const i = indice.get(p.id);
  return i < PARADAS.length - 1 ? irA(PARADAS[i + 1].id) : false;
}

// Al retroceder a la parada anterior se llega a su último paso.
export function anterior() {
  const { parada, paso } = obtener();
  const p = buscarParada(parada);
  if (!p) return irA(PARADAS[0].id);
  if (paso > 0) return irAPaso(p, paso - 1);
  const i = indice.get(p.id);
  if (i === 0) return false;
  const q = PARADAS[i - 1];
  return irA(q.id, { paso: cantidadPasos(q) - 1 });
}

// Teclas 0 a 6: primera parada del momento M0 a M6.
export function irAMomento(n) {
  const id = MOMENTOS[n]?.id;
  const p = PARADAS.find((x) => x.momento === id);
  return p ? irA(p.id) : false;
}

// Tecla O: modo libre; otra vez O vuelve al recorrido con la escala y la cámara de la parada.
export function alternarLibre() {
  const { modo, parada, paso } = obtener();
  if (modo !== 'libre') return cambiar({ modo: 'libre' });
  const p = buscarParada(parada);
  if (!p) return cambiar({ modo: 'recorrido' });
  cambiar({ modo: estadoDe(p, paso).modo, escala: p.escala, foco: p.camara.ancla, camara: { ...p.camara } });
}
