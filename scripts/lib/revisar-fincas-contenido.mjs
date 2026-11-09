// Revisión de contenido/fincas.json y contenido/eap.json. Fincas: una receta por finca de territorio.json, usos
// admitidos en los lotes, áreas o pesos positivos, ubicaciones conocidas, fracciones de conectores y fuentes de las
// proporciones. EAP: ver revisarEap.
import { TIPOS_POR_CLASE } from '../../src/coberturas/tipos.js';

const UBICACIONES = ['cauce', 'casa'];
const PROPORCIONES = ['fuente', 'ilustrativas'];
const CAPAS = ['lindero', 'conectores_internos', 'conectores_externos', 'eep', 'conexion_eep', 'agroecosistema_menor', 'agroecosistema_mayor'];
const enRango = (n) => typeof n === 'number' && n >= 0 && n <= 1;

function revisarLote(l, donde, errores) {
  if (!TIPOS_POR_CLASE.lotes.includes(l.uso)) errores.push(`${donde}: uso «${l.uso}» no admitido en un lote`);
  if (!l.rotulo?.trim()) errores.push(`${donde}: falta el rótulo`);
  const medida = l.ha ?? l.peso;
  if (!(medida > 0)) errores.push(`${donde}: falta un área (ha) o un peso positivo`);
  if (l.ha != null && l.peso != null) errores.push(`${donde}: área y peso a la vez`);
  if (l.ubicacion != null && !UBICACIONES.includes(l.ubicacion)) errores.push(`${donde}: ubicación «${l.ubicacion}» (usar ${UBICACIONES.join(' o ')})`);
  if (l.divisiones != null && !(Number.isInteger(l.divisiones) && l.divisiones >= 1 && l.divisiones <= 8)) {
    errores.push(`${donde}: divisiones fuera de 1 a 8`);
  }
}

export function revisarFincas(datos) {
  const errores = [];
  const avisos = [];
  const f = datos.fincas;
  if (!f) return { errores: ['fincas.json: falta el archivo'], avisos };
  const entidades = (datos.territorio?.entidades ?? []).filter((e) => e.tipo === 'finca').map((e) => e.id);
  const recetas = new Set();
  for (const capa of CAPAS) if (!f.capas?.[capa]?.rotulo?.trim()) errores.push(`fincas.json · capas: falta el rótulo de «${capa}»`);
  for (const x of f.fincas ?? []) {
    const donde = `fincas.json · ${x.id}`;
    if (recetas.has(x.id)) errores.push(`${donde}: receta repetida`);
    recetas.add(x.id);
    if (!entidades.includes(x.id)) errores.push(`${donde}: sin entidad de tipo finca en territorio.json`);
    if (!x.nombre?.trim()) errores.push(`${donde}: falta el nombre`);
    const [ancho, fondo] = x.tamano ?? [];
    if (!(Number.isInteger(ancho) && Number.isInteger(fondo) && ancho >= 4 && fondo >= 4 && ancho <= 30 && fondo <= 30)) {
      errores.push(`${donde}: tamaño fuera de 4 a 30 teselas por lado`);
    }
    if (!x.lotes?.length) errores.push(`${donde}: sin lotes`);
    const conArea = (x.lotes ?? []).filter((l) => l.ha != null).length;
    if (conArea && conArea !== x.lotes.length) errores.push(`${donde}: lotes con área y lotes con peso mezclados`);
    (x.lotes ?? []).forEach((l, i) => revisarLote(l, `${donde} · lote ${i + 1}`, errores));
    if (!enRango(x.conectores?.internos) || !enRango(x.conectores?.externos)) errores.push(`${donde}: conectores internos y externos entre 0 y 1`);
    if (!PROPORCIONES.includes(x.proporciones)) errores.push(`${donde}: proporciones «${x.proporciones}» (usar ${PROPORCIONES.join(' o ')})`);
    if (x.proporciones === 'fuente' && !(conArea && x.fuentes?.length)) errores.push(`${donde}: proporciones con fuente sin áreas o sin fuentes`);
    if (!['borrador', 'revisado'].includes(x.estado_texto)) errores.push(`${donde}: falta estado_texto`);
  }
  for (const id of entidades) if (!recetas.has(id)) errores.push(`fincas.json: falta la receta de «${id}»`);
  return { errores, avisos };
}

// contenido/eap.json: diez criterios con sigla y nombres, fincas de territorio.json, un valor entero por criterio y
// finca dentro de la escala, rótulo de valores ilustrativos y fuentes.
export function revisarEap(datos) {
  const errores = [];
  const e = datos.eap;
  if (!e) return { errores: ['eap.json: falta el archivo'], avisos: [] };
  const fincas = new Set((datos.territorio?.entidades ?? []).filter((x) => x.tipo === 'finca').map((x) => x.id));
  const { minimo, maximo, total } = e.escala ?? {};
  if (!(Number.isInteger(minimo) && Number.isInteger(maximo) && minimo < maximo)) errores.push('eap.json: escala sin mínimo y máximo enteros');
  const ids = (e.criterios ?? []).map((c) => c.id);
  if (ids.length !== 10 || new Set(ids).size !== 10) errores.push(`eap.json: ${ids.length} criterios distintos (se esperan diez)`);
  if (total !== maximo * ids.length) errores.push('eap.json: el total no es la suma de los máximos de los criterios');
  const grupos = new Set((e.grupos ?? []).map((g) => g.id));
  for (const g of e.grupos ?? []) if (!g.rotulo?.trim()) errores.push(`eap.json · grupo ${g.id}: falta el rótulo`);
  for (const c of e.criterios ?? []) {
    if (!c.sigla?.trim() || !c.corto?.trim() || !c.nombre?.trim()) errores.push(`eap.json · ${c.id}: falta sigla, rótulo corto o nombre`);
    if (grupos.size && !grupos.has(c.grupo)) errores.push(`eap.json · ${c.id}: grupo «${c.grupo}» sin entrada en grupos`);
  }
  // Con grupos, los criterios van en el orden de sus grupos (el panel los muestra así).
  const orden = (e.criterios ?? []).map((c) => [...grupos].indexOf(c.grupo));
  if (grupos.size && orden.some((g, k) => k && g < orden[k - 1])) errores.push('eap.json: criterios fuera del orden de sus grupos');
  for (const id of e.fincas ?? []) {
    if (!fincas.has(id)) errores.push(`eap.json: finca «${id}» sin entidad de tipo finca`);
    for (const c of ids) {
      const v = e.valores?.[id]?.[c];
      if (!(Number.isInteger(v) && v >= minimo && v <= maximo)) errores.push(`eap.json · ${id}.${c}: valor fuera de la escala`);
    }
  }
  if (!e.valores_rotulo?.trim()) errores.push('eap.json: falta el rótulo de los valores (GUION, precaución 8)');
  if (!e.fuentes?.length) errores.push('eap.json: sin fuentes');
  return { errores, avisos: [] };
}
