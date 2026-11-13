// Verificación automática: compila, revisa la vista compilada y el archivo único, y escribe el informe.
// Uso: npm run verificar. Sale con código 1 si hay errores de consola, solicitudes externas o vistas que no cargan.
import { build, preview } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile, stat, readdir, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { revisarPagina, VENTANA } from './lib/revisar-pagina.mjs';
import { revisarTerreno, huellaDe, fallasTerreno, seccionTerreno } from './lib/revisar-terreno.mjs';
import { revisarRecorrido, CARPETA_PARADAS } from './lib/revisar-paradas.mjs';
import { revisarLibre } from './lib/revisar-libre.mjs';
import { revisarTransiciones, revisarLegibilidad, VENTANA_PEQUENA } from './lib/revisar-legibilidad.mjs';
import { fallasRecorrido, seccionRecorrido } from './lib/informe-recorrido.mjs';
import { revisarPresentador } from './lib/revisar-presentador.mjs';
import { revisarCoberturas, fallasCoberturas, seccionCoberturas } from './lib/revisar-coberturas.mjs';
import { revisarRespaldo } from './lib/revisar-respaldo.mjs';
import { fallasPresentador, seccionPresentador } from './lib/informe-presentador.mjs';
import { revisarLuz, fallasLuz, seccionLuz, VENTANA_GRANDE } from './lib/revisar-luz.mjs';
import { revisarFincas, fallasFincas, seccionFincas } from './lib/revisar-fincas.mjs';
import { revisarLote, fallasLote, seccionLote } from './lib/revisar-lote.mjs';
import { revisarRendimiento, fallasRendimiento, seccionRendimiento } from './lib/revisar-rendimiento.mjs';
import { validarContenido, escribirPendientes } from './validar-contenido.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_VERIFICACION = path.join(RAIZ, 'verificacion');
const DIR_CAPTURAS = path.join(DIR_VERIFICACION, 'capturas');
const ARCHIVO_UNICO = path.join(RAIZ, 'dist-unico', 'index.html');
const INICIO = Date.now();
// Avance en consola con los segundos transcurridos.
const avisar = (texto) => console.log(`[${((Date.now() - INICIO) / 1000).toFixed(0)} s] ${texto}`);
const CONTENIDO = ['territorio', 'escalas', 'paradas', 'escenarios', 'condiciones', 'actores', 'fincas', 'eap', 'lote', 'fuentes'];

async function compilar() {
  avisar('Compilando dist/ y dist-unico/ ...');
  await build({ root: RAIZ, logLevel: 'warn' });
  await build({ root: RAIZ, mode: 'unico', logLevel: 'warn' });
}

