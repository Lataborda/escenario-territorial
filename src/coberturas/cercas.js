// Cercas vivas de las fincas tipo (conectores internos y externos de la EAP): hileras de leucaena con un guamo
// cada tres plantas sobre los linderos elegidos en src/fincas/trazado.js. Las del lindero van un poco hacia
// adentro de la finca. Puestos para el mosaico (mosaico.js), visibles con cualquier uso del lote.
import { obtenerFincas } from '../fincas/trazado.js';
import { BASE } from './teselas.js';
import { teselaDe } from './rejilla.js';
import { LISTA_TIPOS } from './asignacion.js';

const ESPACIO = 2.6; // separación entre plantas a lo largo del lindero
const ADENTRO = 1.1; // las cercas del lindero se corren hacia el interior de la finca (dentro del retiro de la tesela)
const HOLGURA = 0.25;
const PLANTAS = { arbol: { especie: 'guamo', escala: [0.72, 0.92] }, arbusto: { especie: 'leucaena', escala: [0.95, 1.2] } };
const TINTES = [0xffffff, 0xf3f8e6, 0xe9f3ec, 0xf6f1d6];

// Devuelve Map especie → puestos, con el mismo formato que los del mosaico.
export function puestosCercas(datos, altura, azar) {
  const { fincas } = obtenerFincas(altura);
  const todos = new Set(LISTA_TIPOS.map((_, i) => i));
  const salida = new Map();
  let cuenta = 0;
  const plantar = (x, z, muestra) => {
    const t = teselaDe(datos.centros, muestra[0], muestra[1]);
    const u = datos.unidades[datos.unidadDe[t]];
    if (!u) return;
    const tipo = cuenta++ % 3 === 1 ? PLANTAS.arbol : PLANTAS.arbusto;
    const lista = salida.get(tipo.especie) ?? [];
    salida.set(tipo.especie, lista);
    lista.push({
      u,
      tipos: todos,
      x,
      y: altura(x, z) + (u.relieve ? BASE : 0),
      z,
      giro: azar() * Math.PI * 2,
      escala: tipo.escala[0] + (tipo.escala[1] - tipo.escala[0]) * azar(),
      ancho: 1,
      alto: 1,
      color: TINTES[Math.floor(azar() * TINTES.length)],
      brillo: 0.88 + 0.22 * azar(),
      retardo: u.retardo,
    });
  };
  // Plantas a lo largo de un segmento, corridas d hacia (hx, hz); la muestra de la unidad cae del lado interior.
  const hilera = ([x1, z1, x2, z2], hacia = null) => {
    const largo = Math.hypot(x2 - x1, z2 - z1);
    const m = Math.max(1, Math.round(largo / ESPACIO));
    let [ox, oz] = [0, 0];
    if (hacia) {
      const [mx, mz] = [(x1 + x2) / 2, (z1 + z2) / 2];
      const d = Math.hypot(hacia[0] - mx, hacia[1] - mz) || 1;
      [ox, oz] = [((hacia[0] - mx) / d) * ADENTRO, ((hacia[1] - mz) / d) * ADENTRO];
    }
    // Normal al segmento para tomar la unidad de un lado (en las internas, cualquiera de los dos lotes).
    const [nx, nz] = [-(z2 - z1) / largo, (x2 - x1) / largo];
    for (let k = 0; k < m; k++) {
      const f = (k + 0.5) / m;
      const x = x1 + (x2 - x1) * f + ox + (azar() - 0.5) * 2 * HOLGURA;
      const z = z1 + (z2 - z1) * f + oz + (azar() - 0.5) * 2 * HOLGURA;
      const muestra = hacia ? [x + ox, z + oz] : [x + nx * 1.5, z + nz * 1.5];
      plantar(x, z, muestra);
    }
  };
  for (const f of fincas) {
    for (const s of f.internos) hilera(s);
    for (const c of f.cercasLindero) hilera(c.s, c.hacia);
  }
  return salida;
}
