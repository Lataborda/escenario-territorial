// Punto de entrada: carga tipografías, monta escena, navegación e interfaz, y avisa cuando está lista.
import './estilos.css';
import { crearEscena } from './escena/escena.js';
import { crearMaqueta } from './escena/maqueta.js';
import { generarTerreno, ancla, altura, datosTerreno, revisarAnclasTerreno } from './terreno/terreno.js';
import { crearCoberturas } from './coberturas/coberturas.js';
import { crearVias } from './vias/vias.js';
import { crearAsentamientos } from './asentamientos/asentamientos.js';
import { leerParametros } from './parametros.js';
import { obtener, cambiar, suscribir } from './estado.js';
import { crearCamaraNavegacion } from './navegacion/camara.js';
import { PARADAS, irA, siguiente, anterior } from './navegacion/recorrido.js';
import { irAEscala, enfocar } from './navegacion/foco.js';
import { crearTeclado } from './navegacion/teclado.js';
import { crearHash } from './navegacion/hash.js';
import { crearSeleccion } from './navegacion/seleccion.js';
import { revisarTrayectorias, desvioBloque } from './navegacion/pruebas.js';
import { crearInterfaz } from './ui/interfaz.js';
import { crearSincronia } from './presentador/sincronia.js';

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
function montar(nombre, crear) {
  try {
    return crear();
  } catch (error) {
    console.error(`Módulo ${nombre}:`, error);
    return null;
  }
}

// Atributos de la parada actual en <html>, para la verificación automática.
function marcarParada({ parada, paso }) {
  document.documentElement.dataset.parada = parada ?? '';
  document.documentElement.dataset.paso = String(paso);
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
  const parametros = leerParametros();
  cambiar({ anclas: parametros.anclas });
  montar('maqueta', () => escena.agregar(crearMaqueta()));
  montar('terreno', () => escena.agregar(generarTerreno({ exageracion: parametros.exageracion })));

  const camara = montar('cámara', () => crearCamaraNavegacion(escena, { instantanea: parametros.captura }));
  montar('interfaz', () => crearInterfaz(document.getElementById('interfaz')));
  montar('teclado', () => crearTeclado({ bloqueCamara: camara.bloqueActual }));
  montar('hash', crearHash);
  montar('selección', () => crearSeleccion({ camara: escena.camara, lienzo: escena.renderizador.domElement }));

  // Primera parada sin vuelo: la del hash o P01.
  suscribir(['parada', 'paso'], marcarParada);
  if (!irA(parametros.parada ?? PARADAS[0].id, { paso: parametros.paso, instantanea: true })) {
    irA(PARADAS[0].id, { instantanea: true });
  }
  // Coberturas después de la primera parada: su escenario se aplica sin transición.
  const coberturas = montar('coberturas', () => crearCoberturas({ altura, instantanea: parametros.captura }));
  if (coberturas) escena.agregar(coberturas.grupo);
  const vias = montar('vías', () => crearVias({ altura }));
  if (vias) escena.agregar(vias.malla);
  const asentamientos = montar('asentamientos', () => crearAsentamientos({ altura }));
  if (asentamientos) escena.agregar(asentamientos.grupo);
  // Vista del presentador (npm run presentar): publica el estado y recibe órdenes.
  montar('presentador', crearSincronia);

  escena.iniciar();
  await escena.primerCuadro();
  // Interfaz para la verificación automática y el modo autor.
  window.escenario = {
    estadisticas: escena.estadisticas,
    terreno: datosTerreno,
    coberturas: () => coberturas,
    vias: () => vias,
    asentamientos: () => asentamientos,
    cambiarEscenario: (id) => cambiar({ escenario: id }),
    revisarAnclas: revisarAnclasTerreno,
    vista: (id, vista) => escena.mirar(ancla(id), vista),
    estado: () => obtener(),
    dibujo: (activo) => (activo ? escena.iniciar() : escena.pausar()),
    dibujarCuadro: () => escena.dibujar(),
    irA,
    siguiente,
    anterior,
    irAEscala,
    enfocar,
    controles: () => ({ habilitados: escena.controles.enabled, desplazamiento: escena.controles.enablePan }),
    ultimaTransicion: () => camara?.ultimaTransicion(),
    revisarTrayectorias: () => revisarTrayectorias(PARADAS.map((p) => p.camara)),
    desvioBloque: (bloque) => desvioBloque(bloque, escena.camara.position),
    // Posición en pantalla (píxeles) del ancla de una entidad.
    proyectar: (id) => {
      escena.camara.updateMatrixWorld();
      const p = ancla(id)?.project(escena.camara);
      const r = escena.renderizador.domElement.getBoundingClientRect();
      return p && { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
    },
  };
  marcarListo();
}

iniciar();
