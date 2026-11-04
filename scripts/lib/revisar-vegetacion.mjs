// Revisión de la vegetación y la caña (etapas 5.c.a y 5.c.b): materiales sin facetas, tres edades de caña fijas
// por lote, matas de caña cercanas (dosel y borde) a escala de planta y de finca con la tapa hundida dentro del radio
// cubierto, ninguna en la vista general ni en el modo liviano, ninguna forma de espiga, y capturas de la caña de cerca,
// a escala de suelo y de la ribera.
import path from 'node:path';

const EDADES = ['cortado', 'crecimiento', 'maduro'];
const VISTAS = {
  general: { ancla: 'general', vista: { distancia: 2500, azimut: -30, elevacion: 38 } },
  finca: { ancla: 'F1', vista: { distancia: 450, azimut: -30, elevacion: 45 } },
  planta: { ancla: 'lote', vista: { distancia: 160, azimut: -30, elevacion: 30 } },
  cana: { ancla: 'lote', vista: { distancia: 70, azimut: 20, elevacion: 18 } },
  suelo: { ancla: 'lote', vista: { distancia: 30, azimut: -30, elevacion: 12 } },
  ribera: { ancla: 'rio_tributario', vista: { distancia: 200, azimut: -30, elevacion: 30 } },
};

// Coloca la cámara, dibuja dos cuadros (las matas se reparten en el primero) y lee el estado de la caña.
const mirar = (pagina, v) =>
  pagina.evaluate(({ ancla, vista }) => {
    window.escenario.vista(ancla, vista);
    window.escenario.dibujarCuadro();
    window.escenario.dibujarCuadro();
    const d = window.escenario.coberturas().datos();
    return { cerca: d.cana.cerca, arboles: d.cerca, estadisticas: window.escenario.estadisticas() };
  }, v);

const edadesEn = (pagina, id) =>
  pagina.evaluate((x) => {
    window.escenario.coberturas().aplicarAhora(x);
    return window.escenario.coberturas().datos().cana;
  }, id);

export async function revisarVegetacion(pagina, dirCapturas) {
  const r = { capturas: [] };
  r.facetadas = await pagina.evaluate(() => window.escenario.coberturas().datos().facetadas);
  // Formas de la caña cercana (ninguna espiga).
  r.formasCana = await pagina.evaluate(() => window.escenario.coberturas().grupo.children.map((m) => m.name).filter((n) => n.startsWith('cana-cerca')));
  // Edades por escenario (aplicadas sin transición) y regreso a S0.
  r.edades = {};
  for (const id of ['S1', 'S3', 'S0']) r.edades[id] = await edadesEn(pagina, id);
  await pagina.evaluate(() => window.escenario.dibujo(false));
  r.vistas = {};
  for (const id of ['general', 'finca', 'planta']) r.vistas[id] = await mirar(pagina, VISTAS[id]);
  await pagina.keyboard.press('v');
  r.vistas.liviano = await mirar(pagina, VISTAS.planta);
  await pagina.keyboard.press('v');
  const archivos = { cana: 'cana-cerca.jpg', suelo: 'cana-suelo.jpg', ribera: 'vegetacion-ribera.jpg' };
  for (const [id, archivo] of Object.entries(archivos)) {
    r.vistas[id] = await mirar(pagina, VISTAS[id]);
    await pagina.screenshot({ path: path.join(dirCapturas, archivo), type: 'jpeg', quality: 80 });
    r.capturas.push(archivo);
  }
  await mirar(pagina, VISTAS.general);
  await pagina.evaluate(() => window.escenario.dibujo(true));
  return r;
}

const totalCerca = (v) => v.cerca.dosel + v.cerca.borde;

export function fallasVegetacion(v) {
  if (!v) return ['Vegetación: sin datos'];
  const f = [];
  if (v.facetadas.length) f.push(`Vegetación: materiales facetados (${v.facetadas.join(', ')})`);
  const s0 = v.edades.S0;
  if (EDADES.some((e) => !(s0.edades[e] > 0)) || s0.alturas.length !== EDADES.length) f.push('Caña: faltan edades distinguibles en S0');
  // S1 conserva la extensión de la caña de S0: con edad fija por lote, el número de lotes por edad es el mismo.
  if (EDADES.some((e) => v.edades.S1.edades[e] !== s0.edades[e])) f.push('Caña: S1 cambia la edad de algún lote de S0');
  const { general, finca, planta, liviano } = v.vistas;
  if (general.cerca.celdas || totalCerca(general)) f.push('Caña: matas cercanas en la vista general');
  if (!(planta.cerca.dosel > 0 && planta.cerca.borde > 0)) f.push('Caña: sin matas cercanas a escala de planta');
  if (!(finca.cerca.dosel > 0 && finca.cerca.borde > 0)) f.push('Caña: sin matas cercanas a escala de finca');
  if (!(v.vistas.suelo.cerca.cerca > 0)) f.push('Caña: sin matas detalladas a escala de suelo');
  if (liviano.cerca.celdas || totalCerca(liviano)) f.push('Caña: el modo liviano conserva las matas cercanas');
  // Tapa hundida bajo las matas: radio cubierto a escala de planta y de finca; ninguno en la vista general ni en liviano.
  if (!(planta.cerca.radio > 0 && finca.cerca.radio > 0)) f.push('Caña: la tapa no baja bajo las matas cercanas');
  if (general.cerca.radio || liviano.cerca.radio) f.push('Caña: tapa hundida sin matas cercanas (vista general o liviano)');
  if (!v.formasCana.length || v.formasCana.some((n) => n.includes('espiga'))) f.push(`Caña: formas cercanas inesperadas (${v.formasCana.join(', ')})`);
  for (const [id, x] of Object.entries(v.vistas)) {
    if (x.estadisticas.llamadas >= 200) f.push(`Vegetación: ${x.estadisticas.llamadas} llamadas de dibujo en la vista ${id}`);
  }
  return f;
}

const lista = (o) => Object.entries(o ?? {}).map(([k, x]) => `${k} ${x}`).join(', ');

export function seccionVegetacion(v) {
  if (!v) return ['## Vegetación y caña', '', '- Sin datos', ''];
  const vista = (id) => {
    const x = v.vistas[id];
    const c = x.cerca;
    return `${id}: ${x.estadisticas.llamadas} llamadas, ${x.estadisticas.triangulos} triángulos; matas de caña ${c.dosel} de dosel y ${c.borde} de borde (${c.cerca} detalladas) en ${c.celdas} celdas; tapa hundida hasta ${c.radio} unidades`;
  };
  const arboles = (id) => lista(Object.fromEntries(Object.entries(v.vistas[id].arboles).filter(([, n]) => n > 0)));
  return [
    '## Vegetación y caña',
    '',
    `- Materiales facetados en la vegetación: ${v.facetadas.length ? v.facetadas.join(', ') : 'ninguno'}`,
    `- Formas de la caña cercana: ${v.formasCana.join(', ')} (ninguna espiga)`,
    ...['S0', 'S1', 'S3'].map((id) => `- Lotes con caña por edad en ${id}: ${lista(v.edades[id].edades)}; alturas del bloque ${v.edades[id].alturas.join(', ')}`),
    ...Object.keys(v.vistas).map((id) => `- Vista ${vista(id)}`),
    `- Especies en nivel «cerca» a escala de finca: ${arboles('finca') || 'ninguna'}; a escala de planta: ${arboles('planta') || 'ninguna'}`,
    `- Capturas: ${v.capturas.map((x) => `\`capturas/${x}\``).join(', ')}`,
    '',
  ];
}
