// Radios de control biológico y polinización (P08, capas «radios_enemigos_naturales» y «radios_polinizadores»).
// Desde cada parche de hábitat del escenario actual (parches.js) sale un radio ilustrativo por clase: un anillo
// sobre el relieve, un disco translúcido (la superposición de radios vecinos se lee más densa) y partículas. Los
// enemigos naturales salen del parche y regresan por rutas radiales; los polinizadores forrajean en lazos y recorren
// el corredor ripario más cercano. Clases, radios y rótulos en contenido/procesos.json (radios).
import * as THREE from 'three';
import contenido from '../../contenido/procesos.json';
import { rejillaTeselas } from '../coberturas/rejilla.js';
import { BORDE } from '../terreno/plano.js';
import { fincaEn } from '../fincas/trazado.js';
import { crearTrazo } from '../escena/lineas.js';
import { crearNube } from './particulas.js';
import { sobreRelieve, segmentosDe } from './curvas.js';
import { hallarParches } from './parches.js';
import { ESTILO } from './estilo.js';

const SECTORES = 64; // lados del anillo y del disco
const ANILLOS = 4; // coronas del disco, para que siga el relieve
const ALTO = 1.6; // sobre la superficie
const ALTO_ROTULO = 16;
const RAYOS = 6; // rutas radiales de enemigos naturales por parche
const LAZOS = 5; // lazos de forrajeo por parche
const APERTURA = 0.9; // ancho angular de un lazo (radianes)

const datos = contenido.radios;
const limitar = (v, tope) => Math.min(tope, Math.max(-tope, v));
const punto = (p, r, a) => [limitar(p.x + Math.cos(a) * r, BORDE.x), limitar(p.z + Math.sin(a) * r, BORDE.z)];

