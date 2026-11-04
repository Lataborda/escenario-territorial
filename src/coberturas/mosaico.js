// Mosaico campesino de la ladera: puestos de cada especie según el patrón de su cobertura. Hileras en curva de
// nivel para el café, el plátano y la huerta; tresbolillo para los frutales; sombrío y plátano dispersos en el café.
// Una unidad que cambia de cobertura entre escenarios tiene los puestos de cada patrón; se ve el de su tipo actual.
import { crearAzar } from '../util/azar.js';
import { SEMILLA } from '../terreno/relieve.js';
import { BASE } from './teselas.js';
import { LADO, teselaDe } from './rejilla.js';
import { TIPOS, HORTALIZAS } from './tipos.js';
import { INDICE, LISTA_TIPOS, NINGUNA } from './asignacion.js';
import { ESPECIES } from './especies.js';
import { crearInstancias } from './instancias.js';

// entre: separación entre hileras; en: separación dentro de la hilera; holgura: desvío aleatorio;
// filas: hileras que ocupa la especie dentro de un ciclo de hileras; prob: fracción de puestos que se conserva.
const PATRONES = {
  cafe: [
    { especie: 'cafeto', entre: 2.8, en: 2.4, holgura: 0.25, escala: [0.9, 1.15] },
    { especie: 'guamo', entre: 13, en: 12, holgura: 2.5, escala: [1.2, 1.55], desfase: 0.4 },
    { especie: 'platano', entre: 9, en: 8, holgura: 2, escala: [0.85, 1.1], prob: 0.35, desfase: 0.7 },
  ],
  platano: [{ especie: 'platano', entre: 3.6, en: 3.2, holgura: 0.5, escala: [0.9, 1.3], prob: 0.92 }],
  frutales: [{ especie: ['citrico', 'mango'], entre: 5.6, en: 5.6, holgura: 0.3, escala: [0.9, 1.2], tresbolillo: true }],
  huerta: [
    { especie: 'era', entre: 1.9, en: 4.3, holgura: 0.05, escala: [1, 1], ciclo: 6, filas: [0, 1, 2, 3], alinear: true },
    { especie: 'maiz', entre: 1.9, en: 1.5, holgura: 0.2, escala: [0.85, 1.1], ciclo: 6, filas: [4, 5] },
  ],
};
const TINTES = [0xffffff, 0xf3f8e6, 0xe9f3ec, 0xfff3e2, 0xf6f1d6];

// Ejes de la parcela: a lo largo de la curva de nivel y a través (pendiente abajo).
function ejes(u, altura) {
  const gx = altura(u.x + 3, u.z) - altura(u.x - 3, u.z);
  const gz = altura(u.x, u.z + 3) - altura(u.x, u.z - 3);
  const g = Math.hypot(gx, gz);
  if (g < 1e-3) return { a: [1, 0], b: [0, 1] };
  return { a: [-gz / g, gx / g], b: [gx / g, gz / g] };
}

function generar(u, tipo, datos, altura, azar, puestos) {
  const { centros, unidadDe } = datos;
  const { a, b } = ejes(u, altura);
  let alcance = 0;
  for (const t of u.teselas) {
    alcance = Math.max(alcance, Math.hypot(centros.x(t % centros.columnas) - u.x, centros.z(Math.floor(t / centros.columnas)) - u.z));
  }
  alcance += LADO;
  const tipos = new Set([INDICE.get(tipo)]);
  for (const patron of PATRONES[tipo]) {
    const ciclo = patron.ciclo ?? 1;
    const filas = patron.filas ?? [0];
    const desfase = (patron.desfase ?? 0) * patron.en;
    for (let r = -Math.ceil(alcance / patron.entre); r * patron.entre <= alcance; r++) {
      if (!filas.includes(((r % ciclo) + ciclo) % ciclo)) continue;
      const corrido = desfase + (patron.tresbolillo && r % 2 ? patron.en / 2 : 0);
      for (let k = -Math.ceil(alcance / patron.en) - 1; k * patron.en <= alcance; k++) {
        const s = k * patron.en + corrido + (azar() - 0.5) * 2 * patron.holgura;
        const w = r * patron.entre + (azar() - 0.5) * 2 * patron.holgura;
        const x = u.x + a[0] * s + b[0] * w;
        const z = u.z + a[1] * s + b[1] * w;
        const giro = azar() * Math.PI * 2;
        const elegido = azar();
        if (patron.prob != null && elegido > patron.prob) continue;
        const t = teselaDe(centros, x, z);
        if (t < 0 || unidadDe[t] !== u.indice) continue;
        const especie = Array.isArray(patron.especie) ? patron.especie[Math.floor(elegido * patron.especie.length) % patron.especie.length] : patron.especie;
        const lista = puestos.get(especie) ?? [];
        puestos.set(especie, lista);
        const escala = patron.escala[0] + (patron.escala[1] - patron.escala[0]) * azar();
        lista.push({
          u,
          tipos,
          x,
          y: altura(x, z) + BASE,
          z,
          // Las eras siguen la curva de nivel (su largo va sobre el eje z local).
          giro: patron.alinear ? Math.atan2(a[0], a[1]) : giro,
          escala,
          ancho: 1,
          alto: 1,
          color: especie === 'era' ? HORTALIZAS[Math.floor(azar() * HORTALIZAS.length)] : TINTES[Math.floor(azar() * TINTES.length)],
          brillo: 0.88 + 0.22 * azar(),
          retardo: 0.7 * u.retardo + 0.3 * azar(),
        });
      }
    }
  }
}

function barajar(lista, azar) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

// Clases instanciadas del mosaico, una por especie, con los mismos métodos que vegetacion.js y el nivel de detalle.
export function crearMosaico(datos, asignaciones, altura) {
  const azar = crearAzar(SEMILLA + 131);
  const puestos = new Map();
  for (const u of datos.unidades) {
    const tipos = new Set();
    for (const asignacion of asignaciones.values()) {
      const i = asignacion[u.indice];
      if (i !== NINGUNA && TIPOS[LISTA_TIPOS[i]].mosaico) tipos.add(LISTA_TIPOS[i]);
    }
    for (const tipo of [...tipos].sort()) generar(u, tipo, datos, altura, azar, puestos);
  }
  const clases = Object.keys(ESPECIES)
    .filter((especie) => puestos.has(especie))
    .map((especie) =>
      crearInstancias({
        id: especie,
        puestos: barajar(puestos.get(especie), azar),
        mallas: ESPECIES[especie].mallas(),
        umbral: ESPECIES[especie].umbral,
        visible: (e, indice) => e.tipos.has(indice),
        colorDe: (e, indice, tinte) => tinte.setHex(e.color).multiplyScalar(e.brillo),
      }),
    );
  return {
    clases,
    mallas: clases.flatMap((c) => c.mallas),
    preparar: (asignacion) => clases.reduce((suma, c) => suma + c.preparar(asignacion), 0),
    avanzar: (t, progreso) => clases.reduce((suma, c) => suma + c.avanzar(t, progreso), 0),
    liviano: (activo) => clases.forEach((c) => c.liviano(activo)),
    detalle: (cercana) => clases.reduce((cambio, c) => c.detalle(cercana) || cambio, false),
    arreglos: () => clases.flatMap((c) => c.arreglos()),
  };
}
