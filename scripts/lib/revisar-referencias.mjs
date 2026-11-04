// Revisión de estructura y referencias cruzadas entre los archivos de contenido.
const MODOS = ['recorrido', 'libre', 'actividad', 'autor'];
const ESTADOS_FUENTE = ['en carpeta', 'falta', 'verificar'];
const CAMPOS_PARADA = ['id', 'momento', 'minutos', 'saltable', 'titulo', 'escala', 'camara', 'estado', 'ficha', 'notas', 'fuentes', 'estado_texto'];
const CAMPOS_CAMARA = ['distancia', 'azimut', 'elevacion', 'duracion'];

// Reúne los ids de una lista y señala ausentes o repetidos.
function ids(lista, donde, errores) {
  const vistos = new Set();
  if (!Array.isArray(lista)) {
    errores.push(`${donde}: falta la lista`);
    return vistos;
  }
  for (const e of lista) {
    if (typeof e?.id !== 'string' || !e.id) errores.push(`${donde}: elemento sin id`);
    else if (vistos.has(e.id)) errores.push(`${donde}: id repetido «${e.id}»`);
    else vistos.add(e.id);
  }
  return vistos;
}

function requeridos(objeto, campos, donde, errores) {
  for (const c of campos) {
    if (objeto?.[c] === undefined || objeto[c] === '') errores.push(`${donde}: falta «${c}»`);
  }
}

// Cada valor de la lista debe existir en el conjunto.
function existen(valores, conjunto, donde, que, errores) {
  for (const v of [valores ?? []].flat()) {
    if (!conjunto.has(v)) errores.push(`${donde}: ${que} «${v}» inexistente`);
  }
}

const enRango = (n) => typeof n === 'number' && n >= 0 && n <= 1;
const coordenada = (v) => enRango(v) || (Array.isArray(v) && v.length === 2 && v.every(enRango) && v[0] <= v[1]);

// Expresión { todas, alguna, ninguna } sobre condiciones.
function revisarExpresion(expresion, condiciones, donde, errores, vacia = false) {
  const partes = ['todas', 'alguna', 'ninguna'].filter((k) => expresion?.[k]);
  if (!vacia && !partes.length) errores.push(`${donde}: expresión vacía`);
  for (const k of partes) existen(expresion[k], condiciones, `${donde}.${k}`, 'condición', errores);
}

function revisarTerritorio(t, c, errores) {
  for (const e of t.entidades ?? []) {
    const donde = `territorio.json · ${e.id}`;
    requeridos(e, ['id', 'nombre', 'tipo', 'x', 'z'], donde, errores);
    if (!coordenada(e.x) || !coordenada(e.z)) errores.push(`${donde}: coordenadas fuera de 0 a 1`);
    if (e.ancla && !(enRango(e.ancla.x) && enRango(e.ancla.z))) errores.push(`${donde}: ancla fuera de 0 a 1`);
    if (e.escenarios) existen(e.escenarios, c.escenarios, donde, 'escenario', errores);
  }
}

function revisarEscalas(e, c, errores) {
  const numeros = new Set((e.principios?.lista ?? []).map((p) => p.numero));
  for (const s of e.escalas ?? []) {
    const donde = `escalas.json · ${s.id}`;
    requeridos(s, ['id', 'numero', 'nombre', 'rotulo', 'unidad', 'vista', 'fuentes'], donde, errores);
    if (!(s.vista?.distancia > 0) || typeof s.vista?.elevacion !== 'number') errores.push(`${donde}: vista incompleta`);
    existen(s.principios, numeros, donde, 'principio', errores);
  }
  for (const p of e.procesos ?? []) existen(p.escala_minima, c.escalas, `escalas.json · ${p.id}`, 'escala', errores);
}

function revisarEscenarios(e, c, errores) {
  for (const s of e.escenarios ?? []) {
    requeridos(s, ['id', 'nombre', 'ficha', 'fuentes', 'estado_texto'], `escenarios.json · ${s.id}`, errores);
    existen(s.uso, c.momentos, `escenarios.json · ${s.id}`, 'momento', errores);
  }
}

function revisarCondiciones(d, c, errores) {
  for (const k of d.condiciones ?? []) {
    const donde = `condiciones.json · ${k.id}`;
    requeridos(k, ['id', 'nombre', 'fuentes', 'efectos', 'mensaje_si_falta', 'estado_texto'], donde, errores);
    existen(k.efectos, c.efectos, donde, 'efecto', errores);
    revisarExpresion(k.efecto_territorial_requiere, c.condiciones, `${donde}.efecto_territorial_requiere`, errores, true);
  }
  for (const v of d.reglas ?? []) {
    const donde = `condiciones.json · ${v.id}`;
    revisarExpresion(v.si, c.condiciones, `${donde}.si`, errores);
    existen(v.efectos, c.efectos, donde, 'efecto', errores);
    if (v.escenario) existen(v.escenario, c.escenarios, donde, 'escenario', errores);
  }
  for (const r of d.resultados?.intermedios ?? []) {
    existen(r.condiciones, c.condiciones, `condiciones.json · ${r.id}`, 'condición', errores);
    existen(r.supuestos, c.supuestos, `condiciones.json · ${r.id}`, 'supuesto', errores);
  }
}

function revisarActores(a, c, errores) {
  for (const x of a.actores ?? []) {
    const donde = `actores.json · ${x.id}`;
    requeridos(x, ['id', 'nombre', 'escalas', 'papel', 'anclas'], donde, errores);
    existen(x.escalas, c.escalas, donde, 'escala', errores);
    existen(x.anclas, c.entidades, donde, 'ancla', errores);
  }
}

