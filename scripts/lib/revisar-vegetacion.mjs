// Revisión de la vegetación y la caña (etapa 5.c.a): materiales sin facetas, tres edades de caña fijas por lote,
// matas de caña cercanas a escala de planta y de finca, ninguna en la vista general ni en el modo liviano,
// y capturas de la caña de cerca y de la ribera.
import path from 'node:path';

const EDADES = ['cortado', 'crecimiento', 'maduro'];
const VISTAS = {
  general: { ancla: 'general', vista: { distancia: 2500, azimut: -30, elevacion: 38 } },
  finca: { ancla: 'F1', vista: { distancia: 450, azimut: -30, elevacion: 45 } },
  planta: { ancla: 'lote', vista: { distancia: 160, azimut: -30, elevacion: 30 } },
  cana: { ancla: 'lote', vista: { distancia: 70, azimut: 20, elevacion: 18 } },
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
  // Edades por escenario (aplicadas sin transición) y regreso a S0.
  r.edades = {};
  for (const id of ['S1', 'S3', 'S0']) r.edades[id] = await edadesEn(pagina, id);
  await pagina.evaluate(() => window.escenario.dibujo(false));
  r.vistas = {};
  for (const id of ['general', 'finca', 'planta']) r.vistas[id] = await mirar(pagina, VISTAS[id]);
  await pagina.keyboard.press('v');
  r.vistas.liviano = await mirar(pagina, VISTAS.planta);
  await pagina.keyboard.press('v');
  for (const id of ['cana', 'ribera']) {
    r.vistas[id] = await mirar(pagina, VISTAS[id]);
    const archivo = id === 'cana' ? 'cana-cerca.jpg' : 'vegetacion-ribera.jpg';
    await pagina.screenshot({ path: path.join(dirCapturas, archivo), type: 'jpeg', quality: 80 });
    r.capturas.push(archivo);
  }
  await mirar(pagina, VISTAS.general);
  await pagina.evaluate(() => window.escenario.dibujo(true));
  return r;
}

const totalCerca = (v) => v.cerca.copa + v.cerca.borde;

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
  if (!(planta.cerca.copa > 0 && planta.cerca.borde > 0)) f.push('Caña: sin tallos cercanos a escala de planta');
  if (!(finca.cerca.copa > 0 && finca.cerca.borde > 0)) f.push('Caña: sin tallos cercanos a escala de finca');
  if (liviano.cerca.celdas || totalCerca(liviano)) f.push('Caña: el modo liviano conserva las matas cercanas');
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
    return `${id}: ${x.estadisticas.llamadas} llamadas, ${x.estadisticas.triangulos} triángulos; matas de caña ${x.cerca.copa} de dosel, ${x.cerca.borde} de borde y ${x.cerca.espiga} espigas en ${x.cerca.celdas} celdas`;
  };
  const arboles = (id) => lista(Object.fromEntries(Object.entries(v.vistas[id].arboles).filter(([, n]) => n > 0)));
  return [
    '## Vegetación y caña',
    '',
    `- Materiales facetados en la vegetación: ${v.facetadas.length ? v.facetadas.join(', ') : 'ninguno'}`,
    ...['S0', 'S1', 'S3'].map((id) => `- Lotes con caña por edad en ${id}: ${lista(v.edades[id].edades)}; alturas del bloque ${v.edades[id].alturas.join(', ')}`),
    ...Object.keys(v.vistas).map((id) => `- Vista ${vista(id)}`),
    `- Especies en nivel «cerca» a escala de finca: ${arboles('finca') || 'ninguna'}; a escala de planta: ${arboles('planta') || 'ninguna'}`,
    `- Capturas: ${v.capturas.map((x) => `\`capturas/${x}\``).join(', ')}`,
    '',
  ];
}
