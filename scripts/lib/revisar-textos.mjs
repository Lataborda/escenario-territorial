// Revisión de textos: términos vetados, títulos, fichas, estados y referencias a fuentes.
import { recorrer, campo, lugar, separarReferencia, contarPalabras } from './contenido.mjs';

export const LIMITE_PALABRAS = 60;
const ESTADOS_TEXTO = ['borrador', 'revisado'];
const LOCALIZADOR_PENDIENTE = 'verificar';

const VETADOS = [
  [/—/, 'raya (—)'],
  [/cadena de valor/i, '«cadena de valor»'],
  [/stakeholder/i, '«stakeholder»'],
];

// Construcciones de contraste: aviso, sin bloquear. Se ignoran las citas entre comillas latinas.
const CONTRASTES = [
  [/\bno solo\b/i, '«no solo»'],
  [/\bsino\b/i, '«sino»'],
  [/\bmás que\b/i, '«más que»'],
  [/\bantes que\b/i, '«antes que»'],
  [/\bno es\b[^.;]*,\s*es\b/i, '«no es X, es Y»'],
];

function revisarCadena(texto, donde, ruta, r) {
  for (const [patron, nombre] of VETADOS) {
    if (patron.test(texto)) r.errores.push(`${donde}: término vetado ${nombre}`);
  }
  const sinCitas = texto.replace(/«[^»]*»/g, '');
  for (const [patron, nombre] of CONTRASTES) {
    if (patron.test(sinCitas)) r.avisos.push(`${donde}: construcción de contraste ${nombre}`);
  }
  const nombreCampo = campo(ruta);
  if (nombreCampo === 'titulo' && texto.includes(':')) r.errores.push(`${donde}: título con dos puntos`);
  if (nombreCampo === 'ficha') {
    const n = contarPalabras(texto);
    if (n > LIMITE_PALABRAS) r.errores.push(`${donde}: ficha de ${n} palabras (máximo ${LIMITE_PALABRAS})`);
  }
  if (nombreCampo === 'estado_texto' && !ESTADOS_TEXTO.includes(texto)) {
    r.errores.push(`${donde}: estado_texto «${texto}» (usar ${ESTADOS_TEXTO.join(' o ')})`);
  }
}

function revisarReferencias(lista, donde, archivo, dueno, fuentes, r) {
  for (const referencia of lista) {
    if (typeof referencia !== 'string') {
      r.errores.push(`${donde}: referencia a fuente que no es texto`);
      continue;
    }
    const { clave, localizador } = separarReferencia(referencia);
    if (!fuentes[clave]) r.errores.push(`${donde}: fuente desconocida «${clave}»`);
    if (!localizador) r.errores.push(`${donde}: «${referencia}» sin localizador (usar ${clave}:${LOCALIZADOR_PENDIENTE} si falta)`);
    if (localizador === LOCALIZADOR_PENDIENTE) r.pendientes.localizadores.push({ clave, archivo, lugar: dueno });
  }
}

// «APPA» y «1406» no pueden aparecer en el mismo elemento (GUION, precaución 4).
function revisarAppa(textosPorLugar, archivo, r) {
  for (const [donde, textos] of textosPorLugar) {
    const todo = textos.join(' ');
    if (/\bAPPA\b/.test(todo) && /\b1406\b/.test(todo)) {
      r.errores.push(`${archivo}.json · ${donde}: «APPA» junto a «1406»`);
    }
  }
}

export function revisarTextos(datos) {
  const r = { errores: [], avisos: [], pendientes: { localizadores: [], datos: [] } };
  const fuentes = datos.fuentes?.fuentes ?? {};
  for (const [archivo, contenido] of Object.entries(datos)) {
    const textosPorLugar = new Map();
    recorrer(contenido, (valor, ruta, dueno) => {
      const sitio = lugar(ruta, dueno);
      const donde = `${archivo}.json · ${sitio} · ${ruta}`;
      if (typeof valor === 'string') {
        revisarCadena(valor, donde, ruta, r);
        if (!textosPorLugar.has(sitio)) textosPorLugar.set(sitio, []);
        textosPorLugar.get(sitio).push(valor);
        return;
      }
      if (!Array.isArray(valor)) return;
      const nombreCampo = campo(ruta);
      if (nombreCampo === 'fuentes') revisarReferencias(valor, donde, archivo, sitio, fuentes, r);
      if (nombreCampo === 'verificar') {
        for (const texto of valor) r.pendientes.datos.push({ archivo, lugar: sitio, texto });
      }
    });
    revisarAppa(textosPorLugar, archivo, r);
  }
  return r;
}
