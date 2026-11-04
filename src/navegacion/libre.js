// Modo libre: doble clic en el relieve para volar hasta ese punto; flechas o WASD para avanzar sobre
// el paisaje (Mayús acelera). La cámara no baja del relieve y el objetivo no sale de la maqueta.
// Actúa solo con modo «libre»; el vuelo lo pide al estado y lo anima el módulo de cámara.
import * as THREE from 'three';
import { obtener, cambiar, suscribir } from '../estado.js';
import { superficie } from '../terreno/terreno.js';
import { BORDE } from '../terreno/plano.js';
import { vistaDesde } from './camara.js';
import { puntoEnTerreno, limitarObjetivo, corregirAltura, relieveVecino } from './limites.js';
import { limitar } from '../util/interpolar.js';

// Tecla en minúscula → [adelante, derecha].
const TECLAS = {
  arrowup: [1, 0],
  w: [1, 0],
  arrowdown: [-1, 0],
  s: [-1, 0],
  arrowleft: [0, -1],
  a: [0, -1],
  arrowright: [0, 1],
  d: [0, 1],
};
const nombre = (evento) => evento.key?.toLowerCase() ?? '';
export const esTeclaDeMovimiento = (evento) => nombre(evento) in TECLAS;

// Doble clic: acerca a la mitad de la distancia, con elevación entre 20 y 70 grados.
export const VUELO = { factor: 0.5, distanciaMinima: 90, elevacion: [20, 70], duracion: [1.5, 2.5], porUnidad: 1 / 800 };
// Marcha: rapidez en fracción de la distancia al objetivo por segundo, con límites en unidades por segundo.
// Junto al borde de la maqueta, la componente que va hacia afuera frena en la distancia que recorrería
// en «anticipacion» segundos (al menos «bandaMinima» unidades).
export const MARCHA = { proporcion: 0.35, minima: 25, maxima: 400, rapida: 3, respuesta: 6, anticipacion: 0.5, bandaMinima: 10 };
const SEGUIMIENTO = 5; // respuesta del objetivo a la altura del relieve (1/s)
const DT_MAXIMO = 0.1; // un cuadro lento no produce un salto

// Factor (0 a 1) de la componente v de la velocidad en la posición p, con el borde en ±borde.
function frenoBorde(p, v, borde) {
  if (!v) return 1;
  const banda = Math.max(MARCHA.bandaMinima, Math.abs(v) * MARCHA.anticipacion);
  return limitar((v > 0 ? borde - p : p + borde) / banda, 0, 1);
}

