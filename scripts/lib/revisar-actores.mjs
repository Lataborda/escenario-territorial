// Revisión de la red de actores (etapa 9.a): mercados aislados en S0 (P18) y en red en S2 (P20), polígono del
// territorio de la red a ambos lados del límite departamental, límites administrativos, leyenda, rótulos y
// presupuesto gráfico de cada capa. Misma página que revisar-procesos.mjs (#captura=1, 1600×900).
import path from 'node:path';
import { ir, TOPE_TRIANGULOS } from './revisar-procesos.mjs';

const MAXIMO_ROTULOS = 7;
const DE_RED = ['red_mercados', 'spg', 'poligono_red']; // capas que solo dibujan cuando la red existe

// Cifras del cuadro, capas de actores, leyenda de la red y rótulos visibles.
function leer() {
  for (let k = 0; k < 2; k++) window.escenario.dibujarCuadro();
  const e = window.escenario.estadisticas();
  const caja = (x) => x.getBoundingClientRect();
  const cruzan = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  const visibles = (sel) => [...document.querySelectorAll(sel)].filter((x) => !x.hidden && x.offsetParent !== null);
  const interfaz = [...visibles('.ficha, .botonera, .momentos'), ...visibles('.columna-derecha > *')].map(caja);
  const rotulos = visibles('.rotulos-flujos > *');
  const cajas = rotulos.map(caja);
  return {
    escenario: window.escenario.estado().escenario,
    triangulos: e.triangulos,
    llamadas: e.llamadas,
    capas: window.escenario.actores().capas,
    leyenda: visibles('.red .capas-entrada').map((x) => x.dataset.flujo),
    nota: visibles('.red .leyenda-nota')[0]?.textContent ?? '',
    columnaSobreFicha: visibles('.columna-derecha > *').map(caja).filter((r) => visibles('.ficha').map(caja).some((i) => cruzan(r, i))).length,
    rotulos: rotulos.map((x) => x.dataset.rotulo),
    enEscena: visibles('.rotulos-finca > *').length,
    sobreInterfaz: cajas.filter((r) => interfaz.some((i) => cruzan(r, i))).length,
    fuera: cajas.filter((r) => r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight).length,
  };
}

// Presupuesto de cada capa de actores visible: el mismo cuadro sin ella.
async function presupuesto(pagina, con) {
  const salida = {};
  for (const id of Object.keys(con.capas).filter((c) => con.capas[c].visible)) {
    const encendidas = await pagina.evaluate((id) => {
      const lista = window.escenario.estado().capas;
      window.escenario.capas(lista.filter((c) => c !== id));
      return lista;
    }, id);
    const sin = await pagina.evaluate(leer);
    await pagina.evaluate((lista) => window.escenario.capas(lista), encendidas);
    salida[id] = { triangulos: con.triangulos - sin.triangulos, llamadas: con.llamadas - sin.llamadas };
  }
  return salida;
}

export async function revisarActores(pagina, { dirCapturas }) {
  await pagina.evaluate(() => window.escenario.dibujo(false));
  const r = { capturas: [] };
  const foto = async (nombre) => {
    await pagina.evaluate(() => window.escenario.dibujarCuadro());
    await pagina.screenshot({ path: path.join(dirCapturas, nombre), type: 'jpeg', quality: 82 });
    r.capturas.push(nombre);
  };
  await ir(pagina, 'P01');
  const p01 = await pagina.evaluate(leer);
  r.apagadasEnP01 = Object.values(p01.capas).every((c) => !c.visible) && !p01.leyenda.length;

  // P18 (S0): siete mercados sin enlaces; con las capas de la red forzadas, siguen sin enlaces ni polígono.
  await ir(pagina, 'P18');
  r.aislados = await pagina.evaluate(leer);
  r.aislados.presupuesto = await presupuesto(pagina, r.aislados);
  await foto('actores-P18.jpg');
  const capas = await pagina.evaluate((extra) => {
    const lista = window.escenario.estado().capas;
    window.escenario.capas([...lista, ...extra]);
    return lista;
  }, DE_RED);
  r.forzadas = await pagina.evaluate(leer);
  await pagina.evaluate((lista) => window.escenario.capas(lista), capas);

  // P20 (S2): nueve mercados en una sola red, garantía y polígono que cruza el límite departamental.
  await ir(pagina, 'P20');
  r.red = await pagina.evaluate(leer);
  r.red.presupuesto = await presupuesto(pagina, r.red);
  await foto('actores-P20.jpg');
  return r;
}

