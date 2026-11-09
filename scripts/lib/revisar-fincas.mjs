// Revisión de las fincas tipo (etapa 6): proporciones de F1 frente a sus áreas, distinción de las cuatro fincas,
// conectores legibles a escala de vereda (píxeles de su color en la captura), resaltado del agroecosistema
// menor y mayor, contorno y conexión de la EEP, clic dentro del lindero, capturas de las cuatro fincas y panel
// del índice EAP en P22 (etapa 6.b).
// Página con #captura=1 (vuelos instantáneos).
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const TOLERANCIA_F1 = 0.05; // diferencia máxima entre la fracción dibujada y la del área de cada uso de F1
const DISTINCION_MINIMA = 0.3; // distancia mínima entre las composiciones de dos fincas (suma de diferencias)
const PIXELES_MINIMOS = 400; // píxeles del color de cada conector en la vista de vereda (1600 × 900)
const LADO_MINIMO_PX = 150; // lado mínimo de la finca en pantalla a escala de finca
const COLORES = { internos: [0xf2, 0xa3, 0x3a], externos: [0xe2, 0x50, 0x6e] };

const fincas = (pagina) => pagina.evaluate(() => window.escenario.fincas());
const esperar = (pagina, ms = 250) => pagina.waitForTimeout(ms);
const cuadro = (pagina) => pagina.evaluate(() => window.escenario.dibujarCuadro());