// Valida contenido/, regenera los pendientes de fuente y lista fichas en borrador y fuentes por verificar.
async function revisarContenido() {
  const v = await validarContenido(RAIZ);
  await escribirPendientes(RAIZ, v);
  const datos = v.datos;
  const r = {
    datos,
    validos: Object.keys(datos).length,
    errores: v.errores,
    avisos: v.avisos,
    resumen: v.resumen,
    localizadores: v.pendientes?.localizadores.length ?? 0,
    datosPendientes: v.pendientes?.datos.length ?? 0,
    borradores: [],
    fuentesPendientes: [],
  };
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

function escribirInforme({ fecha, version, principal, unico, terreno, coberturas, fincas, lote, luz, rendimiento, recorrido, presentador, respaldo, tamanoUnico, contenido, fallas }) {
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
    ...seccionTerreno(terreno),
    ...seccionCoberturas(coberturas.extra, principal.estadisticas),
    ...seccionFincas(fincas.extra),
    ...seccionLote(lote.extra),
    ...seccionLuz(luz.extra),
    ...seccionRendimiento(rendimiento.extra),
    ...seccionVista('Ventana de 1920×1080 (vista compilada)', luz),
    ...seccionVista('Recorrido de paradas (vista compilada)', recorrido.vistas.recorrido),
    ...seccionVista('Transiciones (vista compilada, sin #captura)', recorrido.vistas.transiciones),
    ...seccionVista('Ventana de 1280×720 (vista compilada)', recorrido.vistas.legibilidad),
    ...seccionRecorrido(recorrido),
    ...seccionPresentador(presentador, respaldo),
    '## Contenido',
    '',
    `- JSON válidos: ${contenido.validos} de ${CONTENIDO.length}`,
    contenido.resumen
      ? `- Paradas: ${contenido.resumen.paradas}; minutos: ${contenido.resumen.total}; saltables: ${contenido.resumen.saltables.join(', ') || 'ninguna'}`
      : null,
    `- Errores de contenido:${lista(contenido.errores)}`,
    `- Avisos de redacción:${lista(contenido.avisos)}`,
    `- Fichas en borrador (${contenido.borradores.length}): ${contenido.borradores.join(', ') || 'ninguna'}`,
    `- Fuentes en falta o verificar:${lista(contenido.fuentesPendientes, 'ninguna')}`,
    `- Pendientes de fuente: ${contenido.localizadores} localizadores y ${contenido.datosPendientes} datos (\`pendientes-de-fuente.md\`)`,
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
  for (const dir of [DIR_CAPTURAS, path.join(DIR_CAPTURAS, CARPETA_PARADAS)]) {
    await mkdir(dir, { recursive: true });
    for (const archivo of await readdir(dir)) {
      if (/\.(png|jpg)$/.test(archivo)) await rm(path.join(dir, archivo));
    }
  }
}

// Recorrido de paradas, transiciones con vuelo y legibilidad a 1280×720, cada uno en su propia carga.
async function revisarNavegacion(navegador, url, origen, contenido) {
  const datos = contenido.datos;
  const paradas = datos.paradas.paradas;
  const entidades = new Set(datos.territorio.entidades.map((e) => e.id));
  const abierta = { id: 'P14', paso: 2 };
  avisar('Recorriendo las paradas ...');
  const recorrido = await revisarPagina(navegador, `${url}#p=${paradas[0].id}&captura=1`, {
    origen,
    extra: async (pagina) => {
      const r = await revisarRecorrido(pagina, { paradas, momentos: datos.paradas.momentos, entidades, dirCapturas: DIR_CAPTURAS });
      r.modoLibre = await revisarLibre(pagina, { dirCapturas: DIR_CAPTURAS });
      return r;
    },
  });
  avisar('Midiendo transiciones ...');
  // Último paso de P05: la flecha lleva a la parada siguiente (vuelo de P05 a P06).
  const transiciones = await revisarPagina(navegador, `${url}#p=P05&paso=2`, { origen, extra: revisarTransiciones });
  avisar('Revisando fichas a 1280×720 ...');
  const legibilidad = await revisarPagina(navegador, `${url}#p=${abierta.id}&paso=${abierta.paso}&captura=1`, {
    origen,
    ventana: VENTANA_PEQUENA,
    extra: (pagina) => revisarLegibilidad(pagina, { paradas, dirCapturas: DIR_CAPTURAS, abierta }),
  });
  return {
    vistas: { recorrido, transiciones, legibilidad },
    recorrido: recorrido.extra,
    transiciones: transiciones.extra,
    legibilidad: legibilidad.extra,
  };
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
    avisar(`Revisando ${url} ...`);
    const general = path.join(DIR_CAPTURAS, 'general.png');
    const vistaPrincipal = await revisarPagina(navegador, url, {
      origen,
      captura: general,
      medir: true,
      extra: (pagina) => revisarTerreno(pagina, DIR_CAPTURAS),
    });
    avisar('Repitiendo la carga para comparar ...');
    const repeticion = path.join(DIR_CAPTURAS, 'repeticion.png');
    const segunda = await revisarPagina(navegador, url, { origen, captura: repeticion, extra: huellaDe });
    avisar('Revisando el archivo único sin servidor ...');
    const vistaUnica = await revisarPagina(navegador, pathToFileURL(ARCHIVO_UNICO).href, {
      captura: path.join(DIR_CAPTURAS, 'unico.png'),
      extra: huellaDe,
    });
    const terreno = vistaPrincipal.extra ?? { capturas: [] };
    const huella = terreno.datos?.huella;
    terreno.repeticion = {
      huellaIgual: Boolean(huella) && segunda.extra?.huella === huella,
      capturaIgual: segunda.cargo && (await readFile(general)).equals(await readFile(repeticion)),
      unicoIgual: Boolean(huella) && vistaUnica.extra?.huella === huella,
      coberturasIgual:
        Boolean(terreno.datos?.huellaCoberturas) &&
        segunda.extra?.huellaCoberturas === terreno.datos.huellaCoberturas &&
        vistaUnica.extra?.huellaCoberturas === terreno.datos.huellaCoberturas,
    };
    await rm(repeticion, { force: true });
    avisar('Revisando coberturas y transiciones de escenario ...');
    const coberturas = await revisarPagina(navegador, `${url}#p=P13`, { origen, extra: (p) => revisarCoberturas(p, DIR_CAPTURAS) });
    avisar('Revisando las fincas ...');
    const fincas = await revisarPagina(navegador, `${url}#p=P06&captura=1`, { origen, extra: (p) => revisarFincas(p, { navegador, dirCapturas: DIR_CAPTURAS }) });
    avisar('Revisando el lote y el corte de suelo ...');
    const lote = await revisarPagina(navegador, `${url}#p=P03&captura=1`, {
      origen,
      ventana: VENTANA_GRANDE,
      extra: (p) => revisarLote(p, { navegador, dirCapturas: DIR_CAPTURAS, raiz: RAIZ }),
    });
    avisar('Revisando luz, posproceso y textos a 1920×1080 ...');
    const luz = await revisarPagina(navegador, `${url}#p=P01&captura=1`, {
      origen,
      ventana: VENTANA_GRANDE,
      extra: (pagina) => revisarLuz(pagina, { dirCapturas: DIR_CAPTURAS }),
    });
    avisar('Revisando el rendimiento ...');
    const rendimiento = await revisarPagina(navegador, `${url}#p=P01&captura=1`, { origen, extra: revisarRendimiento });
    const recorrido = await revisarNavegacion(navegador, url, origen, contenido);
    avisar('Revisando la vista del presentador ...');
    const presentador = await revisarPresentador(navegador, url, { origen, dirCapturas: DIR_CAPTURAS });
    avisar('Revisando el respaldo en imágenes ...');
    const respaldo = await revisarRespaldo(navegador, RAIZ, { paradas: contenido.datos.paradas.paradas });
    resultado = { principal: vistaPrincipal, unico: vistaUnica, terreno, coberturas, fincas, lote, luz, rendimiento, recorrido, presentador, respaldo, version: navegador.version() };
  } finally {
    await navegador.close();
    await servidor.close();
  }

  const fallas = [
    ...fallasDe('Vista compilada', resultado.principal),
    ...fallasDe('Archivo único', resultado.unico),
    ...fallasTerreno(resultado.terreno),
    ...fallasDe('Vista coberturas', resultado.coberturas),
    ...fallasCoberturas(resultado.coberturas.extra, resultado.principal.estadisticas),
    ...fallasDe('Vista fincas', resultado.fincas),
    ...fallasFincas(resultado.fincas.extra),
    ...fallasDe('Vista lote', resultado.lote),
    ...fallasLote(resultado.lote.extra),
    ...fallasDe('Vista 1920×1080', resultado.luz),
    ...fallasLuz(resultado.luz.extra),
    ...fallasDe('Vista rendimiento', resultado.rendimiento),
    ...fallasRendimiento(resultado.rendimiento.extra),
    ...Object.entries(resultado.recorrido.vistas).flatMap(([nombre, v]) => fallasDe(`Vista ${nombre}`, v)),
    ...fallasRecorrido(resultado.recorrido),
    ...fallasPresentador(resultado.presentador, resultado.respaldo),
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
