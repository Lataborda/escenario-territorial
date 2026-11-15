// Revisión de contenido/procesos.json (etapas 8.a y 8.b): leyenda con flujo de estilo conocido y capa existente; radios
// desde parches de hábitat y prácticas de conservación en una finca de ladera; clases de
// escorrentía que reparten todos los tipos de cobertura; orígenes de nutrientes, custodios y enlaces de semillas con
// ancla existente o posición propuesta dentro del plano; rótulos cortos (tres por capa como máximo) y capas usadas
// por alguna parada.
import { contarPalabras } from './contenido.mjs';
import { ESTILO } from '../../src/flujos/estilo.js';

const MAXIMO_PALABRAS = 8; // rótulos sobre la escena y entradas de la leyenda
const MAXIMO_ROTULOS = 3; // por capa
const enPlano = (n) => typeof n === 'number' && n >= 0 && n <= 1;

function corto(texto, donde, errores) {
  if (!texto?.trim()) return errores.push(`${donde}: texto vacío`);
  const n = contarPalabras(texto);
  if (n > MAXIMO_PALABRAS) errores.push(`${donde}: ${n} palabras (máximo ${MAXIMO_PALABRAS})`);
}

// Un lugar es un ancla de territorio.json o una posición propuesta en coordenadas del plano.
function lugar(o, donde, entidades, errores) {
  if (o.ancla) {
    if (!entidades.has(o.ancla)) errores.push(`${donde}: ancla desconocida «${o.ancla}»`);
  } else if (!enPlano(o.x) || !enPlano(o.z)) errores.push(`${donde}: sin ancla ni posición x, z entre 0 y 1`);
  else if (o.posicion !== 'propuesta') errores.push(`${donde}: posición sin el estado «propuesta»`);
}

function rotulos(lista, donde, escenarios, errores, existe) {
  if ((lista ?? []).length > MAXIMO_ROTULOS) errores.push(`${donde}: ${lista.length} rótulos (máximo ${MAXIMO_ROTULOS})`);
  for (const r of lista ?? []) {
    corto(r.titulo, `${donde} · ${r.id} (título)`, errores);
    if (r.texto != null) corto(r.texto, `${donde} · ${r.id} (texto)`, errores);
    if (!existe(r)) errores.push(`${donde} · ${r.id}: lugar del rótulo desconocido`);
    for (const e of r.escenarios ?? []) if (!escenarios.has(e)) errores.push(`${donde} · ${r.id}: escenario desconocido «${e}»`);
    if (r.lado != null && r.lado !== 'abajo') errores.push(`${donde} · ${r.id}: lado «${r.lado}» (usar «abajo» u omitir)`);
  }
}

// Radios (etapa 8.b): ancla del centro, coberturas de hábitat conocidas y una clase por capa, con radio positivo,
// estilo, entrada en la leyenda, nota de radios ilustrativos y rótulos en un lugar conocido.
const LUGARES_RADIO = ['parche', 'radio', 'superposicion', 'corredor'];
function revisarRadios(p, { capas, entidades, escenarios, tipos, enParadas }, errores, avisos) {
  const r = p.radios;
  const donde = 'procesos.json · radios';
  if (!r) return errores.push(`${donde}: falta la sección`);
  if (!entidades.has(r.centro)) errores.push(`${donde}: centro desconocido «${r.centro}»`);
  for (const t of r.coberturas ?? []) if (!tipos.includes(t)) errores.push(`${donde}: tipo de cobertura desconocido «${t}»`);
  if (!(r.coberturas ?? []).length) errores.push(`${donde}: sin coberturas de hábitat`);
  for (const n of ['alcance', 'minimo_teselas', 'maximo']) if (!(r[n] > 0)) errores.push(`${donde}: «${n}» debe ser positivo`);
  if (!r.fuentes?.length) errores.push(`${donde}: sin fuentes`);
  for (const c of r.clases ?? []) {
    const aqui = `${donde} · ${c.id}`;
    if (!ESTILO[c.id]?.linea || ESTILO[c.id]?.relleno == null) errores.push(`${aqui}: clase sin estilo de trazo y relleno`);
    if (!capas.has(c.capa)) errores.push(`${aqui}: capa desconocida «${c.capa}»`);
    else if (!enParadas.has(c.capa)) avisos.push(`${aqui}: ninguna parada enciende la capa «${c.capa}»`);
    if (!(c.radio > 0)) errores.push(`${aqui}: «radio» debe ser positivo`);
    if (!['rayos', 'lazos'].includes(c.forma)) errores.push(`${aqui}: forma «${c.forma}» (usar «rayos» o «lazos»)`);
    if (!(p.leyenda?.entradas ?? []).some((f) => f.capa === c.capa)) errores.push(`${aqui}: capa sin entrada en la leyenda`);
    if (!/ilustrativ/.test(p.leyenda?.notas?.[c.capa] ?? '')) errores.push(`${aqui}: falta la nota de radios ilustrativos en la leyenda`);
    rotulos(c.rotulos, aqui, escenarios, errores, (x) => LUGARES_RADIO.includes(x.en) && (x.en !== 'corredor' || c.corredor));
  }
  if ((r.clases ?? []).length < 2) errores.push(`${donde}: se esperan dos clases (enemigos naturales y polinizadores)`);
}

