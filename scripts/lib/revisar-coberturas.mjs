// Revisión de coberturas (etapa 5): proporciones y aislamiento de relictos por escenario, transiciones
// sin cortes, modo liviano, leyenda y una captura por escenario. Página sin #captura (vuelos y transiciones reales).
import path from 'node:path';
import { revisarPaisaje, fallasPaisaje, seccionPaisaje } from './revisar-paisaje.mjs';

export const ESCENARIOS = ['S0', 'S1', 'S2', 'S3'];
const SECUENCIA = ['S1', 'S3', 'S2']; // transiciones animadas desde S0
const VISTA = { ancla: 'plano', vista: { distancia: 1000, azimut: -20, elevacion: 45 } };
const DOMINIO_MINIMO = 0.6; // proporción mínima de caña en el plano en S0
const AISLADOS_MINIMO = 0.75; // fracción mínima de relictos aislados en S0
const LLAMADAS_MAXIMO = 200;
const SALTO_MAXIMO = 0.05; // cambio máximo de un elemento entre dos cuadros a 60 cuadros por segundo
const HOLGURA_MINIMA_S = 0.3; // la transición termina en el primer cuadro tras su duración: holgura de un intervalo entre cuadros
const DURACION_S = 2;

const coberturas = (pagina, fn, arg) => pagina.evaluate(fn, arg);
const leyendaVisible = () => [...document.querySelectorAll('.leyenda-entrada:not([hidden])')].map((e) => e.dataset.tipo);

async function transicion(pagina, id, huellaDirecta) {
  // Cambio y consulta en la misma evaluación: con cuadros lentos la transición podría terminar entre dos consultas.
  const empezo = await pagina.evaluate((x) => {
    window.escenario.cambiarEscenario(x);
    return document.documentElement.dataset.coberturas === 'transicion';
  }, id);
  await pagina.waitForFunction(() => !document.documentElement.dataset.coberturas, null, { timeout: 20000 });
  const fin = await pagina.evaluate(() => {
    const c = window.escenario.coberturas();
    return { t: c.datos().transicion, huella: c.huella() };
  });
  fin.leyenda = await pagina.evaluate(leyendaVisible);
  return {
    escenario: id,
    empezo,
    intermedias: fin.t.intermedias,
    cuadros: fin.t.cuadros,
    intervalo: Number((fin.t.intervalo / 1000).toFixed(2)),
    cambios: fin.t.cambios,
    duracion: Number(((fin.t.fin - fin.t.inicio) / 1000).toFixed(2)),
    igual: fin.huella === huellaDirecta,
    leyenda: fin.leyenda,
  };
}

export async function revisarCoberturas(pagina, dirCapturas) {
  const r = { capturas: [] };
  r.datos = await coberturas(pagina, () => window.escenario.coberturas()?.datos() ?? null);
  if (!r.datos) return r;
  r.medidas = await coberturas(pagina, (ids) => Object.fromEntries(ids.map((id) => [id, window.escenario.coberturas().medir(id)])), ESCENARIOS);
  r.mismaCana = await coberturas(pagina, () => window.escenario.coberturas().mismaCana('S0', 'S1'));
  r.salto = await coberturas(pagina, () => window.escenario.coberturas().saltoMaximo());
  r.leyendaS0 = await pagina.evaluate(leyendaVisible);

  // Huella de cada escenario aplicado sin transición (equivale a cargarlo directamente).
  r.huellas = await coberturas(pagina, (ids) => Object.fromEntries([...ids, 'S0'].map((id) => [id, window.escenario.coberturas().aplicarAhora(id)])), SECUENCIA);
  // Transiciones en modo liviano (tecla V): la prueba revisa la animación; la fluidez se mide en el equipo.
  // En la vista general ninguna especie está en el nivel «cerca»: las huellas no cambian con el modo.
  await pagina.keyboard.press('v');
  r.transiciones = [];
  for (const id of SECUENCIA) r.transiciones.push(await transicion(pagina, id, r.huellas[id]));
  await pagina.evaluate(() => window.escenario.cambiarEscenario('S0'));
  await pagina.waitForFunction(() => !document.documentElement.dataset.coberturas, null, { timeout: 20000 });
  await pagina.keyboard.press('v');

  // Modo liviano (tecla V): la mitad de las instancias.
  const dibujadas = () => coberturas(pagina, () => window.escenario.coberturas().datos().dibujadas);
  const completo = await dibujadas();
  await pagina.keyboard.press('v');
  const liviano = await dibujadas();
  await pagina.keyboard.press('v');
  r.liviano = { completo, liviano, restaurado: (await dibujadas()) === completo };

  // Una captura por escenario desde la misma vista, con el ciclo de dibujo en pausa.
  await pagina.evaluate(() => window.escenario.dibujo(false));
  await pagina.evaluate(({ ancla, vista }) => window.escenario.vista(ancla, vista), VISTA);
  for (const id of ESCENARIOS) {
    await pagina.evaluate((x) => {
      window.escenario.coberturas().aplicarAhora(x);
      window.escenario.dibujarCuadro();
    }, id);
    const archivo = `coberturas-${id}.jpg`;
    await pagina.screenshot({ path: path.join(dirCapturas, archivo), type: 'jpeg', quality: 80 });
    r.capturas.push(archivo);
  }
  await pagina.evaluate(() => {
    window.escenario.coberturas().aplicarAhora('S0');
    window.escenario.dibujo(true);
  });
  r.paisaje = await revisarPaisaje(pagina, dirCapturas);
  return r;
}