// Píxeles de cada color de conector en una captura PNG (se decodifica en la página).
function contarColores(pagina, png) {
  return pagina.evaluate(
    async ({ datos, colores }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${datos}`;
      await img.decode();
      const lienzo = new OffscreenCanvas(img.width, img.height);
      const c = lienzo.getContext('2d');
      c.drawImage(img, 0, 0);
      const p = c.getImageData(0, 0, img.width, img.height).data;
      const cuenta = Object.fromEntries(Object.keys(colores).map((k) => [k, 0]));
      for (let i = 0; i < p.length; i += 4) {
        for (const [k, [r, g, b]] of Object.entries(colores)) {
          if (Math.abs(p[i] - r) < 24 && Math.abs(p[i + 1] - g) < 24 && Math.abs(p[i + 2] - b) < 24) cuenta[k] += 1;
        }
      }
      return cuenta;
    },
    { datos: png.toString('base64'), colores: COLORES },
  );
}

// Caja en pantalla de las teselas de una finca (píxeles).
function cajaEnPantalla(pagina, id) {
  return pagina.evaluate((id) => {
    const f = window.escenario.fincas().fincas.find((x) => x.id === id);
    const puntos = (f.esquinas ?? []).map((p) => window.escenario.proyectarPunto(p)).filter(Boolean);
    if (!puntos.length) return null;
    const xs = puntos.map((p) => p.x);
    const ys = puntos.map((p) => p.y);
    return { ancho: Math.round(Math.max(...xs) - Math.min(...xs)), alto: Math.round(Math.max(...ys) - Math.min(...ys)) };
  }, id);
}

// Mosaico de capturas en una sola imagen (página auxiliar del mismo navegador).
export async function componer(navegador, imagenes, columnas, destino) {
  const pagina = await navegador.newPage({ viewport: { width: 1600, height: 900 } });
  const filas = Math.ceil(imagenes.length / columnas);
  const celdas = imagenes.map((b) => `<img src="data:image/jpeg;base64,${b.toString('base64')}">`).join('');
  await pagina.setContent(
    `<style>body{margin:0;display:grid;grid-template-columns:repeat(${columnas},1fr);grid-template-rows:repeat(${filas},1fr);width:1600px;height:900px;gap:4px;background:#2b2a27}img{width:100%;height:100%;object-fit:cover}</style>${celdas}`,
  );
  await pagina.screenshot({ path: destino, type: 'jpeg', quality: 82 });
  await pagina.close();
}

export async function revisarFincas(pagina, { navegador, dirCapturas }) {
  const r = { capturas: [] };
  await pagina.evaluate(() => window.escenario.irA('P06', { instantanea: true }));
  r.datos = await fincas(pagina);
  if (!r.datos) return r;
  r.conexion = await pagina.evaluate(() => window.escenario.coberturas().conexionEep('S0'));
  await pagina.evaluate(() => window.escenario.dibujo(false));

  // Cuatro fincas a escala de finca, con sus conectores (P06) y sin interfaz: tamaño en pantalla y captura.
  await pagina.keyboard.press('h');
  r.pantalla = {};
  const vistas = [];
  for (const id of ['F1', 'F2', 'F3', 'F4']) {
    await pagina.evaluate((x) => window.escenario.enfocar(x), id);
    await esperar(pagina);
    await cuadro(pagina);
    r.pantalla[id] = await cajaEnPantalla(pagina, id);
    vistas.push(await pagina.screenshot({ type: 'jpeg', quality: 85 }));
  }
  await componer(navegador, vistas, 2, path.join(dirCapturas, 'fincas-finca.jpg'));
  r.capturas.push('fincas-finca.jpg');

  // Vista de vereda (matriz): conectores encendidos y apagados; píxeles de cada color.
  r.matriz = {};
  const matriz = [];
  for (const id of ['F1', 'F3']) {
    await pagina.evaluate((x) => {
      window.escenario.enfocar(x);
      window.escenario.irAEscala('vereda');
    }, id);
    await esperar(pagina);
    await cuadro(pagina);
    const con = await pagina.screenshot({ type: 'png' });
    matriz.push(await pagina.screenshot({ type: 'jpeg', quality: 85 }));
    await pagina.evaluate(() => window.escenario.capas([]));
    await cuadro(pagina);
    const sin = await pagina.screenshot({ type: 'png' });
    r.matriz[id] = { con: await contarColores(pagina, con), sin: await contarColores(pagina, sin), escala: (await pagina.evaluate(() => window.escenario.estado().escala)) };
    await pagina.evaluate(() => window.escenario.capas(['conectores_eap', 'eep']));
    await cuadro(pagina);
    matriz.push(await pagina.screenshot({ type: 'jpeg', quality: 85 }));
    await pagina.evaluate(() => window.escenario.capas(['rotulos_finca', 'conectores_eap']));
  }
  await componer(navegador, matriz, 2, path.join(dirCapturas, 'fincas-matriz.jpg'));
  r.capturas.push('fincas-matriz.jpg');
  await pagina.keyboard.press('h');

  // Resaltado del agroecosistema menor y mayor (P04) y pasos de la EAP (P05).
  r.resaltado = [];
  for (const [id, paso] of [['P04', 0], ['P04', 1], ['P05', 0], ['P05', 1], ['P05', 2]]) {
    await pagina.evaluate(([x, k]) => window.escenario.irA(x, { paso: k, instantanea: true }), [id, paso]);
    await cuadro(pagina);
    const f = await fincas(pagina);
    const eep = await pagina.evaluate(() => window.escenario.coberturas().datos().eep);
    r.resaltado.push({ id, paso, capas: f.capas, rotulos: f.rotulos, resaltada: f.resaltada, eep });
  }

  // Clic dentro del lindero de F4, lejos de su ancla: la cámara va a la finca y la fija como punto de interés.
  await pagina.evaluate(() => window.escenario.irA('P06', { instantanea: true }));
  await pagina.evaluate(() => window.escenario.irAEscala('vereda'));
  // Sin interfaz: el punto no cae bajo un panel (la vista se recentra al ocultarla).
  await pagina.keyboard.press('h');
  await cuadro(pagina);
  const punto = await pagina.evaluate(() => {
    const f = window.escenario.fincas().fincas.find((x) => x.id === 'F4');
    const p = f.lejos;
    return p && window.escenario.proyectarPunto(p);
  });
  r.clic = { punto };
  if (punto) {
    await pagina.mouse.click(punto.x, punto.y);
    await esperar(pagina, 400);
    const e = await pagina.evaluate(() => window.escenario.estado());
    r.clic = { punto, foco: e.foco, escala: e.escala };
  }
  await pagina.keyboard.press('h');
  r.eap = await revisarPanelEap(pagina);
  await pagina.evaluate(() => window.escenario.dibujo(true));
  return r;
}

// Panel EAP en P22: criterios, valores y totales iguales a contenido/eap.json, sin desborde ni superposición con la
// ficha, rótulo de valores ilustrativos al pie y un rótulo con el total sobre cada finca; oculto en P06.
async function revisarPanelEap(pagina) {
  const esperado = JSON.parse(await readFile(new URL('../../contenido/eap.json', import.meta.url), 'utf8'));
  const leer = () =>
    pagina.evaluate(() => {
      const panel = document.querySelector('.eap');
      if (!panel || panel.hidden) return null;
      const caja = panel.getBoundingClientRect();
      const ficha = document.querySelector('.ficha').getBoundingClientRect();
      return {
        columnas: [...panel.querySelectorAll('thead th.eap-finca')].map((th) => th.textContent),
        filas: [...panel.querySelectorAll('tbody tr')].map((tr) => ({ criterio: tr.querySelector('th').textContent, valores: [...tr.querySelectorAll('td')].map((td) => Number(td.textContent)) })),
        totales: [...panel.querySelectorAll('tfoot td')].map((td) => Number(td.textContent)),
        desborde: panel.scrollWidth > panel.clientWidth + 1 || [...panel.querySelectorAll('th, td')].some((c) => c.scrollWidth > c.clientWidth + 1),
        superpuesto: caja.bottom > ficha.top && caja.left < ficha.right && ficha.left < caja.right,
        pie: panel.querySelector('.eap-pie').textContent,
        rotulos: [...document.querySelectorAll('.eap-rotulo:not([hidden])')].map((e) => e.textContent),
      };
    });
  await pagina.evaluate(() => window.escenario.irA('P06', { instantanea: true }));
  await cuadro(pagina);
  const ocultoFuera = (await leer()) === null;
  await pagina.evaluate(() => window.escenario.irA('P22', { instantanea: true }));
  await cuadro(pagina);
  const leido = await leer();
  if (!leido) return { visible: false, ocultoFuera };
  const total = (f) => esperado.criterios.reduce((s, c) => s + esperado.valores[f][c.id], 0);
  const igual =
    leido.columnas.join() === esperado.fincas.join() &&
    leido.filas.length === esperado.criterios.length &&
    esperado.criterios.every((c, k) => leido.filas[k].criterio === c.corto && esperado.fincas.every((f, j) => leido.filas[k].valores[j] === esperado.valores[f][c.id])) &&
    esperado.fincas.every((f, j) => leido.totales[j] === total(f));
  return { visible: true, ocultoFuera, igual, ...leido, conRotulo: leido.pie.includes(esperado.valores_rotulo), esperados: esperado.fincas.length };
}

function distancia(a, b) {
  const claves = new Set([...Object.keys(a.usosFraccion), ...Object.keys(b.usosFraccion)]);
  let d = 0;
  for (const k of claves) d += Math.abs((a.usosFraccion[k] ?? 0) - (b.usosFraccion[k] ?? 0));
  const conectores = (f) => (f.internos + f.externos) / Math.max(1, f.perimetro);
  return d + Math.abs(conectores(a) - conectores(b));
}

export function medirFincas(r) {
  if (!r.datos) return null;
  const lista = r.datos.fincas;
  const pares = [];
  for (let i = 0; i < lista.length; i++) for (let j = i + 1; j < lista.length; j++) pares.push({ par: `${lista[i].id}-${lista[j].id}`, d: Number(distancia(lista[i], lista[j]).toFixed(2)) });
  const f1 = lista.find((f) => f.id === 'F1');
  const errores = Object.entries(f1?.objetivo ?? {}).map(([k, x]) => ({ uso: k, dibujada: f1.fracciones[k], objetivo: x, diferencia: Math.abs(f1.fracciones[k] - x) }));
  return { pares, minima: Math.min(...pares.map((p) => p.d)), f1: errores, maximaF1: Math.max(0, ...errores.map((e) => e.diferencia)) };
}

export function fallasFincas(r) {
  const f = [];
  if (!r?.datos) return ['Fincas: sin datos del módulo'];
  const m = medirFincas(r);
  if (m.maximaF1 > TOLERANCIA_F1) f.push(`Fincas: F1 se aparta ${m.maximaF1.toFixed(3)} de las áreas de su fuente (máximo ${TOLERANCIA_F1})`);
  if (m.minima < DISTINCION_MINIMA) f.push(`Fincas: dos fincas con composición parecida (distancia ${m.minima}, mínimo ${DISTINCION_MINIMA})`);
  for (const [id, caja] of Object.entries(r.pantalla ?? {})) {
    if (!caja || Math.min(caja.ancho, caja.alto) < LADO_MINIMO_PX) f.push(`Fincas: ${id} mide menos de ${LADO_MINIMO_PX} px a escala de finca`);
  }
  for (const [id, v] of Object.entries(r.matriz ?? {})) {
    if (v.con.internos < PIXELES_MINIMOS || v.con.externos < PIXELES_MINIMOS) f.push(`Fincas: conectores poco visibles en la vista de vereda desde ${id}`);
    if (v.sin.internos > v.con.internos / 10 || v.sin.externos > v.con.externos / 10) f.push(`Fincas: colores de conectores presentes sin la capa (${id})`);
  }
  const paso = (id, k) => r.resaltado?.find((x) => x.id === id && x.paso === k);
  if (!paso('P04', 0)?.capas.agroecosistema_menor || paso('P04', 0)?.rotulos !== 1) f.push('Fincas: P04 paso 1 sin el lote resaltado y su rótulo');
  if (!paso('P04', 1)?.capas.agroecosistema_mayor || paso('P04', 1)?.capas.agroecosistema_menor) f.push('Fincas: P04 paso 2 sin el lindero resaltado');
  if (!paso('P05', 0)?.capas.conectores_internos || paso('P05', 0)?.capas.conectores_externos) f.push('Fincas: P05 paso 1 debe mostrar solo los conectores internos');
  if (!paso('P05', 2)?.eep?.visible || !(paso('P05', 2)?.eep?.conexion > 0)) f.push('Fincas: P05 paso 3 sin contorno de la EEP o sin conexión');
  if (!(r.conexion?.F1 > 0) || !(r.conexion?.F3 > 0) || r.conexion?.F4 > 0) f.push('Fincas: conexión con la EEP fuera de lo esperado (F1 y F3 con conexión, F4 sin conexión)');
  if (r.clic?.foco !== 'F4' || r.clic?.escala !== 'finca') f.push('Fincas: el clic dentro del lindero de F4 no acerca la cámara a la finca');
  const e = r.eap;
  if (!e?.visible) f.push('Panel EAP: no se ve en P22');
  else {
    if (!e.igual) f.push('Panel EAP: criterios, valores o totales distintos de contenido/eap.json');
    if (e.desborde || e.superpuesto) f.push('Panel EAP: texto desbordado o panel sobre la ficha');
    if (!e.conRotulo) f.push('Panel EAP: falta el rótulo de valores ilustrativos');
    if (e.rotulos.length !== e.esperados) f.push('Panel EAP: falta el total sobre alguna finca');
  }
  if (!e?.ocultoFuera) f.push('Panel EAP: visible fuera de la capa indices_eap');
  return f;
}

const si = (v) => (v ? 'sí' : 'no');

export function seccionFincas(r) {
  if (!r?.datos) return ['## Fincas', '', '- Sin datos', ''];
  const m = medirFincas(r);
  const p4 = r.resaltado?.filter((x) => x.id === 'P04') ?? [];
  const p5 = r.resaltado?.filter((x) => x.id === 'P05') ?? [];
  return [
    '## Fincas',
    '',
    ...r.datos.fincas.map(
      (f) =>
        `- ${f.id}: ${f.teselas} teselas, ${f.lotes} lotes (${f.usos.join(', ')}); lindero ${f.perimetro} u; cercas vivas internas ${f.internos} u y del lindero ${f.externos} u; conexión con la EEP en S0 ${r.conexion?.[f.id] ?? 0} u; en pantalla a escala de finca ${r.pantalla?.[f.id]?.ancho ?? '?'} × ${r.pantalla?.[f.id]?.alto ?? '?'} px`,
    ),
    `- F1 frente a las áreas de Calle et al. (2022, §11.1): ${m.f1.map((e) => `${e.uso} ${e.dibujada} (${e.objetivo.toFixed(3)})`).join('; ')}; diferencia máxima ${m.maximaF1.toFixed(3)} (máximo ${TOLERANCIA_F1})`,
    `- Distinción (composición por uso y conectores por unidad de lindero): mínima ${m.minima} (mínimo ${DISTINCION_MINIMA}); ${m.pares.map((p) => `${p.par} ${p.d}`).join(', ')}`,
    `- Casas: ${r.datos.casas.casas}; figuras de la familia: ${r.datos.casas.figuras}`,
    ...Object.entries(r.matriz ?? {}).map(
      ([id, v]) => `- Vista de vereda desde ${id} (${v.escala}): píxeles de conectores internos ${v.con.internos} y externos ${v.con.externos} con la capa; ${v.sin.internos} y ${v.sin.externos} sin ella (mínimo ${PIXELES_MINIMOS})`,
    ),
    `- P04: paso 1 lote resaltado ${si(p4[0]?.capas.agroecosistema_menor)} con ${p4[0]?.rotulos ?? 0} rótulo; paso 2 lindero resaltado ${si(p4[1]?.capas.agroecosistema_mayor)} con ${p4[1]?.rotulos ?? 0} rótulo; finca ${p4[0]?.resaltada ?? '?'}`,
    `- P05: ${p5.map((x) => `paso ${x.paso + 1} internos ${si(x.capas.conectores_internos)}, externos ${si(x.capas.conectores_externos)}, EEP ${si(x.eep?.visible)} (${x.eep?.segmentos ?? 0} tramos, conexión ${x.eep?.conexion ?? 0})`).join('; ')}`,
    `- Clic dentro del lindero de F4: punto de interés ${r.clic?.foco ?? '?'}, escala ${r.clic?.escala ?? '?'}`,
    r.eap?.visible
      ? `- Panel EAP (P22): ${r.eap.filas.length} criterios × ${r.eap.columnas.length} fincas iguales a \`contenido/eap.json\`: ${si(r.eap.igual)}; totales ${r.eap.columnas.map((c, j) => `${c} ${r.eap.totales[j]}`).join(', ')}; rótulos en la escena: ${r.eap.rotulos.join(', ')}; desborde ${si(r.eap.desborde)}; sobre la ficha ${si(r.eap.superpuesto)}; pie «${r.eap.pie}»; oculto en P06 ${si(r.eap.ocultoFuera)}`
      : '- Panel EAP (P22): no visible',
    `- Capturas: ${r.capturas.map((c) => `\`capturas/${c}\``).join(', ')}`,
    '',
  ];
}
