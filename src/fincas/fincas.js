// Fincas tipo (etapa 6): casa y familia, lindero, conectores internos y externos de la EAP y resaltado del
// agroecosistema menor (lote) y mayor (lindero con la familia dentro). Los lotes, las cercas vivas y la conexión
// con la estructura ecológica principal son de las coberturas (src/coberturas/); aquí van la casa, el lindero y
// los trazos de las capas, que se dibujan en la superposición. Reacciona a «capas», «foco» y «escala».
import * as THREE from 'three';
import { obtener, suscribir } from '../estado.js';
import { obtenerFincas } from './trazado.js';
import { VECINOS } from './region.js';
import { crearCasas } from './casa.js';
import { crearTrazo } from '../escena/lineas.js';
import { ESTILO, activa } from './estilo.js';
import { LADO } from '../coberturas/rejilla.js';

const PREDETERMINADA = 'F3'; // finca del resaltado si el punto de interés no es una finca (P04)
// Escalas en que los conectores se muestran solo en la finca del punto de interés (en las demás, en todas).
const SOLO_FOCO = ['suelo', 'planta', 'finca'];

// Contorno de un conjunto de teselas: lados con la vecina fuera del conjunto.
function contorno(teselas, centros) {
  const { columnas } = centros;
  const h = LADO / 2;
  const dentro = new Set(teselas);
  const segmentos = [];
  for (const t of teselas) {
    const i = t % columnas;
    const j = Math.floor(t / columnas);
    const x = centros.x(i);
    const z = centros.z(j);
    for (const [di, dj] of VECINOS) {
      if (dentro.has((j + dj) * columnas + i + di) && i + di >= 0 && i + di < columnas) continue;
      segmentos.push(di ? [x + di * h, z - h, x + di * h, z + h] : [x - h, z + dj * h, x + h, z + dj * h]);
    }
  }
  return segmentos;
}

// Verificación: fracción dibujada de cada lote de la receta (y la de su área, si la tiene), fracción por uso, esquinas
// de la finca y un punto interior alejado del ancla (clic).
function medidas(f, centros, altura) {
  const { columnas } = centros;
  const lotes = f.teselas.length - 1; // sin el solar
  const cuenta = (k) => f.lotes.filter((l) => l.receta === k).reduce((s, l) => s + l.teselas.length, 0);
  const area = f.receta.lotes.reduce((s, r) => s + (r.ha ?? 0), 0);
  const usosFraccion = {};
  for (const l of f.lotes) usosFraccion[l.uso] = (usosFraccion[l.uso] ?? 0) + l.teselas.length / lotes;
  const xs = f.teselas.map((t) => centros.x(t % columnas));
  const zs = f.teselas.map((t) => centros.z(Math.floor(t / columnas)));
  const esquinas = [[Math.min(...xs), Math.min(...zs)], [Math.max(...xs), Math.min(...zs)], [Math.min(...xs), Math.max(...zs)], [Math.max(...xs), Math.max(...zs)]];
  const d = (t) => Math.abs(Math.hypot(centros.x(t % columnas) - f.ancla.x, centros.z(Math.floor(t / columnas)) - f.ancla.z) - 30);
  const lejos = f.teselas.filter((t) => t !== f.solar).reduce((a, b) => (d(b) < d(a) ? b : a));
  const punto = (x, z) => [x, altura(x, z), z];
  return {
    fracciones: Object.fromEntries(f.receta.lotes.map((r, k) => [r.rotulo, Number((cuenta(k) / lotes).toFixed(3))])),
    objetivo: area ? Object.fromEntries(f.receta.lotes.map((r) => [r.rotulo, r.ha / area])) : null,
    usosFraccion,
    esquinas: esquinas.map(([x, z]) => punto(x, z)),
    lejos: punto(centros.x(lejos % columnas), centros.z(Math.floor(lejos / columnas))),
  };
}

