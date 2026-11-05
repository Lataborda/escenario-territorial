// Revisión de la luz de diorama y de la legibilidad (etapa 5.c.c) en una ventana de 1920×1080: efectos activos y su
// retiro en el modo liviano, sombra suave, llamadas de dibujo por vista, captura igual al repetir (sin ruido temporal),
// viento visible al mover el reloj, tecla M y textos de la interfaz (24 px o más, contraste AA sobre su panel, ningún
// texto directo sobre la escena y ningún filtro sobre la interfaz).
import path from 'node:path';
import { createHash } from 'node:crypto';
import { irPorHash, pausarDibujo } from './revisar-paradas.mjs';

export const VENTANA_GRANDE = { width: 1920, height: 1080 };
const LETRA_MINIMA = 24;
const CONTRASTE_MINIMO = 4.5;
const LLAMADAS_MAXIMO = 200;
const EXCEPCIONES = ['ficha-borrador']; // marca temporal de estado: desaparece al revisar la ficha
const PARADAS_TEXTO = [['P01', 0], ['P04', 1], ['P06', 0], ['P13', 0], ['P14', 2]];
const VISTAS = {
  general: { ancla: 'general', vista: { distancia: 2500, azimut: -30, elevacion: 38 } },
  finca: { ancla: 'F1', vista: { distancia: 450, azimut: -30, elevacion: 45 } },
  planta: { ancla: 'lote', vista: { distancia: 160, azimut: -30, elevacion: 30 } },
  suelo: { ancla: 'lote', vista: { distancia: 30, azimut: -30, elevacion: 12 } },
};

const mirar = (pagina, v) =>
  pagina.evaluate(({ ancla, vista }) => {
    window.escenario.vista(ancla, vista);
    window.escenario.dibujarCuadro();
    window.escenario.dibujarCuadro();
    return { estadisticas: window.escenario.estadisticas(), luz: window.escenario.luz() };
  }, v);

// Huella de la captura de la ventana tras n cuadros más.
async function huellaCaptura(pagina, cuadros = 1, archivo = null) {
  await pagina.evaluate((n) => {
    for (let i = 0; i < n; i++) window.escenario.dibujarCuadro();
  }, cuadros);
  if (archivo) await pagina.screenshot({ path: archivo, type: 'jpeg', quality: 85 });
  return createHash('sha1').update(await pagina.screenshot()).digest('hex');
}

const tecla = async (pagina, t) => {
  await pagina.keyboard.press(t);
  return pagina.evaluate(() => ({ luz: window.escenario.luz(), cana: window.escenario.coberturas().datos().cana.cerca }));
};

// Textos visibles de la interfaz: tamaño, contraste en el peor caso (escena negra o blanca detrás de un panel
// translúcido), fondo propio y filtros.
function leerTextos(excepciones) {
  const color = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const sobre = (c, f) => ({ r: c.r * c.a + f.r * (1 - c.a), g: c.g * c.a + f.g * (1 - c.a), b: c.b * c.a + f.b * (1 - c.a), a: 1 });
  const lum = (c) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const contraste = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const raiz = document.getElementById('interfaz');
  const filas = [];
  const caminante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  while (caminante.nextNode()) {
    const nodo = caminante.currentNode;
    const el = nodo.parentElement;
    if (!nodo.textContent.trim() || !el.checkVisibility()) continue;
    const caja = el.getBoundingClientRect();
    if (!caja.width || !caja.height) continue;
    const capas = [];
    for (let e = el; e && e !== raiz; e = e.parentElement) {
      const c = color(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) capas.push(c);
    }
    const s = getComputedStyle(el);
    const texto = color(s.color);
    const fondos = [{ r: 0, g: 0, b: 0, a: 1 }, { r: 255, g: 255, b: 255, a: 1 }].map((escena) => capas.reduceRight((f, c) => sobre(c, f), escena));
    const minimo = Math.min(...fondos.map((f) => contraste(sobre(texto, f), f)));
    filas.push({
      texto: nodo.textContent.trim().slice(0, 40),
      clase: el.className,
      letra: parseFloat(s.fontSize),
      contraste: Number(minimo.toFixed(2)),
      conFondo: capas.some((c) => c.a >= 0.8),
      excepcion: excepciones.some((x) => el.closest(`.${x}`)),
    });
  }
  const filtros = [...raiz.querySelectorAll('*')].filter((e) => {
    const s = getComputedStyle(e);
    return s.filter !== 'none' || (s.backdropFilter ?? 'none') !== 'none';
  }).length;
  return { filas, filtros, lienzoAparte: !raiz.contains(document.querySelector('canvas')) };
}

