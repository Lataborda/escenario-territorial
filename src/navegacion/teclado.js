// Teclado del presentador (PLAN, sección 3.4). Las teclas de avance de los presentadores
// inalámbricos (Av Pág y Re Pág) equivalen a las flechas.
import { obtener, cambiar } from '../estado.js';
import { siguiente, anterior, irAMomento, alternarLibre } from './recorrido.js';

const alternar = (clave) => () => cambiar({ [clave]: !obtener()[clave] });

function pantallaCompleta() {
  const promesa = document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen?.();
  promesa?.catch?.((error) => console.warn('Pantalla completa no disponible:', error.message));
}

// Bloque de cámara con el formato de paradas.json.
export function formatearCamara(b) {
  const campos = Object.entries(b).map(([k, v]) => `"${k}": ${JSON.stringify(v)}`);
  return `"camara": { ${campos.join(', ')} }`;
}

/** bloqueCamara: función que devuelve la cámara actual como bloque de parada (tecla C). */
export function crearTeclado({ bloqueCamara }) {
  function copiarCamara() {
    const texto = formatearCamara(bloqueCamara());
    navigator.clipboard?.writeText(texto).catch(() => {});
    cambiar({ aviso: { titulo: 'Cámara copiada', texto } });
  }

  const acciones = {
    ArrowRight: siguiente,
    ' ': siguiente,
    PageDown: siguiente,
    ArrowLeft: anterior,
    PageUp: anterior,
    o: alternarLibre,
    f: pantallaCompleta,
    h: alternar('interfaz'),
    v: alternar('liviano'),
    c: copiarCamara,
    a: alternar('anclas'),
  };
  for (let n = 0; n <= 6; n++) acciones[String(n)] = () => irAMomento(n);

  window.addEventListener('keydown', (evento) => {
    if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.repeat) return;
    if (evento.target.closest?.('input, textarea, select')) return;
    const tecla = evento.key.length === 1 ? evento.key.toLowerCase() : evento.key;
    const accion = acciones[tecla];
    if (!accion) return;
    evento.preventDefault();
    accion();
  });
}
