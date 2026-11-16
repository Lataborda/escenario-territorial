// Motor de reglas de la teoría de cambio (etapa 10.a): función pura, sin estado ni navegador (la usa también la
// validación en Node). Lee contenido/condiciones.json y deriva, de las condiciones activas, el escenario, los efectos,
// las capas de la maqueta y lo que le falta a cada condición para tener efecto territorial. Aquí solo vive el
// significado de las expresiones; las reglas, los efectos y los preajustes están en el contenido.

const lista = (x) => (Array.isArray(x) ? x : []);

/** Expresión { todas, alguna, ninguna } frente a un conjunto de condiciones activas. */
export function cumple(expresion, activas) {
  if (!expresion) return true;
  const alguna = lista(expresion.alguna);
  return (
    lista(expresion.todas).every((c) => activas.has(c)) &&
    (!alguna.length || alguna.some((c) => activas.has(c))) &&
    !lista(expresion.ninguna).some((c) => activas.has(c))
  );
}

/** Lo que impide cumplir una expresión: condiciones de «todas» ausentes, grupo «alguna» sin ninguna y «ninguna» presentes. */
export function faltantes(expresion, activas) {
  const alguna = lista(expresion?.alguna);
  return {
    todas: lista(expresion?.todas).filter((c) => !activas.has(c)),
    alguna: alguna.length && !alguna.some((c) => activas.has(c)) ? alguna : [],
    sobran: lista(expresion?.ninguna).filter((c) => activas.has(c)),
  };
}

export function crearMotor(datos) {
  const condiciones = lista(datos.condiciones);
  const reglas = lista(datos.reglas);
  const derivacion = datos.derivacion ?? {};
  const ordenEfectos = Object.keys(datos.efectos ?? {});
  const ordenCondiciones = condiciones.map((c) => c.id);
  const conocidas = new Set(ordenCondiciones);
  const preajustes = lista(datos.preajustes);

  // Condiciones conocidas, sin repetir y en el orden del contenido.
  const ordenar = (ids) => {
    const pedidas = new Set(lista(ids).filter((c) => conocidas.has(c)));
    return ordenCondiciones.filter((c) => pedidas.has(c));
  };

  function evaluar(ids) {
    const orden = ordenar(ids);
    const activas = new Set(orden);
    const cumplidas = reglas.filter((r) => cumple(r.si, activas));
    const escenario =
      lista(derivacion.orden_escenarios).find((e) => cumplidas.some((r) => r.escenario === e)) ?? derivacion.escenario_base ?? null;
    // Efectos de las condiciones activas y de las reglas cumplidas, sin los que una regla cumplida reemplaza.
    const reemplazados = new Set(cumplidas.flatMap((r) => lista(r.reemplaza)));
    const propios = condiciones.filter((c) => activas.has(c.id)).flatMap((c) => lista(c.efectos));
    const deReglas = cumplidas.flatMap((r) => lista(r.efectos));
    const presentes = new Set([...propios, ...deReglas].filter((e) => !reemplazados.has(e)));
    const efectos = ordenEfectos.filter((e) => presentes.has(e));
    const capas = [...new Set(efectos.flatMap((e) => lista(derivacion.capas_por_efecto?.[e])))];
    return {
      condiciones: orden,
      escenario,
      reglas: cumplidas.map((r) => r.id),
      efectos,
      efectosDeReglas: ordenEfectos.filter((e) => deReglas.includes(e) && presentes.has(e)),
      capas,
      // Una entrada por condición del contenido: activa, con efecto territorial y lo que le falta.
      estado: condiciones.map((c) => {
        const activa = activas.has(c.id);
        const territorial = activa && cumple(c.efecto_territorial_requiere, activas);
        return {
          id: c.id,
          activa,
          territorial,
          faltan: activa && !territorial ? faltantes(c.efecto_territorial_requiere, activas) : null,
          mensaje: activa && !territorial ? c.mensaje_si_falta ?? null : null,
        };
      }),
      // Resultados intermedios cuyas condiciones están todas activas (diagrama de la teoría de cambio).
      resultados: lista(datos.resultados?.intermedios).filter((r) => lista(r.condiciones).every((c) => activas.has(c))).map((r) => r.id),
    };
  }

  return {
    evaluar,
    ordenar,
    condiciones: ordenCondiciones,
    preajustes: preajustes.map((p) => p.id),
    /** Condiciones de un preajuste, o null si no existe. */
    preajuste: (id) => {
      const p = preajustes.find((x) => x.id === id);
      return p ? ordenar(p.condiciones) : null;
    },
    /** Condiciones del preajuste declarado para un escenario, o null. */
    preajusteDe: (escenario) => {
      const p = preajustes.find((x) => x.escenario === escenario);
      return p ? ordenar(p.condiciones) : null;
    },
    /** Preajuste cuyas condiciones coinciden con las activas, o null. */
    preajusteVigente: (ids) => {
      const clave = ordenar(ids).join();
      return preajustes.find((p) => ordenar(p.condiciones).join() === clave)?.id ?? null;
    },
  };
}
