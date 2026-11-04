// Cámara del recorrido: vuelo con GSAP hacia una vista relativa a un ancla.
// Reacciona a «camara» y a «modo» del estado. Tecla C: bloque de cámara para paradas.json.
import * as THREE from 'three';
import gsap from 'gsap';
import { obtener, suscribir } from '../estado.js';
import { ancla, superficie } from '../terreno/terreno.js';
import { ENTIDADES } from '../terreno/plano.js';
import { limitar } from '../util/interpolar.js';

export const DURACION = { minima: 1.5, maxima: 3, autor: 2.5 };
const SALTO = 0.35; // alejamiento a mitad de vuelo, en proporción al desplazamiento horizontal
const { degToRad: rad, radToDeg: grados } = THREE.MathUtils;

// El reloj de GSAP sigue el tiempo real aunque un cuadro tarde: la duración se respeta.
gsap.ticker.lagSmoothing(0);

export function esfericaAPosicion(objetivo, { distancia, azimut, elevacion }) {
  const az = rad(azimut);
  const el = rad(elevacion);
  return new THREE.Vector3(
    objetivo.x + distancia * Math.cos(el) * Math.sin(az),
    objetivo.y + distancia * Math.sin(el),
    objetivo.z + distancia * Math.cos(el) * Math.cos(az),
  );
}

// Vista de una posición respecto de su objetivo (ángulos en grados).
export function vistaDesde(posicion, objetivo) {
  const d = posicion.clone().sub(objetivo);
  const distancia = Math.max(d.length(), 1e-6);
  return {
    objetivo: objetivo.clone(),
    distancia,
    azimut: grados(Math.atan2(d.x, d.z)),
    elevacion: grados(Math.asin(limitar(d.y / distancia, -1, 1))),
  };
}

// Bloque de cámara (paradas.json, botonera o doble clic del modo libre) a vista; lo que falta se toma
// de la vista actual. El objetivo es un ancla o un punto { x, y, z } de la escena.
export function resolver(bloque, actual) {
  const { punto } = bloque;
  return {
    objetivo:
      (bloque.ancla && ancla(bloque.ancla)) ||
      (punto && new THREE.Vector3(punto.x, punto.y, punto.z)) ||
      actual?.objetivo.clone() ||
      new THREE.Vector3(),
    distancia: bloque.distancia ?? actual.distancia,
    azimut: bloque.azimut ?? actual.azimut,
    elevacion: bloque.elevacion ?? actual.elevacion,
  };
}

// La cámara no entra en el relieve: altura mínima sobre la superficie visible.
function sobreSuperficie(p, distancia) {
  const minimo = superficie(p.x, p.z) + Math.max(6, distancia * 0.08);
  if (p.y < minimo) p.y = minimo;
  return p;
}

const suavizar = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const diferenciaAngular = (a, b) => ((((b - a) % 360) + 540) % 360) - 180;

// Posición y objetivo en t (0 a 1) del vuelo entre dos vistas. Función pura: la verificación la muestrea.
export function trayectoria(inicio, fin) {
  const dAz = diferenciaAngular(inicio.azimut, fin.azimut);
  const desplazamiento = Math.hypot(fin.objetivo.x - inicio.objetivo.x, fin.objetivo.z - inicio.objetivo.z);
  const ln0 = Math.log(inicio.distancia);
  const ln1 = Math.log(fin.distancia);
  return (t) => {
    const e = suavizar(limitar(t, 0, 1));
    const objetivo = inicio.objetivo.clone().lerp(fin.objetivo, e);
    const distancia = Math.exp(ln0 + (ln1 - ln0) * e) + SALTO * desplazamiento * Math.sin(Math.PI * e);
    const vista = {
      distancia,
      azimut: inicio.azimut + dAz * e,
      elevacion: inicio.elevacion + (fin.elevacion - inicio.elevacion) * e,
    };
    return { posicion: sobreSuperficie(esfericaAPosicion(objetivo, vista), distancia), objetivo };
  };
}

const mismaVista = (a, b) =>
  a.objetivo.distanceTo(b.objetivo) < 0.5 &&
  Math.abs(a.distancia - b.distancia) < 0.5 &&
  Math.abs(diferenciaAngular(a.azimut, b.azimut)) < 0.1 &&
  Math.abs(a.elevacion - b.elevacion) < 0.1;

// Ancla más próxima a un punto (para la tecla C si el objetivo no coincide con el foco).
function anclaCercana(punto) {
  let mejor = null;
  for (const e of ENTIDADES) {
    const p = ancla(e.id);
    if (p && (!mejor || p.distanceTo(punto) < mejor.d)) mejor = { id: e.id, d: p.distanceTo(punto) };
  }
  return mejor?.id ?? 'general';
}

/**
 * escena: { camara, controles, colocar(posicion, objetivo) }.
 * instantanea: sin vuelo (verificación con #captura=1).
 */
export function crearCamaraNavegacion(escena, { instantanea = false } = {}) {
  const { camara, controles, colocar } = escena;
  const raiz = document.documentElement;
  let tween = null;
  let ultima = null;

  const actual = () => vistaDesde(camara.position, controles.target);
  const habilitar = () => {
    controles.enabled = !tween && obtener().modo === 'libre';
  };

  function terminar() {
    tween = null;
    delete raiz.dataset.transicion;
    habilitar();
  }

  // Un bloque con duración 0 coloca la cámara sin vuelo.
  function ir(bloque) {
    if (!bloque) return;
    tween?.kill();
    const inicio = actual();
    const fin = resolver(bloque, inicio);
    const camino = trayectoria(inicio, fin);
    const aplicar = (t) => {
      const { posicion, objetivo } = camino(t);
      colocar(posicion, objetivo);
    };
    const duracion = instantanea || !bloque.duracion ? 0 : limitar(bloque.duracion, DURACION.minima, DURACION.maxima);
    if (duracion === 0 || mismaVista(inicio, fin)) {
      aplicar(1);
      terminar();
      return;
    }
    raiz.dataset.transicion = '1';
    // El reloj de GSAP avanza solo en cada cuadro: se pone al día para que el vuelo dure lo pedido.
    gsap.ticker.tick();
    const progreso = { t: 0 };
    const registro = { duracion, inicio: performance.now(), fin: null };
    ultima = registro;
    tween = gsap.to(progreso, {
      t: 1,
      duration: duracion,
      ease: 'none',
      onUpdate: () => aplicar(progreso.t),
      onComplete: () => {
        registro.fin = performance.now();
        terminar();
      },
    });
    habilitar();
  }

  // Bloque de cámara actual en el formato de paradas.json (tecla C).
  function bloqueActual() {
    const foco = obtener().camara?.ancla;
    const pFoco = foco && ancla(foco);
    const id = pFoco && pFoco.distanceTo(controles.target) < 1 ? foco : anclaCercana(controles.target);
    const v = vistaDesde(camara.position, ancla(id) ?? controles.target);
    return {
      ancla: id,
      distancia: Math.round(v.distancia),
      azimut: Math.round(v.azimut),
      elevacion: Math.round(v.elevacion),
      duracion: DURACION.autor,
    };
  }

  suscribir('camara', (e) => ir(e.camara));
  suscribir('modo', habilitar);
  habilitar();

  return {
    bloqueActual,
    vistaActual: actual,
    ultimaTransicion: () => ultima && { ...ultima },
  };
}
