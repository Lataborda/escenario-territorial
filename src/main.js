// Punto de entrada: carga tipografías, monta la escena y avisa cuando está lista.
import './estilos.css';
import { crearEscena } from './escena/escena.js';
import { crearMaqueta } from './escena/maqueta.js';

const TIPOGRAFIAS = [
  '400 24px "IBM Plex Sans"',
  '500 24px "IBM Plex Sans"',
  '600 24px "IBM Plex Sans"',
  '400 24px "Fraunces"',
  '600 24px "Fraunces"',
];

async function cargarTipografias() {
  try {
    await Promise.all(TIPOGRAFIAS.map((t) => document.fonts.load(t)));
  } catch (error) {
    console.warn('Tipografías no cargadas:', error);
  }
}

function mostrarAviso(texto) {
  const aviso = document.getElementById('aviso');
  aviso.textContent = texto;
  aviso.hidden = false;
}

// Señal para la verificación automática y para módulos futuros.
function marcarListo() {
  document.documentElement.dataset.listo = '1';
  window.dispatchEvent(new CustomEvent('escenario:listo'));
}

// Un módulo que falla se registra y deja seguir al resto.
function montar(nombre, crear, escena) {
  try {
    escena.agregar(crear());
  } catch (error) {
    console.error(`Módulo ${nombre}:`, error);
  }
}

async function iniciar() {
  await cargarTipografias();
  let escena;
  try {
    escena = crearEscena(document.getElementById('escena'));
  } catch (error) {
    console.error('No se pudo crear la escena:', error);
    mostrarAviso('WebGL no disponible en este navegador.');
    return;
  }
  montar('maqueta', crearMaqueta, escena);
  escena.iniciar();
  await escena.primerCuadro();
  window.escenario = { estadisticas: escena.estadisticas };
  marcarListo();
}

iniciar();
