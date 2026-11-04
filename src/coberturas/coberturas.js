// Coberturas del paisaje (etapa 5.a): teselas y vegetación según el escenario del estado, con transición suave.
// Reacciona a «escenario» y «liviano». Ningún temporizador cambia el escenario: solo anima el cambio pedido.
import * as THREE from 'three';
import gsap from 'gsap';
import contenido from '../../contenido/escenarios.json';
import { obtener, suscribir } from '../estado.js';
import { huella } from '../util/azar.js';
import { suave } from '../util/interpolar.js';
import { crearUnidades } from './unidades.js';
import { asignarEscenarios } from './asignacion.js';
import { crearTeselas } from './teselas.js';
import { crearVegetacion } from './vegetacion.js';
import { medirAsignacion, extensionCana } from './metricas.js';

export const DURACION = 2; // s
const ESCALON = 0.45; // fracción de la transición en que se reparten los inicios de cada unidad

// Fracción de un elemento con retardo r (0 a 1) en el instante t (0 a 1) de la transición: continua y suave.
export const progreso = (t, r) => suave(0, 1, (t - r * ESCALON) / (1 - ESCALON));

export function crearCoberturas({ altura, instantanea = false }) {
  const comienzo = performance.now();
  const datos = crearUnidades();
  const asignaciones = asignarEscenarios(datos, contenido.escenarios, altura);
  const teselas = crearTeselas(datos, asignaciones, altura);
  const vegetacion = crearVegetacion(datos, asignaciones, altura);
  const retardos = { get: (u) => datos.unidades[u].retardo };
  const grupo = new THREE.Group();
  grupo.name = 'coberturas';
  grupo.add(teselas.malla, ...vegetacion.mallas);

  let actual = null;
  let animacion = null;
  let registro = null;

  // Avanza la transición y registra cuadros y elementos a medio camino (verificación).
  const avanzar = (t) => {
    const intermedias = teselas.avanzar(t, progreso, retardos) + vegetacion.avanzar(t, progreso);
    if (registro) {
      const ahora = performance.now();
      registro.cuadros += 1;
      registro.intermedias = Math.max(registro.intermedias, intermedias);
      registro.intervalo = Math.max(registro.intervalo, ahora - registro.ultimo);
      registro.ultimo = ahora;
    }
  };

  function aplicar(escenario, inmediata) {
    const id = asignaciones.has(escenario) ? escenario : 'S0';
    if (id === actual) return;
    const asignacion = asignaciones.get(id);
    const cambios = teselas.preparar(asignacion) + vegetacion.preparar(asignacion);
    animacion?.kill();
    actual = id;
    registro = { escenario: id, cambios, inicio: performance.now(), fin: null, duracion: inmediata ? 0 : DURACION, cuadros: 0, intermedias: 0, intervalo: 0, ultimo: performance.now() };
    const marca = document.documentElement.dataset;
    if (inmediata || !cambios) {
      avanzar(1);
      registro.fin = registro.inicio;
      delete marca.coberturas;
      return;
    }
    marca.coberturas = 'transicion';
    // Reloj de GSAP al día: con cuadros lentos la transición empezaría en el pasado (ver camara.js).
    gsap.ticker.tick();
    registro.inicio = performance.now();
    registro.ultimo = registro.inicio;
    const p = { t: 0 };
    animacion = gsap.to(p, {
      t: 1,
      duration: DURACION,
      ease: 'none',
      onUpdate: () => avanzar(p.t),
      onComplete: () => {
        registro.fin = performance.now();
        delete marca.coberturas;
      },
    });
  }

  aplicar(obtener().escenario, true);
  vegetacion.liviano(obtener().liviano);
  const ms = Math.round(performance.now() - comienzo);
  suscribir('escenario', ({ escenario }) => aplicar(escenario, instantanea));
  suscribir('liviano', ({ liviano }) => vegetacion.liviano(liviano));

  // Interfaz para la verificación automática.
  const cuenta = (clase) => datos.unidades.filter((u) => u.clase === clase).length;
  return {
    grupo,
    datos: () => ({
      escenario: actual,
      ms,
      unidades: { parcelas: cuenta('parcelas'), orillas: cuenta('orillas'), celdas: cuenta('celdas'), reservas: cuenta('reservas') },
      teselas: { unidades: teselas.unidades, vertices: teselas.vertices },
      instancias: Object.fromEntries(vegetacion.clases.map((c) => [c.id, c.total])),
      visibles: Object.fromEntries(vegetacion.clases.map((c) => [c.id, c.visiblesAhora()])),
      dibujadas: vegetacion.mallas.reduce((suma, m) => suma + m.count, 0),
      transicion: registro && { ...registro },
    }),
    huella: () => huella([...teselas.arreglos(), ...vegetacion.arreglos()]),
    medir: (id) => asignaciones.has(id) && medirAsignacion(datos, asignaciones.get(id)),
    // Extensión de la caña igual en dos escenarios (misma geometría de la matriz).
    mismaCana: (a, b) => {
      const x = extensionCana(datos.unidades, asignaciones.get(a));
      const y = extensionCana(datos.unidades, asignaciones.get(b));
      return x.length === y.length && x.every((v, i) => v === y[i]);
    },
    // Salto máximo de un elemento entre dos cuadros a 60 cuadros por segundo (muestreo de la función de transición).
    saltoMaximo: () => {
      let maximo = 0;
      for (let r = 0; r <= 1; r += 0.05) {
        for (let k = 1; k <= DURACION * 60; k++) {
          const t0 = (k - 1) / (DURACION * 60);
          const t1 = k / (DURACION * 60);
          maximo = Math.max(maximo, progreso(t1, r) - progreso(t0, r));
        }
      }
      return Number(maximo.toFixed(4));
    },
    // Aplica un escenario sin transición (verificación) y devuelve la huella resultante.
    aplicarAhora: (id) => {
      aplicar(id, true);
      return huella([...teselas.arreglos(), ...vegetacion.arreglos()]);
    },
  };
}