export async function revisarLuz(pagina, { dirCapturas }) {
  const r = { vistas: {}, capturas: [] };
  // Textos en cinco paradas (con y sin pasos, con rótulos de finca), antes de pausar el dibujo.
  r.textos = [];
  for (const [id, paso] of PARADAS_TEXTO) {
    await irPorHash(pagina, id, paso);
    const t = await pagina.evaluate(leerTextos, EXCEPCIONES);
    r.textos.push({ id, paso, ...t });
  }
  await pausarDibujo(pagina);
  for (const [id, v] of Object.entries(VISTAS)) r.vistas[id] = await mirar(pagina, v);
  // Captura de referencia a escala de finca, igual tras más cuadros (sin ruido temporal).
  await mirar(pagina, VISTAS.finca);
  const archivo = 'luz-finca.jpg';
  const base = await huellaCaptura(pagina, 1, path.join(dirCapturas, archivo));
  r.capturas.push(archivo);
  r.repeticionIgual = (await huellaCaptura(pagina, 6)) === base;
  // Viento: con el reloj en 1,3 s la vegetación se mueve; con el reloj en 0 vuelve a la referencia.
  await pagina.evaluate(() => window.escenario.fijarViento(1.3));
  r.vientoMueve = (await huellaCaptura(pagina)) !== base;
  await pagina.evaluate(() => window.escenario.fijarViento(0));
  r.vientoVuelve = (await huellaCaptura(pagina)) === base;
  await pagina.evaluate(() => window.escenario.fijarViento(null));
  // Tecla M: sin miniatura cambia la imagen; al volver, igual a la referencia.
  r.sinMiniatura = await tecla(pagina, 'm');
  r.miniaturaCambia = (await huellaCaptura(pagina)) !== base;
  r.conMiniatura = await tecla(pagina, 'm');
  r.miniaturaVuelve = (await huellaCaptura(pagina)) === base;
  // Modo liviano (tecla V): sin oclusión, miniatura, viento, sombras ni matas cercanas; al volver, igual a la referencia.
  r.liviano = await tecla(pagina, 'v');
  r.liviano.estadisticas = await pagina.evaluate(() => {
    window.escenario.dibujarCuadro();
    return window.escenario.estadisticas();
  });
  r.restaurado = await tecla(pagina, 'v');
  await mirar(pagina, VISTAS.finca);
  r.livianoVuelve = (await huellaCaptura(pagina)) === base;
  await pausarDibujo(pagina, false);
  return r;
}

const todas = (l) => l.textos.flatMap((t) => t.filas.map((f) => ({ ...f, parada: t.id })));
const activos = (x) => x.oclusion && x.miniatura && x.viento.fuerza > 0 && x.sombra.activa;

export function fallasLuz(l) {
  if (!l) return ['Luz: sin datos'];
  const f = [];
  for (const [id, v] of Object.entries(l.vistas)) {
    if (!activos(v.luz)) f.push(`Luz: efectos incompletos en la vista ${id}`);
    if (v.estadisticas.llamadas >= LLAMADAS_MAXIMO) f.push(`Luz: ${v.estadisticas.llamadas} llamadas de dibujo en la vista ${id}`);
  }
  const lv = l.liviano.luz;
  const matas = l.liviano.cana.cerca + l.liviano.cana.lejos;
  if (lv.oclusion || lv.miniatura || lv.viento.fuerza > 0 || lv.sombra.activa || matas > 0) f.push('Luz: el modo liviano no retira todos los efectos');
  if (!activos(l.restaurado.luz)) f.push('Luz: los efectos no vuelven al salir del modo liviano');
  if (!l.repeticionIgual || !l.livianoVuelve) f.push('Luz: la captura cambia al repetir (ruido temporal)');
  if (!l.vientoMueve || !l.vientoVuelve) f.push('Luz: el viento no se mueve con el reloj o no vuelve');
  if (l.sinMiniatura.luz.miniatura || !l.miniaturaCambia || !l.miniaturaVuelve) f.push('Luz: la tecla M no alterna la miniatura');
  const malas = todas(l).filter((x) => !x.excepcion && (x.letra < LETRA_MINIMA - 0.01 || x.contraste < CONTRASTE_MINIMO || !x.conFondo));
  if (malas.length) f.push(`Legibilidad: ${malas.length} textos bajo 24 px, sin contraste AA o sobre la escena (${malas.slice(0, 3).map((x) => `«${x.texto}»`).join(', ')})`);
  if (l.textos.some((t) => t.filtros > 0 || !t.lienzoAparte)) f.push('Legibilidad: filtro sobre la interfaz o interfaz dentro del lienzo');
  return f;
}

