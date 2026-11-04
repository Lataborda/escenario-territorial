// Revisión de coberturas: tipos de la leyenda (territorio.json) y proporciones por escenario (escenarios.json).
import { TIPOS, CLASES_POR_ZONA, TIPOS_POR_CLASE, EDADES_CANA } from '../../src/coberturas/tipos.js';

const TOLERANCIA = 1e-6;
const ROTULO_MAXIMO = 18; // caracteres: dos columnas de leyenda en el ancho de la ficha

function revisarTipos(t, escalas, errores) {
  const c = t?.coberturas;
  if (!c) return errores.push('territorio.json · coberturas: falta el bloque'), new Set();
  const ids = new Set();
  for (const tipo of c.tipos ?? []) {
    const donde = `territorio.json · coberturas · ${tipo.id}`;
    if (ids.has(tipo.id)) errores.push(`${donde}: id repetido`);
    ids.add(tipo.id);
    if (!TIPOS[tipo.id]) errores.push(`${donde}: tipo sin definición en src/coberturas/tipos.js`);
    if (!tipo.nombre?.trim()) errores.push(`${donde}: falta el nombre`);
    if (!tipo.rotulo?.trim()) errores.push(`${donde}: falta el rótulo de la leyenda`);
    else if (tipo.rotulo.length > ROTULO_MAXIMO) errores.push(`${donde}: rótulo de más de ${ROTULO_MAXIMO} caracteres`);
  }
  for (const id of Object.keys(TIPOS)) {
    if (!ids.has(id)) errores.push(`territorio.json · coberturas: falta el nombre del tipo «${id}»`);
  }
  const l = c.leyenda ?? {};
  if (!l.titulo?.trim()) errores.push('territorio.json · coberturas · leyenda: falta el título');
  for (const e of l.escalas ?? []) {
    if (!escalas.has(e)) errores.push(`territorio.json · coberturas · leyenda: escala desconocida «${e}»`);
  }
  return ids;
}

function revisarEscenario(s, zonas, tipos, errores, avisos) {
  const donde = `escenarios.json · ${s.id} · coberturas`;
  if (!s.coberturas) return errores.push(`${donde}: falta el bloque`);
  for (const zona of Object.keys(CLASES_POR_ZONA)) {
    if (!s.coberturas[zona]) avisos.push(`${donde}: zona «${zona}» sin proporciones (queda sin cobertura)`);
  }
  for (const [zona, clases] of Object.entries(s.coberturas)) {
    if (!zonas.has(zona) || !CLASES_POR_ZONA[zona]) {
      errores.push(`${donde}: zona desconocida o sin coberturas «${zona}»`);
      continue;
    }
    for (const [clase, fracciones] of Object.entries(clases)) {
      const aqui = `${donde} · ${zona}.${clase}`;
      if (!CLASES_POR_ZONA[zona].includes(clase)) {
        errores.push(`${aqui}: clase no admitida en la zona (${CLASES_POR_ZONA[zona].join(', ')})`);
        continue;
      }
      let suma = 0;
      for (const [tipo, f] of Object.entries(fracciones)) {
        if (!tipos.has(tipo)) errores.push(`${aqui}: tipo desconocido «${tipo}»`);
        else if (!TIPOS_POR_CLASE[clase].includes(tipo)) errores.push(`${aqui}: «${tipo}» no se admite en ${clase}`);
        if (typeof f !== 'number' || f < 0 || f > 1) errores.push(`${aqui}: fracción de «${tipo}» fuera de 0 a 1`);
        else suma += f;
      }
      if (suma > 1 + TOLERANCIA) errores.push(`${aqui}: las fracciones suman ${suma.toFixed(3)} (máximo 1)`);
    }
  }
}

// Edades de la caña: una fracción entre 0 y 1 por edad de EDADES_CANA, con suma 1.
function revisarEdades(e, errores) {
  const donde = 'escenarios.json · edades_cana';
  if (!e) return errores.push(`${donde}: falta el bloque`);
  if (!e.nota?.trim()) errores.push(`${donde}: falta la nota`);
  const fracciones = e.fracciones ?? {};
  let suma = 0;
  for (const id of EDADES_CANA.ids) {
    const f = fracciones[id];
    if (typeof f !== 'number' || f < 0 || f > 1) errores.push(`${donde}: fracción de «${id}» ausente o fuera de 0 a 1`);
    else suma += f;
  }
  for (const id of Object.keys(fracciones)) if (!EDADES_CANA.ids.includes(id)) errores.push(`${donde}: edad desconocida «${id}»`);
  if (Math.abs(suma - 1) > 1e-3) errores.push(`${donde}: las fracciones suman ${suma.toFixed(3)} (deben sumar 1)`);
}

export function revisarProporciones(datos) {
  const errores = [];
  const avisos = [];
  const t = datos.territorio;
  const escalas = new Set((datos.escalas?.escalas ?? []).map((e) => e.id));
  const zonas = new Set((t?.entidades ?? []).filter((e) => e.tipo === 'zona').map((e) => e.id));
  const tipos = revisarTipos(t, escalas, errores);
  for (const s of datos.escenarios?.escenarios ?? []) revisarEscenario(s, zonas, tipos, errores, avisos);
  revisarEdades(datos.escenarios?.edades_cana, errores);
  return { errores, avisos };
}