// Prácticas de conservación (etapa 8.b): finca tipo existente, usos presentes en sus lotes, estilo de cada práctica
// y rótulos sobre una práctica conocida.
function revisarPracticas(p, { escenarios, fincas }, errores) {
  const c = p.practicas;
  const donde = 'procesos.json · practicas';
  if (!c) return;
  const finca = fincas.find((f) => f.id === c.finca);
  if (!finca) return errores.push(`${donde}: finca desconocida «${c.finca}»`);
  if (!(c.intervalo > 0)) errores.push(`${donde}: «intervalo» debe ser positivo`);
  const usos = new Set(finca.lotes.map((l) => l.uso));
  const ids = new Set();
  for (const x of c.practicas ?? []) {
    ids.add(x.id);
    if (!ESTILO[x.id]?.linea) errores.push(`${donde} · ${x.id}: práctica sin estilo de trazo`);
    for (const u of x.usos ?? []) if (!usos.has(u)) errores.push(`${donde} · ${x.id}: la finca ${c.finca} no tiene lotes de «${u}»`);
    if (!(x.usos ?? []).length) errores.push(`${donde} · ${x.id}: sin usos`);
    if (x.cada != null && !(Number.isInteger(x.cada) && x.cada > 1)) errores.push(`${donde} · ${x.id}: «cada» debe ser un entero mayor que 1`);
    if (!(p.leyenda?.entradas ?? []).some((f) => f.id === x.id)) errores.push(`${donde} · ${x.id}: práctica sin entrada en la leyenda`);
  }
  if (!ids.has(c.infiltracion?.en) || !ESTILO[c.infiltracion.en]?.forma) errores.push(`${donde}: la infiltración debe apoyarse en una práctica con puntos`);
  if (!/ilustrativ/.test(p.leyenda?.notas?.[c.capa] ?? '')) errores.push(`${donde}: falta la nota de disposición ilustrativa en la leyenda`);
  rotulos(c.rotulos, donde, escenarios, errores, (x) => ids.has(x.en) && (x.extremo == null || ['norte', 'sur', 'oriente', 'occidente'].includes(x.extremo)));
}

