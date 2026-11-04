// Relieve de la cuenca: perfil por zonas, ruido con semilla, valles y cauces tallados.
import { crearRuidos, fractal, crestas } from '../util/azar.js';
import { interpolacionMonotona, suave, mezclar } from '../util/interpolar.js';
import { ZONAS, aMundoX, aMundoZ, aPlanoU, aPlanoV, crearConsulta } from './plano.js';
import { medirDistancias, enPosicion, fijarLechos } from './hidrografia.js';

export const SEMILLA = 20261104;
const COTA_BASE = 900; // m que corresponden a y = 0
const METROS_POR_UNIDAD = 22; // escala vertical antes de exagerar
const aUnidades = (m) => (m - COTA_BASE) / METROS_POR_UNIDAD;

// Altitudes ilustrativas (m) al final de cada zona; la maqueta no reproduce la cartografía.
const COTA_INICIAL = { borde: 952, plano: 958 };
const COTA_FINAL = { plano: 1010, piedemonte: 1250, ladera: 2350, bosque_altoandino: 3250, paramo: 3650 };

// Abanico aluvial al pie de la cordillera, donde el río tributario sale al plano.
const ABANICO = { u: 0.53, v: 0.41, radio: 210, metros: 34 };

// Talud de las orillas (unidades base por unidad de escena) y alcance del tallado.
const TALUD = 0.15;
const ALCANCE = 26;

function crearPerfil() {
  const xs = [0];
  const ys = [COTA_INICIAL.borde];
  const primera = ZONAS[0];
  if (primera && primera.desde > 0) {
    xs.push(primera.desde);
    ys.push(COTA_INICIAL[primera.id] ?? COTA_INICIAL.borde);
  }
  for (const z of ZONAS) {
    if (COTA_FINAL[z.id] == null) continue;
    xs.push(z.hasta);
    ys.push(COTA_FINAL[z.id]);
  }
  return interpolacionMonotona(xs, ys);
}

// Relieve de montaña (m): filos alargados de oriente a occidente, más altos hacia el páramo.
function montana(r, x, z, u) {
  const mascara = suave(0.48, 0.62, u) * mezclar(0.55, 1, suave(0.62, 0.9, u));
  if (mascara === 0) return 0;
  const c = crestas(r.montana, x / 240 + 7.3, z / 100 - 2.1, 4, 0.4);
  const f = fractal(r.detalle, x / 60, z / 60, 3);
  return mascara * (c * 680 - 310 + f * 35);
}

// Ondulación suave del plano y pendiente leve de sur a norte (el río Cauca corre al norte).
function llanura(r, x, z, v) {
  return fractal(r.llanura, x / 260, z / 260, 2) * 5 + 12 * v;
}

function abanico(x, z, u) {
  const d = Math.hypot(x - aMundoX(ABANICO.u), z - aMundoZ(ABANICO.v));
  if (d >= ABANICO.radio) return 0;
  return ABANICO.metros * Math.pow(1 - d / ABANICO.radio, 1.5) * suave(0.62, 0.5, u);
}

// Calcula alturas (unidades base), niveles de agua y distancia al cauce más cercano para cada vértice.
export function calcularRelieve(rejilla, rios) {
  const ruidos = crearRuidos(SEMILLA, ['montana', 'detalle', 'llanura']);
  const perfil = crearPerfil();
  const { total, columnas } = rejilla;

  const medidas = rios.map((rio) => ({
    rio,
    ...medirDistancias(rejilla, rio, rio.valle ? Math.max(rio.valle.ancho * 2.6, ALCANCE + 40) : ALCANCE + 40),
  }));

  // Relieve base: perfil, ruido y valles, sin cauces.
  const base = new Float32Array(total);
  for (let idx = 0; idx < total; idx++) {
    const x = rejilla.x(idx % columnas);
    const z = rejilla.z(Math.floor(idx / columnas));
    const u = aPlanoU(x);
    const v = aPlanoV(z);
    let bajar = 0;
    let cercania = 0;
    for (const { rio, distancia, posicion } of medidas) {
      if (!rio.valle || distancia[idx] === Infinity) continue;
      const desdeNacimiento = suave(0, 25, posicion[idx]);
      const g = Math.exp(-((distancia[idx] / rio.valle.ancho) ** 2)) * desdeNacimiento;
      bajar = Math.max(bajar, rio.valle.cota(u) * g);
      cercania = Math.max(cercania, g);
    }
    const m = perfil(u) + llanura(ruidos, x, z, v) + abanico(x, z, u) + montana(ruidos, x, z, u) * (1 - 0.75 * cercania) - bajar;
    base[idx] = aUnidades(m);
  }

  fijarLechos(rios, crearConsulta(rejilla, base));

  // Cauces: perfil parabólico dentro del cauce y orillas con talud; se toma el mínimo.
  const alturas = new Float32Array(base);
  const niveles = new Float32Array(total).fill(NaN);
  const canal = new Float32Array(total).fill(Infinity);
  for (const { rio, distancia, posicion } of medidas) {
    const m = rio.muestras;
    for (let idx = 0; idx < total; idx++) {
      const d = distancia[idx];
      if (d === Infinity) continue;
      const p = posicion[idx];
      const semiancho = enPosicion(m, p, 'ancho') * 0.5;
      const lecho = enPosicion(m, p, 'lecho');
      let h;
      if (d < semiancho) {
        // Fondo plano: los vértices de la rejilla cercanos al eje quedan bajo el agua.
        h = lecho - enPosicion(m, p, 'profundidad') * (1 - (d / semiancho) ** 4);
        const sumergido = m[Math.floor(p)].sumergido || m[Math.min(Math.ceil(p), m.length - 1)].sumergido;
        if (!sumergido) {
          const nivel = enPosicion(m, p, 'nivel');
          niveles[idx] = Number.isNaN(niveles[idx]) ? nivel : Math.max(niveles[idx], nivel);
        }
      } else {
        const e = d - semiancho;
        h = lecho + TALUD * e + 0.02 * Math.max(0, e - ALCANCE) ** 2;
      }
      if (h < alturas[idx]) alturas[idx] = h;
      canal[idx] = Math.min(canal[idx], d - semiancho);
    }
  }
  return { alturas, niveles, canal, ruidos };
}
