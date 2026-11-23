// Canal entre la vista principal y la del presentador (BroadcastChannel, mismo origen).
// Mensajes:
//   presentador → principal: { tipo: 'hola' } y { tipo: 'orden', accion, ... }
//   principal → presentador: { tipo: 'estado', estado: { parada, paso, escala, modo, interfaz, calidad, miniatura,
//     condiciones, capas, diagrama } } (condiciones y capas, para mostrar la teoría de cambio con el panel abierto)
// Sin BroadcastChannel (por ejemplo, el archivo único en file://) el canal queda inactivo.

export const NOMBRE_CANAL = 'escenario-territorial';

// Claves del estado que la vista principal publica.
export const CLAVES_PUBLICADAS = ['parada', 'paso', 'escala', 'modo', 'interfaz', 'calidad', 'miniatura', 'condiciones', 'capas', 'diagrama'];

// Órdenes que acepta la vista principal.
export const ACCIONES = ['siguiente', 'anterior', 'irA', 'momento', 'libre', 'alternar', 'calidad'];
export const ALTERNABLES = ['interfaz', 'miniatura'];

export function crearCanal(nombre = NOMBRE_CANAL) {
  let canal = null;
  try {
    canal = typeof BroadcastChannel === 'function' ? new BroadcastChannel(nombre) : null;
  } catch {
    canal = null;
  }
  const oyentes = new Set();
  canal?.addEventListener('message', (evento) => {
    const m = evento.data;
    if (!m || typeof m.tipo !== 'string') return;
    for (const fn of oyentes) {
      try {
        fn(m);
      } catch (error) {
        console.error('Canal del presentador:', error);
      }
    }
  });
  return {
    activo: Boolean(canal),
    enviar: (mensaje) => canal?.postMessage(mensaje),
    alRecibir: (fn) => {
      oyentes.add(fn);
      return () => oyentes.delete(fn);
    },
    cerrar: () => canal?.close(),
  };
}