export function fallasActores(r) {
  if (!r?.red) return ['Actores: sin datos de la revisión'];
  const f = [];
  if (!r.apagadasEnP01) f.push('Actores: hay capas o leyenda de la red visibles en P01');
  const comun = (nombre, m) => {
    for (const [id, p] of Object.entries(m.presupuesto)) {
      if (p.triangulos > TOPE_TRIANGULOS) f.push(`${nombre}: la capa «${id}» suma ${p.triangulos} triángulos (tope ${TOPE_TRIANGULOS})`);
    }
    if (m.enEscena > MAXIMO_ROTULOS) f.push(`${nombre}: ${m.enEscena} rótulos en escena (máximo ${MAXIMO_ROTULOS})`);
    if (m.sobreInterfaz || m.fuera) f.push(`${nombre}: rótulos sobre la interfaz (${m.sobreInterfaz}) o fuera de la ventana (${m.fuera})`);
    if (m.columnaSobreFicha) f.push(`${nombre}: ${m.columnaSobreFicha} paneles de la columna derecha cruzan la ficha`);
    if (!/ilustrativ/.test(m.nota)) f.push(`${nombre}: la leyenda no lleva la nota de disposición ilustrativa («${m.nota}»)`);
    if (!m.capas.limites_administrativos.visible || !m.capas.limites_administrativos.ladosMunicipales) f.push(`${nombre}: sin límites administrativos`);
  };
  const { aislados: a, forzadas: z, red: d } = r;
  comun('Actores P18', a);
  if (a.escenario !== 'S0' || a.capas.mercados.mercados !== 7) f.push(`Actores P18: ${a.capas.mercados.mercados} mercados en ${a.escenario} (se esperan siete en S0)`);
  if (DE_RED.some((c) => a.capas[c].visible)) f.push('Actores P18: hay capas de la red visibles');
  if (z.capas.red_mercados.enlaces || z.capas.spg.enlaces || z.capas.poligono_red.vertices) f.push('Actores P18: en S0 hay enlaces o polígono con las capas de la red encendidas (los mercados deben quedar aislados)');
  if (!a.leyenda.includes('mercado') || a.leyenda.includes('comercio')) f.push(`Actores P18: leyenda ${a.leyenda.join(', ')}`);
  comun('Actores P20', d);
  const { mercados, red_mercados: c, spg, poligono_red: p } = d.capas;
  if (d.escenario !== 'S2' || mercados.mercados !== 9) f.push(`Actores P20: ${mercados.mercados} mercados en ${d.escenario} (se esperan nueve en S2)`);
  if (!c.visible || c.mercados !== mercados.mercados || c.componentes !== 1) f.push(`Actores P20: la red de comercio une ${c.mercados} de ${mercados.mercados} mercados en ${c.componentes} grupos (se espera una sola red)`);
  if (!c.cruzanLimite) f.push('Actores P20: ningún enlace de comercio cruza el límite departamental');
  if (!spg.visible || !spg.enlaces) f.push('Actores P20: sin enlaces de garantía');
  if (!p.visible || !p.verticesNorte || !p.verticesSur || !p.nodosNorte || !p.nodosSur || p.cruces !== 2) {
    f.push(`Actores P20: el polígono de la red no cruza el límite departamental (vértices norte ${p.verticesNorte}, sur ${p.verticesSur}, cruces ${p.cruces})`);
  }
  for (const id of ['mercado', 'comercio', 'garantia', 'poligono', 'limite_departamental']) if (!d.leyenda.includes(id)) f.push(`Actores P20: «${id}» falta en la leyenda`);
  if (!d.rotulos.includes('territorio_red')) f.push('Actores P20: falta el rótulo del territorio de la red');
  return f;
}

export function seccionActores(r) {
  if (!r?.red) return ['## Actores y red', '', '- Sin datos', ''];
  const { aislados: a, forzadas: z, red: d } = r;
  const { mercados, red_mercados: c, spg, poligono_red: p, limites_administrativos: l } = d.capas;
  const gasto = (m) => Object.entries(m.presupuesto).map(([id, x]) => `${id} ${x.triangulos} triángulos y ${x.llamadas} llamadas`).join('; ');
  return [
    '## Actores y red',
    '',
    `- Capas de la red apagadas en P01: ${r.apagadasEnP01 ? 'sí' : 'no'}`,
    `- P18 (${a.escenario}): ${a.capas.mercados.mercados} mercados (${a.capas.mercados.ids.join(', ')}), sin capas de enlaces; con las capas de la red forzadas en S0: ${z.capas.red_mercados.enlaces} enlaces de comercio, ${z.capas.spg.enlaces} de garantía y ${z.capas.poligono_red.vertices} vértices de polígono`,
    `- P20 (${d.escenario}): ${mercados.mercados} mercados; comercio: ${c.enlaces} enlaces entre ${c.nodos} nodos, ${c.mercados} mercados en ${c.componentes} red, ${c.cruzanLimite} enlaces cruzan el límite departamental; garantía: ${spg.enlaces} enlaces entre ${spg.nodos} nodos`,
    `- Polígono de la red: ${p.nodos} nodos (${p.nodosNorte} al norte y ${p.nodosSur} al sur del límite departamental), ${p.vertices} vértices (${p.verticesNorte} al norte y ${p.verticesSur} al sur) y ${p.cruces} cruces con el límite`,
    `- Límites administrativos: ${l.municipios} municipios esquemáticos (${l.norte} al norte y ${l.sur} al sur) y ${l.ladosMunicipales} lados de límite municipal`,
    `- Rótulos: P18 ${a.rotulos.join(', ')} (${a.enEscena} en escena); P20 ${d.rotulos.join(', ')} (${d.enEscena} en escena); máximo ${MAXIMO_ROTULOS}`,
    `- Leyenda: P18 ${a.leyenda.join(', ')}; P20 ${d.leyenda.join(', ')} («${d.nota}»)`,
    `- Presupuesto gráfico por capa (tope ${TOPE_TRIANGULOS} triángulos): P18: ${gasto(a)}. P20: ${gasto(d)}`,
    `- Capturas: ${r.capturas.map((x) => `\`capturas/${x}\``).join(', ')}`,
    '',
  ];
}
