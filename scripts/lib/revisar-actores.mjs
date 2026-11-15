// Revisión de la red de actores (etapas 9.a y 9.b): mercados aislados en S0 (P18) y en red en S2 (P20), polígono del
// territorio de la red a ambos lados del límite departamental y límites administrativos; lindero, figuras
// territoriales y marcadores de actores sin enlaces en S0 (P13); enlaces de los cinco tipos de relación y, en el
// segundo paso, proximidades y compras públicas (P21). Leyenda, rótulos y presupuesto gráfico de cada capa. Misma
// página que revisar-procesos.mjs (#captura=1, 1600×900).
import path from 'node:path';
import { ir, TOPE_TRIANGULOS } from './revisar-procesos.mjs';

const MAXIMO_ROTULOS = 7;
// Capas que solo dibujan donde hay red (S2 y S3).
const DE_RED = ['red_mercados', 'spg', 'poligono_red', 'vinculos_actores', 'proximidades', 'compras_publicas'];
const TIPOS = ['comercio', 'garantia', 'conocimiento', 'semillas', 'gobernanza']; // PLAN, etapa 9
const SIN_MARCADOR = 4; // actores sin nodo propio (contenido/actores.json, red.sin_marcador)
const ACTORES = 18;

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
    encendidas: window.escenario.estado().capas,
    triangulos: e.triangulos,
    llamadas: e.llamadas,
    capas: window.escenario.actores().capas,
    leyenda: visibles('.red .capas-entrada').map((x) => x.dataset.flujo),
    nota: visibles('.red .leyenda-nota')[0]?.textContent ?? '',
    columnaSobreFicha: visibles('.columna-derecha > *').map(caja).filter((r) => visibles('.ficha').map(caja).some((i) => cruzan(r, i))).length,
    rotulos: rotulos.map((x) => x.dataset.rotulo),
    enEscena: visibles('.rotulos-finca > *').length,
    sobreInterfaz: cajas.filter((r) => interfaz.some((i) => cruzan(r, i))).length,
    // Rótulos que se cruzan entre sí.
    encimados: cajas.filter((a, i) => cajas.some((b, j) => j > i && cruzan(a, b))).length,
    fuera: cajas.filter((r) => r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight).length,
  };
}

// Lectura de una parada con el presupuesto de cada capa encendida: el mismo cuadro sin ella.
async function medir(pagina) {
  const con = await pagina.evaluate(leer);
  con.presupuesto = {};
  for (const id of con.encendidas) {
    await pagina.evaluate(([lista, id]) => window.escenario.capas(lista.filter((c) => c !== id)), [con.encendidas, id]);
    const sin = await pagina.evaluate(leer);
    con.presupuesto[id] = { triangulos: con.triangulos - sin.triangulos, llamadas: con.llamadas - sin.llamadas };
  }
  await pagina.evaluate((lista) => window.escenario.capas(lista), con.encendidas);
  return con;
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

  // P13 (S0): lindero, figuras territoriales y marcadores de actores, sin enlaces.
  await ir(pagina, 'P13');
  r.limite = await medir(pagina);
  await foto('actores-P13.jpg');

  // P18 (S0): siete mercados sin enlaces; con las capas de la red forzadas, siguen sin enlaces ni polígono.
  await ir(pagina, 'P18');
  r.aislados = await medir(pagina);
  await foto('actores-P18.jpg');
  await pagina.evaluate(([lista, extra]) => window.escenario.capas([...lista, ...extra]), [r.aislados.encendidas, DE_RED]);
  r.forzadas = await pagina.evaluate(leer);
  await pagina.evaluate((lista) => window.escenario.capas(lista), r.aislados.encendidas);

  // P20 (S2): nueve mercados en una sola red, garantía y polígono que cruza el límite departamental.
  await ir(pagina, 'P20');
  r.red = await medir(pagina);
  await foto('actores-P20.jpg');

  // P21 (S2): sujeto plural con los cinco tipos de relación; después, proximidades y compras públicas.
  await ir(pagina, 'P21', 0);
  r.sujeto = await medir(pagina);
  await foto('actores-P21-1.jpg');
  await ir(pagina, 'P21', 1);
  r.circuitos = await medir(pagina);
  await foto('actores-P21-2.jpg');
  return r;
}

const enlaces = (m) => Object.entries(m.capas).filter(([id]) => id.startsWith('enlaces_'));