// Estado de una parada o de un paso (en un paso, todos los campos son opcionales).
function revisarEstado(estado, c, donde, errores) {
  if (!estado || typeof estado !== 'object') return errores.push(`${donde}: falta «estado»`);
  if (estado.escenario != null) existen(estado.escenario, c.escenarios, donde, 'escenario', errores);
  if (estado.lente != null) existen(estado.lente, c.lentes, donde, 'lente', errores);
  if (estado.anio != null) existen(estado.anio, c.anios, donde, 'año', errores);
  if (estado.capas) existen(estado.capas, c.capas, donde, 'capa', errores);
  if (estado.condiciones) existen(estado.condiciones, c.condiciones, donde, 'condición', errores);
  if (estado.modo != null && !MODOS.includes(estado.modo)) errores.push(`${donde}: modo desconocido «${estado.modo}»`);
}

function revisarParadas(p, c, errores, avisos) {
  const minutos = Object.fromEntries((p.momentos ?? []).map((m) => [m.id, 0]));
  for (const x of p.paradas ?? []) {
    const donde = `paradas.json · ${x.id}`;
    requeridos(x, CAMPOS_PARADA, donde, errores);
    if (!/^P\d{2}$/.test(x.id ?? '')) errores.push(`${donde}: id con formato distinto de P00`);
    if (!(x.minutos > 0)) errores.push(`${donde}: minutos no positivos`);
    if (typeof x.saltable !== 'boolean') errores.push(`${donde}: «saltable» debe ser verdadero o falso`);
    existen(x.momento, c.momentos, donde, 'momento', errores);
    existen(x.escala, c.escalas, donde, 'escala', errores);
    existen(x.camara?.ancla, c.entidades, donde, 'ancla', errores);
    for (const k of CAMPOS_CAMARA) {
      if (typeof x.camara?.[k] !== 'number') errores.push(`${donde}: cámara sin «${k}» numérico`);
    }
    revisarEstado(x.estado, c, donde, errores);
    if (!x.fuentes?.length) errores.push(`${donde}: sin fuentes`);
    ids(x.pasos ?? [], `${donde} · pasos`, errores);
    for (const paso of x.pasos ?? []) {
      if (!paso.rotulo) errores.push(`${donde} · ${paso.id}: paso sin rótulo`);
      if (paso.estado) revisarEstado(paso.estado, c, `${donde} · ${paso.id}`, errores);
    }
    if (x.momento in minutos) minutos[x.momento] += x.minutos ?? 0;
  }
  const tolerancia = p.tolerancia_minutos ?? 1;
  for (const m of p.momentos ?? []) {
    if (Math.abs(minutos[m.id] - m.meta) > tolerancia) {
      errores.push(`paradas.json · ${m.id}: ${minutos[m.id]} min frente a la meta de ${m.meta} (tolerancia ${tolerancia})`);
    }
    existen(m.escenarios, c.escenarios, `paradas.json · ${m.id}`, 'escenario', errores);
  }
  const total = Object.values(minutos).reduce((a, b) => a + b, 0);
  if (total > p.duracion_total) errores.push(`paradas.json: ${total} min exceden la duración de ${p.duracion_total}`);
  else if (total < p.duracion_total - tolerancia) avisos.push(`paradas.json: ${total} min de ${p.duracion_total} disponibles`);
  const saltables = (p.paradas ?? []).filter((x) => x.saltable);
  return { paradas: p.paradas?.length ?? 0, minutos, total, saltables: saltables.map((x) => x.id) };
}

function revisarFuentes(f, errores) {
  for (const [clave, x] of Object.entries(f.fuentes ?? {})) {
    requeridos(x, ['referencia', 'corta', 'estado'], `fuentes.json · ${clave}`, errores);
    if (!ESTADOS_FUENTE.includes(x.estado)) errores.push(`fuentes.json · ${clave}: estado «${x.estado}»`);
  }
}

export function revisarReferencias(datos) {
  const errores = [];
  const avisos = [];
  const { territorio: t, escalas: e, paradas: p, escenarios: s, condiciones: d, actores: a, fuentes: f } = datos;
  const c = {
    entidades: ids(t.entidades, 'territorio.json · entidades', errores),
    capas: ids(t.capas, 'territorio.json · capas', errores),
    escalas: ids(e.escalas, 'escalas.json · escalas', errores),
    momentos: ids(p.momentos, 'paradas.json · momentos', errores),
    escenarios: ids(s.escenarios, 'escenarios.json · escenarios', errores),
    lentes: ids(s.lentes, 'escenarios.json · lentes', errores),
    anios: ids(s.capa_historica?.anios, 'escenarios.json · capa_historica', errores),
    condiciones: ids(d.condiciones, 'condiciones.json · condiciones', errores),
    supuestos: ids(d.supuestos, 'condiciones.json · supuestos', errores),
    efectos: new Set(Object.keys(d.efectos ?? {})),
  };
  ids(d.reglas, 'condiciones.json · reglas', errores);
  ids(a.actores, 'actores.json · actores', errores);
  revisarTerritorio(t, c, errores);
  revisarEscalas(e, c, errores);
  revisarEscenarios(s, c, errores);
  revisarCondiciones(d, c, errores);
  revisarActores(a, c, errores);
  revisarFuentes(f, errores);
  const resumen = revisarParadas(p, c, errores, avisos);
  ids(p.paradas, 'paradas.json · paradas', errores);
  return { errores, avisos, resumen };
}
