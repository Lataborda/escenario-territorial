// Lectura de contenido/ y utilidades comunes para revisar sus valores.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const ARCHIVOS = ['territorio', 'escalas', 'paradas', 'escenarios', 'condiciones', 'actores', 'fuentes'];

export async function leerContenido(raiz) {
  const datos = {};
  const errores = [];
  for (const nombre of ARCHIVOS) {
    try {
      datos[nombre] = JSON.parse(await readFile(path.join(raiz, 'contenido', `${nombre}.json`), 'utf8'));
    } catch (error) {
      errores.push(`${nombre}.json: ${error.message}`);
    }
  }
  return { datos, errores };
}

// Recorre un valor JSON y llama a visitar(valor, ruta, dueno) en cada nodo.
// dueno es el id del objeto más cercano que lo tenga.
export function recorrer(valor, visitar, ruta = '', dueno = null) {
  visitar(valor, ruta, dueno);
  if (Array.isArray(valor)) {
    valor.forEach((v, i) => recorrer(v, visitar, `${ruta}[${i}]`, dueno));
  } else if (valor && typeof valor === 'object') {
    const propio = typeof valor.id === 'string' ? valor.id : dueno;
    for (const [clave, v] of Object.entries(valor)) recorrer(v, visitar, ruta ? `${ruta}.${clave}` : clave, propio);
  }
}

// Nombre del campo final de una ruta («paradas[3].ficha» da «ficha»).
export function campo(ruta) {
  const partes = ruta.replace(/\[\d+\]/g, '').split('.');
  return partes[partes.length - 1];
}

// Etiqueta legible del lugar de un valor: id del dueño o primer segmento de la ruta.
export function lugar(ruta, dueno) {
  return dueno ?? ruta.split(/[.[]/)[0];
}

// «clave:localizador» a sus partes.
export function separarReferencia(referencia) {
  const i = referencia.indexOf(':');
  if (i < 0) return { clave: referencia.trim(), localizador: '' };
  return { clave: referencia.slice(0, i).trim(), localizador: referencia.slice(i + 1).trim() };
}

// Palabras con letras o cifras; «61.435,70» cuenta como una.
export function contarPalabras(texto) {
  return (texto.match(/[\p{L}\p{N}][\p{L}\p{N}.,'’-]*/gu) ?? []).length;
}
