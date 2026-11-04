// Fuente abreviada para la ficha: «Calle et al. (2022), §11.7, §11.8».
// Un localizador «verificar» no se muestra; la fuente queda marcada como pendiente.
import contenido from '../../contenido/fuentes.json';

const FUENTES = contenido.fuentes;

function separar(referencia) {
  const i = referencia.indexOf(':');
  return i < 0
    ? { clave: referencia.trim(), localizador: '' }
    : { clave: referencia.slice(0, i).trim(), localizador: referencia.slice(i + 1).trim() };
}

// Agrupa las referencias por fuente, en el orden en que aparecen.
export function abreviarFuentes(referencias = []) {
  const grupos = new Map();
  for (const r of referencias) {
    const { clave, localizador } = separar(r);
    if (!grupos.has(clave)) grupos.set(clave, { clave, localizadores: [], pendiente: false });
    const g = grupos.get(clave);
    if (!localizador || localizador === 'verificar') g.pendiente = true;
    else if (!g.localizadores.includes(localizador)) g.localizadores.push(localizador);
  }
  return [...grupos.values()].map((g) => {
    const f = FUENTES[g.clave];
    const corta = f?.corta ?? g.clave;
    return {
      clave: g.clave,
      texto: g.localizadores.length ? `${corta}, ${g.localizadores.join(', ')}` : corta,
      pendiente: g.pendiente || !f || f.estado !== 'en carpeta',
    };
  });
}
