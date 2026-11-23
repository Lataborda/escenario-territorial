// Aparición gradual de las capas superpuestas (etapa 10.b.b). mostrar(grupo, visible) funde la opacidad de los
// materiales del grupo de 0 a 1 al aparecer y de 1 a 0 al ocultar, y deja el grupo oculto al terminar. La opacidad
// base de cada material queda en userData; las partículas usan su uniforme «uOpacidad». Pide cuadro mientras dura.
// Con #captura=1 el cambio es inmediato, para que las capturas sean idénticas en cada carga. Solo toca el grupo que
// recibe: los módulos de capa la usan en lugar de asignar grupo.visible.
import gsap from 'gsap';
import { leerParametros } from '../parametros.js';
import { pedirCuadro } from './pedidos.js';

export const DURACION = { entrada: 0.8, salida: 0.5 }; // s
const instantanea = leerParametros().captura;
const estados = new WeakMap(); // grupo -> { factor, objetivo, tween }

function materiales(grupo) {
  const lista = [];
  grupo.traverse((o) => {
    if (o.material) lista.push(...[].concat(o.material));
  });
  return lista;
}

function aplicar(grupo, factor) {
  for (const m of materiales(grupo)) {
    const d = m.userData;
    const uniforme = m.uniforms?.uOpacidad;
    if (d.opacidadBase == null) {
      d.opacidadBase = uniforme ? uniforme.value : m.opacity;
      d.transparenteBase = m.transparent;
    }
    if (uniforme) uniforme.value = d.opacidadBase * factor;
    else {
      m.opacity = d.opacidadBase * factor;
      m.transparent = d.transparenteBase || factor < 1;
    }
  }
}

/** Muestra u oculta el grupo de una capa con un fundido (inmediato con #captura=1). */
export function mostrar(grupo, visible) {
  let e = estados.get(grupo);
  if (!e) {
    e = { factor: grupo.visible ? 1 : 0, objetivo: grupo.visible, tween: null };
    estados.set(grupo, e);
  }
  if (e.objetivo === visible) return;
  e.objetivo = visible;
  e.tween?.kill();
  e.tween = null;
  if (instantanea) {
    e.factor = visible ? 1 : 0;
    aplicar(grupo, e.factor);
    grupo.visible = visible;
    return;
  }
  grupo.visible = true;
  aplicar(grupo, e.factor);
  // El reloj de GSAP duerme sin animaciones: se pone al día para que el fundido dure lo pedido (como camara.js).
  gsap.ticker.tick();
  e.tween = gsap.to(e, {
    factor: visible ? 1 : 0,
    duration: visible ? DURACION.entrada : DURACION.salida,
    ease: 'power1.inOut',
    onUpdate: () => {
      aplicar(grupo, e.factor);
      pedirCuadro();
    },
    onComplete: () => {
      e.tween = null;
      grupo.visible = visible;
      pedirCuadro();
    },
  });
}

/** Verificación: factor de opacidad actual del grupo (1 si nunca pasó por aquí y está visible). */
export const factorDe = (grupo) => estados.get(grupo)?.factor ?? (grupo.visible ? 1 : 0);
