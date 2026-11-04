// Revisión del paisaje (etapa 5.b): mosaico campesino de la ladera por escenario, niveles de detalle de la
// vegetación, modo liviano de cerca, vías y asentamientos, con capturas de la ladera y de la ciudad.
import path from 'node:path';

const MOSAICO = ['cafe', 'platano', 'frutales', 'huerta'];
const LLAMADAS_MAXIMO = 200;
const VISTAS = {
  general: { ancla: 'general', vista: { distancia: 2500, azimut: -30, elevacion: 38 } },
  finca: { ancla: 'F3', vista: { distancia: 450, azimut: -30, elevacion: 45 } },
  cerca: { ancla: 'F3', vista: { distancia: 120, azimut: -40, elevacion: 30 } },
  ciudad: { ancla: 'ciudad', vista: { distancia: 320, azimut: -30, elevacion: 40 } },
};

// Coloca la cámara, dibuja dos cuadros (el nivel de detalle se reparte en el primero) y cuenta.
const mirar = (pagina, v) =>
  pagina.evaluate(({ ancla, vista }) => {
    window.escenario.vista(ancla, vista);
    window.escenario.dibujarCuadro();
    window.escenario.dibujarCuadro();
    const cerca = window.escenario.coberturas().datos().cerca;
    return { cerca, total: Object.values(cerca).reduce((a, x) => a + x, 0), estadisticas: window.escenario.estadisticas() };
  }, v);

export async function revisarPaisaje(pagina, dirCapturas) {
  const r = { capturas: [] };
  r.vias = await pagina.evaluate(() => window.escenario.vias?.()?.datos() ?? null);
  r.asentamientos = await pagina.evaluate(() => window.escenario.asentamientos?.()?.datos() ?? null);
  await pagina.evaluate(() => window.escenario.dibujo(false));
  r.detalle = {};
  for (const id of ['general', 'finca', 'cerca']) r.detalle[id] = await mirar(pagina, VISTAS[id]);
  await pagina.screenshot({ path: path.join(dirCapturas, 'mosaico-cerca.jpg'), type: 'jpeg', quality: 80 });
  r.capturas.push('mosaico-cerca.jpg');
  // Modo liviano de cerca: todo en el nivel simple.
  await pagina.keyboard.press('v');
  r.detalle.liviano = await mirar(pagina, VISTAS.cerca);
  await pagina.keyboard.press('v');
  r.detalle.ciudad = await mirar(pagina, VISTAS.ciudad);
  await pagina.screenshot({ path: path.join(dirCapturas, 'ciudad.jpg'), type: 'jpeg', quality: 80 });
  r.capturas.push('ciudad.jpg');
  await mirar(pagina, VISTAS.general);
  await pagina.evaluate(() => window.escenario.dibujo(true));
  return r;
}

// Proporción de pastura y número de tipos del mosaico en la ladera de un escenario.
function ladera(medidas, id) {
  const l = medidas?.[id]?.ladera ?? {};
  return { pastura: l.pastura ?? 0, tipos: MOSAICO.filter((t) => (l[t] ?? 0) > 0).length, mosaico: MOSAICO.reduce((a, t) => a + (l[t] ?? 0), 0) };
}

export function fallasPaisaje(p, medidas) {
  if (!p) return ['Paisaje: sin datos'];
  const f = [];
  const s0 = ladera(medidas, 'S0');
  if (s0.tipos < MOSAICO.length) f.push('Mosaico: faltan tipos del mosaico campesino en la ladera de S0');
  for (const id of ['S2', 'S3']) {
    const s = ladera(medidas, id);
    if (!(s.pastura < s0.pastura && s.mosaico > s0.mosaico)) f.push(`Mosaico: la ladera de ${id} no se diversifica respecto de S0`);
  }
  const d = p.detalle;
  if (d.general.total !== 0) f.push('Detalle: hay especies en nivel «cerca» en la vista general');
  if (!(d.cerca.total > 0)) f.push('Detalle: ninguna especie en nivel «cerca» a escala de planta');
  if (d.liviano.total !== 0) f.push('Detalle: el modo liviano conserva el nivel «cerca»');
  for (const [id, v] of Object.entries(d)) {
    if (v.estadisticas.llamadas >= LLAMADAS_MAXIMO) f.push(`Detalle: ${v.estadisticas.llamadas} llamadas de dibujo en la vista ${id}`);
  }
  const v = p.vias;
  if (!v || v.trazos < 10 || !v.puentes || !v.corredor) f.push('Vías: red incompleta (tramos, puentes o corredor)');
  const a = p.asentamientos?.asentamientos ?? [];
  if (a.length < 10 || a.some((x) => !x.edificios || x.fuera)) f.push('Asentamientos: ciudad o cabeceras sin edificaciones o fuera de su radio');
  return f;
}

const fraccion = (o) => Object.entries(o ?? {}).map(([k, x]) => `${k} ${x}`).join(', ');

export function seccionPaisaje(p, medidas) {
  if (!p) return ['## Paisaje', '', '- Sin datos', ''];
  const d = p.detalle;
  const vista = (id) => `${id}: ${d[id].estadisticas.llamadas} llamadas, ${d[id].estadisticas.triangulos} triángulos, ${d[id].total} instancias cerca`;
  const a = p.asentamientos;
  return [
    '## Paisaje: mosaico, vías y asentamientos',
    '',
    ...['S0', 'S1', 'S2', 'S3'].map((id) => `- Ladera en ${id}: ${fraccion(medidas?.[id]?.ladera)}`),
    `- Niveles de detalle por vista (${Object.keys(d).join(', ')}): ${Object.keys(d).map(vista).join('; ')}`,
    `- Instancias cerca a escala de planta: ${fraccion(d.cerca.cerca)}`,
    `- Vías: ${p.vias?.trazos} tramos (${fraccion(p.vias?.porCategoria)}); ${p.vias?.longitud} unidades de largo; ${p.vias?.puentes} puentes; ${p.vias?.corredor} teselas de corredor sin parcela; ${p.vias?.vertices} vértices`,
    `- Asentamientos: ${(a?.asentamientos ?? []).map((x) => `${x.id} ${x.manzanas} manzanas y ${x.edificios} edificaciones`).join('; ')}; instancias ${fraccion(a?.instancias)}`,
    `- Capturas: ${p.capturas.map((x) => `\`capturas/${x}\``).join(', ')}`,
    '',
  ];
}