export function fallasActores(r) {
  if (!r?.circuitos) return ['Actores: sin datos de la revisión'];
  const f = [];
  if (!r.apagadasEnP01) f.push('Actores: hay capas o leyenda de la red visibles en P01');
  const comun = (nombre, m, escenario) => {
    if (m.escenario !== escenario) f.push(`${nombre}: escenario ${m.escenario} (se espera ${escenario})`);
    for (const [id, p] of Object.entries(m.presupuesto)) {
      if (p.triangulos > TOPE_TRIANGULOS) f.push(`${nombre}: la capa «${id}» suma ${p.triangulos} triángulos (tope ${TOPE_TRIANGULOS})`);
    }
    if (m.enEscena > MAXIMO_ROTULOS) f.push(`${nombre}: ${m.enEscena} rótulos en escena (máximo ${MAXIMO_ROTULOS})`);
    if (m.sobreInterfaz || m.fuera || m.encimados) f.push(`${nombre}: rótulos sobre la interfaz (${m.sobreInterfaz}), fuera de la ventana (${m.fuera}) o encimados (${m.encimados})`);
    if (m.columnaSobreFicha) f.push(`${nombre}: ${m.columnaSobreFicha} paneles de la columna derecha cruzan la ficha`);
    if (!/ilustrativ/.test(m.nota)) f.push(`${nombre}: la leyenda no lleva la nota de disposición ilustrativa («${m.nota}»)`);
  };
  const { limite: l, aislados: a, forzadas: z, red: d, sujeto: s, circuitos: c } = r;

  comun('Actores P13', l, 'S0');
  const { figuras_territoriales: fig, lindero_territorio: lin, actores: mar } = l.capas;
  if (!fig.visible || fig.figuras.length !== 3 || !fig.sobreFinca.includes('F1')) f.push(`Actores P13: figuras territoriales ${fig.figuras.join(', ')} (se esperan tres, una sobre la finca faro)`);
  if (!lin.visible || lin.fincas.length !== 4) f.push(`Actores P13: lindero resaltado en ${lin.fincas.length} fincas (se esperan cuatro)`);
  if (!mar.visible || mar.actores.length !== ACTORES - SIN_MARCADOR) f.push(`Actores P13: ${mar.actores.length} actores con marcador (se esperan ${ACTORES - SIN_MARCADOR})`);
  if (enlaces(l).some(([, x]) => x.visible)) f.push('Actores P13: hay enlaces visibles en S0');
  for (const id of ['lindero', 'figura_territorial', 'reserva_natural', 'comunitario']) if (!l.leyenda.includes(id)) f.push(`Actores P13: «${id}» falta en la leyenda`);

  comun('Actores P18', a, 'S0');
  if (a.capas.mercados.mercados !== 7) f.push(`Actores P18: ${a.capas.mercados.mercados} mercados (se esperan siete en S0)`);
  if (!a.capas.limites_administrativos.visible || !a.capas.limites_administrativos.ladosMunicipales) f.push('Actores P18: sin límites administrativos');
  if (enlaces(a).some(([, x]) => x.visible) || a.capas.poligono_red.visible) f.push('Actores P18: hay capas de la red visibles');
  if (enlaces(z).some(([, x]) => x.enlaces) || z.capas.poligono_red.vertices) f.push('Actores P18: en S0 hay enlaces o polígono con las capas de la red encendidas (los mercados deben quedar aislados)');
  if (!a.leyenda.includes('mercado') || a.leyenda.includes('comercio')) f.push(`Actores P18: leyenda ${a.leyenda.join(', ')}`);

  comun('Actores P20', d, 'S2');
  const { mercados, enlaces_comercio: com, enlaces_garantia: gar, poligono_red: p } = d.capas;
  if (mercados.mercados !== 9) f.push(`Actores P20: ${mercados.mercados} mercados (se esperan nueve en S2)`);
  if (!com.visible || com.mercados !== mercados.mercados || com.componentes !== 1) f.push(`Actores P20: la red de comercio une ${com.mercados} de ${mercados.mercados} mercados en ${com.componentes} grupos (se espera una sola red)`);
  if (!com.cruzanLimite) f.push('Actores P20: ningún enlace de comercio cruza el límite departamental');
  if (!gar.visible || !gar.enlaces) f.push('Actores P20: sin enlaces de garantía');
  if (!p.visible || !p.verticesNorte || !p.verticesSur || !p.nodosNorte || !p.nodosSur || p.cruces !== 2) {
    f.push(`Actores P20: el polígono de la red no cruza el límite departamental (vértices norte ${p.verticesNorte}, sur ${p.verticesSur}, cruces ${p.cruces})`);
  }
  for (const id of ['mercado', 'comercio', 'garantia', 'poligono', 'limite_departamental']) if (!d.leyenda.includes(id)) f.push(`Actores P20: «${id}» falta en la leyenda`);
  if (!d.rotulos.includes('territorio_red')) f.push('Actores P20: falta el rótulo del territorio de la red');

  comun('Actores P21 (sujeto plural)', s, 'S2');
  for (const t of TIPOS) {
    const x = s.capas[`enlaces_${t}`];
    if (!x?.visible || !x.enlaces) f.push(`Actores P21: sin enlaces de «${t}» en el paso del sujeto plural`);
    if (!s.leyenda.includes(t)) f.push(`Actores P21: «${t}» falta en la leyenda del sujeto plural`);
  }
  if (!s.capas.actores.visible) f.push('Actores P21: sin marcadores de actores en el paso del sujeto plural');
  comun('Actores P21 (circuitos cortos)', c, 'S2');
  const { enlaces_proximidad: pro, enlaces_compras: cmp } = c.capas;
  if (!pro.visible || !pro.enlaces || !pro.mercados) f.push('Actores P21: sin enlaces de proximidad con los mercados en el segundo paso');
  if (!cmp.visible || !cmp.enlaces) f.push('Actores P21: sin enlaces de compras públicas en el segundo paso');
  if (TIPOS.some((t) => c.capas[`enlaces_${t}`].visible)) f.push('Actores P21: los enlaces del sujeto plural siguen visibles en el segundo paso');
  for (const id of ['proximidad', 'compras', 'consumo']) if (!c.leyenda.includes(id)) f.push(`Actores P21: «${id}» falta en la leyenda del segundo paso`);
  return f;
}