/** escena: { camara, controles, renderizador, alCuadro }. */
export function crearLibre({ camara, controles, renderizador, alCuadro }) {
  const lienzo = renderizador.domElement;
  const pulsadas = new Set();
  let rapido = false;
  const velocidad = new THREE.Vector2();
  const deseada = new THREE.Vector2();
  const adelante = new THREE.Vector3(0, 0, -1);
  const derecha = new THREE.Vector3();
  const desfase = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const libre = () => obtener().modo === 'libre';

  function detener() {
    pulsadas.clear();
    velocidad.set(0, 0);
  }

  // Ejes horizontales de la vista; desde arriba se conserva el último adelante.
  function ejes() {
    desfase.subVectors(controles.target, camara.position).setY(0);
    if (desfase.lengthSq() > 1e-6) adelante.copy(desfase).normalize();
    derecha.set(-adelante.z, 0, adelante.x);
  }

  function marchar(dt, distancia) {
    let f = 0;
    let r = 0;
    for (const k of pulsadas) {
      f += TECLAS[k][0];
      r += TECLAS[k][1];
    }
    const n = Math.hypot(f, r);
    const rapidez = n ? (limitar(distancia * MARCHA.proporcion, MARCHA.minima, MARCHA.maxima) * (rapido ? MARCHA.rapida : 1)) / n : 0;
    ejes();
    deseada.set(adelante.x * f + derecha.x * r, adelante.z * f + derecha.z * r).multiplyScalar(rapidez);
    velocidad.lerp(deseada, 1 - Math.exp(-MARCHA.respuesta * dt));
    if (!n && velocidad.lengthSq() < 1e-4) velocidad.set(0, 0);
    const objetivo = controles.target;
    velocidad.x *= frenoBorde(objetivo.x, velocidad.x, BORDE.x);
    velocidad.y *= frenoBorde(objetivo.z, velocidad.y, BORDE.z);
    const x0 = objetivo.x;
    const y0 = objetivo.y;
    const z0 = objetivo.z;
    const libreX = x0 + velocidad.x * dt;
    const libreZ = z0 + velocidad.y * dt;
    objetivo.x = libreX;
    objetivo.z = libreZ;
    limitarObjetivo(objetivo);
    // En el borde la marcha se detiene en ese eje.
    if (objetivo.x !== libreX) velocidad.x = 0;
    if (objetivo.z !== libreZ) velocidad.y = 0;
    objetivo.y += (superficie(objetivo.x, objetivo.z) - objetivo.y) * (1 - Math.exp(-SEGUIMIENTO * dt));
    camara.position.x += objetivo.x - x0;
    camara.position.y += objetivo.y - y0;
    camara.position.z += objetivo.z - z0;
  }

  // Un cuadro: marcha (si los controles están activos, es decir, sin vuelo) y altura mínima de la cámara.
  function paso(dt) {
    if (!libre()) return;
    const t = limitar(dt, 0, DT_MAXIMO);
    const distancia = camara.position.distanceTo(controles.target);
    if (controles.enabled) marchar(t, distancia);
    else velocidad.set(0, 0);
    corregirAltura(camara.position, distancia, t);
    camara.lookAt(controles.target);
  }

  // Punto del relieve bajo el puntero (coordenadas de la ventana), o null.
  function puntoBajo(cx, cy) {
    const r = lienzo.getBoundingClientRect();
    const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    camara.updateMatrixWorld();
    raycaster.setFromCamera(ndc, camara);
    return puntoEnTerreno(raycaster.ray);
  }

  // Vuelo al punto: lo pide al estado con «punto» en lugar de «ancla»; conserva el azimut.
  function volarA(punto) {
    const v = vistaDesde(camara.position, controles.target);
    const distancia = Math.min(v.distancia, Math.max(VUELO.distanciaMinima, v.distancia * VUELO.factor));
    const recorrido = Math.hypot(punto.x - v.objetivo.x, punto.z - v.objetivo.z);
    cambiar({
      camara: {
        punto: { x: punto.x, y: punto.y, z: punto.z },
        distancia,
        azimut: v.azimut,
        elevacion: limitar(v.elevacion, ...VUELO.elevacion),
        duracion: limitar(VUELO.duracion[0] + recorrido * VUELO.porUnidad, ...VUELO.duracion),
      },
    });
  }

  lienzo.addEventListener('dblclick', (ev) => {
    if (!libre() || ev.button !== 0) return;
    const punto = puntoBajo(ev.clientX, ev.clientY);
    if (!punto) return;
    ev.preventDefault();
    volarA(punto);
  });

  window.addEventListener('keydown', (ev) => {
    rapido = ev.shiftKey;
    if (ev.ctrlKey || ev.metaKey || ev.altKey || !libre() || !esTeclaDeMovimiento(ev)) return;
    if (ev.target.closest?.('input, textarea, select')) return;
    ev.preventDefault();
    pulsadas.add(nombre(ev));
  });
  window.addEventListener('keyup', (ev) => {
    rapido = ev.shiftKey;
    pulsadas.delete(nombre(ev));
  });
  window.addEventListener('blur', detener);
  suscribir('modo', (e) => {
    if (e.modo !== 'libre') detener();
  });
  alCuadro(paso);

  return {
    paso,
    puntoBajo,
    // Lectura para la verificación.
    leer: () => ({
      objetivo: controles.target.toArray(),
      posicion: camara.position.toArray(),
      distancia: camara.position.distanceTo(controles.target),
      sobre: camara.position.y - relieveVecino(camara.position.x, camara.position.z),
      pulsadas: [...pulsadas],
      velocidad: velocidad.length(),
    }),
  };
}
