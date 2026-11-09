// Revisión de contenido/lote.json (etapa 7): especies con forma conocida, lotes con medidas en teselas, franjas,
// niveles de organización iguales a los pasos de P03 y con capa existente, interacciones con especie presente en su
// lote y con fuente, horizontes del corte que suman 1, biota, rótulo de cierre y materia orgánica con fuente.
import { contarPalabras } from './contenido.mjs';

const FORMAS = ['cafeto', 'platano', 'guamo', 'maiz', 'frijol', 'cana'];
const LOTES = ['policultivo', 'monocultivo'];
const EN = ['planta', 'policultivo', 'monocultivo', 'lotes'];
const LADO = 6;
const MAXIMO_PALABRAS = 12; // rótulos sobre la escena
const enRango = (n) => typeof n === 'number' && n >= 0 && n <= 1;
const positivo = (n) => typeof n === 'number' && n > 0;

function corto(texto, donde, errores) {
  if (!texto?.trim()) return errores.push(`${donde}: texto vacío`);
  const n = contarPalabras(texto);
  if (n > MAXIMO_PALABRAS) errores.push(`${donde}: ${n} palabras (máximo ${MAXIMO_PALABRAS} en un rótulo)`);
}

// Especies de un lote: las de sus franjas o su lista propia.
export function especiesDeLote(lote) {
  const listas = lote.franjas ? lote.franjas.flatMap((f) => f.especies ?? []) : lote.especies ?? [];
  return listas.map((e) => e.especie);
}

function revisarLotes(l, especies, errores) {
  for (const id of LOTES) {
    const lote = l.lotes?.[id];
    const donde = `lote.json · lotes.${id}`;
    if (!lote) {
      errores.push(`${donde}: falta`);
      continue;
    }
    if (!lote.rotulo?.trim()) errores.push(`${donde}: falta el rótulo`);
    for (const k of ['ancho', 'fondo']) {
      if (!(positivo(lote[k]) && lote[k] % LADO === 0 && lote[k] <= 60)) errores.push(`${donde}: ${k} no es múltiplo de ${LADO} entre ${LADO} y 60`);
    }
    const listas = lote.franjas ? lote.franjas.map((f) => f.especies ?? []) : [lote.especies ?? []];
    if (lote.franjas) {
      const fijas = lote.franjas.slice(0, -1);
      if (fijas.some((f) => !positivo(f.ancho))) errores.push(`${donde}: franja sin ancho (solo la última ocupa el resto)`);
      if (fijas.reduce((s, f) => s + (f.ancho ?? 0), 0) >= lote.ancho) errores.push(`${donde}: las franjas no dejan lugar a la última`);
    }
    for (const lista of listas) {
      const propias = lista.map((e) => e.especie);
      for (const e of lista) {
        if (!FORMAS.includes(e.especie) || !especies[e.especie]) errores.push(`${donde}: especie «${e.especie}» sin forma o sin nombre`);
        if (e.sobre) {
          if (!propias.includes(e.sobre)) errores.push(`${donde}: «${e.especie}» sobre «${e.sobre}», ausente en la franja`);
          if (!enRango(e.fraccion)) errores.push(`${donde}: fracción de «${e.especie}» fuera de 0 a 1`);
        } else if (!(Array.isArray(e.separacion) && e.separacion.length === 2 && e.separacion.every((v) => v >= 0.8 && v <= 20))) {
          errores.push(`${donde}: separación de «${e.especie}» fuera de 0,8 a 20`);
        }
      }
    }
  }
}

function revisarNiveles(l, datos, capas, errores) {
  const p03 = datos.paradas?.paradas?.find((p) => p.id === 'P03');
  const pasos = (p03?.pasos ?? []).map((x) => x.id);
  const niveles = (l.niveles ?? []).map((n) => n.id);
  if (pasos.join() !== niveles.join()) errores.push(`lote.json · niveles: ${niveles.join(', ')} frente a los pasos de P03 (${pasos.join(', ')})`);
  for (const n of l.niveles ?? []) {
    const donde = `lote.json · niveles.${n.id}`;
    if (!capas.has(n.capa)) errores.push(`${donde}: capa «${n.capa}» sin entrada en territorio.json`);
    const k = pasos.indexOf(n.id);
    const capasPaso = p03?.pasos?.[k]?.estado?.capas ?? p03?.estado?.capas ?? [];
    if (k >= 0 && !capasPaso.includes(n.capa)) errores.push(`${donde}: el paso de P03 no enciende la capa «${n.capa}»`);
    if (!n.resalta?.especies?.length) errores.push(`${donde}: sin especies resaltadas`);
    for (const r of n.rotulos ?? []) {
      if (!EN.includes(r.en)) errores.push(`${donde}: rótulo en «${r.en}» (usar ${EN.join(', ')})`);
      if (!r.titulo?.trim()) errores.push(`${donde}: rótulo sin título`);
      corto(r.texto, donde, errores);
    }
    if (!n.rotulos?.length) errores.push(`${donde}: sin rótulos`);
  }
  if (!l.niveles_fuentes?.length) errores.push('lote.json · niveles: sin fuentes');
}

