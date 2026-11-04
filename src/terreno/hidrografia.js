// Red hídrica: trazos del río Cauca, el río tributario y las quebradas; distancias de la rejilla a cada cauce.
import * as THREE from 'three';
import { aMundoX, aMundoZ, aPlanoU, BORDE, dentro } from './plano.js';
import { suave, mezclar, interpolacionMonotona } from '../util/interpolar.js';
import { RIOS } from './rios.js';

const PASO_TRAZO = 3; // separación entre muestras del cauce (unidades de escena)
const GRADIENTE = 0.0015; // descenso mínimo del lecho por unidad recorrida (unidades base)
const MARGEN = 0.3; // el lecho queda bajo el terreno circundante (unidades base)
const ANCHO_MINIMO = 9.6; // cauce tallado mínimo: la rejilla de 3 unidades lo resuelve sin cortes
export const LAMINA = 0.9; // fracción del cauce tallado que cubre la lámina de agua

// Punto más cercano de un trazo muestreado.
function masCercano(muestras, x, z) {
  let mejor = null;
  let dMin = Infinity;
  for (const m of muestras) {
    const d = Math.hypot(m.x - x, m.z - z);
    if (d < dMin) {
      dMin = d;
      mejor = m;
    }
  }
  return { muestra: mejor, distancia: dMin };
}

function muestrear(def, padre) {
  const puntos = def.puntos.map(([u, v]) => new THREE.Vector3(aMundoX(u), 0, aMundoZ(v)));
  // La confluencia cae sobre el eje del cauce receptor.
  if (padre) {
    const ultimo = puntos[puntos.length - 1];
    const { muestra } = masCercano(padre.muestras, ultimo.x, ultimo.z);
    ultimo.set(muestra.x, 0, muestra.z);
  }
  const curva = new THREE.CatmullRomCurve3(puntos, false, 'centripetal');
  const n = Math.max(2, Math.ceil(curva.getLength() / PASO_TRAZO));
  const base = curva.getSpacedPoints(n);
  const largo = curva.getLength();
  const sp = def.serpenteo;
  const muestras = base.map((p, k) => {
    const s = (k / n) * largo;
    const ant = base[Math.max(0, k - 1)];
    const sig = base[Math.min(n, k + 1)];
    const tx = sig.x - ant.x;
    const tz = sig.z - ant.z;
    const lt = Math.hypot(tx, tz) || 1;
    let x = p.x;
    let z = p.z;
    if (sp) {
      const u = aPlanoU(p.x);
      const zonaMeandros = sp.hastaU ? suave(sp.hastaU, sp.hastaU - 0.05, u) : 1;
      const extremos = padre ? suave(0, 40, largo - s) : 1;
      const desvio = sp.amplitud * zonaMeandros * extremos *
        (Math.sin((2 * Math.PI * s) / sp.onda) + 0.35 * Math.sin((2 * Math.PI * s) / (sp.onda * 0.43) + 1.3));
      x += (tz / lt) * desvio;
      z += (-tx / lt) * desvio;
    }
    const t = s / largo;
    return {
      x,
      z,
      s,
      ancho: Math.max(ANCHO_MINIMO, mezclar(def.ancho[0], def.ancho[1], suave(0, 0.7, t))),
      profundidad: def.profundidad * mezclar(0.45, 1, suave(0, 0.25, t)),
      lecho: 0,
      nivel: 0,
      sumergido: false,
    };
  });
  // Tramo final dentro del cauce receptor: talla el relieve pero no dibuja agua propia.
  if (padre) {
    for (const m of muestras) {
      const { muestra, distancia } = masCercano(padre.muestras, m.x, m.z);
      m.sumergido = distancia < muestra.ancho * 0.5 * LAMINA;
    }
  }
  return muestras;
}

// Trazos muestreados con sus parámetros; cada río conoce su cauce receptor.
export function trazarRios() {
  const rios = [];
  for (const def of RIOS) {
    const padre = def.unirA ? rios.find((r) => r.id === def.unirA) : null;
    const valle = def.valle
      ? { ancho: def.valle.ancho, cota: interpolacionMonotona(def.valle.cotas.map((c) => c[0]), def.valle.cotas.map((c) => c[1])) }
      : null;
    rios.push({ id: def.id, padre: def.unirA ?? null, valle, muestras: muestrear(def, padre) });
  }
  return rios;
}

