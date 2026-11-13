// Coberturas del paisaje (etapas 5.a a 5.c): teselas, vegetación, mosaico campesino y caña cercana según el
// escenario del estado, con transición suave. Reacciona a «escenario» y «liviano»; el nivel de detalle, el descarte
// por zonas y las matas de caña cercanas siguen a la cámara (cuadro(), antes de cada dibujo).
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
import { crearDetalle, crearEncuadre } from './detalle.js';
import { medirAsignacion, extensionCana } from './metricas.js';
import { crearContornoEep } from './eep.js';
import { rejillaTeselas, LADO } from './rejilla.js';
import { crearTrazo } from '../escena/lineas.js';
import { pedirSombra } from '../escena/pedidos.js';
import { ESTILO, activa } from '../fincas/estilo.js';
import { obtenerFincas } from '../fincas/trazado.js';

export const DURACION = 2; // s
const ESCALON = 0.45; // fracción de la transición en que se reparten los inicios de cada unidad

// Fracción de un elemento con retardo r (0 a 1) en el instante t (0 a 1) de la transición: continua y suave.
export const progreso = (t, r) => suave(0, 1, (t - r * ESCALON) / (1 - ESCALON));

/** camara: cámara principal (nivel de detalle y encuadre); instantanea: sin transición (#captura=1). */
export function crearCoberturas({ altura, camara, instantanea = false }) {
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

  // Por cuadro, antes del dibujo (los arreglos de instancias suben a la tarjeta en el mismo cuadro): nivel de
  // detalle, celdas dentro del encuadre y matas de caña. Con la cámara en movimiento, el encuadre va ampliado; el
  // primer cuadro con la cámara quieta lo deja exacto.
  const detalle = crearDetalle(altura);
  const encuadre = crearEncuadre();
  teselas.malla.renderOrder = -1;
  teselas.malla.frustumCulled = false;
  let enVuelo = false;
  function cuadro() {
    camara.updateMatrixWorld();
    const movida = detalle.medir(camara);
    const girada = encuadre.medir(camara);
    if (!movida && !girada) {
      if (enVuelo) {
        capas.forEach((c) => c.mirar(null, encuadre.dentro, true));
        cana.afinar(encuadre.esfera);
      }
      enVuelo = false;
      return;
    }
    enVuelo = true;
    const cambio = capas.reduce((v, c) => c.mirar(movida ? detalle.cercana : null, encuadre.dentro, false) || v, false);
    // Las especies del nivel cercano proyectan otra sombra.
    if (cana.medir(camara, encuadre.dentro) || cambio) pedirSombra();
  }

  let actual = null;
  let animacion = null;
  let registro = null;

  // Avanza la transición y registra cuadros y elementos a medio camino (verificación).
  const avanzar = (t) => {
    const intermedias = capas.reduce((suma, c) => suma + c.avanzar(t, progreso), teselas.avanzar(t, progreso, retardos));
    cana.avanzar();
    pedirSombra();
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
  // Capa «eep»: contorno de la estructura ecológica principal del escenario actual y conexión de las fincas con
  // ella (superposición).
  const contornoEep = crearContornoEep(datos, rejillaTeselas().cauces);
  const { fincas } = obtenerFincas(altura);
  const eep = crearTrazo('eep', altura, ESTILO.eep);
  const conexion = crearTrazo('conexion_eep', altura, ESTILO.conexion_eep);
  const superposicion = new THREE.Group();
  superposicion.name = 'coberturas-capas';
  superposicion.add(eep.grupo, conexion.grupo);
  let eepDe = null;
  const pintarEep = ({ capas, escenario }) => {
    const id = asignaciones.has(escenario) ? escenario : 'S0';
    const encendida = activa('eep', capas);
    if (encendida && eepDe !== id) {
      eep.fijar(contornoEep.segmentos(id, asignaciones.get(id)));
      conexion.fijar(Object.values(contornoEep.conexiones(id, asignaciones.get(id), fincas)).flat());
      eepDe = id;
    }
    eep.grupo.visible = encendida && !eep.grupo.userData.vacio;
    conexion.grupo.visible = activa('conexion_eep', capas) && !conexion.grupo.userData.vacio;
  };
  suscribir(['capas', 'escenario'], pintarEep);
  pintarEep(obtener());
  const liviano = (activo) => {
    [...capas, cana].forEach((c) => c.liviano(activo));
    pedirSombra();
  };
  liviano(obtener().liviano);
  const ms = Math.round(performance.now() - comienzo);
  suscribir('escenario', ({ escenario }) => aplicar(escenario, instantanea));
  suscribir('liviano', ({ liviano: activo }) => liviano(activo));
  const arreglos = () => [...teselas.arreglos(), ...capas.flatMap((c) => c.arreglos()), ...cana.arreglos()];

  // Interfaz para la verificación automática.
  const cuenta = (clase) => datos.unidades.filter((u) => u.clase === clase).length;
  return {
    grupo,
    superposicion,
    cuadro,
    datos: () => ({
      escenario: actual,
      ms,
      tiempos,
      unidades: { parcelas: cuenta('parcelas'), orillas: cuenta('orillas'), celdas: cuenta('celdas'), reservas: cuenta('reservas'), lotes: cuenta('lotes') },
      teselas: { unidades: teselas.unidades, vertices: teselas.vertices },
      instancias: Object.fromEntries(clases.map((c) => [c.id, c.total])),
      visibles: Object.fromEntries(clases.map((c) => [c.id, c.visiblesAhora()])),
      cerca: Object.fromEntries(clases.map((c) => [c.id, c.cercaAhora()])),
      cana: { ...teselas.resumenCana(), cerca: cana.datos() },
      // Ningún material facetado en la vegetación (las teselas conservan caras planas).
      facetadas: capas.flatMap((c) => c.mallas).filter((m) => m.material.flatShading).map((m) => m.name),
      dibujadas: capas.flatMap((c) => c.mallas).reduce((suma, m) => suma + m.count, 0),
      transicion: registro && { ...registro },
      eep: { visible: eep.grupo.visible, segmentos: eep.cantidad(), conexion: conexion.cantidad() },
    }),
    huella: () => huella(arreglos()),
    medir: (id) => asignaciones.has(id) && medirAsignacion(datos, asignaciones.get(id)),
    // Largo del lindero de cada finca en conexión con la EEP (unidades de escena) en un escenario.
    conexionEep: (id) =>
      Object.fromEntries(Object.entries(contornoEep.conexiones(id, asignaciones.get(id), fincas)).map(([f, l]) => [f, l.length * LADO])),
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
