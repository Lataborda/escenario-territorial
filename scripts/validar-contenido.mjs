// Valida contenido/ y genera verificacion/pendientes-de-fuente.md.
// Uso: npm run validar. Sale con código 1 si hay errores.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { leerContenido } from './lib/contenido.mjs';
import { revisarTextos } from './lib/revisar-textos.mjs';
import { revisarReferencias } from './lib/revisar-referencias.mjs';
import { revisarProporciones } from './lib/revisar-proporciones.mjs';
import { revisarFincas, revisarEap } from './lib/revisar-fincas-contenido.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARCHIVO_PENDIENTES = path.join('verificacion', 'pendientes-de-fuente.md');

export async function validarContenido(raiz = RAIZ) {
  const { datos, errores } = await leerContenido(raiz);
  if (errores.length) return { datos, errores, avisos: [], pendientes: null, resumen: null };
  const textos = revisarTextos(datos);
  const referencias = revisarReferencias(datos);
  const proporciones = revisarProporciones(datos);
  const fincas = revisarFincas(datos);
  const eap = revisarEap(datos);
  return {
    datos,
    errores: [...referencias.errores, ...proporciones.errores, ...fincas.errores, ...eap.errores, ...textos.errores],
    avisos: [...referencias.avisos, ...proporciones.avisos, ...fincas.avisos, ...eap.avisos, ...textos.avisos],
    pendientes: textos.pendientes,
    resumen: referencias.resumen,
  };
}

// Agrupa los localizadores pendientes por fuente y archivo.
function agruparLocalizadores(localizadores) {
  const grupos = new Map();
  for (const { clave, archivo, lugar } of localizadores) {
    if (!grupos.has(clave)) grupos.set(clave, new Map());
    const porArchivo = grupos.get(clave);
    if (!porArchivo.has(archivo)) porArchivo.set(archivo, new Set());
    porArchivo.get(archivo).add(lugar);
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function informePendientes({ datos, pendientes }) {
  const fuentes = datos.fuentes.fuentes;
  const enFalta = Object.entries(fuentes).filter(([, f]) => f.estado !== 'en carpeta');
  const grupos = agruparLocalizadores(pendientes.localizadores);
  const lineas = [
    '# Pendientes de fuente',
    '',
    'Archivo generado por `npm run validar`; no se edita a mano. Reúne lo que debe cerrarse en una sesión local con acceso a las fuentes (etapa 14 a más tardar).',
    '',
    `## Fuentes en falta o por verificar (${enFalta.length})`,
    '',
    '| Clave | Referencia | Estado | Nota |',
    '|---|---|---|---|',
    ...enFalta.map(([clave, f]) => `| ${clave} | ${f.referencia} | ${f.estado} | ${f.nota ?? ''} |`),
    '',
    `## Localizadores por verificar (${pendientes.localizadores.length} referencias en ${grupos.length} fuentes)`,
    '',
    'Referencias con la forma `clave:verificar`. Al localizar el pasaje, reemplazar «verificar» por la página o la sección.',
    '',
  ];
  for (const [clave, porArchivo] of grupos) {
    const sitios = [...porArchivo.entries()].map(([archivo, lugares]) => `${archivo} (${[...lugares].join(', ')})`);
    lineas.push(`- \`${clave}\` (${fuentes[clave]?.corta ?? 'sin referencia'}): ${sitios.join('; ')}`);
  }
  lineas.push('', `## Datos por verificar (${pendientes.datos.length})`, '');
  for (const { archivo, lugar, texto } of pendientes.datos) lineas.push(`- ${archivo}.json · ${lugar}: ${texto}`);
  lineas.push('');
  return lineas.join('\n');
}

export async function escribirPendientes(raiz, resultado) {
  if (!resultado.pendientes) return null;
  const destino = path.join(raiz, ARCHIVO_PENDIENTES);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, informePendientes(resultado));
  return destino;
}

function imprimir({ errores, avisos, resumen, pendientes }) {
  if (resumen) {
    const porMomento = Object.entries(resumen.minutos).map(([m, n]) => `${m} ${n}`).join(', ');
    console.log(`Paradas: ${resumen.paradas}. Minutos: ${resumen.total} (${porMomento}). Saltables: ${resumen.saltables.join(', ') || 'ninguna'}.`);
  }
  if (pendientes) {
    console.log(`Pendientes: ${pendientes.localizadores.length} localizadores y ${pendientes.datos.length} datos por verificar (${ARCHIVO_PENDIENTES}).`);
  }
  for (const a of avisos) console.log(`Aviso: ${a}`);
  for (const e of errores) console.error(`Error: ${e}`);
  console.log(errores.length ? `Contenido con ${errores.length} errores.` : 'Contenido válido.');
}

async function principal() {
  const resultado = await validarContenido(RAIZ);
  await escribirPendientes(RAIZ, resultado);
  imprimir(resultado);
  if (resultado.errores.length) process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  principal().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
