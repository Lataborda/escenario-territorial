// Límites administrativos (capa «limites_administrativos», P18 a P20): el límite departamental resaltado y los
// límites municipales esquemáticos. Cada asentamiento de territorio.json es la cabecera de un municipio; su término
// es la parte del departamento más próxima a ella que a las demás cabeceras (celdas de Voronoi a cada lado del
// límite departamental). Trazos discontinuos sobre el relieve. No cambian con el escenario.
import * as THREE from 'three';
import contenido from '../../contenido/actores.json';
import { ENTIDADES, BORDE, aMundoX, aMundoZ, aPlanoU } from '../terreno/plano.js';
import { vLimite, ondaLimite } from '../terreno/limite.js';
import { crearTrazo } from '../escena/lineas.js';
import { ESTILO } from './estilo.js';

const ALTO = 1.8; // sobre el terreno
const ALTO_ROTULO = 4;
const PASO = 4; // tramo del límite departamental
const datos = contenido.red.limites;

// Recorta el polígono convexo (lista de [x, z]) con el semiplano más cercano a «a» que a «b».
function recortar(poligono, a, b) {
  const mx = (a.x + b.x) / 2;
  const mz = (a.z + b.z) / 2;
  const lado = ([x, z]) => (x - mx) * (b.x - a.x) + (z - mz) * (b.z - a.z); // negativo: del lado de «a»
  const salida = [];
  poligono.forEach((p, k) => {
    const q = poligono[(k + 1) % poligono.length];
    const dp = lado(p);
    const dq = lado(q);
    if (dp <= 0) salida.push(p);
    if (dp * dq < 0) {
      const t = dp / (dp - dq);
      salida.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  });
  return salida;
}

// Lados compartidos por dos celdas de un departamento (rectángulo de z0 a z1): cada lado una sola vez.
function ladosInternos(cabeceras, z0, z1) {
  const lados = [];
  const d = (c, x, z) => Math.hypot(c.x - x, c.z - z);
  cabeceras.forEach((c, i) => {
    let celda = [[-BORDE.x, z0], [BORDE.x, z0], [BORDE.x, z1], [-BORDE.x, z1]];
    for (const o of cabeceras) if (o !== c && celda.length) celda = recortar(celda, c, o);
    celda.forEach((p, k) => {
      const q = celda[(k + 1) % celda.length];
      const x = (p[0] + q[0]) / 2;
      const z = (p[1] + q[1]) / 2;
      // El lado es compartido si su punto medio equidista de otra cabecera de índice mayor.
      if (cabeceras.some((o, j) => j > i && Math.abs(d(o, x, z) - d(c, x, z)) < 0.01)) lados.push([p[0], p[1], q[0], q[1]]);
    });
  });
  return lados;
}

// Parte un segmento [x1, z1, x2, z2] en guiones.
function guiones([x1, z1, x2, z2], guion, hueco) {
  const largo = Math.hypot(x2 - x1, z2 - z1);
  const salida = [];
  for (let s = 0; s < largo; s += guion + hueco) {
    const a = s / largo;
    const b = Math.min(1, (s + guion) / largo);
    salida.push([x1 + (x2 - x1) * a, z1 + (z2 - z1) * a, x1 + (x2 - x1) * b, z1 + (z2 - z1) * b]);
  }
  return salida;
}

/** superficie y altura: consultas del terreno. */
export function crearLimites({ superficie, altura }) {
  const limite = ENTIDADES.find((e) => e.tipo === 'limite');
  const v = vLimite(limite);
  const zLimite = aMundoZ(v);
  const cabeceras = ENTIDADES.filter((e) => e.tipo === 'asentamiento' && typeof e.x === 'number').map((e) => ({ id: e.id, x: aMundoX(e.x), z: aMundoZ(e.z) }));
  const norte = cabeceras.filter((c) => c.z < zLimite);
  const sur = cabeceras.filter((c) => c.z >= zLimite);
  const internos = [...ladosInternos(norte, -BORDE.z, zLimite), ...ladosInternos(sur, zLimite, BORDE.z)];

  const municipal = crearTrazo('limites-municipales', altura, { ...ESTILO.limite_municipal.linea, alto: ALTO });
  municipal.fijar(internos.flatMap((s) => guiones(s, ESTILO.limite_municipal.guion, ESTILO.limite_municipal.hueco)));
  // Límite departamental: el mismo trazo irregular del terreno, en guiones.
  const { guion, hueco } = ESTILO.limite_departamental;
  const z = (x) => aMundoZ(ondaLimite(v, aPlanoU(x)));
  const tramos = [];
  for (let x = -BORDE.x; x < BORDE.x; x += PASO) {
    if ((x + BORDE.x) % (guion + hueco) < guion) tramos.push([x, z(x), Math.min(BORDE.x, x + PASO), z(Math.min(BORDE.x, x + PASO))]);
  }
  const departamental = crearTrazo('limite-departamental', altura, { ...ESTILO.limite_departamental.linea, alto: ALTO });
  departamental.fijar(tramos);
  const grupo = new THREE.Group();
  grupo.name = 'actores-limites';
  grupo.add(municipal.grupo, departamental.grupo);

  return {
    capa: datos.capa,
    grupo,
    nubes: [],
    rotulos: datos.rotulos.map((r) => {
      const x = aMundoX(r.x);
      const zr = aMundoZ(r.z);
      return { ...r, punto: [x, superficie(x, zr) + ALTO_ROTULO, zr] };
    }),
    aplicar() {},
    datos: () => ({
      municipios: cabeceras.length,
      norte: norte.length,
      sur: sur.length,
      ladosMunicipales: internos.length,
      segmentos: municipal.cantidad() + departamental.cantidad(),
    }),
  };
}