export function revisarProcesos(datos) {
  const errores = [];
  const avisos = [];
  const p = datos.procesos;
  if (!p) return { errores: ['procesos.json: no se pudo leer'], avisos };
  const capas = new Set(datos.territorio.capas.map((c) => c.id));
  const entidades = new Set(datos.territorio.entidades.map((e) => e.id));
  const escenarios = new Set(datos.escenarios.escenarios.map((e) => e.id));
  const tipos = datos.territorio.coberturas.tipos.map((t) => t.id);
  const zonas = new Set(datos.territorio.entidades.filter((e) => e.tipo === 'zona').map((e) => e.id));
  const enParadas = new Set(datos.paradas.paradas.flatMap((x) => [x.estado?.capas ?? [], ...(x.pasos ?? []).map((s) => s.estado?.capas ?? [])].flat()));

  corto(p.leyenda?.titulo, 'procesos.json · leyenda (título)', errores);
  for (const f of p.leyenda?.entradas ?? []) {
    const donde = `procesos.json · leyenda · ${f.id}`;
    if (!ESTILO[f.id]) errores.push(`${donde}: flujo sin estilo en src/flujos/estilo.js`);
    if (!capas.has(f.capa)) errores.push(`${donde}: capa desconocida «${f.capa}»`);
    corto(f.rotulo, donde, errores);
    for (const e of f.escenarios ?? []) if (!escenarios.has(e)) errores.push(`${donde}: escenario desconocido «${e}»`);
  }
  for (const seccion of ['escorrentia', 'practicas', 'nutrientes', 'semillas']) {
    const s = p[seccion];
    const donde = `procesos.json · ${seccion}`;
    if (!s) {
      errores.push(`${donde}: falta la sección`);
      continue;
    }
    if (!capas.has(s.capa)) errores.push(`${donde}: capa desconocida «${s.capa}»`);
    else if (!enParadas.has(s.capa)) avisos.push(`${donde}: ninguna parada enciende la capa «${s.capa}»`);
    if (!s.fuentes?.length) errores.push(`${donde}: sin fuentes`);
    if (!(p.leyenda?.entradas ?? []).some((f) => f.capa === s.capa)) errores.push(`${donde}: capa sin entrada en la leyenda`);
  }

  // Escorrentía: cada tipo de cobertura en una sola clase o entre los tipos sin punto de origen.
  const e = p.escorrentia ?? {};
  const clases = e.clases ?? [];
  for (const c of clases) {
    if (!ESTILO[c.id]) errores.push(`procesos.json · escorrentia · ${c.id}: clase sin estilo`);
    corto(c.rotulo, `procesos.json · escorrentia · ${c.id}`, errores);
  }
  for (const t of tipos) {
    const veces = clases.filter((c) => (c.coberturas ?? []).includes(t)).length + ((e.sin_origen ?? []).includes(t) ? 1 : 0);
    if (veces !== 1) errores.push(`procesos.json · escorrentia: el tipo «${t}» aparece ${veces} veces (debe estar en una clase o en sin_origen)`);
  }
  for (const t of [...clases.flatMap((c) => c.coberturas ?? []), ...(e.sin_origen ?? [])]) {
    if (!tipos.includes(t)) errores.push(`procesos.json · escorrentia: tipo de cobertura desconocido «${t}»`);
  }
  for (const z of e.zonas ?? []) if (!zonas.has(z)) errores.push(`procesos.json · escorrentia: zona desconocida «${z}»`);
  if (!Number.isInteger(e.rutas) || e.rutas < 1) errores.push('procesos.json · escorrentia: «rutas» debe ser un entero positivo');

  // Nutrientes: destino y orígenes.
  const n = p.nutrientes ?? {};
  if (!entidades.has(n.destino)) errores.push(`procesos.json · nutrientes: destino desconocido «${n.destino}»`);
  for (const o of n.origenes ?? []) lugar(o, `procesos.json · nutrientes · ${o.id}`, entidades, errores);
  for (const id of n.retorno?.escenarios ?? []) if (!escenarios.has(id)) errores.push(`procesos.json · nutrientes: escenario de retorno desconocido «${id}»`);
  rotulos(n.rotulos, 'procesos.json · nutrientes', escenarios, errores, (r) => entidades.has(r.ancla));

  // Semillas: custodios con id único y enlaces entre custodios, sin repetir.
  const s = p.semillas ?? {};
  const custodios = new Set();
  for (const c of s.custodios ?? []) {
    if (custodios.has(c.id)) errores.push(`procesos.json · semillas: custodio repetido «${c.id}»`);
    custodios.add(c.id);
    lugar(c, `procesos.json · semillas · ${c.id}`, entidades, errores);
    if (!c.grupo) errores.push(`procesos.json · semillas · ${c.id}: sin grupo`);
  }
  const vistos = new Set();
  for (const [a, b] of s.enlaces ?? []) {
    if (!custodios.has(a) || !custodios.has(b) || a === b) errores.push(`procesos.json · semillas: enlace inválido ${a} y ${b}`);
    const clave = [a, b].sort().join();
    if (vistos.has(clave)) errores.push(`procesos.json · semillas: enlace repetido ${a} y ${b}`);
    vistos.add(clave);
  }
  rotulos(s.rotulos, 'procesos.json · semillas', escenarios, errores, (r) => custodios.has(r.en));
  revisarRadios(p, { capas, entidades, escenarios, tipos, enParadas }, errores, avisos);
  revisarPracticas(p, { escenarios, usos: new Set(datos.fincas.fincas.flatMap((f) => f.lotes.map((l) => l.uso))), fincas: datos.fincas.fincas }, errores);
  if (!p.estado_texto) errores.push('procesos.json: falta estado_texto');
  return { errores, avisos };
}