// Distancia de cada vértice de la rejilla al cauce y posición (índice fraccionario) de la muestra más cercana.
export function medirDistancias(rejilla, rio, radio) {
  const { columnas, filas, paso, x0, z0, total } = rejilla;
  const distancia = new Float32Array(total).fill(Infinity);
  const posicion = new Float32Array(total);
  const m = rio.muestras;
  for (let k = 0; k < m.length - 1; k++) {
    const a = m[k];
    const b = m[k + 1];
    const iMin = Math.max(0, Math.floor((Math.min(a.x, b.x) - radio - x0) / paso));
    const iMax = Math.min(columnas - 1, Math.ceil((Math.max(a.x, b.x) + radio - x0) / paso));
    const jMin = Math.max(0, Math.floor((Math.min(a.z, b.z) - radio - z0) / paso));
    const jMax = Math.min(filas - 1, Math.ceil((Math.max(a.z, b.z) + radio - z0) / paso));
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const l2 = dx * dx + dz * dz || 1;
    for (let j = jMin; j <= jMax; j++) {
      const z = z0 + j * paso;
      for (let i = iMin; i <= iMax; i++) {
        const x = x0 + i * paso;
        const t = Math.min(1, Math.max(0, ((x - a.x) * dx + (z - a.z) * dz) / l2));
        const d = Math.hypot(x - a.x - t * dx, z - a.z - t * dz);
        const idx = j * columnas + i;
        if (d < distancia[idx]) {
          distancia[idx] = d;
          posicion[idx] = k + t;
        }
      }
    }
  }
  return { distancia, posicion };
}

// Valor de un atributo de las muestras en una posición fraccionaria.
export function enPosicion(muestras, posicion, atributo) {
  const k = Math.floor(posicion);
  const a = muestras[k];
  const b = muestras[Math.min(k + 1, muestras.length - 1)];
  return a[atributo] + (b[atributo] - a[atributo]) * (posicion - k);
}

// Lecho descendente desde el nacimiento: bajo el relieve base y nunca más alto que aguas arriba.
export function fijarLechos(rios, alturaBase) {
  for (const rio of rios) {
    let anterior = Infinity;
    let sAnterior = 0;
    for (const m of rio.muestras) {
      const h = alturaBase(m.x, m.z) - MARGEN;
      anterior = Math.min(anterior - GRADIENTE * (m.s - sAnterior), h);
      sAnterior = m.s;
      m.lecho = anterior;
      m.nivel = anterior - 0.3 * m.profundidad;
    }
  }
}

// Tramos visibles: muestras fuera del cauce receptor, recortadas en los bordes del bloque.
export function tramosVisibles(rio) {
  const tramos = [];
  let actual = [];
  const m = rio.muestras;
  for (let k = 0; k < m.length; k++) {
    const p = m[k];
    const visible = !p.sumergido && dentro(p.x, p.z);
    if (visible) {
      if (!actual.length && k > 0 && !m[k - 1].sumergido) actual.push(enBorde(m[k - 1], p));
      actual.push(p);
    } else if (actual.length) {
      if (!p.sumergido) actual.push(enBorde(p, m[k - 1]));
      tramos.push(actual);
      actual = [];
    }
  }
  if (actual.length > 1) tramos.push(actual);
  return tramos.filter((t) => t.length > 1);
}

// Muestra interpolada en el borde del bloque, entre una muestra exterior y una interior.
function enBorde(fuera, adentro) {
  let t = 1;
  if (Math.abs(fuera.x) > BORDE.x) t = Math.min(t, (Math.sign(fuera.x) * BORDE.x - adentro.x) / (fuera.x - adentro.x));
  if (Math.abs(fuera.z) > BORDE.z) t = Math.min(t, (Math.sign(fuera.z) * BORDE.z - adentro.z) / (fuera.z - adentro.z));
  const r = {};
  for (const clave of ['x', 'z', 's', 'ancho', 'profundidad', 'lecho', 'nivel']) {
    r[clave] = adentro[clave] + (fuera[clave] - adentro[clave]) * t;
  }
  return r;
}

// Nivel del agua en (x, z), o null si el punto no está sobre un cauce visible.
// Proyecta el punto sobre el segmento más cercano e interpola, como la lámina de agua.
export function nivelAgua(rios, x, z) {
  let nivel = null;
  for (const rio of rios) {
    const m = rio.muestras;
    let mejor = null;
    for (let k = 0; k < m.length - 1; k++) {
      const a = m[k];
      const b = m[k + 1];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const t = Math.min(1, Math.max(0, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
      const d = Math.hypot(x - a.x - t * dx, z - a.z - t * dz);
      if (!mejor || d < mejor.d) mejor = { d, k, t };
    }
    const a = m[mejor.k];
    const b = m[mejor.k + 1];
    if (a.sumergido || b.sumergido || !dentro(x, z)) continue;
    if (mejor.d < mezclar(a.ancho, b.ancho, mejor.t) * 0.5 * LAMINA) {
      nivel = Math.max(nivel ?? -Infinity, mezclar(a.nivel, b.nivel, mejor.t));
    }
  }
  return nivel;
}

// Muestra visible más cercana de un río por id (para anclar la cámara sobre el agua).
export function puntoDelRio(rios, id, x, z) {
  const rio = rios.find((r) => r.id === id);
  if (!rio) return null;
  return masCercano(rio.muestras.filter((m) => !m.sumergido && dentro(m.x, m.z)), x, z).muestra;
}
