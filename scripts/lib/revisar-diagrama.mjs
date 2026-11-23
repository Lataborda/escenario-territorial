// Revisión del diagrama de la teoría de cambio (etapa 10.b.a), desde revisar-reglas.mjs con el panel abierto en P19:
// con cada preajuste y con cada condición sola, condiciones, resultados, final y supuestos resaltados según el motor;
// supuestos y resultado final con su fuente; sin texto fuera del recuadro, también a 1280 × 720; letra de 1 rem como
// mínimo; botón y tecla D; cierre al avanzar de parada y al cerrar el panel con la tecla T. Capturas diagrama-*.jpg.
import path from 'node:path';
import { VENTANA_PEQUENA } from './revisar-legibilidad.mjs';

const MINIMO_REM = 0.99;

// Estado del diagrama en la página.
function leerDiagrama() {
  const s = document.querySelector('.diagrama');
  const abierto = Boolean(s) && !s.hidden && s.offsetParent !== null;
  const e = window.escenario.estado();
  if (!abierto) return { abierto, estado: e.diagrama, panel: !document.querySelector('.condiciones').hidden, parada: e.parada };
  const ids = (sel) => [...s.querySelectorAll(sel)].map((x) => x.dataset.nodo ?? x.dataset.supuesto);
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const caja = s.getBoundingClientRect();
  const fondo = caja.bottom - parseFloat(getComputedStyle(s).paddingBottom);
  const conTexto = [...s.querySelectorAll('*')].filter((x) => x.offsetParent !== null && [...x.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const conFuente = (x) => Boolean(x?.querySelector('.dg-fuente')?.textContent.trim());
  return {
    abierto,
    estado: e.diagrama,
    panel: !document.querySelector('.condiciones').hidden,
    parada: e.parada,
    condiciones: e.condiciones,
    escenario: s.querySelector('.dg-escenario').textContent,
    activas: ids('.dg-condicion.activa'),
    sinEfecto: ids('.dg-condicion.sin-efecto'),
    alcanzados: ids('.dg-resultado.alcanzado'),
    supuestos: ids('.dg-supuesto.en-juego'),
    final: s.querySelector('.dg-resultado-final')?.textContent ?? '',
    finalConFuente: conFuente(s.querySelector('.dg-final')),
    supuestosConFuente: [...s.querySelectorAll('.dg-supuesto')].filter(conFuente).map((x) => x.dataset.supuesto),
    gruposConFuente: [...s.querySelectorAll('.dg-grupo')].filter(conFuente).length,
    enlaces: s.querySelectorAll('.dg-enlaces path').length,
    sinTrazo: [...s.querySelectorAll('.dg-enlaces path')].filter((p) => !/^M[\d.-]+,[\d.-]+ C/.test(p.getAttribute('d') ?? '')).length,
    completos: s.querySelectorAll('.dg-enlaces path.completo').length,
    fuera: conTexto.filter((x) => {
      const b = x.getBoundingClientRect();
      return b.bottom > fondo + 0.5 || b.right > caja.right + 0.5 || b.left < caja.left - 0.5;
    }).map((x) => x.textContent.trim().slice(0, 30)),
    cubre: caja.left >= document.querySelector('.condiciones').getBoundingClientRect().right && caja.right <= innerWidth,
    boton: document.querySelector('.cond-diagrama')?.getAttribute('aria-pressed'),
    letra: Math.min(...conTexto.map((x) => parseFloat(getComputedStyle(x).fontSize) / rem)),
  };
}

// Lo que el diagrama debe resaltar para unas condiciones, según el motor.
function esperado(motor, final, ids) {
  const r = motor.evaluar(ids);
  return {
    escenario: r.escenario,
    activas: r.condiciones,
    sinEfecto: r.estado.filter((c) => c.activa && !c.territorial).map((c) => c.id),
    alcanzados: [...r.resultados, ...(r.final ? [final.id] : [])],
    supuestos: r.supuestos,
  };
}

const igual = (a, b) => [...a].sort().join() === [...b].sort().join();
function coincide(m, x) {
  return (
    m.abierto && m.escenario.startsWith(x.escenario) && igual(m.activas, x.activas) && igual(m.sinEfecto, x.sinEfecto) &&
    igual(m.alcanzados, x.alcanzados) && igual(m.supuestos, x.supuestos)
  );
}

export async function revisarDiagrama(pagina, { dirCapturas, datos, motor, parada }) {
  const d = datos.condiciones;
  const final = d.resultados.final;
  const leer = () => pagina.evaluate(leerDiagrama);
  const r = { capturas: [], preajustes: [], solas: [] };
  const vacio = d.preajustes.find((p) => !p.condiciones.length);

  // Botón del panel: abre el diagrama.
  await pagina.click(`.cond-preajuste[data-preajuste="${vacio.id}"]`);
  await pagina.click('.cond-diagrama');
  r.boton = (await leer()).abierto;

  // Preajustes con el diagrama abierto: sincronía, fuentes, recuadro y captura.
  for (const p of d.preajustes) {
    await pagina.click(`.cond-preajuste[data-preajuste="${p.id}"]`);
    const m = await leer();
    const x = esperado(motor, final, p.condiciones);
    const captura = `diagrama-${p.id}.jpg`;
    await pagina.screenshot({ path: path.join(dirCapturas, captura), type: 'jpeg', quality: 82 });
    r.capturas.push(captura);
    r.preajustes.push({ id: p.id, esperado: x, correcto: coincide(m, x), ...m });
  }
  // Cada condición sola, con el diagrama abierto.
  for (const c of d.condiciones) {
    await pagina.click(`.cond-preajuste[data-preajuste="${vacio.id}"]`);
    await pagina.click(`.cond-interruptor[data-condicion="${c.id}"]`);
    const m = await leer();
    r.solas.push({ id: c.id, correcto: coincide(m, esperado(motor, final, [c.id])), sinEfecto: m.sinEfecto });
  }
  // Ventana pequeña con el preajuste más completo.
  const completo = d.preajustes.at(-1);
  await pagina.click(`.cond-preajuste[data-preajuste="${completo.id}"]`);
  const tamano = pagina.viewportSize();
  await pagina.setViewportSize(VENTANA_PEQUENA);
  await pagina.waitForTimeout(400);
  r.pequena = await leer();
  await pagina.setViewportSize(tamano);
  await pagina.waitForTimeout(400);

  // Tecla D cierra y abre; al avanzar de parada se cierra con el panel.
  await pagina.keyboard.press('d');
  r.cierraConD = !(await leer()).abierto;
  await pagina.keyboard.press('d');
  r.abreConD = (await leer()).abierto;
  await pagina.keyboard.press('ArrowRight');
  const tras = await leer();
  r.cierraAlAvanzar = !tras.abierto && !tras.estado && tras.parada !== parada;
  // En una parada sin panel, D abre panel y diagrama; T cierra el panel y con él el diagrama.
  await pagina.keyboard.press('d');
  const conD = await leer();
  r.abrePanelConD = conD.abierto && conD.panel;
  await pagina.keyboard.press('t');
  const conT = await leer();
  r.cierraConT = !conT.abierto && !conT.estado && !conT.panel;
  return r;
}

export function fallasDiagrama(r, datos) {
  if (!r) return ['Diagrama: sin datos'];
  const f = [];
  const falla = (texto) => f.push(`Diagrama de la teoría de cambio: ${texto}`);
  const d = datos.condiciones;
  const supuestos = d.supuestos.map((h) => h.id);
  if (!r.boton) falla('el botón del panel no lo abre');
  for (const p of [...r.preajustes, { ...r.pequena, id: 'ventana pequeña', correcto: true, esperado: null }]) {
    const donde = `preajuste ${p.id}`;
    if (!p.correcto) falla(`${donde}: resaltado distinto del motor (condiciones ${p.activas}, resultados ${p.alcanzados}, supuestos ${p.supuestos})`);
    if (!p.abierto || !p.cubre) falla(`${donde}: cerrado o fuera del área a la derecha del panel`);
    if (p.fuera?.length) falla(`${donde}: texto fuera del recuadro (${p.fuera.join('; ')})`);
    if (p.letra < MINIMO_REM) falla(`${donde}: letra de ${p.letra?.toFixed(2)} rem`);
    if (p.final !== d.resultados.final.texto || !p.finalConFuente) falla(`${donde}: resultado final sin texto o sin fuente`);
    if (!igual(p.supuestosConFuente ?? [], supuestos)) falla(`${donde}: supuestos sin fuente (${supuestos.filter((h) => !p.supuestosConFuente?.includes(h)).join(', ')})`);
    if (p.gruposConFuente !== d.diagrama.grupos.length) falla(`${donde}: grupo de condiciones sin fuente`);
    if (!p.enlaces || p.sinTrazo) falla(`${donde}: ${p.sinTrazo} de ${p.enlaces} enlaces sin trazo`);
    if (p.boton !== 'true') falla(`${donde}: el botón del panel no marca el diagrama abierto`);
  }
  for (const c of r.solas) if (!c.correcto) falla(`${c.id} sola: resaltado distinto del motor`);
  if (!r.cierraConD || !r.abreConD) falla(`tecla D: cierra ${r.cierraConD}, abre ${r.abreConD}`);
  if (!r.cierraAlAvanzar) falla('sigue abierto al avanzar de parada');
  if (!r.abrePanelConD || !r.cierraConT) falla(`tecla D sin panel: abre panel y diagrama ${r.abrePanelConD}; tecla T los cierra ${r.cierraConT}`);
  return f;
}

const si = (v) => (v ? 'sí' : 'no');

export function seccionDiagrama(r, datos) {
  if (!r) return ['- Diagrama: sin datos'];
  const final = datos.condiciones.resultados.final;
  const lineas = ['', '### Diagrama de la teoría de cambio (etapa 10.b.a)', '', '| Preajuste | Escenario | Resultados alcanzados | Supuestos en juego | Sincronía | Texto fuera | Letra mínima |', '|---|---|---|---|---|---|---|'];
  for (const p of r.preajustes) {
    lineas.push(`| ${p.id} | ${p.escenario} | ${p.alcanzados.join(', ') || 'ninguno'} | ${p.supuestos.join(', ') || 'ninguno'} | ${si(p.correcto)} | ${p.fuera.length} | ${p.letra.toFixed(2)} rem |`);
  }
  lineas.push(
    '',
    `- Resultado final «${final.texto}» con fuente en los ${r.preajustes.length} preajustes: ${si(r.preajustes.every((p) => p.finalConFuente))}; alcanzado solo en ${r.preajustes.filter((p) => p.alcanzados.includes(final.id)).map((p) => p.id).join(', ')}`,
    `- Supuestos con fuente: ${r.preajustes[0].supuestosConFuente.join(', ')}; grupos de condiciones con fuente: ${r.preajustes[0].gruposConFuente}; enlaces trazados: ${r.preajustes[0].enlaces - r.preajustes[0].sinTrazo} de ${r.preajustes[0].enlaces}`,
    `- Cada condición sola con el diagrama abierto: resaltado igual al motor en ${r.solas.filter((c) => c.correcto).length} de ${r.solas.length}`,
    `- Ventana de ${VENTANA_PEQUENA.width} × ${VENTANA_PEQUENA.height}: texto fuera del recuadro ${r.pequena.fuera?.length ?? 'sin datos'}; letra mínima ${r.pequena.letra?.toFixed(2)} rem`,
    `- Botón del panel abre: ${si(r.boton)}; tecla D cierra ${si(r.cierraConD)} y abre ${si(r.abreConD)}; se cierra al avanzar de parada: ${si(r.cierraAlAvanzar)}; en una parada sin panel, D abre panel y diagrama ${si(r.abrePanelConD)} y T cierra los dos ${si(r.cierraConT)}`,
    `- Capturas: ${r.capturas.map((c) => `\`capturas/${c}\``).join(', ')}`,
  );
  return lineas;
}