function revisarInteracciones(l, capas, errores) {
  if (!capas.has('interacciones')) errores.push('lote.json: falta la capa «interacciones» en territorio.json');
  const ids = new Set();
  for (const x of l.interacciones ?? []) {
    const donde = `lote.json · interacciones.${x.id}`;
    if (ids.has(x.id)) errores.push(`${donde}: repetida`);
    ids.add(x.id);
    if (!x.rotulo?.trim()) errores.push(`${donde}: falta el rótulo`);
    corto(x.texto, donde, errores);
    if (!LOTES.includes(x.lote)) errores.push(`${donde}: lote «${x.lote}»`);
    else if (!especiesDeLote(l.lotes[x.lote]).includes(x.en)) errores.push(`${donde}: «${x.en}» no crece en el ${x.lote}`);
    if (!(Array.isArray(x.lugar) && x.lugar.length === 2 && x.lugar.every(enRango))) errores.push(`${donde}: lugar fuera de 0 a 1`);
    if (!x.fuentes?.length) errores.push(`${donde}: sin fuentes`);
  }
  if (ids.size < 6) errores.push(`lote.json: ${ids.size} interacciones (PLAN, etapa 7: seis)`);
}

function revisarSuelo(s, errores) {
  if (!s) return errores.push('lote.json: falta «suelo»');
  const donde = 'lote.json · suelo';
  const m = s.medidas ?? {};
  if (!['ancho', 'fondo', 'alto', 'separacion'].every((k) => positivo(m[k])) || typeof m.frente !== 'number') errores.push(`${donde}: medidas incompletas`);
  const suma = (s.horizontes ?? []).reduce((t, h) => t + (h.fraccion ?? 0), 0);
  if (Math.abs(suma - 1) > 1e-6) errores.push(`${donde}: fracciones de los horizontes suman ${suma}`);
  for (const h of s.horizontes ?? []) if (!h.rotulo?.trim() || !positivo(h.fraccion)) errores.push(`${donde} · ${h.id}: rótulo o fracción`);
  for (const b of s.biota ?? []) {
    if (!b.rotulo?.trim()) errores.push(`${donde} · ${b.id}: falta el rótulo`);
    corto(b.texto, `${donde} · ${b.id}`, errores);
  }
  const biota = (s.biota ?? []).map((b) => b.id).sort().join();
  if (biota !== 'hifas,macrofauna,materia,raices') errores.push(`${donde}: biota «${biota}» (raíces, hifas, macrofauna y materia orgánica)`);
  if (!s.cierre?.titulo?.trim()) errores.push(`${donde}: falta el rótulo de cierre (GUION, sección 4)`);
  corto(s.cierre?.texto, `${donde} · cierre`, errores);
  if (!s.fuentes?.length) errores.push(`${donde}: sin fuentes`);
}

function revisarMateria(mo, errores) {
  const donde = 'lote.json · materia_organica';
  if (!mo) return errores.push(`${donde}: falta`);
  if (!mo.titulo?.trim() || !positivo(mo.maximo)) errores.push(`${donde}: título o máximo`);
  for (const f of mo.filas ?? []) {
    const desde = f.desde ?? 0;
    if (!(typeof f.hasta === 'number' && desde >= 0 && f.hasta >= desde && f.hasta <= mo.maximo)) errores.push(`${donde} · ${f.id}: valores fuera de 0 al máximo`);
    if (!f.rotulo?.trim() || !f.texto?.trim()) errores.push(`${donde} · ${f.id}: rótulo o texto`);
  }
  if ((mo.filas ?? []).length < 2) errores.push(`${donde}: se esperan dos filas (caña y bosque)`);
  if (!mo.fuentes?.length) errores.push(`${donde}: sin fuentes`);
}

export function revisarLote(datos) {
  const errores = [];
  const l = datos.lote;
  if (!l) return { errores: ['lote.json: falta el archivo'], avisos: [] };
  const capas = new Set((datos.territorio?.capas ?? []).map((c) => c.id));
  const entidades = new Map((datos.territorio?.entidades ?? []).map((e) => [e.id, e]));
  for (const id of ['lote', 'organismo', 'corte_suelo']) if (!entidades.has(id)) errores.push(`lote.json: falta la entidad «${id}» en territorio.json`);
  const p07 = datos.paradas?.paradas?.find((p) => p.id === 'P07');
  const giro = Math.abs(((((p07?.camara?.azimut ?? 0) - (l.suelo?.medidas?.frente ?? 0)) % 360) + 540) % 360 - 180);
  if (p07?.camara?.ancla === 'corte_suelo' && giro > 35) errores.push(`lote.json · suelo: la cara del corte mira a ${giro}° de la cámara de P07`);
  const corte = entidades.get('corte_suelo');
  const m = l.suelo?.medidas;
  if (corte && m && Math.abs((corte.alto ?? 0) - (m.separacion + m.alto / 2)) > 0.6) {
    errores.push('lote.json · suelo: el alto del ancla «corte_suelo» no coincide con el centro del corte (separación más medio alto)');
  }
  for (const [id, e] of Object.entries(l.especies ?? {})) if (!e.nombre?.trim() || !e.plural?.trim()) errores.push(`lote.json · especies.${id}: nombre o plural`);
  revisarLotes(l, l.especies ?? {}, errores);
  revisarNiveles(l, datos, capas, errores);
  revisarInteracciones(l, capas, errores);
  revisarSuelo(l.suelo, errores);
  revisarMateria(l.materia_organica, errores);
  if (!['borrador', 'revisado'].includes(l.estado_texto)) errores.push('lote.json: falta estado_texto');
  return { errores, avisos: [] };
}
