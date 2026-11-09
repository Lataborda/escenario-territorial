// Revisión del lote y del corte de suelo (etapa 7): los cuatro pasos de P03 (nivel resaltado, plantas resaltadas,
// cámara del paso y distancia creciente), marcadores y panel de interacciones, corte de suelo en P07 (en su lugar,
// rótulos, panel de materia orgánica igual a contenido/lote.json), corte oculto fuera de su capa y visible en la
// escala de suelo, rótulos sin superposición con la interfaz a 1920×1080, vuelos continuos de P03 a P04 y de P06 a
// P07, y capturas. Página con #captura=1 (vuelos instantáneos) en la ventana de 1920×1080.
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { componer } from './revisar-fincas.mjs';

const RAZON_MAXIMA = 4; // igual que informe-recorrido.mjs
const DESVIO_MAXIMO = 0.5; // unidades de escena entre la cámara y la del bloque del paso
const CORTE_ROTULOS = 9; // cuatro horizontes, cuatro grupos de biota y el cierre

const cuadro = (pagina) => pagina.evaluate(() => window.escenario.dibujarCuadro());
const ir = (pagina, id, paso = 0) => pagina.evaluate(([id, paso]) => window.escenario.irA(id, { paso, instantanea: true }), [id, paso]);

// Cajas de los rótulos del lote visibles y de la interfaz; superposiciones y salidas de la ventana.
function leerInterfaz() {
  const caja = (e) => e.getBoundingClientRect();
  const cruzan = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  const visibles = (sel) => [...document.querySelectorAll(sel)].filter((e) => !e.hidden && e.offsetParent !== null);
  const interfaz = [...visibles('.ficha, .botonera, .momentos'), ...visibles('.columna-derecha > *')].map(caja);
  const rotulos = visibles('.rotulos-lote > *').map(caja);
  const ventana = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
  const panel = (sel) => {
    const e = document.querySelector(sel);
    return e && !e.hidden ? e : null;
  };
  const interacciones = panel('.interacciones');
  const materia = panel('.materia');
  return {
    rotulos: rotulos.length,
    sobreInterfaz: rotulos.filter((r) => interfaz.some((i) => cruzan(r, i))).length,
    fuera: rotulos.filter((r) => r.left < 0 || r.top < 0 || r.right > ventana.right || r.bottom > ventana.bottom).length,
    interacciones: interacciones ? [...interacciones.querySelectorAll('.interacciones-entrada')].map((e) => e.dataset.interaccion) : null,
    materia: materia ? [...materia.querySelectorAll('.materia-fila')].map((e) => ({ id: e.dataset.fila, valor: e.querySelector('.materia-valor').textContent })) : null,
    panelSobreFicha: [interacciones, materia].filter(Boolean).some((p) => cruzan(caja(p), caja(document.querySelector('.ficha')))),
  };
}

const estadisticas = (pagina) =>
  pagina.evaluate(() => {
    window.escenario.dibujarCuadro();
    return window.escenario.estadisticas();
  });

