// Coberturas del paisaje (etapas 5.a a 5.c): teselas, vegetación, mosaico campesino y caña cercana según el
// escenario del estado, con transición suave. Reacciona a «escenario» y «liviano»; el nivel de detalle y las matas
// de caña cercanas siguen a la cámara.
// Ningún temporizador cambia el escenario: solo anima el cambio pedido.
import * as THREE from 'three';
import gsap from 'gsap';
import contenido from '../../contenido/escenarios.json';
import { obtener, suscribir } from '../estado.js';
import { huella } from '../util/azar.js';
import { suave } from '../util/interpolar.js';
import { crearUnidades } from './unidades.js';
import { asignarEscenarios, asignarCana } from './asignacion.js';
import { crearTeselas } from './teselas.js';
import { crearVegetacion } from './vegetacion.js';
import { crearMosaico } from './mosaico.js';
import { crearCanaCerca } from './cana.js';
import { crearDetalle } from './detalle.js';
import { medirAsignacion, extensionCana } from './metricas.js';

export const DURACION = 2; // s
const ESCALON = 0.45; // fracción de la transición en que se reparten los inicios de cada unidad

// Fracción de un elemento con retardo r (0 a 1) en el instante t (0 a 1) de la transición: continua y suave.
export const progreso = (t, r) => suave(0, 1, (t - r * ESCALON) / (1 - ESCALON));

export function crearCoberturas({ altura, instantanea = false }) {
  const comienzo = performance.now();
  // Tiempo de generación de cada parte (ms), para el informe de verificación.
  const tiempos = {};
  const medir = (nombre, fn) => {
    const t = performance.now();
    const r = fn();
    tiempos[nombre] = Math.round(performance.now() - t);
    return r;
  };
  const datos = medir('unidades y vías', () => crearUnidades(altura));
  const asignaciones = medir('asignación', () => {
    asignarCana(datos, contenido.edades_cana?.fracciones);
    return asignarEscenarios(datos, contenido.escenarios, altura);
  });
  const teselas = medir('teselas', () => crearTeselas(datos, asignaciones, altura));
  const vegetacion = medir('vegetación', () => crearVegetacion(datos, asignaciones, altura));
  const mosaico = medir('mosaico', () => crearMosaico(datos, asignaciones, altura));
  const cana = medir('caña cercana', () => crearCanaCerca(datos, teselas.lectura, altura, teselas.cercania));
  const capas = [vegetacion, mosaico];
  const clases = capas.flatMap((c) => c.clases);
  const retardos = { get: (u) => datos.unidades[u].retardo };
  const grupo = new THREE.Group();
  grupo.name = 'coberturas';
  grupo.add(teselas.malla, ...vegetacion.mallas, ...mosaico.mallas, ...cana.mallas);

  // Nivel de detalle: antes de dibujar las teselas (primeras en el orden de dibujo) se mide la cámara principal.
  const detalle = crearDetalle(altura);
  teselas.malla.renderOrder = -1;
  teselas.malla.frustumCulled = false;
  teselas.malla.onBeforeRender = (renderizador, escena, camara) => {
    if (!camara.isPerspectiveCamera || !detalle.medir(camara)) return;
    capas.forEach((c) => c.detalle(detalle.cercana));
    cana.medir(camara);
  };

  let actual = null;
  let animacion = null;
  let registro = null;

  // Avanza la transición y registra cuadros y elementos a medio camino (verificación).
  const avanzar = (t) => {
    const intermedias = capas.reduce((suma, c) => suma + c.avanzar(t, progreso), teselas.avanzar(t, progreso, retardos));
    cana.avanzar();
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
    const cambios = capas.reduce((suma, c) => suma + c.preparar(asignacion), teselas.preparar(asignacion));
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
  const liviano = (activo) => [...capas, cana].forEach((c) => c.liviano(activo));
  liviano(obtener().liviano);
  const ms = Math.round(performance.now() - comienzo);
  suscribir('escenario', ({ escenario }) => aplicar(escenario, instantanea));
  suscribir('liviano', ({ liviano: activo }) => liviano(activo));
  const arreglos = () => [...teselas.arreglos(), ...capas.flatMap((c) => c.arreglos()), ...cana.arreglos()];

  // Interfaz para la verificación automática.
  const cuenta = (clase) => datos.unidades.filter((u) => u.clase === clase).length;
  return {
    grupo,
    datos: () => ({
      escenario: actual,
      ms,
      tiempos,
      unidades: { parcelas: cuenta('parcelas'), orillas: cuenta('orillas'), celdas: cuenta('celdas'), reservas: cuenta('reservas') },
      teselas: { unidades: teselas.unidades, vertices: teselas.vertices },
      instancias: Object.fromEntries(clases.map((c) => [c.id, c.total])),
      visibles: Object.fromEntries(clases.map((c) => [c.id, c.visiblesAhora()])),
      cerca: Object.fromEntries(clases.map((c) => [c.id, c.cercaAhora()])),
      cana: { ...teselas.resumenCana(), cerca: cana.datos() },
      // Ningún material facetado en la vegetación (las teselas conservan caras planas).
      facetadas: capas.flatMap((c) => c.mallas).filter((m) => m.material.flatShading).map((m) => m.name),
      dibujadas: capas.flatMap((c) => c.mallas).reduce((suma, m) => suma + m.count, 0),
      transicion: registro && { ...registro },
    }),
    huella: () => huella(arreglos()),
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
      return huella(arreglos());
    },
  };
}
