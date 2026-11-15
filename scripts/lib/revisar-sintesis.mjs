// Revisión de la etapa 8.b: radios de control biológico y polinización (P08, dos pasos), prácticas de conservación
// en la finca de ladera (paso de ladera de P09) y panel de síntesis de la escala mínima (P12). Misma página que
// revisar-procesos.mjs (#captura=1, reloj quieto, 1600×900). Presupuesto gráfico de cada capa nueva.
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { ir, leer, revisarProcesos, TOPE_TRIANGULOS } from './revisar-procesos.mjs';

const PROCESOS = JSON.parse(readFileSync(new URL('../../contenido/escalas.json', import.meta.url), 'utf8')).procesos;

const MAXIMO_ROTULOS = 7;
const PRACTICAS = ['curvas_nivel', 'barreras_vivas', 'terrazas'];

// Lectura del cuadro con las capas de la parada y, sin ellas, para el presupuesto; huella con el reloj en 0, 2 y 0.
async function medir(pagina, capa) {
  const con = await pagina.evaluate(leer);
  const huellas = [];
  for (const t of [0, 2, 0]) {
    huellas.push(await pagina.evaluate(([t, id]) => {
      window.escenario.fijarRelojFlujos(t);
      return window.escenario.flujos().capas[id].huella;
    }, [t, capa]));
  }
  await pagina.evaluate(() => window.escenario.fijarRelojFlujos(null));
  const capas = await pagina.evaluate((id) => {
    const encendidas = window.escenario.estado().capas;
    window.escenario.capas(encendidas.filter((c) => c !== id));
    return encendidas;
  }, capa);
  const sin = await pagina.evaluate(leer);
  await pagina.evaluate((lista) => window.escenario.capas(lista), capas);
  return {
    capa,
    datos: con.flujos.capas[capa],
    visibles: Object.entries(con.flujos.capas).filter(([, c]) => c.visible).map(([id]) => id),
    avanza: huellas[0] !== huellas[1],
    repite: huellas[0] === huellas[2],
    leyenda: con.leyenda,
    nota: con.notaLeyenda,
    rotulos: con.rotulos,
    enEscena: con.enEscena,
    sobreInterfaz: con.sobreInterfaz,
    fuera: con.fuera,
    triangulos: con.triangulos - sin.triangulos,
    llamadas: con.llamadas - sin.llamadas,
  };
}

// Panel de P12: filas, alto y peso de cada una, leyenda de coberturas y cruce con la ficha.
function leerPanel() {
  const caja = (x) => x.getBoundingClientRect();
  const panel = document.querySelector('.minima');
  const visible = Boolean(panel) && !panel.hidden && panel.offsetParent !== null;
  const filas = [...(panel?.querySelectorAll('.minima-fila') ?? [])].map((f) => {
    const nombre = f.querySelector('.minima-nombre');
    const estilo = getComputedStyle(nombre);
    return {
      id: f.dataset.proceso,
      escala: f.dataset.escala,
      numero: f.querySelector('.es-minima')?.textContent ?? null,
      alto: Math.round(caja(f).height * 10) / 10,
      peso: estilo.fontWeight,
      letra: parseFloat(estilo.fontSize),
      pasos: f.querySelectorAll('.minima-paso').length,
    };
  });
  const ficha = document.querySelector('.ficha');
  const leyenda = document.querySelector('.leyenda');
  const a = visible ? caja(panel) : null;
  const b = caja(ficha);
  return {
    visible,
    filas,
    coberturasOculta: leyenda.hidden || leyenda.offsetParent === null,
    sobreFicha: Boolean(a) && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top,
    fuera: Boolean(a) && (a.left < 0 || a.top < 0 || a.right > innerWidth || a.bottom > innerHeight),
    flujos: Object.values(window.escenario.flujos().capas).filter((c) => c.visible).length,
  };
}

