// Verificación automática: compila, revisa la vista compilada y el archivo único, y escribe el informe.
// Uso: npm run verificar. Sale con código 1 si hay errores de consola, solicitudes externas o vistas que no cargan.
import { build, preview } from 'vite';
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile, stat, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { revisarPagina, VENTANA } from './lib/revisar-pagina.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_VERIFICACION = path.join(RAIZ, 'verificacion');
const DIR_CAPTURAS = path.join(DIR_VERIFICACION, 'capturas');
const ARCHIVO_UNICO = path.join(RAIZ, 'dist-unico', 'index.html');
const CONTENIDO = ['territorio', 'escalas', 'paradas', 'escenarios', 'condiciones', 'actores', 'fuentes'];

async function compilar() {
  console.log('Compilando dist/ y dist-unico/ ...');
  await build({ root: RAIZ, logLevel: 'warn' });
  await build({ root: RAIZ, mode: 'unico', logLevel: 'warn' });
}

// Lee contenido/ y lista fichas en borrador y fuentes por verificar.
async function revisarContenido() {
  const r = { validos: 0, errores: [], borradores: [], fuentesPendientes: [] };
  const datos = {};
  for (const nombre of CONTENIDO) {
    try {
      datos[nombre] = JSON.parse(await readFile(path.join(RAIZ, 'contenido', `${nombre}.json`), 'utf8'));
      r.validos += 1;
    } catch (error) {
      r.errores.push(`contenido/${nombre}.json: ${error.message}`);
    }
  }
  for (const p of datos.paradas?.paradas ?? []) {
    if (p.estado_texto === 'borrador') r.borradores.push(p.id);
  }
  const fuentes = datos.fuentes?.fuentes ?? {};
  const lista = Array.isArray(fuentes) ? fuentes : Object.entries(fuentes).map(([clave, f]) => ({ clave, ...f }));
  for (const f of lista) {
    if (f.estado === 'falta' || f.estado === 'verificar') r.fuentesPendientes.push(`${f.clave} (${f.estado})`);
  }
  return r;
}

async function lanzarNavegador() {
  try {
    return await chromium.launch();
  } catch (error) {
    console.error('No se pudo abrir Chromium. En un equipo sin navegador de Playwright: npx playwright install chromium');
    throw error;
  }
}

function lista(elementos, vacio = 'ninguno') {
  if (!elementos?.length) return ` ${vacio}`;
  return '\n' + elementos.map((e) => `  - ${String(e).slice(0, 300)}`).join('\n');
}

function seccionVista(titulo, v, extra = []) {
  const est = v.estadisticas;
  const tipos = (v.tipografias ?? []).map((t) => `${t.familia} ${t.cargadas}/${t.caras}`).join('; ');
  return [
    `## ${titulo}`,
    '',
    `- Dirección: \`${v.url}\``,
    `- Carga: ${v.cargo ? `sí, ${v.ms} ms hasta \`escenario:listo\`` : 'no'}`,
    ...extra,
    `- Errores de consola:${lista(v.errores)}`,
    `- Solicitudes: ${v.solicitudes} en total; externas:${lista(v.externas, 'ninguna')}`,
    v.fps != null ? `- Cuadros por segundo en la vista general: ${v.fps} (navegador sin pantalla; referencia, no equivale al equipo de la prueba)` : null,
    est ? `- Llamadas de dibujo: ${est.llamadas}; triángulos: ${est.triangulos}; relación de píxeles: ${est.relacionPixeles}` : null,
    v.webgl ? `- Renderizador WebGL: ${v.webgl}` : null,
    tipos ? `- Tipografías cargadas (caras): ${tipos}` : null,
    v.captura ? `- Captura: \`capturas/${v.captura}\` (${VENTANA.width}×${VENTANA.height})` : null,
    `- Avisos de consola (no bloquean):${lista(v.avisos)}`,
    '',
  ].filter((l) => l !== null);
}

function escribirInforme({ fecha, version, principal, unico, tamanoUnico, contenido, fallas }) {
  return [
    '# Informe de verificación',
    '',
    `- Fecha: ${fecha}`,
    `- Navegador: Chromium ${version}`,
    `- Resultado: ${fallas.length ? 'con fallas' : 'correcto'}`,
    fallas.length ? `- Fallas:${lista(fallas)}` : null,
    '',
    ...seccionVista('Vista compilada (servidor de vista previa)', principal),
    ...seccionVista('Archivo único (file://, sin servidor y sin red)', unico, [
      `- Tamaño: ${(tamanoUnico / 1024).toFixed(0)} kB`,
    ]),
    '## Contenido',
    '',
    `- JSON válidos: ${contenido.validos} de ${CONTENIDO.length}`,
    `- Errores de contenido:${lista(contenido.errores)}`,
    `- Fichas en borrador:${lista(contenido.borradores, 'ninguna')}`,
    `- Fuentes en falta o verificar:${lista(contenido.fuentesPendientes, 'ninguna')}`,
    '',
  ]
    .filter((l) => l !== null)
    .join('\n');
}

function fallasDe(nombre, v) {
  const f = [];
  if (!v.cargo) f.push(`${nombre}: no cargó`);
  if (v.errores.length) f.push(`${nombre}: ${v.errores.length} errores de consola`);
  if (v.externas.length) f.push(`${nombre}: ${v.externas.length} solicitudes externas`);
  return f;
}

async function limpiarCapturas() {
  await mkdir(DIR_CAPTURAS, { recursive: true });
  for (const archivo of await readdir(DIR_CAPTURAS)) {
    if (archivo.endsWith('.png')) await rm(path.join(DIR_CAPTURAS, archivo));
  }
}

async function principal() {
  await compilar();
  await limpiarCapturas();
  const contenido = await revisarContenido();

  const servidor = await preview({ root: RAIZ, logLevel: 'warn', preview: { port: 4317, strictPort: false } });
  const url = servidor.resolvedUrls.local[0];
  const origen = new URL(url).origin;
  const navegador = await lanzarNavegador();
  let resultado;
  try {
    console.log(`Revisando ${url} ...`);
    const vistaPrincipal = await revisarPagina(navegador, url, {
      origen,
      captura: path.join(DIR_CAPTURAS, 'inicio.png'),
      medir: true,
    });
    console.log('Revisando el archivo único sin servidor ...');
    const vistaUnica = await revisarPagina(navegador, pathToFileURL(ARCHIVO_UNICO).href, {
      captura: path.join(DIR_CAPTURAS, 'unico.png'),
    });
    resultado = { principal: vistaPrincipal, unico: vistaUnica, version: navegador.version() };
  } finally {
    await navegador.close();
    await servidor.close();
  }

  const fallas = [
    ...fallasDe('Vista compilada', resultado.principal),
    ...fallasDe('Archivo único', resultado.unico),
    ...contenido.errores.map((e) => `Contenido: ${e}`),
  ];
  const informe = escribirInforme({
    fecha: new Date().toISOString(),
    ...resultado,
    tamanoUnico: (await stat(ARCHIVO_UNICO)).size,
    contenido,
    fallas,
  });
  await writeFile(path.join(DIR_VERIFICACION, 'informe.md'), informe);
  console.log(informe);
  if (fallas.length) {
    console.error(`Verificación con ${fallas.length} fallas. Ver verificacion/informe.md`);
    process.exitCode = 1;
  }
}

principal().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