export async function revisarLote(pagina, { navegador, dirCapturas, raiz }) {
  const leer = async (nombre) => JSON.parse(await readFile(path.join(raiz, 'contenido', `${nombre}.json`), 'utf8'));
  const lote = await leer('lote');
  const paradas = (await leer('paradas')).paradas;
  const p03 = paradas.find((p) => p.id === 'P03');
  const r = { pasos: [], capturas: [], contenido: { niveles: lote.niveles.map((n) => n.id), interacciones: lote.interacciones.map((i) => i.id), materia: lote.materia_organica.filas } };
  await pagina.evaluate(() => window.escenario.dibujo(false));

  // P03: cuatro pasos con su cámara; captura de cada uno.
  const vistas = [];
  for (let k = 0; k < p03.pasos.length; k++) {
    await ir(pagina, 'P03', k);
    await cuadro(pagina);
    await cuadro(pagina);
    const bloque = { ...p03.camara, ...(p03.pasos[k].camara ?? {}) };
    const datos = await pagina.evaluate(() => window.escenario.lote());
    r.pasos.push({
      id: p03.pasos[k].id,
      nivel: datos.nivel,
      plantas: datos.plantas,
      resaltadas: datos.resaltadas,
      rotulos: datos.rotulos,
      anillo: datos.anillo,
      contorno: datos.contorno,
      detalle: datos.detalle,
      distancia: bloque.distancia,
      desvio: await pagina.evaluate((b) => window.escenario.desvioBloque(b), bloque),
      interfaz: await pagina.evaluate(leerInterfaz),
      estadisticas: await estadisticas(pagina),
    });
    vistas.push(await pagina.screenshot({ type: 'jpeg', quality: 85 }));
  }
  await componer(navegador, vistas, 2, path.join(dirCapturas, 'lote-niveles.jpg'));
  r.capturas.push('lote-niveles.jpg');

  // P07: corte en su lugar, rótulos y panel de materia orgánica.
  await ir(pagina, 'P07');
  await cuadro(pagina);
  await cuadro(pagina);
  const p07 = await pagina.evaluate(() => window.escenario.lote());
  r.corte = { ...p07.corte, rotulos: p07.rotulos.corte, interfaz: await pagina.evaluate(leerInterfaz), estadisticas: await estadisticas(pagina) };
  await pagina.screenshot({ path: path.join(dirCapturas, 'suelo-corte.jpg'), type: 'jpeg', quality: 85 });
  r.capturas.push('suelo-corte.jpg');

  // Fuera de su capa el corte no se ve; en la escala de suelo, sí.
  await ir(pagina, 'P06');
  await cuadro(pagina);
  r.ocultoP06 = await pagina.evaluate(() => {
    const l = window.escenario.lote();
    return !l.corte.visible && l.rotulos.corte === 0 && document.querySelector('.materia').hidden && document.querySelector('.interacciones').hidden;
  });
  await ir(pagina, 'P01');
  await pagina.evaluate(() => window.escenario.irAEscala('suelo'));
  await cuadro(pagina);
  r.escalaSuelo = await pagina.evaluate(() => window.escenario.lote().corte.visible && !document.querySelector('.materia').hidden);

  // Vuelos del descenso: pasos de P03, P03 a P04 y P06 a P07 (tramos de la lista de estados del recorrido).
  const tramos = await pagina.evaluate(() => window.escenario.revisarTrayectorias());
  const indice = [];
  for (const p of paradas) for (let k = 0; k < Math.max(1, p.pasos?.length ?? 0); k++) indice.push(`${p.id}.${k}`);
  const nombres = ['P03.0', 'P03.1', 'P03.2', 'P03.3', 'P06.0'];
  r.vuelos = nombres.map((n) => ({ desde: n, hasta: indice[indice.indexOf(n) + 1], ...tramos[indice.indexOf(n)] }));
  await pagina.evaluate(() => window.escenario.dibujo(true));
  return r;
}

