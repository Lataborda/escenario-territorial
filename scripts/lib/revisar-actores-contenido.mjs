// Revisión del bloque «red» de contenido/actores.json (etapa 9.a): leyenda con estilo conocido y capa existente;
// nodos con id único, tipo conocido y ancla existente o posición propuesta; siete mercados presentes en todos los
// escenarios; las cinco relaciones del plan, con pares entre nodos conocidos y sin escenarios de partida (en S0 y S1
// los mercados quedan aislados) o marcadas como pendientes; polígono con nodos a ambos lados del límite
// departamental; rótulos cortos (tres por capa como máximo) y capas usadas por alguna parada.
import { contarPalabras } from './contenido.mjs';
import { ESTILO } from '../../src/actores/estilo.js';

const MAXIMO_PALABRAS = 8; // rótulos sobre la escena y entradas de la leyenda
const MAXIMO_ROTULOS = 3; // por capa
const TIPOS = ['mercado', 'familia', 'aliado'];
const RELACIONES = ['comercio', 'conocimiento', 'garantia', 'semillas', 'gobernanza']; // PLAN, etapa 9
const SIN_RED = ['S0', 'S1']; // escenarios con los mercados aislados
const MERCADOS_DE_PARTIDA = 7;
const enPlano = (n) => typeof n === 'number' && n >= 0 && n <= 1;
const centro = (v) => (Array.isArray(v) ? (v[0] + v[1]) / 2 : v);

