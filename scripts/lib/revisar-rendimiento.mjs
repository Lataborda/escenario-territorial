// Revisión del rendimiento (etapa 7.c): triángulos y llamadas de dibujo por cuadro con la cámara quieta en cuatro
// vistas, frente a la línea base de la auditoría del 2026-11-10 y a su límite; sombra fija igual a la recalculada
// (misma captura al forzar la actualización); y ritmo del dibujo: con la cámara quieta y el viento detenido (reloj
// quieto en la verificación) la escena deja de dibujarse. Página con #captura=1 en la ventana de 1600×900.
import { createHash } from 'node:crypto';

// Triángulos por cuadro: línea base (commit 97baa57, todas las pasadas) y límite de la etapa 7.c (PLAN.md).
export const VISTAS_RENDIMIENTO = [
  { id: 'P01', paso: 0, nombre: 'General (P01)', base: 1.93, limite: 1.3 },
  { id: 'P06', paso: 0, nombre: 'Finca faro (P06)', base: 3.71, limite: 2.8 },
  { id: 'P03', paso: 2, nombre: 'Lote (P03, comunidad)', base: 5.3, limite: 3.0 },
  { id: 'P07', paso: 0, nombre: 'Suelo (P07)', base: 5.42, limite: 3.5 },
];
const REPOSO_MS = 3000;
const CUADROS_EN_REPOSO = 5; // un cuadro de seguridad por segundo, con holgura

const huella = async (pagina) => createHash('sha1').update(await pagina.screenshot()).digest('hex');

export async function revisarRendimiento(pagina) {
  const r = { vistas: [] };
  await pagina.evaluate(() => window.escenario.dibujo(false));
  for (const v of VISTAS_RENDIMIENTO) {
    // Tres cuadros: el primero sigue el movimiento de la cámara; desde el segundo, encuadre exacto y sombra al día.
    const cifras = await pagina.evaluate(([id, paso]) => {
      window.escenario.irA(id, { paso, instantanea: true });
      for (let i = 0; i < 3; i++) window.escenario.dibujarCuadro();
      const d = window.escenario.coberturas().datos();
      return { ...window.escenario.estadisticas(), instancias: d.dibujadas, matas: d.cana.cerca.dibujadas, matasCupo: d.cana.cerca.cerca + d.cana.cerca.lejos };
    }, [v.id, v.paso]);
    const fija = await huella(pagina);
    await pagina.evaluate(() => {
      window.escenario.pedirSombra();
      window.escenario.dibujarCuadro();
    });
    r.vistas.push({ ...v, ...cifras, sombraIgual: fija === (await huella(pagina)) });
  }
  // Ritmo: con el ciclo en marcha y la cámara quieta, pocos cuadros dibujados frente a los cuadros del navegador.
  r.reposo = await pagina.evaluate(
    (ms) =>
      new Promise((resolver) => {
        window.escenario.irA('P01', { instantanea: true });
        window.escenario.dibujarCuadro();
        window.escenario.dibujo(true);
        const viento = window.escenario.luz().viento;
        let navegador = 0;
        let inicio = null;
        let antes = 0;
        function contar(t) {
          // La cuenta empieza medio segundo después: el ritmo de movimiento dura un instante tras el último cambio.
          if (inicio == null && t > comienzo + 600) {
            inicio = t;
            antes = window.escenario.estadisticas().cuadros;
          }
          if (inicio != null) navegador += 1;
          if (inicio != null && t - inicio >= ms) {
            window.escenario.dibujo(false);
            resolver({ navegador, dibujados: window.escenario.estadisticas().cuadros - antes, segundos: (t - inicio) / 1000, vientoQuieto: viento.quieto, ritmo: window.escenario.estadisticas().ritmo });
          } else requestAnimationFrame(contar);
        }
        const comienzo = performance.now();
        requestAnimationFrame(contar);
      }),
    REPOSO_MS,
  );
  return r;
}

export function fallasRendimiento(r) {
  if (!r?.vistas) return ['Rendimiento: sin datos'];
  const f = [];
  for (const v of r.vistas) {
    if (!(v.triangulos <= v.limite * 1e6)) f.push(`Rendimiento: ${v.nombre} dibuja ${(v.triangulos / 1e6).toFixed(2)} M de triángulos (límite ${v.limite} M)`);
    if (!v.sombraIgual) f.push(`Rendimiento: la sombra fija de ${v.nombre} difiere de la recalculada`);
  }
  const q = r.reposo;
  if (!q || !q.vientoQuieto) f.push('Rendimiento: el reloj del viento no está quieto en la verificación');
  else if (q.dibujados > CUADROS_EN_REPOSO) f.push(`Rendimiento: ${q.dibujados} cuadros dibujados en ${q.segundos.toFixed(1)} s con la cámara quieta y sin viento`);
  return f;
}

export function seccionRendimiento(r) {
  if (!r?.vistas) return [];
  const m = (x) => (x / 1e6).toFixed(2).replace('.', ',');
  const q = r.reposo;
  return [
    '## Rendimiento',
    '',
    'Triángulos por cuadro con la cámara quieta (todas las pasadas; la sombra no se recalcula). Línea base: commit `97baa57`.',
    '',
    '| Vista | Línea base | Ahora | Límite | Llamadas | Instancias de vegetación | Matas de caña dibujadas (del cupo) | Sombra fija igual a la recalculada |',
    '|---|---|---|---|---|---|---|---|',
    ...r.vistas.map(
      (v) =>
        `| ${v.nombre} | ${String(v.base).replace('.', ',')} M | ${m(v.triangulos)} M (${Math.round((100 * v.triangulos) / (v.base * 1e6))} %) | ${String(v.limite).replace('.', ',')} M | ${v.llamadas} | ${v.instancias} | ${v.matas} (${v.matasCupo}) | ${v.sombraIgual ? 'sí' : 'no'} |`,
    ),
    '',
    q
      ? `- Ritmo del dibujo: tope de ${q.ritmo.movimiento} cuadros por segundo en movimiento y ${q.ritmo.reposo} con la cámara quieta y viento; con la cámara quieta y el viento detenido, ${q.dibujados} cuadros dibujados en ${q.segundos.toFixed(1).replace('.', ',')} s (${q.navegador} cuadros del navegador)`
      : null,
    '- Los cuadros por segundo reales se miden en el equipo de la prueba con la tecla R (sin tope mientras el medidor está visible).',
    '',
  ].filter((x) => x != null);
}