export async function revisarSintesis(pagina, { dirCapturas }) {
  await pagina.evaluate(() => window.escenario.dibujo(false));
  const r = { capturas: [] };
  const foto = async (nombre) => {
    await pagina.evaluate(() => window.escenario.dibujarCuadro());
    await pagina.screenshot({ path: path.join(dirCapturas, nombre), type: 'jpeg', quality: 82 });
    r.capturas.push(nombre);
  };
  await ir(pagina, 'P01');
  r.panelEnP01 = (await pagina.evaluate(leerPanel)).visible;

  // P08: primero los radios de enemigos naturales; en el segundo paso se suman los de polinizadores.
  await ir(pagina, 'P08', 0);
  r.enemigos = await medir(pagina, 'radios_enemigos_naturales');
  await ir(pagina, 'P08', 1);
  r.polinizadores = await medir(pagina, 'radios_polinizadores');
  await foto('flujos-P08.jpg');
  await pagina.evaluate(() => window.escenario.cambiarEscenario('S3'));
  r.parchesS3 = (await pagina.evaluate(leer)).flujos.capas.radios_enemigos_naturales.parches;
  await pagina.evaluate(() => window.escenario.cambiarEscenario('S0'));

  // P09: las prácticas aparecen solo en el paso de ladera.
  await ir(pagina, 'P09', 0);
  r.practicasEnCuenca = (await pagina.evaluate(leer)).flujos.capas.practicas_conservacion.visible;
  await ir(pagina, 'P09', 1);
  r.practicas = await medir(pagina, 'practicas_conservacion');
  await foto('flujos-P09-ladera.jpg');

  await ir(pagina, 'P12');
  r.panel = await pagina.evaluate(leerPanel);
  await foto('sintesis-P12.jpg');
  return r;
}

// Revisión de los flujos de la 8.a y, en la misma página, la de la 8.b (en «sintesis»).
export async function revisarFlujos(pagina, opciones) {
  const procesos = await revisarProcesos(pagina, opciones);
  return { ...procesos, sintesis: await revisarSintesis(pagina, opciones) };
}

export function fallasSintesis(r, procesos = PROCESOS) {
  if (!r?.panel) return ['Síntesis: sin datos de la revisión'];
  const f = [];
  const comun = (nombre, m) => {
    if (!m.datos.visible) f.push(`${nombre}: la capa «${m.capa}» no está visible`);
    if (!m.datos.particulas) f.push(`${nombre}: sin partículas`);
    if (!m.avanza || !m.repite) f.push(`${nombre}: las partículas no siguen el reloj (avanza ${m.avanza}, repite ${m.repite})`);
    if (m.triangulos > TOPE_TRIANGULOS) f.push(`${nombre}: la capa suma ${m.triangulos} triángulos (tope ${TOPE_TRIANGULOS})`);
    if (m.enEscena > MAXIMO_ROTULOS) f.push(`${nombre}: ${m.enEscena} rótulos en escena (máximo ${MAXIMO_ROTULOS})`);
    if (m.sobreInterfaz || m.fuera) f.push(`${nombre}: rótulos sobre la interfaz (${m.sobreInterfaz}) o fuera de la ventana (${m.fuera})`);
    if (!/ilustrativ/.test(m.nota)) f.push(`${nombre}: la leyenda no lleva la nota de esquema ilustrativo («${m.nota}»)`);
  };
  const { enemigos: e, polinizadores: p, practicas: c, panel } = r;
  comun('Radios P08 (control biológico)', e);
  if (e.visibles.join() !== 'radios_enemigos_naturales') f.push(`Radios P08: en el primer paso se ven ${e.visibles.join(', ')}`);
  if (e.leyenda.join() !== 'enemigos') f.push(`Radios P08: leyenda ${e.leyenda.join(', ')} (esperada enemigos)`);
  if (e.datos.parches < 3) f.push(`Radios P08: ${e.datos.parches} parches de hábitat (mínimo 3)`);
  if (!e.datos.salenDeSuFinca) f.push('Radios P08: ningún radio sale del lindero de la finca de su parche');
  if (!e.datos.fincasAlcanzadas.length) f.push('Radios P08: ningún radio alcanza una finca vecina');
  if (!e.datos.superpuestos) f.push('Radios P08: los radios de enemigos naturales no se superponen');
  comun('Radios P08 (polinización)', p);
  if (p.visibles.length !== 2) f.push(`Radios P08: en el segundo paso se ven ${p.visibles.join(', ')}`);
  if (p.leyenda.join() !== 'enemigos,polinizadores') f.push(`Radios P08: leyenda ${p.leyenda.join(', ')} en el segundo paso`);
  if (p.datos.radio <= e.datos.radio) f.push('Radios P08: el radio de polinizadores no supera al de enemigos naturales');
  if (p.datos.superpuestos < e.datos.superpuestos || !p.datos.corredor) f.push('Radios P08: polinizadores sin superposición o sin corredor ripario');
  if (r.practicasEnCuenca) f.push('Prácticas P09: visibles en el paso de cuenca');
  comun('Prácticas P09 (ladera)', c);
  for (const id of PRACTICAS) if (!c.datos.tramos[id]) f.push(`Prácticas P09: sin tramos de «${id}»`);
  if (!c.datos.puntosBarrera || !c.datos.rutasAgua) f.push('Prácticas P09: barreras vivas sin puntos o sin agua que se infiltra');
  for (const id of [...PRACTICAS, 'infiltracion']) if (!c.leyenda.includes(id)) f.push(`Prácticas P09: «${id}» falta en la leyenda`);
  if (c.rotulos.length !== 3) f.push(`Prácticas P09: ${c.rotulos.length} rótulos (esperados 3)`);
  if (r.panelEnP01) f.push('Síntesis: el panel de escala mínima está visible en P01');
  if (!panel.visible) f.push('Síntesis P12: el panel de escala mínima no está visible');
  if (panel.filas.length !== procesos.length || procesos.some((x, k) => panel.filas[k]?.id !== x.id || panel.filas[k]?.escala !== x.escala_minima)) {
    f.push(`Síntesis P12: filas ${panel.filas.map((x) => x.id).join(', ')} (se esperan los ${procesos.length} procesos de escalas.json, en orden)`);
  }
  const base = panel.filas[0];
  for (const x of panel.filas) {
    if (!base || x.alto !== base.alto || x.peso !== base.peso || x.letra !== base.letra || x.pasos !== 7 || !x.numero) {
      f.push(`Síntesis P12: la fila «${x.id}» no tiene el mismo peso que las demás (alto ${x.alto}, peso ${x.peso}, letra ${x.letra}, ${x.pasos} escalas)`);
    }
  }
  if (!panel.filas.some((x) => x.id === 'biota_suelo')) f.push('Síntesis P12: falta la fila de la biota del suelo');
  if (!panel.coberturasOculta || panel.sobreFicha || panel.fuera) f.push('Síntesis P12: el panel cruza la ficha, sale de la ventana o convive con la leyenda de coberturas');
  if (panel.flujos) f.push('Síntesis P12: hay capas de flujo visibles');
  return f;
}