// Disco de todos los parches en una sola malla: centro y coronas hasta el radio, sobre el relieve.
function geometriaDiscos(parches, radio, superficie) {
  const posiciones = [];
  const indices = [];
  for (const p of parches) {
    const base = posiciones.length / 3;
    posiciones.push(p.x, superficie(p.x, p.z) + ALTO, p.z);
    for (let c = 1; c <= ANILLOS; c++) {
      for (let s = 0; s < SECTORES; s++) {
        const [x, z] = punto(p, (radio(p) * c) / ANILLOS, (s / SECTORES) * Math.PI * 2);
        posiciones.push(x, superficie(x, z) + ALTO, z);
      }
    }
    for (let s = 0; s < SECTORES; s++) {
      const t = (s + 1) % SECTORES;
      indices.push(base, base + 1 + t, base + 1 + s);
      for (let c = 1; c < ANILLOS; c++) {
        const a = base + 1 + (c - 1) * SECTORES;
        const b = a + SECTORES;
        indices.push(a + s, a + t, b + s, a + t, b + t, b + s);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
  g.setIndex(indices);
  g.computeBoundingSphere();
  return g;
}

// Tramo de cauce más cercano al primer parche, dentro del alcance: corredor ripario de los polinizadores.
function corredor(centro, parche, alcance, superficie) {
  let mejor = null;
  for (const r of rejillaTeselas().cauces.rios) {
    const cerca = r.muestras.filter((m) => !m.sumergido && Math.hypot(m.x - centro.x, m.z - centro.z) < alcance);
    if (cerca.length < 4) continue;
    const d = Math.min(...cerca.map((m) => Math.hypot(m.x - parche.x, m.z - parche.z)));
    if (!mejor || d < mejor.d) mejor = { d, xz: cerca.filter((m, k) => k % 2 === 0).map((m) => [m.x, m.z]) };
  }
  return mejor ? sobreRelieve(mejor.xz, superficie, ALTO) : null;
}

/** superficie y altura: consultas del terreno; ancla(id): posición de una entidad; coberturas: tipoEn. */
export function crearRadios({ altura, superficie, ancla, coberturas }) {
  const a = ancla(datos.centro);
  const centro = { x: a.x, z: a.z };
  const memoria = new Map();
  const parchesDe = (escenario) => {
    if (!memoria.has(escenario)) {
      memoria.set(escenario, hallarParches({
        tipoEn: coberturas.tipoEn, escenario, centro, alcance: datos.alcance,
        coberturas: datos.coberturas, minimo: datos.minimo_teselas, maximo: datos.maximo,
      }));
    }
    return memoria.get(escenario);
  };
  const base = parchesDe('S0');
  const via = base.length ? corredor(centro, base[0], datos.alcance, superficie) : null;

  return datos.clases.map((clase) => {
    const estilo = ESTILO[clase.id];
    const radio = (p) => p.radio + clase.radio;
    const disco = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({ color: estilo.color, transparent: true, opacity: estilo.relleno, depthTest: false, depthWrite: false }),
    );
    disco.name = `radios-${clase.id}-disco`;
    disco.renderOrder = estilo.linea.orden - 10;
    const anillo = crearTrazo(`radios-${clase.id}`, altura, estilo.linea);
    const nube = crearNube(clase.id, estilo);
    const grupo = new THREE.Group();
    grupo.name = `flujos-radios-${clase.id}`;
    grupo.add(disco, anillo.grupo, nube.puntos);

    let parches = [];
    function aplicar(escenario, factor) {
      parches = parchesDe(escenario);
      disco.geometry.dispose();
      disco.geometry = geometriaDiscos(parches, radio, superficie);
      // Anillo: los tramos que tocan el borde del bloque no se trazan.
      const lados = [];
      const rutas = [];
      parches.forEach((p, n) => {
        const r = radio(p);
        const xz = Array.from({ length: SECTORES + 1 }, (_, s) => punto(p, r, (s / SECTORES) * Math.PI * 2));
        const enBorde = ([x, z]) => Math.abs(x) >= BORDE.x || Math.abs(z) >= BORDE.z;
        for (let s = 0; s < SECTORES; s++) {
          if (enBorde(xz[s]) || enBorde(xz[s + 1])) continue;
          const [x1, z1] = xz[s];
          const [x2, z2] = xz[s + 1];
          lados.push(x1, superficie(x1, z1) + ALTO, z1, x2, superficie(x2, z2) + ALTO, z2);
        }
        if (clase.forma === 'lazos') {
          // Lazo de forrajeo: sale del parche, alcanza el radio y vuelve.
          for (let k = 0; k < LAZOS; k++) {
            const eje = ((k + n * 0.37) / LAZOS) * Math.PI * 2;
            const lazo = Array.from({ length: 25 }, (_, u) => punto(p, r * 0.96 * Math.sin((Math.PI * u) / 24), eje + (u / 24 - 0.5) * APERTURA));
            rutas.push({ ruta: sobreRelieve(lazo, superficie, ALTO) });
          }
        } else {
          for (let k = 0; k < RAYOS; k++) {
            const eje = ((k + n * 0.41) / RAYOS) * Math.PI * 2;
            const ruta = sobreRelieve([punto(p, p.radio * 0.5, eje), punto(p, r, eje)], superficie, ALTO);
            const separacion = estilo.separacion * 2;
            rutas.push({ ruta, sentido: 1, separacion }, { ruta, sentido: -1, separacion });
          }
        }
      });
      anillo.fijarPuntos(lados);
      if (clase.corredor && via) rutas.push({ ruta: via, sentido: 1, dispersion: 3 }, { ruta: via, sentido: -1, dispersion: 3 });
      nube.fijar(rutas, factor);
    }

    // Lugar de un rótulo, sobre los parches de S0: el parche más cercano al centro, un punto de su radio (con
    // «rumbo» en grados), la superposición con el parche vecino o el corredor.
    const lugar = (r) => {
      const p = base[0];
      if (!p) return null;
      const sobre = (x, z, alto = ALTO_ROTULO) => [x, superficie(x, z) + alto, z];
      if (r.en === 'radio') return sobre(...punto(p, radio(p), ((r.rumbo ?? 0) * Math.PI) / 180), ALTO);
      if (r.en === 'superposicion' && base[1]) {
        const q = [...base.slice(1)].sort((m, n) => Math.hypot(m.x - p.x, m.z - p.z) - Math.hypot(n.x - p.x, n.z - p.z))[0];
        return sobre((p.x + q.x) / 2, (p.z + q.z) / 2, ALTO);
      }
      if (r.en === 'corredor' && via) {
        const k = Math.floor(via.n * (r.tramo ?? 0.5)) * 3;
        return [via.puntos[k], via.puntos[k + 1], via.puntos[k + 2]];
      }
      return sobre(p.x, p.z);
    };

    return {
      capa: clase.capa,
      grupo,
      nubes: [nube],
      rotulos: clase.rotulos.map((r) => ({ ...r, punto: lugar(r) })).filter((r) => r.punto),
      aplicar,
      datos: () => {
        // Muestras del radio de cada parche: fincas que toca y si sale de la finca donde está el parche.
        const propia = parches.map((p) => fincaEn(p.x, p.z)?.id ?? null);
        const tocadas = parches.map((p) => {
          const ids = new Set();
          for (const f of [0.5, 1]) {
            for (let s = 0; s < 24; s++) ids.add(fincaEn(...punto(p, radio(p) * f, (s / 24) * Math.PI * 2))?.id ?? null);
          }
          return ids;
        });
        let superpuestos = 0;
        parches.forEach((p, i) => parches.slice(i + 1).forEach((q) => {
          if (Math.hypot(p.x - q.x, p.z - q.z) < radio(p) + radio(q)) superpuestos++;
        }));
        return {
          parches: parches.length,
          radio: clase.radio,
          salenDeSuFinca: parches.filter((p, i) => propia[i] && tocadas[i].has(null)).length,
          fincasAlcanzadas: [...new Set(tocadas.flatMap((ids, i) => [...ids].filter((id) => id && id !== propia[i])))].sort(),
          superpuestos,
          corredor: Boolean(clase.corredor && via),
          triangulos: (disco.geometry.index?.count ?? 0) / 3,
          segmentos: anillo.cantidad(),
        };
      },
    };
  });
}
