// Rótulos de la finca sobre la escena: marcadores numerados de los lotes (capa «rotulos_finca», mismos números
// que el panel de usos de src/ui/capas.js) y rótulos del resaltado del agroecosistema menor y mayor. Elementos de
// la interfaz con panel propio, colocados en cada cuadro sobre la proyección de su punto. Textos en
// contenido/fincas.json.
import contenido from '../../contenido/fincas.json';
import { obtener, suscribir } from '../estado.js';
import { marca } from '../ui/capas.js';

const ALZA = 3; // altura del punto del rótulo sobre el terreno (unidades de escena)

function crear(contenedor, clase) {
  const e = document.createElement('div');
  e.className = `rotulo-finca ${clase}`;
  e.hidden = true;
  contenedor.append(e);
  return e;
}

// Marcadores de los lotes de una finca: uno por lote de la receta, en el mayor de sus lotes; corredores en la
// cerca interna más próxima al centro de la finca.
function puntosDeLotes(finca) {
  const puntos = finca.receta.lotes.map((r, k) => {
    const propios = finca.lotes.filter((l) => l.receta === k);
    if (!propios.length) return null;
    const l = propios.reduce((a, b) => (b.teselas.length > a.teselas.length ? b : a));
    return { x: l.x, z: l.z };
  });
  // Corredores: la cerca interna más alejada de los demás marcadores y de la casa.
  if (finca.receta.corredores && finca.internos.length) {
    const medio = ([x1, z1, x2, z2]) => ({ x: (x1 + x2) / 2, z: (z1 + z2) / 2 });
    const otros = [...puntos.filter(Boolean), finca.casa];
    const holgura = (s) => Math.min(...otros.map((p) => Math.hypot(medio(s).x - p.x, medio(s).z - p.z)));
    puntos.push(medio(finca.internos.reduce((a, b) => (holgura(b) > holgura(a) ? b : a))));
  }
  return puntos;
}

/** fincas: módulo de src/fincas/fincas.js; proyectar(x, y, z) → { x, y } en píxeles o null. */
export function crearRotulosFinca({ contenedor, fincas, altura, proyectar, alCuadro }) {
  const capa = document.createElement('div');
  capa.className = 'rotulos-finca';
  capa.setAttribute('aria-hidden', 'true');
  contenedor.prepend(capa);
  const marcadores = [];
  const menor = crear(capa, 'resaltado');
  const mayor = crear(capa, 'resaltado');
  for (const [e, clave] of [[menor, 'agroecosistema_menor'], [mayor, 'agroecosistema_mayor']]) {
    const c = contenido.capas[clave];
    const titulo = document.createElement('strong');
    titulo.textContent = c.rotulo;
    const texto = document.createElement('span');
    texto.textContent = c.texto;
    e.append(titulo, texto);
  }

  // Elementos visibles con su punto en la escena.
  let activos = [];
  function pintar({ capas, foco }) {
    activos = [];
    const propia = fincas.fincas.find((f) => f.id === foco);
    const puntos = capas.includes('rotulos_finca') && propia ? puntosDeLotes(propia) : [];
    while (marcadores.length < puntos.length) {
      const e = crear(capa, 'marcador');
      e.append(marca(marcadores.length + 1));
      marcadores.push(e);
    }
    marcadores.forEach((e, k) => {
      e.hidden = true;
      if (puntos[k]) activos.push({ e, x: puntos[k].x, z: puntos[k].z, ancla: 'centro' });
    });
    const resaltada = fincas.resaltada();
    menor.hidden = true;
    mayor.hidden = true;
    // Rótulos del resaltado: sobre el punto más alto de su contorno en la pantalla.
    for (const [e, nombre] of [[menor, 'agroecosistema_menor'], [mayor, 'agroecosistema_mayor']]) {
      if (resaltada && capas.includes(nombre)) activos.push({ e, contorno: fincas.contorno(nombre), ancla: 'arriba' });
    }
    colocar();
  }

  // Punto del contorno con la menor ordenada en pantalla.
  function cima(segmentos) {
    let mejor = null;
    for (const [x1, z1, x2, z2] of segmentos) {
      for (const [x, z] of [[x1, z1], [x2, z2]]) {
        const p = proyectar(x, altura(x, z) + 1, z);
        if (p && (!mejor || p.y < mejor.y)) mejor = p;
      }
    }
    return mejor;
  }

  function colocar() {
    if (!activos.length) return;
    const ancho = window.innerWidth;
    const alto = window.innerHeight;
    for (const a of activos) {
      const p = a.contorno ? cima(a.contorno) : proyectar(a.x, altura(a.x, a.z) + ALZA, a.z);
      const fuera = !p || p.x < 0 || p.y < 0 || p.x > ancho || p.y > alto;
      a.e.hidden = fuera;
      if (fuera) continue;
      // Marcadores centrados en el punto; rótulos del resaltado encima, con la punta en el punto.
      const dy = a.ancla === 'arriba' ? 'calc(-100% - 0.6rem)' : '-50%';
      a.e.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, ${dy})`;
    }
  }

  suscribir(['capas', 'foco'], pintar);
  pintar(obtener());
  alCuadro(colocar);
  return { visibles: () => activos.filter((a) => !a.e.hidden).length };
}