export function seccionSintesis(r) {
  if (!r?.panel) return ['## Radios, prácticas de conservación y síntesis', '', '- Sin datos', ''];
  const { enemigos: e, polinizadores: p, practicas: c, panel } = r;
  const presupuesto = (m) => `${m.triangulos} triángulos (tope ${TOPE_TRIANGULOS}) y ${m.llamadas} llamadas de dibujo; ${m.datos.particulas} partículas; reloj: avanza ${m.avanza ? 'sí' : 'no'}, repite ${m.repite ? 'sí' : 'no'}`;
  const radios = (m) => `${m.datos.parches} parches de hábitat, radio ${m.datos.radio} (ilustrativo); ${m.datos.salenDeSuFinca} salen del lindero de su finca; fincas alcanzadas: ${m.datos.fincasAlcanzadas.join(', ') || 'ninguna'}; pares de radios superpuestos: ${m.datos.superpuestos}`;
  return [
    '## Radios, prácticas de conservación y síntesis',
    '',
    `- P08, enemigos naturales: ${radios(e)}; rótulos: ${e.rotulos.join(', ')}`,
    `- P08, polinizadores (segundo paso): ${radios(p)}; corredor ripario ${p.datos.corredor ? 'sí' : 'no'}; rótulos: ${p.rotulos.join(', ')} (${p.enEscena} en escena)`,
    `- P08 en S3: ${r.parchesS3} parches de hábitat (los radios siguen la cobertura del escenario)`,
    `- P09, prácticas en la finca ${c.datos.finca}: tramos de curvas a nivel ${c.datos.tramos.curvas_nivel}, de barreras vivas ${c.datos.tramos.barreras_vivas} y de terrazas ${c.datos.tramos.terrazas}; ${c.datos.puntosBarrera} puntos de barrera y ${c.datos.rutasAgua} rutas de agua que se infiltra; visibles en el paso de cuenca: ${r.practicasEnCuenca ? 'sí' : 'no'}; leyenda: ${c.leyenda.join(', ')} («${c.nota}»)`,
    `- P12, panel de escala mínima: ${panel.filas.length} filas (${panel.filas.map((x) => `${x.id} ${x.numero}`).join(', ')}); alto de fila ${[...new Set(panel.filas.map((x) => x.alto))].join(' y ')} px y peso ${[...new Set(panel.filas.map((x) => x.peso))].join(' y ')}; leyenda de coberturas oculta: ${panel.coberturasOculta ? 'sí' : 'no'}; cruza la ficha: ${panel.sobreFicha ? 'sí' : 'no'}`,
    `- Presupuesto gráfico, radios de enemigos naturales: ${presupuesto(e)}`,
    `- Presupuesto gráfico, radios de polinizadores: ${presupuesto(p)}`,
    `- Presupuesto gráfico, prácticas de conservación: ${presupuesto(c)}`,
    `- Capturas: ${r.capturas.map((x) => `\`capturas/${x}\``).join(', ')}`,
    '',
  ];
}