export function seccionActores(r) {
  if (!r?.circuitos) return ['## Actores y red', '', '- Sin datos', ''];
  const { limite: l, aislados: a, forzadas: z, red: d, sujeto: s, circuitos: c } = r;
  const { mercados, enlaces_comercio: com, enlaces_garantia: gar, poligono_red: p, limites_administrativos: lim } = d.capas;
  const gasto = (m) => Object.entries(m.presupuesto).map(([id, x]) => `${id} ${x.triangulos} y ${x.llamadas}`).join('; ');
  const cuenta = (m, ids) => ids.map((t) => `${t} ${m.capas[`enlaces_${t}`].enlaces}`).join(', ');
  const rotulos = (m) => `${m.rotulos.join(', ') || 'ninguno'} (${m.enEscena} en escena)`;
  const cat = l.capas.actores.categorias;
  return [
    '## Actores y red',
    '',
    `- Capas de la red apagadas en P01: ${r.apagadasEnP01 ? 'sí' : 'no'}`,
    `- P13 (${l.escenario}): lindero resaltado de ${l.capas.lindero_territorio.fincas.join(', ')}; figuras territoriales ${l.capas.figuras_territoriales.figuras.join(', ')} (sobre la finca ${l.capas.figuras_territoriales.sobreFinca.join(', ')}); ${l.capas.actores.marcadores} marcadores de ${l.capas.actores.actores.length} actores (${Object.entries(cat).map(([k, n]) => `${k} ${n}`).join(', ')}); enlaces visibles: ${enlaces(l).filter(([, x]) => x.visible).length}`,
    `- P18 (${a.escenario}): ${a.capas.mercados.mercados} mercados (${a.capas.mercados.ids.join(', ')}), sin capas de enlaces; con todas las capas de la red forzadas en S0: ${enlaces(z).reduce((n, [, x]) => n + x.enlaces, 0)} enlaces y ${z.capas.poligono_red.vertices} vértices de polígono`,
    `- P20 (${d.escenario}): ${mercados.mercados} mercados; comercio: ${com.enlaces} enlaces entre ${com.nodos} nodos, ${com.mercados} mercados en ${com.componentes} red, ${com.cruzanLimite} enlaces cruzan el límite departamental; garantía: ${gar.enlaces} enlaces entre ${gar.nodos} nodos`,
    `- Polígono de la red: ${p.nodos} nodos (${p.nodosNorte} al norte y ${p.nodosSur} al sur del límite departamental), ${p.vertices} vértices (${p.verticesNorte} al norte y ${p.verticesSur} al sur) y ${p.cruces} cruces con el límite`,
    `- Límites administrativos: ${lim.municipios} municipios esquemáticos (${lim.norte} al norte y ${lim.sur} al sur) y ${lim.ladosMunicipales} lados de límite municipal`,
    `- P21, sujeto plural (${s.escenario}): enlaces por tipo de relación: ${cuenta(s, TIPOS)}; ${s.capas.actores.marcadores} marcadores de actores`,
    `- P21, circuitos cortos: enlaces de ${cuenta(c, ['proximidad', 'compras'])}; mercados enlazados por proximidad: ${c.capas.enlaces_proximidad.mercados}`,
    `- Rótulos (máximo ${MAXIMO_ROTULOS}): P13 ${rotulos(l)}; P18 ${rotulos(a)}; P20 ${rotulos(d)}; P21 ${rotulos(s)} y ${rotulos(c)}`,
    `- Leyenda («${d.nota}»): P13 ${l.leyenda.join(', ')}; P18 ${a.leyenda.join(', ')}; P20 ${d.leyenda.join(', ')}; P21 ${s.leyenda.join(', ')} y ${c.leyenda.join(', ')}`,
    `- Presupuesto gráfico por capa, triángulos y llamadas (tope ${TOPE_TRIANGULOS} triángulos): P13: ${gasto(l)}. P18: ${gasto(a)}. P20: ${gasto(d)}. P21: ${gasto(s)}; segundo paso: ${gasto(c)}`,
    `- Capturas: ${r.capturas.map((x) => `\`capturas/${x}\``).join(', ')}`,
    '',
  ];
}
