// Vista del presentador (presentador.html). Refleja el estado que publica la vista principal y le envía
// órdenes por BroadcastChannel. No anima nada ni cambia la parada por su cuenta.
import '../tipografias.css';
import './presentador.css';
import './paneles.css';
import contenido from '../../contenido/paradas.json';
import { cambiar, suscribir } from '../estado.js';
import { MOMENTOS, buscarParada } from '../navegacion/recorrido.js';
import { crearCanal, CLAVES_PUBLICADAS } from './canal.js';
import { crearActual, crearSiguiente, crearIndice, crearControles } from './paneles.js';
import { crearCronometro, crearVistaCronometro } from './cronometro.js';

const LATIDO_MS = 2000;
const SIN_RESPUESTA_MS = 5000;

const TECLAS = {
  ArrowRight: ['siguiente'],
  ' ': ['siguiente'],
  PageDown: ['siguiente'],
  ArrowLeft: ['anterior'],
  PageUp: ['anterior'],
  o: ['libre'],
  h: ['alternar', { clave: 'interfaz' }],
  v: ['alternar', { clave: 'liviano' }],
};
MOMENTOS.forEach((m, n) => (TECLAS[String(n)] = ['momento', { n }]));

function seccion(padre, clase, etiqueta = 'section') {
  const e = document.createElement(etiqueta);
  e.className = clase;
  padre.append(e);
  return e;
}

// Solo las claves publicadas y con el tipo esperado pasan al almacén del presentador.
function filtrar(estado = {}) {
  const tipos = { parada: 'string', paso: 'number', escala: 'string', modo: 'string', interfaz: 'boolean', liviano: 'boolean' };
  return Object.fromEntries(CLAVES_PUBLICADAS.filter((k) => typeof estado[k] === tipos[k]).map((k) => [k, estado[k]]));
}

function montar(nombre, crear) {
  try {
    return crear();
  } catch (error) {
    console.error(`Presentador, ${nombre}:`, error);
    return null;
  }
}

function iniciar(raiz) {
  const canal = crearCanal();
  const ordenar = (accion, datos = {}) => canal.enviar({ tipo: 'orden', accion, ...(datos ?? {}) });

  const barra = seccion(raiz, 'barra', 'header');
  const conexion = seccion(barra, 'conexion', 'div');
  const vistaEstado = seccion(barra, 'barra-estado', 'div');
  const rejilla = seccion(raiz, 'rejilla', 'main');
  montar('actual', () => crearActual(seccion(rejilla, 'panel actual')));
  const columna = seccion(rejilla, 'columna', 'div');
  const panelCrono = seccion(columna, 'panel cronometro');
  montar('siguiente', () => crearSiguiente(seccion(columna, 'panel siguiente'), ordenar));
  montar('controles', () => crearControles(seccion(columna, 'panel controles'), ordenar));
  montar('índice', () => crearIndice(seccion(columna, 'panel indice'), ordenar));

  const cronometro = crearCronometro({ momentos: MOMENTOS, tolerancia: contenido.tolerancia_minutos });
  const vistaCrono = montar('cronómetro', () =>
    crearVistaCronometro(panelCrono, cronometro, {
      duracionTotal: contenido.duracion_total,
      ensayoObjetivo: contenido.ensayo_objetivo,
      tolerancia: contenido.tolerancia_minutos,
      // Con retraso acumulado, las paradas saltables se resaltan en el índice y en «Siguiente».
      alPintar: (l) => (raiz.dataset.retraso = l.retraso ? 'si' : 'no'),
    }),
  );
  suscribir('parada', ({ parada }) => {
    cronometro.cambiarMomento(buscarParada(parada)?.momento);
    vistaCrono?.pintar();
  });

  suscribir(['modo', 'interfaz', 'liviano', 'escala'], (e) => {
    const modo = { recorrido: 'Recorrido', libre: 'Modo libre', actividad: 'Actividad', autor: 'Modo autor' }[e.modo] ?? e.modo;
    vistaEstado.textContent = [modo, `escala ${e.escala}`, e.interfaz ? 'interfaz visible' : 'interfaz oculta', e.liviano ? 'liviano' : null]
      .filter(Boolean)
      .join(' · ');
  });

  // Conexión: saludo periódico; la vista principal responde con su estado.
  let ultimo = -Infinity;
  const marcarConexion = (si) => {
    raiz.dataset.conexion = si ? 'si' : 'no';
    conexion.textContent = !canal.activo
      ? 'Este navegador no admite la sincronización'
      : si
        ? 'Vista principal conectada'
        : 'Sin vista principal: abrir la dirección principal en otra pestaña';
  };
  canal.alRecibir((m) => {
    if (m.tipo !== 'estado') return;
    ultimo = Date.now();
    marcarConexion(true);
    cambiar(filtrar(m.estado));
  });
  const latido = () => {
    canal.enviar({ tipo: 'hola' });
    if (Date.now() - ultimo > SIN_RESPUESTA_MS) marcarConexion(false);
  };
  marcarConexion(false);
  latido();
  setInterval(latido, LATIDO_MS);

  window.addEventListener('keydown', (evento) => {
    if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.repeat) return;
    const tecla = evento.key.length === 1 ? evento.key.toLowerCase() : evento.key;
    const orden = TECLAS[tecla];
    if (!orden) return;
    evento.preventDefault();
    ordenar(...orden);
  });

  // Para la verificación automática.
  window.presentador = { cronometro: () => cronometro.leer() };
  document.documentElement.dataset.listo = '1';
}

iniciar(document.getElementById('presentador'));