// Lote del agroecosistema menor: el mayor de los lotes con el uso de la receta (lote_menor), o el mayor de todos.
export function loteMenor(finca) {
  const propios = finca.lotes.filter((l) => l.uso === finca.receta.lote_menor);
  const lista = propios.length ? propios : finca.lotes;
  return lista.reduce((a, b) => (b.teselas.length > a.teselas.length ? b : a));
}

export function crearFincas({ altura }) {
  const { fincas, centros } = obtenerFincas(altura);
  const casas = crearCasas(fincas, altura);
  const grupo = new THREE.Group();
  grupo.name = 'fincas';
  const lindero = crearTrazo('lindero', altura, ESTILO.lindero);
  lindero.fijar(fincas.flatMap((f) => f.perimetro));
  grupo.add(casas.grupo, lindero.grupo);

  // Trazos de las capas: los conectores y la conexión con la EEP de todas las fincas; el resaltado, de una.
  const superposicion = new THREE.Group();
  superposicion.name = 'fincas-capas';
  const trazos = {};
  for (const nombre of ['conectores_internos', 'conectores_externos', 'agroecosistema_menor', 'agroecosistema_mayor']) {
    trazos[nombre] = crearTrazo(nombre, altura, ESTILO[nombre]);
    superposicion.add(trazos[nombre].grupo);
  }
  const fincaDe = (foco) => fincas.find((f) => f.id === foco) ?? fincas.find((f) => f.id === PREDETERMINADA) ?? fincas[0];
  let resaltada = null;
  let mostradas = null;
  const contornos = { agroecosistema_menor: [], agroecosistema_mayor: [] };
  function pintar({ capas, foco, escala }) {
    // Conectores: de la finca del punto de interés a escala de finca o menor; de todas en la vereda y más arriba.
    const propia = fincas.find((f) => f.id === foco);
    const lista = SOLO_FOCO.includes(escala) && propia ? [propia] : fincas;
    const clave = lista.map((f) => f.id).join();
    if (clave !== mostradas) {
      mostradas = clave;
      trazos.conectores_internos.fijar(lista.flatMap((f) => f.internos));
      trazos.conectores_externos.fijar(lista.flatMap((f) => f.externos));
    }
    const f = fincaDe(foco);
    if (f !== resaltada) {
      resaltada = f;
      contornos.agroecosistema_menor = contorno(loteMenor(f).teselas, centros);
      contornos.agroecosistema_mayor = f.perimetro;
      trazos.agroecosistema_menor.fijar(contornos.agroecosistema_menor);
      trazos.agroecosistema_mayor.fijar(contornos.agroecosistema_mayor);
    }
    for (const [nombre, t] of Object.entries(trazos)) t.grupo.visible = activa(nombre, capas) && !t.grupo.userData.vacio;
  }
  suscribir(['capas', 'foco', 'escala'], pintar);
  pintar(obtener());

  return {
    grupo,
    superposicion,
    fincas,
    familias: casas.familias,
    resaltada: () => resaltada,
    // Segmentos del resaltado actual (rótulos: se colocan sobre el punto más alto del contorno en pantalla).
    contorno: (nombre) => contornos[nombre] ?? [],
    // Verificación: lotes, conectores, casas y capas encendidas.
    datos: () => ({
      fincas: fincas.map((f) => ({
        id: f.id,
        teselas: f.teselas.length,
        lotes: f.lotes.length,
        usos: [...new Set(f.lotes.map((l) => l.uso))],
        ...medidas(f, centros, altura),
        perimetro: f.perimetro.length * LADO,
        internos: f.internos.length * LADO,
        externos: f.externos.length * LADO,
      })),
      casas: casas.cuentas,
      capas: Object.fromEntries(Object.entries(trazos).map(([n, t]) => [n, t.grupo.visible])),
      resaltada: resaltada?.id ?? null,
      conectoresDe: mostradas,
    }),
  };
}
