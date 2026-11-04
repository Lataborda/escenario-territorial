// Respaldo en imágenes: compila, captura cada parada y cada paso a 1920×1080 y escribe
// respaldo/index.html (navegable con flechas, abre sin servidor) y respaldo/notas.md.
// Uso: npm run respaldo. Tarda unos dos minutos con render por software.
import { build, preview } from 'vite';
import { chromium } from 'playwright';
import { mkdir, readdir, rm, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bloquearExternas, vigilar } from './lib/revisar-pagina.mjs';
import { irPorHash, pausarDibujo, dibujarCuadro } from './lib/revisar-paradas.mjs';
import { paginaRespaldo } from './lib/plantilla-respaldo.mjs';
import { notasPresentador } from './lib/notas.mjs';
import { revisarRespaldo, huellaContenido, estadosDe, CARPETA_RESPALDO } from './lib/revisar-respaldo.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(RAIZ, CARPETA_RESPALDO);
const DIR_IMAGENES = path.join(DIR, 'capturas');
const VENTANA = { width: 1920, height: 1080 };
const CALIDAD_JPEG = 75;
const INICIO = Date.now();
const avisar = (texto) => console.log(`[${((Date.now() - INICIO) / 1000).toFixed(0)} s] ${texto}`);
const leerJson = async (nombre) => JSON.parse(await readFile(path.join(RAIZ, 'contenido', `${nombre}.json`), 'utf8'));

// Nombre de archivo: P01.jpg; con pasos, P03-1.jpg a P03-4.jpg.
const nombreDe = (p, paso) => `${p.id}${(p.pasos?.length ?? 0) > 1 ? `-${paso + 1}` : ''}.jpg`;

async function limpiar() {
  await mkdir(DIR_IMAGENES, { recursive: true });
  for (const archivo of await readdir(DIR_IMAGENES)) {
    if (archivo.endsWith('.jpg')) await rm(path.join(DIR_IMAGENES, archivo));
  }
}

async function capturar(navegador, url, origen, paradas) {
  const contexto = await navegador.newContext({ viewport: VENTANA, deviceScaleFactor: 1 });
  await bloquearExternas(contexto, origen);
  const pagina = await contexto.newPage();
  const r = { errores: [], avisos: [], solicitudes: 0, externas: [] };
  vigilar(pagina, origen, r);
  await pagina.goto(`${url}#p=${paradas[0].id}&captura=1`, { waitUntil: 'load', timeout: 30000 });
  await pagina.waitForFunction(() => document.documentElement.dataset.listo === '1', null, { timeout: 30000 });
  await pausarDibujo(pagina);
  const diapositivas = [];
  for (const { parada, paso } of estadosDe(paradas)) {
    const p = paradas.find((x) => x.id === parada);
    await irPorHash(pagina, parada, paso);
    await dibujarCuadro(pagina);
    const archivo = nombreDe(p, paso);
    await pagina.screenshot({ path: path.join(DIR_IMAGENES, archivo), type: 'jpeg', quality: CALIDAD_JPEG });
    diapositivas.push({ src: `capturas/${archivo}`, parada, paso, momento: p.momento, titulo: p.titulo });
    if (diapositivas.length % 10 === 0) avisar(`${diapositivas.length} capturas`);
  }
  await contexto.close();
  return { diapositivas, ...r };
}

async function principal() {
  const contenido = await leerJson('paradas');
  const fuentes = (await leerJson('fuentes')).fuentes;
  const huella = await huellaContenido(RAIZ);
  const fecha = new Date().toISOString().slice(0, 10);

  avisar('Compilando dist/ ...');
  await build({ root: RAIZ, logLevel: 'warn' });
  await limpiar();
  const servidor = await preview({ root: RAIZ, logLevel: 'warn', preview: { port: 4318, strictPort: false } });
  const url = servidor.resolvedUrls.local[0];
  const navegador = await chromium.launch();
  let captura;
  let revision;
  try {
    avisar(`Capturando ${estadosDe(contenido.paradas).length} estados a ${VENTANA.width}×${VENTANA.height} ...`);
    captura = await capturar(navegador, url, new URL(url).origin, contenido.paradas);
    const { diapositivas } = captura;
    await writeFile(path.join(DIR, 'index.html'), paginaRespaldo({ diapositivas, huella, fecha }));
    await writeFile(path.join(DIR, 'notas.md'), notasPresentador({ contenido, fuentes, diapositivas, huella, fecha }));
    avisar('Revisando respaldo/index.html sin servidor ...');
    revision = await revisarRespaldo(navegador, RAIZ, { paradas: contenido.paradas });
  } finally {
    await navegador.close();
    await servidor.close();
  }

  const fallas = [
    ...captura.errores.map((e) => `Captura: ${e}`),
    ...captura.externas.map((e) => `Captura, solicitud externa: ${e}`),
    ...revision.errores,
    ...revision.externas.map((e) => `Respaldo, solicitud externa: ${e}`),
  ];
  if (revision.cargadas !== revision.esperados) fallas.push(`Respaldo: ${revision.cargadas} de ${revision.esperados} imágenes cargan`);
  if (!revision.navegacion) fallas.push('Respaldo: el teclado no navega como se espera');
  avisar(`respaldo/index.html: ${revision.cargadas} de ${revision.esperados} imágenes (${revision.medidas.join(', ')}); teclado ${revision.navegacion ? 'correcto' : 'con fallas'}; respaldo/notas.md escrito.`);
  if (fallas.length) {
    console.error(`Respaldo con ${fallas.length} fallas:\n- ${fallas.join('\n- ')}`);
    process.exitCode = 1;
  }
}

principal().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
