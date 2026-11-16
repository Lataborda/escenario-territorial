// Reglas de la teoría de cambio (etapa 10.a) en contenido/condiciones.json, con el mismo motor de la maqueta
// (src/reglas/motor.js): referencias de la derivación y de los preajustes, textos del panel, cada preajuste deriva
// su escenario y, sobre todas las combinaciones de condiciones, ninguna condición sola cambia el escenario de base
// (criterio de la etapa: ninguna condición sola produce S2) y los escenarios que presuponen a otro lo cumplen.
import { crearMotor, cumple } from '../../src/reglas/motor.js';

const TEXTOS_PANEL = ['titulo', 'preajustes', 'sin_efecto', 'falta', 'faltan', 'alguna', 'todas', 'otras', 'nota'];
const ARCHIVO = 'condiciones.json';

export function revisarReglas(datos) {
  const errores = [];
  const d = datos.condiciones ?? {};
  const derivacion = d.derivacion;
  const condiciones = (d.condiciones ?? []).map((c) => c.id);
  const efectos = new Set(Object.keys(d.efectos ?? {}));
  const escenarios = new Set((datos.escenarios?.escenarios ?? []).map((e) => e.id));
  const capas = new Set((datos.territorio?.capas ?? []).map((c) => c.id));
  const falla = (texto) => errores.push(`${ARCHIVO} · ${texto}`);
  if (!derivacion) return { errores: [`${ARCHIVO}: falta el bloque «derivacion»`], avisos: [], resumen: null };

  for (const c of d.condiciones ?? []) {
    if (!c.rotulo) falla(`${c.id}: falta el rótulo corto del interruptor`);
    if (c.efecto_territorial_requiere && !c.mensaje_si_falta) falla(`${c.id}: dependencia sin mensaje`);
  }
  for (const t of TEXTOS_PANEL) if (!d.panel?.[t]) falla(`panel: falta el texto «${t}»`);

  // Derivación: escenario de base, orden de precedencia y capas por efecto.
  const orden = derivacion.orden_escenarios ?? [];
  if (!escenarios.has(derivacion.escenario_base)) falla(`derivacion: escenario de base desconocido «${derivacion.escenario_base}»`);
  for (const e of orden) if (!escenarios.has(e)) falla(`derivacion · orden_escenarios: escenario desconocido «${e}»`);
  if (orden.includes(derivacion.escenario_base)) falla('derivacion: el escenario de base no puede estar en el orden de precedencia');
  for (const [efecto, lista] of Object.entries(derivacion.capas_por_efecto ?? {})) {
    if (!efectos.has(efecto)) falla(`derivacion · capas_por_efecto: efecto desconocido «${efecto}»`);
    for (const c of lista) if (!capas.has(c)) falla(`derivacion · capas_por_efecto · ${efecto}: capa desconocida «${c}»`);
  }
  for (const r of d.reglas ?? []) {
    for (const e of r.reemplaza ?? []) if (!efectos.has(e)) falla(`${r.id} · reemplaza: efecto desconocido «${e}»`);
    if (r.escenario && !orden.includes(r.escenario)) falla(`${r.id}: su escenario «${r.escenario}» no está en el orden de precedencia`);
  }
  for (const e of orden) if (!(d.reglas ?? []).some((r) => r.escenario === e)) falla(`derivacion: ninguna regla produce «${e}»`);

  // Preajustes: uno por escenario, con condiciones conocidas, y cada uno deriva su escenario.
  const motor = crearMotor(d);
  const preajustes = d.preajustes ?? [];
  for (const e of escenarios) {
    const n = preajustes.filter((p) => p.escenario === e).length;
    if (n !== 1) falla(`preajustes: ${n} preajustes para ${e} (se espera 1)`);
  }
  for (const p of preajustes) {
    for (const c of p.condiciones ?? []) if (!condiciones.includes(c)) falla(`preajuste ${p.id}: condición desconocida «${c}»`);
    const derivado = motor.evaluar(p.condiciones).escenario;
    if (derivado !== p.escenario) falla(`preajuste ${p.id}: sus condiciones derivan ${derivado} (se espera ${p.escenario})`);
  }
  if (new Set(preajustes.map((p) => p.id)).size !== preajustes.length) falla('preajustes: identificadores repetidos');

  // Todas las combinaciones de condiciones.
  const reglasDe = (e) => (d.reglas ?? []).filter((r) => r.escenario === e);
  const cuenta = {};
  const minimo = {};
  const incumplen = new Map(); // «A presupone B» -> combinaciones que cumplen A sin cumplir B
  for (let k = 0; k < 2 ** condiciones.length; k++) {
    const ids = condiciones.filter((_, i) => (k >> i) & 1);
    const activas = new Set(ids);
    const { escenario } = motor.evaluar(ids);
    cuenta[escenario] = (cuenta[escenario] ?? 0) + 1;
    minimo[escenario] = Math.min(minimo[escenario] ?? Infinity, ids.length);
    if (ids.length === 1 && escenario !== derivacion.escenario_base) falla(`la condición ${ids[0]} sola produce ${escenario}`);
    for (const [mayor, menores] of Object.entries(derivacion.presupone ?? {})) {
      if (!reglasDe(mayor).some((r) => cumple(r.si, activas))) continue;
      for (const menor of menores) {
        if (!reglasDe(menor).some((r) => cumple(r.si, activas))) incumplen.set(`${mayor} presupone ${menor}`, ids.join(' + '));
      }
    }
  }
  for (const [par, ejemplo] of incumplen) falla(`derivacion · presupone: ${par}, pero ${ejemplo} cumple el primero sin el segundo`);
  for (const [mayor, menores] of Object.entries(derivacion.presupone ?? {})) {
    for (const e of [mayor, ...menores]) if (!orden.includes(e)) falla(`derivacion · presupone: escenario «${e}» fuera del orden de precedencia`);
  }

  return {
    errores,
    avisos: [],
    resumen: {
      combinaciones: 2 ** condiciones.length,
      cuenta,
      minimo,
      preajustes: preajustes.map((p) => ({ id: p.id, escenario: p.escenario, condiciones: p.condiciones })),
      solas: condiciones.map((c) => ({ id: c, escenario: motor.evaluar([c]).escenario })),
    },
  };
}