export function fallasCoberturas(c, estadisticas) {
  if (!c?.datos) return ['Coberturas: sin datos (window.escenario.coberturas)'];
  const f = [];
  const s0 = c.medidas.S0;
  const mayor = Object.entries(s0.proporciones).sort((a, b) => b[1] - a[1])[0][0];
  if (s0.cana < DOMINIO_MINIMO || !mayor.startsWith('cana')) f.push(`Coberturas: la caña no domina el plano en S0 (${s0.cana})`);
  const a = s0.aislamiento;
  if (!a.relictos || a.contiguos || a.aislados / a.relictos < AISLADOS_MINIMO) f.push('Coberturas: relictos de S0 sin aislamiento suficiente');
  if (!c.mismaCana) f.push('Coberturas: S1 cambia la extensión de la caña de S0');
  if (c.salto > SALTO_MAXIMO) f.push(`Coberturas: salto por cuadro de ${c.salto}`);
  for (const t of c.transiciones) {
    const holgura = Math.max(HOLGURA_MINIMA_S, t.intervalo * 1.1);
    const ok = t.empezo && t.intermedias > 0 && t.igual && t.duracion >= DURACION_S - 0.05 && t.duracion <= DURACION_S + holgura;
    if (!ok) f.push(`Coberturas: transición a ${t.escenario} incorrecta`);
  }
  if (c.leyendaS0.includes('cana_organica') || !c.transiciones.find((t) => t.escenario === 'S1')?.leyenda.includes('cana_organica')) {
    f.push('Coberturas: la leyenda no sigue al escenario');
  }
  if (!(c.liviano.liviano < c.liviano.completo * 0.6) || !c.liviano.restaurado) f.push('Coberturas: el modo liviano no reduce las instancias');
  if (!estadisticas || estadisticas.llamadas >= LLAMADAS_MAXIMO) f.push(`Coberturas: ${estadisticas?.llamadas} llamadas de dibujo`);
  return [...f, ...fallasPaisaje(c.paisaje, c.medidas)];
}

const porcentaje = (x) => `${Math.round(x * 100)} %`;

export function seccionCoberturas(c, estadisticas) {
  if (!c?.datos) return ['## Coberturas', '', '- Sin datos', ''];
  const d = c.datos;
  const si = (v) => (v ? 'sí' : 'no');
  const a = c.medidas.S0.aislamiento;
  const instancias = Object.entries(d.instancias).map(([k, n]) => `${k} ${n} (${d.visibles[k]} en S0)`).join('; ');
  return [
    '## Coberturas',
    '',
    `- Unidades: ${Object.entries(d.unidades).map(([k, n]) => `${k} ${n}`).join(', ')}; teselas dibujadas: ${d.teselas.unidades} unidades, ${d.teselas.vertices} vértices; generación en ${d.ms} ms (${Object.entries(d.tiempos ?? {}).map(([k, n]) => `${k} ${n}`).join(', ')})`,
    `- Instancias: ${instancias}`,
    `- S0: caña en el ${porcentaje(c.medidas.S0.cana)} del plano (mínimo ${porcentaje(DOMINIO_MINIMO)}); relictos ${a.relictos}, aislados ${a.aislados} (separación de ${a.umbral} unidades o más), contiguos ${a.contiguos}; separación mínima ${a.separacionMinima}, mediana ${a.separacionMediana}`,
    ...ESCENARIOS.map((id) => `- Plano en ${id}: ${Object.entries(c.medidas[id].proporciones).map(([k, v]) => `${k} ${v}`).join(', ')}`),
    `- S1 conserva la extensión de la caña de S0: ${si(c.mismaCana)}`,
    `- Salto máximo de un elemento por cuadro a 60 cuadros por segundo: ${c.salto} (máximo ${SALTO_MAXIMO})`,
    ...c.transiciones.map(
      (t) =>
        `- Transición a ${t.escenario} (modo liviano): ${t.cambios} elementos; en curso ${si(t.empezo)}; ${t.cuadros} cuadros (intervalo máximo ${t.intervalo} s); máximo de elementos a medio camino en un cuadro: ${t.intermedias}; ${t.duracion} s (declarada ${DURACION_S} s); final igual a la carga directa: ${si(t.igual)}; leyenda: ${t.leyenda.length} tipos`,
    ),
    `- Leyenda en S0: ${c.leyendaS0.join(', ')}`,
    `- Modo liviano: ${c.liviano.completo} instancias dibujadas, ${c.liviano.liviano} en liviano; restaurado ${si(c.liviano.restaurado)}`,
    `- Llamadas de dibujo en la vista general: ${estadisticas?.llamadas} (máximo ${LLAMADAS_MAXIMO}); triángulos ${estadisticas?.triangulos}`,
    `- Capturas: ${c.capturas.map((x) => `\`capturas/${x}\``).join(', ')}`,
    '',
    ...seccionPaisaje(c.paisaje, c.medidas),
  ];
}
