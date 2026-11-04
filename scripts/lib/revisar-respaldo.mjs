// Revisión del respaldo en imágenes: abre respaldo/index.html por file:// sin red, carga cada imagen
// y prueba el teclado. Compara la huella del contenido con la actual.
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { bloquearExternas, vigilar } from './revisar-pagina.mjs';

export const CARPETA_RESPALDO = 'respaldo';
const ESPERA_MS = 30000;

// Huella de paradas.json y fuentes.json: indica si el respaldo corresponde al contenido actual.
export async function huellaContenido(raiz) {
  const h = createHash('sha256');
  for (const nombre of ['paradas', 'fuentes']) h.update(await readFile(path.join(raiz, 'contenido', `${nombre}.json`)));
  return h.digest('hex').slice(0, 12);
}

// Estados esperados del recorrido: uno por parada y uno por paso.
export const estadosDe = (paradas) =>
  paradas.flatMap((p) => Array.from({ length: Math.max(1, p.pasos?.length ?? 0) }, (_, k) => ({ parada: p.id, paso: k })));

export async function revisarRespaldo(navegador, raiz, { paradas, ventana = { width: 1600, height: 900 } }) {
  const archivo = path.join(raiz, CARPETA_RESPALDO, 'index.html');
  const r = { url: pathToFileURL(archivo).href, existe: true, cargo: false, ms: null, errores: [], avisos: [], solicitudes: 0, externas: [] };
  try {
    await stat(archivo);
  } catch {
    return { ...r, existe: false };
  }
  const contexto = await navegador.newContext({ viewport: ventana, deviceScaleFactor: 1 });
  await bloquearExternas(contexto, null);
  const pagina = await contexto.newPage();
  vigilar(pagina, null, r);
  try {
    const inicio = Date.now();
    await pagina.goto(r.url, { waitUntil: 'load', timeout: ESPERA_MS });
    await pagina.waitForFunction(() => document.documentElement.dataset.listo === '1', null, { timeout: ESPERA_MS });
    r.cargo = true;
    r.ms = Date.now() - inicio;
    const info = await pagina.evaluate(() => window.respaldo.info());
    r.total = info.total;
    r.huella = info.huella;
    // Cada imagen carga y mide lo mismo.
    const medidas = await pagina.evaluate(() =>
      Promise.all(
        window.respaldo.fuentes().map(
          (src) =>
            new Promise((resolver) => {
              const img = new Image();
              img.onload = () => resolver(`${img.naturalWidth}×${img.naturalHeight}`);
              img.onerror = () => resolver(null);
              img.src = src;
            }),
        ),
      ),
    );
    r.cargadas = medidas.filter(Boolean).length;
    r.medidas = [...new Set(medidas.filter(Boolean))];
    const esperados = estadosDe(paradas);
    r.esperados = esperados.length;
    // Teclado: avance, retroceso, fin, momento 3 e hash directo.
    const leer = () => pagina.evaluate(() => window.respaldo.info());
    const pasos = [];
    await pagina.keyboard.press('ArrowRight');
    pasos.push((await leer()).actual === 1);
    await pagina.keyboard.press('ArrowLeft');
    pasos.push((await leer()).actual === 0);
    await pagina.keyboard.press('End');
    pasos.push((await leer()).actual === info.total - 1);
    await pagina.keyboard.press('3');
    const m3 = paradas.find((p) => p.momento === 'M3')?.id;
    pasos.push((await leer()).parada === m3);
    await pagina.evaluate(() => (location.hash = 'p=P14&paso=2'));
    await pagina.waitForFunction(() => window.respaldo.info().paso === 2, null, { timeout: 5000 });
    pasos.push((await leer()).parada === 'P14');
    r.navegacion = pasos.every(Boolean);
  } catch (error) {
    r.errores.push(`Respaldo: ${error.message.split('\n')[0]}`);
  } finally {
    await contexto.close();
  }
  r.huellaActual = await huellaContenido(raiz);
  r.actualizado = r.huella === r.huellaActual;
  return r;
}
