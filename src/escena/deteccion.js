// Detección de calidad al arrancar (etapa 7.c): tras «escenario:listo» deja pasar unos cuadros de calentamiento,
// mide los siguientes sin tope (pide cuadro a pedidos.js en cada cuadro del navegador) y, si el promedio queda por
// debajo del umbral, baja la calidad un nivel y lo avisa. Una sola vez y sin subir sola. La medida empieza de nuevo
// si la pestaña se oculta y se cancela si la calidad cambia por otra vía (tecla V o presentador). No corre con
// #calidad= en el hash; en la verificación automática y con #captura=1 solo corre con #deteccion= explícito.
import { obtener, cambiar, suscribir } from '../estado.js';
import { pedirCuadro } from './pedidos.js';
import { calidadInferior, NOMBRE_CALIDAD } from '../calidad.js';

// umbral: cuadros por segundo; calentamiento y medida: cuadros dibujados, con un límite de tiempo para equipos lentos.
export const DETECCION = { umbral: 30, calentamiento: 10, calentamientoMs: 2000, cuadros: 60, medidaMs: 4000 };

/** cuadros(): cuadros dibujados por la escena; umbral: cuadros por segundo (0 apaga); activa: si debe medir. */
export function crearDeteccion({ cuadros, umbral = DETECCION.umbral, activa = true }) {
  const d = { estado: activa && umbral > 0 ? 'espera' : 'inactiva', umbral, cps: null, medidos: 0, bajo: null };
  const datos = () => ({ ...d });
  if (d.estado === 'inactiva') return { datos };

  const enCurso = () => d.estado === 'espera' || d.estado === 'midiendo';
  suscribir('calidad', () => {
    if (enCurso()) d.estado = 'cancelada';
  });

  let inicio = null; // { t, n }: comienzo del calentamiento
  let base = null; // { t, n }: comienzo de la medida
  const reiniciar = () => {
    inicio = null;
    base = null;
  };
  document.addEventListener('visibilitychange', reiniciar);

  function decidir(cps, medidos) {
    d.cps = Number(cps.toFixed(1));
    d.medidos = medidos;
    d.estado = 'hecha';
    document.removeEventListener('visibilitychange', reiniciar);
    const inferior = cps < umbral ? calidadInferior(obtener().calidad) : null;
    d.bajo = inferior;
    if (inferior) cambiar({ calidad: inferior, aviso: { titulo: `${NOMBRE_CALIDAD[inferior]}. Tecla V para cambiarla`, texto: '' } });
  }

  function medir(t) {
    if (d.estado !== 'midiendo') return;
    if (!document.hidden) {
      const n = cuadros();
      pedirCuadro();
      if (!inicio) inicio = { t, n };
      else if (!base) {
        if (n - inicio.n >= DETECCION.calentamiento || (n > inicio.n && t - inicio.t >= DETECCION.calentamientoMs)) base = { t, n };
      } else if (n - base.n >= DETECCION.cuadros || (n > base.n && t - base.t >= DETECCION.medidaMs)) {
        return decidir(((n - base.n) * 1000) / (t - base.t), n - base.n);
      }
    }
    requestAnimationFrame(medir);
  }

  window.addEventListener(
    'escenario:listo',
    () => {
      if (d.estado !== 'espera') return;
      d.estado = 'midiendo';
      requestAnimationFrame(medir);
    },
    { once: true },
  );
  return { datos };
}
