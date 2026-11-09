// Interfaz sobre la escena: botonera, ficha, indicador de momento, leyendas, usos de la finca, rótulo del esquema
// y avisos.
// Tecla H: oculta o muestra todo.
import './interfaz.css';
import territorio from '../../contenido/territorio.json';
import { obtener, suscribir } from '../estado.js';
import { crearBotonera } from './botonera.js';
import { crearFicha } from './ficha.js';
import { crearMomentos } from './momentos.js';
import { crearLeyenda } from './leyenda.js';
import { crearCapas } from './capas.js';
import { crearEap } from './eap.js';
import { crearMateria } from './materia.js';
import { crearInteracciones } from './interacciones.js';

const DURACION_AVISO_MS = 8000;

// Un módulo de interfaz que falla se registra y deja seguir al resto.
function montar(nombre, crear, contenedor) {
  try {
    crear(contenedor);
  } catch (error) {
    console.error(`Interfaz ${nombre}:`, error);
  }
}

function crearAviso(contenedor) {
  const titulo = document.createElement('strong');
  const texto = document.createElement('pre');
  contenedor.append(titulo, texto);
  let temporizador = null;
  suscribir('aviso', ({ aviso }) => {
    clearTimeout(temporizador);
    contenedor.hidden = !aviso;
    if (!aviso) return;
    titulo.textContent = aviso.titulo;
    texto.textContent = aviso.texto;
    // El temporizador solo oculta el aviso: no cambia parada, escala ni cámara.
    temporizador = setTimeout(() => {
      contenedor.hidden = true;
    }, DURACION_AVISO_MS);
  });
}

export function crearInterfaz(raiz) {
  const parte = (clase, etiqueta = 'div') => {
    const e = document.createElement(etiqueta);
    e.className = clase;
    raiz.append(e);
    return e;
  };
  montar('momentos', crearMomentos, parte('momentos', 'header'));
  const botonera = parte('botonera', 'nav');
  botonera.setAttribute('aria-label', 'Escalas');
  montar('botonera', crearBotonera, botonera);
  const ficha = parte('ficha', 'aside');
  ficha.setAttribute('aria-live', 'polite');
  montar('ficha', crearFicha, ficha);
  // Columna derecha: leyenda de coberturas, leyenda de capas, usos de la finca, índice EAP, interacciones del lote y
  // materia orgánica.
  const columna = parte('columna-derecha');
  const enColumna = (clase) => {
    const e = document.createElement('aside');
    e.className = clase;
    columna.append(e);
    return e;
  };
  montar('leyenda', crearLeyenda, enColumna('leyenda'));
  montar('capas', crearCapas, columna);
  montar('índice EAP', crearEap, columna);
  montar('interacciones', crearInteracciones, columna);
  montar('materia orgánica', crearMateria, columna);
  parte('rotulo-esquema').textContent = territorio.rotulo;
  const aviso = parte('aviso-autor');
  aviso.hidden = true;
  montar('aviso', crearAviso, aviso);

  const visibilidad = ({ interfaz }) => raiz.classList.toggle('oculta', !interfaz);
  suscribir('interfaz', visibilidad);
  visibilidad(obtener());
}
