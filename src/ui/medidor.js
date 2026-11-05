// Medidor de rendimiento (tecla R, etapa 5.c.c): cuadros por segundo, duración del cuadro, llamadas de dibujo,
// triángulos, tamaño del lienzo y efectos activos. Sirve para medir en el equipo de la prueba (MacBook Air).
// Reacciona a «medidor»; solo cuenta cuadros mientras está visible.
import './medidor.css';
import { suscribir } from '../estado.js';

const VENTANA_MS = 1000; // cifras de cada segundo
const MEDIA_S = 5; // media móvil de cuadros por segundo

const numero = (x, d = 0) => x.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });

/** estadisticas() y luz(): cifras de la escena (escena.js). */
export function crearMedidor(contenedor, { estadisticas, luz }) {
  const linea1 = document.createElement('div');
  const linea2 = document.createElement('div');
  linea2.className = 'medidor-detalle';
  contenedor.append(linea1, linea2);
  contenedor.hidden = true;

  let activo = false;
  let inicio = 0;
  let previo = 0;
  let cuadros = 0;
  let peor = 0;
  const historial = [];

  function pintar(fps, ms) {
    historial.push(fps);
    if (historial.length > MEDIA_S) historial.shift();
    const media = historial.reduce((a, b) => a + b, 0) / historial.length;
    const e = estadisticas();
    const l = luz();
    const efectos = [l.oclusion && 'oclusión', l.miniatura && 'miniatura', l.viento.fuerza > 0 && 'viento', l.sombra.activa && 'sombras']
      .filter(Boolean)
      .join(', ');
    linea1.textContent = `${numero(fps)} cuadros/s (media ${numero(media)}) · ${numero(ms, 1)} ms, peor ${numero(peor, 1)} ms`;
    linea2.textContent = `${e.llamadas} llamadas · ${numero(e.triangulos / 1e6, 2)} M triángulos · píxeles ×${e.relacionPixeles} · efectos: ${efectos || 'ninguno'}`;
  }

  function contar(t) {
    if (!activo) return;
    if (previo) peor = Math.max(peor, t - previo);
    previo = t;
    cuadros += 1;
    if (t - inicio >= VENTANA_MS) {
      pintar((cuadros * 1000) / (t - inicio), (t - inicio) / cuadros);
      inicio = t;
      cuadros = 0;
      peor = 0;
    }
    requestAnimationFrame(contar);
  }

  suscribir('medidor', ({ medidor }) => {
    activo = medidor;
    contenedor.hidden = !medidor;
    if (!medidor) return;
    historial.length = 0;
    inicio = performance.now();
    previo = 0;
    cuadros = 0;
    peor = 0;
    linea1.textContent = 'Midiendo…';
    linea2.textContent = '';
    requestAnimationFrame(contar);
  });
}