const igualLista = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function fallasLote(r) {
  const f = [];
  if (!r?.pasos?.length) return ['Lote: sin datos del módulo'];
  const total = r.pasos[0].plantas;
  const solo = (paso, especies) => Object.entries(paso.resaltadas).every(([e, n]) => n === (especies.includes(e) ? total[e] : 0));
  const [org, pob, com, eco] = r.pasos;
  if (!igualLista(r.pasos.map((p) => p.nivel), r.contenido.niveles)) f.push('Lote: el nivel resaltado no sigue los pasos de P03');
  if (!(org.resaltadas.cafeto === 1 && Object.entries(org.resaltadas).every(([e, n]) => e === 'cafeto' || n === 0) && org.anillo)) f.push('Lote: paso Organismo sin un único cafeto resaltado con su anillo');
  if (!solo(pob, ['cafeto', 'cana'])) f.push('Lote: paso Población debe resaltar solo cafetos y caña');
  if (!solo(com, Object.keys(total)) || !solo(eco, Object.keys(total))) f.push('Lote: pasos Comunidad y Ecosistema deben resaltar todas las especies');
  if (!igualLista(com.rotulos.interacciones, r.contenido.interacciones) || !igualLista(com.interfaz.interacciones, r.contenido.interacciones)) f.push('Lote: marcadores o panel de interacciones distintos de contenido/lote.json');
  if (!eco.contorno) f.push('Lote: paso Ecosistema sin el contorno de los lotes');
  if (r.pasos.some((p, k) => k && p.distancia <= r.pasos[k - 1].distancia)) f.push('Lote: la cámara de P03 no se aleja paso a paso');
  for (const p of r.pasos) {
    if (!(p.desvio < DESVIO_MAXIMO)) f.push(`Lote: cámara del paso ${p.id} distinta de su bloque (${p.desvio?.toFixed(2)})`);
    if (p.rotulos.niveles < 1) f.push(`Lote: paso ${p.id} sin rótulo de nivel`);
    if (p.interfaz.sobreInterfaz || p.interfaz.fuera) f.push(`Lote: rótulos del paso ${p.id} sobre la interfaz o fuera de la ventana`);
    if (p.interfaz.panelSobreFicha) f.push(`Lote: panel de interacciones sobre la ficha (${p.id})`);
  }
  const c = r.corte;
  if (!c?.visible || !c.enSuLugar) f.push('Corte de suelo: no está en su lugar en P07');
  if (c?.rotulos !== CORTE_ROTULOS) f.push(`Corte de suelo: ${c?.rotulos ?? 0} rótulos visibles en P07 (se esperan ${CORTE_ROTULOS})`);
  const valores = (c?.interfaz.materia ?? []).map((x) => x.valor);
  if (!igualLista(valores, r.contenido.materia.map((x) => x.texto))) f.push('Corte de suelo: panel de materia orgánica distinto de contenido/lote.json');
  if (c?.interfaz.sobreInterfaz || c?.interfaz.fuera || c?.interfaz.panelSobreFicha) f.push('Corte de suelo: rótulos o panel sobre la interfaz');
  if (!r.ocultoP06) f.push('Corte de suelo: visible fuera de su capa (P06)');
  if (!r.escalaSuelo) f.push('Corte de suelo: no aparece con la escala de suelo de la botonera');
  for (const v of r.vuelos ?? []) {
    if (!v.extremos || !v.finitos || v.razon > RAZON_MAXIMA) f.push(`Lote: vuelo de ${v.desde} a ${v.hasta} con saltos`);
  }
  return f;
}

const si = (v) => (v ? 'sí' : 'no');

export function seccionLote(r) {
  if (!r?.pasos?.length) return ['## Lote y corte de suelo', '', '- Sin datos', ''];
  const total = r.pasos[0].plantas;
  const resumen = (o) => Object.entries(o).map(([e, n]) => `${e} ${n}`).join(', ');
  const c = r.corte;
  return [
    '## Lote y corte de suelo',
    '',
    `- Plantas: ${resumen(total)}`,
    ...r.pasos.map(
      (p) =>
        `- P03 ${p.id}: nivel ${p.nivel}; resaltadas ${resumen(p.resaltadas)}; cámara a ${p.distancia} (desvío ${p.desvio.toFixed(2)}); detalle ${p.detalle}; rótulos de nivel ${p.rotulos.niveles}, marcadores de interacción ${p.rotulos.interacciones.length}; anillo ${si(p.anillo)}, contorno ${si(p.contorno)}; panel de interacciones ${p.interfaz.interacciones ? p.interfaz.interacciones.length : 'oculto'}; rótulos sobre la interfaz ${p.interfaz.sobreInterfaz}, fuera ${p.interfaz.fuera}; ${p.estadisticas.llamadas} llamadas, ${p.estadisticas.triangulos} triángulos`,
    ),
    `- P07: corte visible ${si(c?.visible)}, en su lugar ${si(c?.enSuLugar)} (base ${c?.base} sobre el terreno); rótulos ${c?.rotulos} de ${CORTE_ROTULOS}; materia orgánica ${(c?.interfaz.materia ?? []).map((x) => `${x.id} «${x.valor}»`).join(', ')}; rótulos sobre la interfaz ${c?.interfaz.sobreInterfaz}, fuera ${c?.interfaz.fuera}; ${c?.estadisticas.llamadas} llamadas, ${c?.estadisticas.triangulos} triángulos`,
    `- Corte oculto en P06 (con sus paneles): ${si(r.ocultoP06)}; visible con la escala de suelo: ${si(r.escalaSuelo)}`,
    `- Vuelos del descenso: ${(r.vuelos ?? []).map((v) => `${v.desde}→${v.hasta} ${v.longitud} u, razón ${v.razon}`).join('; ')} (máximo ${RAZON_MAXIMA})`,
    `- Capturas: ${r.capturas.map((x) => `\`capturas/${x}\``).join(', ')}`,
    '',
  ];
}
