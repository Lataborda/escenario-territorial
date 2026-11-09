// Punto de entrada: carga tipografías, monta escena, navegación e interfaz, y avisa cuando está lista.
import './estilos.css';
import { crearEscena } from './escena/escena.js';
import { crearMaqueta } from './escena/maqueta.js';
import * as THREE from 'three';
import { generarTerreno, ancla, altura, superficie, datosTerreno, revisarAnclasTerreno } from './terreno/terreno.js';
import { crearCoberturas } from './coberturas/coberturas.js';
import { crearVias } from './vias/vias.js';
import { crearAsentamientos } from './asentamientos/asentamientos.js';
import { crearFincas } from './fincas/fincas.js';
import { crearRotulosFinca } from './fincas/rotulos.js';
import { crearLote } from './lote/lote.js';
import { crearCorte } from './lote/suelo.js';
import { crearRotulosLote } from './lote/rotulos.js';
import { leerParametros } from './parametros.js';
import { obtener, cambiar, suscribir } from './estado.js';
import { crearCamaraNavegacion } from './navegacion/camara.js';
import { PARADAS, irA, siguiente, anterior, bloquesDelRecorrido } from './navegacion/recorrido.js';
import { irAEscala, enfocar } from './navegacion/foco.js';
import { crearTeclado } from './navegacion/teclado.js';
import { crearHash } from './navegacion/hash.js';
import { crearSeleccion } from './navegacion/seleccion.js';
import { crearLibre } from './navegacion/libre.js';
import { revisarTrayectorias, desvioBloque } from './navegacion/pruebas.js';
import { crearInterfaz } from './ui/interfaz.js';
import { crearMedidor } from './ui/medidor.js';
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

// Posición en pantalla (píxeles) de un punto de la escena, o null.
function proyectar(escena, punto) {
  if (!punto) return null;
  escena.camara.updateMatrixWorld();
  const p = punto.clone().project(escena.camara);
  const r = escena.renderizador.domElement.getBoundingClientRect();
  return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
}

// Atributos de la parada actual en <html>, para la verificación automática.
function marcarParada({ parada, paso }) {
  document.documentElement.dataset.parada = parada ?? '';
  document.documentElement.dataset.paso = String(paso);
}

async function iniciar() {
  await cargarTipografias();
  const parametros = leerParametros();
  let escena;
  try {
    escena = crearEscena(document.getElementById('escena'), parametros);
  } catch (error) {
    console.error('No se pudo crear la escena:', error);
    mostrarAviso('WebGL no disponible en este navegador.');
    return;
  }
  cambiar({ anclas: parametros.anclas });
  montar('maqueta', () => escena.agregar(crearMaqueta()));
  montar('terreno', () => escena.agregar(generarTerreno({ exageracion: parametros.exageracion })));

  const camara = montar('cámara', () => crearCamaraNavegacion(escena, { instantanea: parametros.captura }));
  montar('interfaz', () => crearInterfaz(document.getElementById('interfaz')));
  montar('medidor', () => {
    const caja = document.createElement('div');
    caja.className = 'medidor';
    document.body.append(caja);
    crearMedidor(caja, { estadisticas: escena.estadisticas, luz: escena.luz });
  });
  montar('teclado', () => crearTeclado({ bloqueCamara: camara.bloqueActual }));
  montar('hash', crearHash);
  montar('selección', () => crearSeleccion({ camara: escena.camara, lienzo: escena.renderizador.domElement }));
  const libre = montar('modo libre', () => crearLibre(escena));

  // Primera parada sin vuelo: la del hash o P01.
  suscribir(['parada', 'paso'], marcarParada);
  if (!irA(parametros.parada ?? PARADAS[0].id, { paso: parametros.paso, instantanea: true })) {
    irA(PARADAS[0].id, { instantanea: true });
  }
  // Coberturas después de la primera parada: su escenario se aplica sin transición.
  const coberturas = montar('coberturas', () => crearCoberturas({ altura, instantanea: parametros.captura }));
  if (coberturas) {
    escena.agregar(coberturas.grupo);
    escena.superponer(coberturas.superposicion);
  }
  const vias = montar('vías', () => crearVias({ altura }));
  if (vias) escena.agregar(vias.malla);
  const asentamientos = montar('asentamientos', () => crearAsentamientos({ altura }));
  if (asentamientos) escena.agregar(asentamientos.grupo);
  const fincas = montar('fincas', () => crearFincas({ altura }));
  if (fincas) {
    escena.agregar(fincas.grupo);
    escena.superponer(fincas.superposicion);
  }
  const rotulos = fincas && montar('rótulos de finca', () =>
    crearRotulosFinca({
      contenedor: document.getElementById('interfaz'),
      fincas,
      altura,
      proyectar: (x, y, z) => proyectar(escena, new THREE.Vector3(x, y, z)),
      alCuadro: escena.alCuadro,
    }),
  );
  // Lote de policultivo y monocultivo (P03) y corte de suelo (P07), con sus rótulos.
  const lote = montar('lote', () => crearLote({ altura, camara: escena.camara, instantanea: parametros.captura }));
  if (lote) {
    escena.agregar(lote.grupo);
    escena.superponer(lote.superposicion);
    escena.alCuadro(lote.cuadro);
  }
  const corte = montar('corte de suelo', () => crearCorte({ altura, instantanea: parametros.captura }));
  if (corte) escena.agregar(corte.grupo);
  const rotulosLote = lote && corte && montar('rótulos del lote', () =>
    crearRotulosLote({
      contenedor: document.getElementById('interfaz'),
      lote,
      corte,
      altura,
      proyectar: (x, y, z) => proyectar(escena, new THREE.Vector3(x, y, z)),
      alCuadro: escena.alCuadro,
    }),
  );
  // Vista del presentador (npm run presentar): publica el estado y recibe órdenes.
  montar('presentador', crearSincronia);

  escena.iniciar();
  await escena.primerCuadro();
  // Interfaz para la verificación automática y el modo autor.
  window.escenario = {
    estadisticas: escena.estadisticas,
    luz: escena.luz,
    fijarViento: escena.fijarViento,
    terreno: datosTerreno,
    coberturas: () => coberturas,
    vias: () => vias,
    asentamientos: () => asentamientos,
    fincas: () => fincas && { ...fincas.datos(), rotulos: rotulos?.visibles() ?? 0 },
    lote: () => lote && { ...lote.datos(), corte: corte?.datos() ?? null, rotulos: rotulosLote?.visibles() ?? null },
    cambiarEscenario: (id) => cambiar({ escenario: id }),
    capas: (lista) => cambiar({ capas: lista }),
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
    // Modo libre: un cuadro de marcha con dt fijo y lectura de cámara y objetivo.
    libre: libre && {
      paso: (dt) => libre.paso(dt),
      leer: libre.leer,
      puntoBajo: (x, y) => libre.puntoBajo(x, y)?.toArray() ?? null,
    },
    colocar: (posicion, objetivo) => escena.colocar(new THREE.Vector3(...posicion), new THREE.Vector3(...objetivo)),
    superficie: (x, z) => superficie(x, z),
    ancla: (id) => ancla(id)?.toArray() ?? null,
    revisarTrayectorias: () => revisarTrayectorias(bloquesDelRecorrido()),
    desvioBloque: (bloque) => desvioBloque(bloque, escena.camara.position),
    // Posición en pantalla (píxeles) del ancla de una entidad o de un punto [x, y, z].
    proyectar: (id) => proyectar(escena, ancla(id)),
    proyectarPunto: (p) => proyectar(escena, new THREE.Vector3(...p)),
  };
  marcarListo();
}

iniciar();
