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
import { crearFlujos } from './flujos/flujos.js';
import { crearRotulosFlujos } from './flujos/rotulos.js';
import { crearActores } from './actores/actores.js';
import { crearReglas, abrirCon } from './reglas/reglas.js';
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
import { pedirSombra } from './escena/pedidos.js';
import { crearDeteccion, DETECCION } from './escena/deteccion.js';

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

// Cede dos cuadros al navegador para que el aviso de carga de index.html se pinte antes de generar la escena
// (con un plazo, por si la pestaña está oculta y no hay cuadros).
const cederCuadro = () =>
  new Promise((resolver) => {
    const plazo = setTimeout(resolver, 150);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        clearTimeout(plazo);
        resolver();
      }),
    );
  });

const quitarCarga = () => document.getElementById('carga')?.setAttribute('hidden', '');

function mostrarAviso(texto) {
  quitarCarga();
  const aviso = document.getElementById('aviso');
  aviso.textContent = texto;
  aviso.hidden = false;
}

// Señal para la verificación automática y para módulos futuros.
function marcarListo() {
  quitarCarga();
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
  await cederCuadro();
  const parametros = leerParametros();
  // Calidad del hash antes de montar la escena: los módulos arrancan ya en ese nivel.
  if (parametros.calidad) cambiar({ calidad: parametros.calidad });
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
  // Teoría de cambio: el escenario y las capas derivados de las condiciones (panel de P19, tecla T y hash #c=).
  const reglas = montar('reglas', crearReglas);
  if (reglas && parametros.condiciones) abrirCon(parametros.condiciones);
  // Coberturas después de la primera parada: su escenario se aplica sin transición.
  const coberturas = montar('coberturas', () => crearCoberturas({ altura, camara: escena.camara, instantanea: parametros.captura }));
  if (coberturas) {
    escena.agregar(coberturas.grupo);
    escena.superponer(coberturas.superposicion);
    escena.alCuadro(coberturas.cuadro);
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
      camara: escena.camara,
      alCuadro: escena.alCuadro,
    }),
  );
  // Flujos de los procesos supraprediales (P09 a P11), con sus rótulos.
  const flujos = coberturas && montar('flujos', () => crearFlujos({ altura, superficie, ancla, coberturas, instantanea: parametros.captura }));
  if (flujos) {
    escena.superponer(flujos.grupo);
    escena.alCuadro(flujos.cuadro);
  }
  const rotulosFlujos = flujos && montar('rótulos de flujos', () =>
    crearRotulosFlujos({
      contenedor: document.getElementById('interfaz'),
      capas: flujos.capas,
      proyectar: (x, y, z) => proyectar(escena, new THREE.Vector3(x, y, z)),
      alCuadro: escena.alCuadro,
    }),
  );
  // Red de actores (P18 a P20): mercados, enlaces, polígono de la red y límites, con sus rótulos.
  const actores = montar('actores', () => crearActores({ altura, superficie, ancla }));
  if (actores) escena.superponer(actores.grupo);
  const rotulosActores = actores && montar('rótulos de actores', () =>
    crearRotulosFlujos({
      contenedor: document.getElementById('interfaz'),
      capas: actores.capas,
      proyectar: (x, y, z) => proyectar(escena, new THREE.Vector3(x, y, z)),
      alCuadro: escena.alCuadro,
    }),
  );
  // Vista del presentador (npm run presentar): publica el estado y recibe órdenes.
  montar('presentador', crearSincronia);
  // Detección de calidad: sin #calidad= en el hash; en la verificación y con #captura=1, solo con #deteccion=.
  const deteccion = montar('detección de calidad', () =>
    crearDeteccion({
      cuadros: escena.cuadros,
      umbral: parametros.deteccion ?? DETECCION.umbral,
      activa: !parametros.calidad && (parametros.deteccion != null || !(parametros.captura || navigator.webdriver)),
    }),
  );

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
    flujos: () => flujos && { ...flujos.datos(), rotulos: rotulosFlujos?.visibles() ?? 0 },
    fijarRelojFlujos: (t) => flujos?.fijarReloj(t),
    actores: () => actores && { ...actores.datos(), rotulos: rotulosActores?.visibles() ?? 0 },
    reglas: () => reglas?.datos() ?? null,
    evaluarReglas: (ids) => reglas?.evaluar(ids) ?? null,
    cambiarEscenario: (id) => cambiar({ escenario: id }),
    capas: (lista) => cambiar({ capas: lista }),
    revisarAnclas: revisarAnclasTerreno,
    vista: (id, vista) => escena.mirar(ancla(id), vista),
    estado: () => obtener(),
    deteccion: () => deteccion?.datos() ?? null,
    dibujo: (activo) => (activo ? escena.iniciar() : escena.pausar()),
    dibujarCuadro: () => escena.dibujar(),
    // Verificación: fuerza el recálculo de la sombra en el cuadro siguiente.
    pedirSombra,
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
