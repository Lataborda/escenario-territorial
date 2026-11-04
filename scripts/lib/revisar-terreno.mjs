// Revisión del terreno: anclas sobre la superficie (tecla A), capturas de ladera y plano, repetición entre cargas.
import path from 'node:path';

// Vistas de control del relieve (ángulos en grados respecto del ancla).
export const VISTAS_TERRENO = [
  { nombre: 'ladera', ancla: 'F2', vista: { distancia: 700, azimut: -60, elevacion: 35 } },
  { nombre: 'plano', ancla: 'plano', vista: { distancia: 1000, azimut: -20, elevacion: 45 } },
];

const dosCuadros = (pagina) =>
  pagina.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

// Datos del terreno con la huella de las coberturas (misma escena en cada carga).
const datosTerreno = (pagina) =>
  pagina.evaluate(() => {
    const t = window.escenario?.terreno?.();
    return t ? { ...t, huellaCoberturas: [window.escenario.coberturas, window.escenario.vias, window.escenario.asentamientos].map((f) => f?.()?.huella() ?? null).join('-') } : null;
  });

// Se ejecuta con la página lista, después de la captura de la vista general.
export async function revisarTerreno(pagina, dirCapturas) {
  const r = { datos: await datosTerreno(pagina), capturas: [] };
  r.anclas = await pagina.evaluate(() => window.escenario?.revisarAnclas?.() ?? null);

  // Tecla A: marcadores de anclas sobre la vista general.
  await pagina.evaluate(() => window.escenario.vista('general'));
  await pagina.keyboard.press('a');
  await dosCuadros(pagina);
  r.teclaA = (await datosTerreno(pagina))?.anclasVisibles === true;
  await pagina.screenshot({ path: path.join(dirCapturas, 'anclas.png') });
  r.capturas.push('anclas.png');
  await pagina.keyboard.press('a');

  for (const v of VISTAS_TERRENO) {
    await pagina.evaluate(({ ancla, vista }) => window.escenario.vista(ancla, vista), v);
    await dosCuadros(pagina);
    const archivo = `${v.nombre}.png`;
    await pagina.screenshot({ path: path.join(dirCapturas, archivo) });
    r.capturas.push(archivo);
  }
  await pagina.evaluate(() => window.escenario.vista('general'));
  return r;
}

// Datos mínimos de una carga adicional (segunda carga o archivo único).
export const huellaDe = (pagina) => datosTerreno(pagina);

export function fallasTerreno(t) {
  const f = [];
  if (!t.datos) return ['Terreno: sin datos (window.escenario.terreno)'];
  if (!t.anclas || t.anclas.fuera.length || t.anclas.sinImpacto.length) f.push('Terreno: anclas fuera de la superficie');
  if (!t.teclaA) f.push('Terreno: la tecla A no muestra las anclas');
  if (!t.repeticion.huellaIgual) f.push('Terreno: la huella cambia entre dos cargas');
  if (!t.repeticion.capturaIgual) f.push('Terreno: la captura de la vista general cambia entre dos cargas');
  if (!t.repeticion.unicoIgual) f.push('Terreno: el archivo único genera otro terreno');
  if (!t.repeticion.coberturasIgual) f.push('Coberturas: cambian entre dos cargas o en el archivo único');
  return f;
}

export function seccionTerreno(t) {
  const d = t.datos ?? {};
  const a = t.anclas ?? { total: 0, maximo: null, fuera: [], sinImpacto: [] };
  const si = (v) => (v ? 'sí' : 'no');
  const sobre = a.total - a.fuera.length - a.sinImpacto.length;
  return [
    '## Terreno',
    '',
    `- Exageración vertical: ${d.exageracion} (configurable con \`#ex=\` entre 1,5 y 3)`,
    `- Vértices de la rejilla: ${d.vertices}; anclas: ${d.anclas}`,
    `- Huella del terreno: \`${d.huella}\``,
    `- Idéntico en dos cargas: huella ${si(t.repeticion.huellaIgual)}; captura de la vista general ${si(t.repeticion.capturaIgual)}`,
    `- Archivo único con la misma huella: ${si(t.repeticion.unicoIgual)}`,
    `- Coberturas idénticas en la segunda carga y en el archivo único: ${si(t.repeticion.coberturasIgual)} (huella \`${d.huellaCoberturas}\`)`,
    `- Anclas sobre la superficie (rayo vertical): ${sobre} de ${a.total}; desvío máximo ${a.maximo}`,
    a.fuera.length ? `- Anclas fuera: ${a.fuera.join(', ')}` : null,
    a.sinImpacto.length ? `- Anclas sin superficie debajo: ${a.sinImpacto.join(', ')}` : null,
    `- Tecla A muestra los marcadores: ${si(t.teclaA)}`,
    `- Capturas: ${['general.png', ...t.capturas].map((c) => `\`capturas/${c}\``).join(', ')}`,
    '',
  ].filter((l) => l !== null);
}
