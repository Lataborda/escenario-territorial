// Sistema de flujos (etapa 8): partículas sobre curvas en la superposición. Cada capa de flujo (agua.js,
// nutrientes.js, semillas.js, practicas.js y las dos de radios.js) se enciende con su capa del estado y se arma para el escenario y la calidad actuales
// (la liviana deja la mitad de las partículas). Un reloj propio mueve las partículas y pide cuadro mientras haya un
// flujo visible (hasta 60 por segundo en la calidad alta y 30 en las demás); queda quieto en la verificación automática y con #captura=1, para que las capturas sean idénticas
// en cada carga. Reacciona a «capas», «escenario» y «calidad».
import * as THREE from 'three';
import { obtener, suscribir } from '../estado.js';
import { pedirCuadro } from '../escena/pedidos.js';
import { crearAgua } from './agua.js';
import { crearNutrientes } from './nutrientes.js';
import { crearSemillas } from './semillas.js';
import { crearRadios } from './radios.js';
import { crearPracticas } from './practicas.js';

const DT_MAXIMO = 0.1; // s: un cuadro lento no hace saltar las partículas
const FACTOR_LIVIANA = 0.5;
const PASO_REDUCIDO = 1 / 30; // s entre cuadros pedidos por los flujos fuera de la calidad alta

// Una capa que falla se registra y deja seguir a las demás.
function montar(nombre, crear) {
  try {
    return crear();
  } catch (error) {
    console.error(`Flujo ${nombre}:`, error);
    return null;
  }
}

/** altura, superficie y ancla: consultas del terreno; coberturas: módulo de coberturas; instantanea: #captura=1. */
export function crearFlujos({ altura, superficie, ancla, coberturas, instantanea = false }) {
  const capas = [
    montar('agua y sedimentos', () => crearAgua({ altura, superficie, coberturas })),
    montar('nutrientes', () => crearNutrientes({ altura, superficie, ancla })),
    montar('semillas', () => crearSemillas({ altura, superficie, ancla })),
    montar('radios', () => crearRadios({ altura, superficie, ancla, coberturas })),
    montar('prácticas de conservación', () => crearPracticas({ altura, superficie })),
  ]
    .flat()
    .filter(Boolean);
  const grupo = new THREE.Group();
  grupo.name = 'flujos';
  for (const c of capas) {
    c.grupo.visible = false;
    grupo.add(c.grupo);
  }

  const quieto = instantanea || navigator.webdriver === true;
  let tiempo = 0;
  let fijado = null;
  let espera = 0; // s desde el último cuadro pedido
  const armadas = new Map(); // capa -> «escenario|factor» con que se armó
  const mover = (c) => c.nubes.forEach((n) => n.avanzar(tiempo));

  function pintar({ capas: activas, escenario, calidad }) {
    const factor = calidad === 'liviana' ? FACTOR_LIVIANA : 1;
    for (const c of capas) {
      const visible = activas.includes(c.capa);
      if (visible) {
        const clave = `${escenario}|${factor}`;
        if (armadas.get(c) !== clave) {
          c.aplicar(escenario, factor);
          armadas.set(c, clave);
        }
        mover(c);
      }
      c.grupo.visible = visible;
    }
  }
  suscribir(['capas', 'escenario', 'calidad'], pintar);
  pintar(obtener());

  // Por cuadro del navegador: avanza el reloj y pide el dibujo mientras haya un flujo visible.
  function cuadro(dt) {
    const visibles = capas.filter((c) => c.grupo.visible);
    if (!visibles.length || quieto || fijado != null) return;
    tiempo += Math.min(dt, DT_MAXIMO);
    espera += dt;
    if (obtener().calidad !== 'alta' && espera < PASO_REDUCIDO) return;
    espera = 0;
    visibles.forEach(mover);
    pedirCuadro();
  }

  return {
    grupo,
    cuadro,
    capas,
    // Verificación: fija el reloj en t segundos (null lo devuelve a su marcha).
    fijarReloj(t) {
      fijado = t;
      if (t == null) return;
      tiempo = t;
      capas.filter((c) => c.grupo.visible).forEach(mover);
      pedirCuadro();
    },
    datos: () => ({
      reloj: Number(tiempo.toFixed(3)),
      quieto: quieto || fijado != null,
      capas: Object.fromEntries(
        capas.map((c) => [
          c.capa,
          {
            visible: c.grupo.visible,
            particulas: c.nubes.reduce((s, n) => s + n.cantidad(), 0),
            nubes: Object.fromEntries(c.nubes.map((n) => [n.puntos.name, n.cantidad()])),
            huella: c.nubes.reduce((s, n) => s + n.huella(), 0),
            ...c.datos(),
          },
        ]),
      ),
    }),
  };
}
