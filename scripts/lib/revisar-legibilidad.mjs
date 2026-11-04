// Revisión de transiciones (duración real del vuelo) y de fichas legibles en una ventana de 1280×720.
import path from 'node:path';
import { irPorHash, leerFicha, estado, pausarDibujo, dibujarCuadro } from './revisar-paradas.mjs';

export const VENTANA_PEQUENA = { width: 1280, height: 720 };
const LETRA_MINIMA = 16; // 24 px a 1920×1080 equivalen a 16 px a 1280×720
const HOLGURA_S = 0.6; // el vuelo termina en el primer cuadro tras su duración: holgura de un intervalo entre cuadros

const esperarFin = (pagina) =>
  pagina.waitForFunction(() => !document.documentElement.dataset.transicion, null, { timeout: 15000 });

// El vuelo empieza al procesar la tecla o el clic; con render por software puede terminar antes de la
// consulta siguiente, por eso se compara el registro del último vuelo antes y después de la acción.
// También registra el intervalo máximo entre cuadros durante el vuelo (requestAnimationFrame).
async function medir(pagina, accion) {
  const antes = await pagina.evaluate(() => {
    const r = { ultimo: performance.now(), maximo: 0, activo: true };
    window.intervalosVuelo = r;
    const paso = (t) => {
      r.maximo = Math.max(r.maximo, t - r.ultimo);
      r.ultimo = t;
      if (r.activo) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
    return window.escenario.ultimaTransicion()?.inicio ?? null;
  });
  await accion();
  await esperarFin(pagina);
  const t = await pagina.evaluate(() => {
    window.intervalosVuelo.activo = false;
    return { ...window.escenario.ultimaTransicion(), intervalo: window.intervalosVuelo.maximo };
  });
  return {
    empezo: t.inicio != null && t.inicio !== antes,
    declarada: t.duracion ?? null,
    medida: t.fin ? Number(((t.fin - t.inicio) / 1000).toFixed(2)) : null,
    intervalo: Number((t.intervalo / 1000).toFixed(2)),
  };
}

// Página sin #captura=1: vuelo entre dos paradas y desde la botonera. Se mide en modo liviano (tecla V): la
// prueba revisa la duración del vuelo; los cuadros por segundo se miden en el equipo de la prueba.
export async function revisarTransiciones(pagina) {
  await pagina.keyboard.press('v');
  const parada = await medir(pagina, () => pagina.keyboard.press('ArrowRight'));
  parada.destino = (await estado(pagina)).parada;
  const botonera = await medir(pagina, () => pagina.click('.escala[data-escala="cuenca"]'));
  await pagina.keyboard.press('v');
  const ok = (m) =>
    m.empezo &&
    m.declarada >= 1.5 &&
    m.declarada <= 3 &&
    m.medida >= m.declarada - 0.05 &&
    m.medida <= m.declarada + Math.max(HOLGURA_S, m.intervalo * 1.1);
  return { parada, botonera, correcto: ok(parada) && ok(botonera) };
}

// Página de 1280×720 abierta en #p=P14&paso=2: hash directo y fichas de todas las paradas.
export async function revisarLegibilidad(pagina, { paradas, dirCapturas, abierta }) {
  await pausarDibujo(pagina);
  const e = await estado(pagina);
  const inicial = await leerFicha(pagina);
  const p = paradas.find((x) => x.id === abierta.id);
  const hashDirecto =
    e.parada === abierta.id && e.paso === abierta.paso && e.lente === p.pasos[abierta.paso].estado.lente &&
    inicial.pasoActual === p.pasos[abierta.paso].rotulo;
  const filas = [];
  for (const x of paradas) {
    await irPorHash(pagina, x.id);
    const f = await leerFicha(pagina);
    filas.push({ id: x.id, ...f, legible: !f.desborde && f.dentro && !f.superpuesta && f.letra >= LETRA_MINIMA - 0.01 });
  }
  const mayor = filas.reduce((a, b) => (b.alto > a.alto ? b : a));
  await irPorHash(pagina, mayor.id);
  await dibujarCuadro(pagina);
  const captura = 'ficha-1280.png';
  await pagina.screenshot({ path: path.join(dirCapturas, captura) });
  await pausarDibujo(pagina, false);
  return {
    hashDirecto,
    total: filas.length,
    legibles: filas.filter((f) => f.legible).length,
    fallidas: filas.filter((f) => !f.legible).map((f) => f.id),
    letra: Math.min(...filas.map((f) => f.letra)),
    mayor: { id: mayor.id, alto: mayor.alto },
    captura,
  };
}