export function seccionLuz(l) {
  if (!l) return ['## Luz de diorama y legibilidad', '', '- Sin datos', ''];
  const si = (v) => (v ? 'sí' : 'no');
  const g = l.vistas.general.luz;
  const filas = todas(l);
  const normales = filas.filter((x) => !x.excepcion);
  const excepciones = [...new Set(filas.filter((x) => x.excepcion).map((x) => `«${x.texto}» ${x.letra.toFixed(1)} px`))];
  return [
    '## Luz de diorama y legibilidad (1920×1080)',
    '',
    `- Efectos: oclusión ambiental ${si(g.oclusion)}, miniatura ${si(g.miniatura)} (intensidades ${g.intensidad.oclusion} y ${g.intensidad.miniatura}; MSAA ${g.msaa}), viento ${si(g.viento.fuerza > 0)} (reloj quieto en la verificación: ${si(g.viento.quieto)}), sombra ${si(g.sombra.activa)} (PCF, radio ${g.sombra.radio}, intensidad ${g.sombra.intensidad}, mapa ${g.sombra.mapa})`,
    ...Object.entries(l.vistas).map(([id, v]) => `- Vista ${id}: ${v.estadisticas.llamadas} llamadas de dibujo (máximo ${LLAMADAS_MAXIMO}), ${(v.estadisticas.triangulos / 1e6).toFixed(2)} millones de triángulos`),
    `- Captura igual tras seis cuadros más: ${si(l.repeticionIgual)}; viento visible con el reloj en 1,3 s: ${si(l.vientoMueve)}; vuelve con el reloj en 0: ${si(l.vientoVuelve)}`,
    `- Tecla M: miniatura ${si(l.sinMiniatura.luz.miniatura)} tras pulsarla, la imagen cambia ${si(l.miniaturaCambia)}, vuelve igual ${si(l.miniaturaVuelve)}`,
    `- Modo liviano: oclusión ${si(l.liviano.luz.oclusion)}, miniatura ${si(l.liviano.luz.miniatura)}, viento ${si(l.liviano.luz.viento.fuerza > 0)}, sombra ${si(l.liviano.luz.sombra.activa)}, matas de caña ${l.liviano.cana.cerca + l.liviano.cana.lejos}; ${l.liviano.estadisticas.llamadas} llamadas; al salir, igual a la referencia: ${si(l.livianoVuelve)}`,
    `- Textos revisados: ${normales.length} en ${l.textos.map((t) => `${t.id}${t.paso ? ` paso ${t.paso}` : ''}`).join(', ')}; letra mínima ${Math.min(...normales.map((x) => x.letra)).toFixed(1)} px (mínimo ${LETRA_MINIMA}); contraste mínimo ${Math.min(...normales.map((x) => x.contraste)).toFixed(2)} (mínimo ${CONTRASTE_MINIMO}); sin fondo propio: ${normales.filter((x) => !x.conFondo).length}`,
    `- Excepciones (marca de borrador): ${excepciones.join('; ') || 'ninguna'}`,
    `- Filtros sobre la interfaz: ${l.textos.reduce((a, t) => a + t.filtros, 0)}; lienzo fuera de la interfaz: ${si(l.textos.every((t) => t.lienzoAparte))}`,
    `- Captura: ${l.capturas.map((x) => `\`capturas/${x}\``).join(', ')}`,
    '',
  ];
}