export function revisarActoresRed(datos) {
  const errores = [];
  const avisos = [];
  const red = datos.actores.red;
  if (!red) return { errores: ['actores.json: falta el bloque «red»'], avisos };
  const t = datos.territorio;
  const capas = new Set(t.capas.map((c) => c.id));
  const entidades = new Map(t.entidades.map((e) => [e.id, e]));
  const escenarios = new Set(datos.escenarios.escenarios.map((e) => e.id));
  const enParadas = new Set(datos.paradas.paradas.flatMap((p) => [...(p.estado?.capas ?? []), ...(p.pasos ?? []).flatMap((s) => s.estado?.capas ?? [])]));
  const zLimite = centro(t.entidades.find((e) => e.tipo === 'limite')?.z);
  const corto = (texto, donde) => {
    if (!texto?.trim()) return errores.push(`${donde}: texto vacío`);
    const n = contarPalabras(texto);
    if (n > MAXIMO_PALABRAS) errores.push(`${donde}: ${n} palabras (máximo ${MAXIMO_PALABRAS})`);
  };
  const capa = (id, donde) => {
    if (!capas.has(id)) errores.push(`${donde}: capa desconocida «${id}»`);
    else if (!enParadas.has(id)) avisos.push(`${donde}: ninguna parada enciende la capa «${id}»`);
  };
  const conocidos = (lista, donde) => {
    for (const e of lista ?? []) if (!escenarios.has(e)) errores.push(`${donde}: escenario desconocido «${e}»`);
  };
  const rotulos = (lista, donde, existe) => {
    if ((lista ?? []).length > MAXIMO_ROTULOS) errores.push(`${donde}: ${lista.length} rótulos (máximo ${MAXIMO_ROTULOS})`);
    for (const r of lista ?? []) {
      corto(r.titulo, `${donde} · ${r.id} (título)`);
      if (r.texto != null) corto(r.texto, `${donde} · ${r.id} (texto)`);
      if (!existe(r)) errores.push(`${donde} · ${r.id}: lugar del rótulo desconocido`);
      conocidos(r.escenarios, `${donde} · ${r.id}`);
      if (r.lado != null && r.lado !== 'abajo') errores.push(`${donde} · ${r.id}: lado «${r.lado}» (usar «abajo» u omitir)`);
    }
  };

  // Leyenda.
  if (!/ilustrativ/.test(red.leyenda?.nota ?? '')) errores.push('actores.json · red · leyenda: falta la nota de disposición ilustrativa');
  for (const e of red.leyenda?.entradas ?? []) {
    const donde = `actores.json · red · leyenda · ${e.id}`;
    if (!ESTILO[e.id]) errores.push(`${donde}: entrada sin estilo`);
    capa(e.capa, donde);
    corto(e.rotulo, donde);
  }

  // Nodos: posición en el plano (v) para saber de qué lado del límite departamental queda cada uno.
  const nodos = new Map();
  for (const n of red.nodos ?? []) {
    const donde = `actores.json · red · nodos · ${n.id}`;
    if (nodos.has(n.id)) errores.push(`${donde}: id repetido`);
    if (!TIPOS.includes(n.tipo) || !ESTILO[n.tipo]) errores.push(`${donde}: tipo desconocido «${n.tipo}»`);
    conocidos(n.escenarios, donde);
    let v = n.z;
    if (n.ancla) {
      const e = entidades.get(n.ancla);
      if (!e) errores.push(`${donde}: ancla desconocida «${n.ancla}»`);
      else if (n.tipo === 'mercado' && (e.escenarios ?? []).join() !== (n.escenarios ?? []).join()) errores.push(`${donde}: escenarios distintos de los de la cabecera en territorio.json`);
      v = centro(e?.ancla?.z ?? e?.z);
    } else if (!enPlano(n.x) || !enPlano(n.z)) errores.push(`${donde}: sin ancla ni posición x, z entre 0 y 1`);
    else if (n.posicion !== 'propuesta') errores.push(`${donde}: posición sin el estado «propuesta»`);
    nodos.set(n.id, { ...n, v });
  }
  const dePartida = [...nodos.values()].filter((n) => n.tipo === 'mercado' && !n.escenarios);
  if (dePartida.length !== MERCADOS_DE_PARTIDA) errores.push(`actores.json · red · nodos: ${dePartida.length} mercados en todos los escenarios (se esperan ${MERCADOS_DE_PARTIDA})`);
  if (dePartida.some((n) => n.v >= zLimite)) errores.push('actores.json · red · nodos: hay mercados de partida al sur del límite departamental');

  // Mercados.
  capa(red.mercados?.capa, 'actores.json · red · mercados');
  rotulos(red.mercados?.rotulos, 'actores.json · red · mercados', (r) => nodos.get(r.en)?.tipo === 'mercado');

  // Relaciones.
  const ids = (red.relaciones ?? []).map((r) => r.id);
  for (const id of RELACIONES) if (!ids.includes(id)) errores.push(`actores.json · red · relaciones: falta el tipo «${id}»`);
  for (const r of red.relaciones ?? []) {
    const donde = `actores.json · red · relaciones · ${r.id}`;
    if (!RELACIONES.includes(r.id)) errores.push(`${donde}: tipo de relación fuera del plan`);
    if (!capas.has(r.capa)) errores.push(`${donde}: capa desconocida «${r.capa}»`);
    if (!r.pares) {
      if (!r.pendiente) errores.push(`${donde}: sin pares y sin la marca «pendiente»`);
      continue;
    }
    capa(r.capa, donde);
    if (!ESTILO[r.id]?.linea) errores.push(`${donde}: relación sin estilo de trazo`);
    conocidos(r.escenarios, donde);
    if (!r.escenarios?.length || r.escenarios.some((e) => SIN_RED.includes(e))) errores.push(`${donde}: los enlaces no pueden existir en ${SIN_RED.join(' ni en ')}`);
    const vistos = new Set();
    for (const [a, b] of r.pares) {
      if (!nodos.has(a) || !nodos.has(b) || a === b) errores.push(`${donde}: enlace inválido ${a} y ${b}`);
      const clave = [a, b].sort().join();
      if (vistos.has(clave)) errores.push(`${donde}: enlace repetido ${a} y ${b}`);
      vistos.add(clave);
    }
    rotulos(r.rotulos, donde, (x) => nodos.has(x.en));
  }

  // Polígono: en cada escenario en que existe, nodos de sus tipos a ambos lados del límite departamental.
  const p = red.poligono ?? {};
  capa(p.capa, 'actores.json · red · poligono');
  conocidos(p.escenarios, 'actores.json · red · poligono');
  if (!(p.margen > 0)) errores.push('actores.json · red · poligono: margen no positivo');
  for (const x of p.tipos ?? []) if (!TIPOS.includes(x)) errores.push(`actores.json · red · poligono: tipo desconocido «${x}»`);
  for (const e of p.escenarios ?? []) {
    if (SIN_RED.includes(e)) errores.push(`actores.json · red · poligono: no puede existir en ${e}`);
    const lista = [...nodos.values()].filter((n) => (p.tipos ?? []).includes(n.tipo) && (!n.escenarios || n.escenarios.includes(e)));
    if (!lista.some((n) => n.v < zLimite) || !lista.some((n) => n.v > zLimite)) errores.push(`actores.json · red · poligono: en ${e} los nodos no quedan a ambos lados del límite departamental`);
  }
  rotulos(p.rotulos, 'actores.json · red · poligono', (r) => r.en === 'cruce' && ['oriente', 'occidente'].includes(r.extremo));

  // Límites administrativos.
  capa(red.limites?.capa, 'actores.json · red · limites');
  rotulos(red.limites?.rotulos, 'actores.json · red · limites', (r) => enPlano(r.x) && enPlano(r.z) && r.posicion === 'propuesta');
  if (!red.estado_texto) errores.push('actores.json · red: falta estado_texto');
  return { errores, avisos };
}
