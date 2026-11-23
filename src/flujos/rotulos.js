// Rótulos de los flujos sobre la escena (etapa 8): los de cada capa de flujo (contenido/procesos.json, rotulos),
// visibles con su capa y en sus escenarios. Mismo estilo de los rótulos de finca (src/ui/capas.css), con la punta en
// el punto («lado» del rótulo: encima o debajo). Solo escriben la posición: sin lecturas de medida por cuadro.
// Un rótulo con «tituloDe(estado)» (etapa 10.b.b, detonantes) toma de ahí su título y no se ve si devuelve null.
import { obtener, suscribir } from '../estado.js';

/** capas: capas de flujos.js (con «rotulos»); proyectar(x, y, z) → { x, y } en píxeles o null. */
export function crearRotulosFlujos({ contenedor, capas, proyectar, alCuadro }) {
  const capa = document.createElement('div');
  capa.className = 'rotulos-finca rotulos-flujos';
  capa.setAttribute('aria-hidden', 'true');
  contenedor.prepend(capa);
  const todos = capas.flatMap((c) =>
    c.rotulos.map((r) => {
      const e = document.createElement('div');
      e.className = `rotulo-finca resaltado rotulo-flujo${r.lado === 'abajo' ? ' abajo' : ''}`;
      e.dataset.rotulo = r.id;
      e.hidden = true;
      const titulo = document.createElement('strong');
      titulo.textContent = r.titulo;
      e.append(titulo);
      if (r.texto) {
        const texto = document.createElement('span');
        texto.textContent = r.texto;
        e.append(texto);
      }
      capa.append(e);
      return { e, titulo, tituloDe: r.tituloDe ?? null, capa: c.capa, escenarios: r.escenarios ?? null, punto: r.punto, abajo: r.lado === 'abajo' };
    }),
  );

  let activos = [];
  function colocar() {
    for (const a of activos) {
      const p = proyectar(...a.punto);
      const fuera = !p || p.x < 0 || p.y < 0 || p.x > window.innerWidth || p.y > window.innerHeight;
      a.e.hidden = fuera;
      // Encima del punto, con la punta hacia abajo; con «lado: abajo», debajo y con la punta hacia arriba.
      const dy = a.abajo ? '0.6rem' : 'calc(-100% - 0.6rem)';
      if (!fuera) a.e.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, ${dy})`;
    }
  }
  function pintar(estado) {
    const { capas: encendidas, escenario } = estado;
    activos = todos.filter((r) => {
      if (!encendidas.includes(r.capa) || (r.escenarios && !r.escenarios.includes(escenario))) return false;
      if (!r.tituloDe) return true;
      const titulo = r.tituloDe(estado);
      if (titulo) r.titulo.textContent = titulo;
      return Boolean(titulo);
    });
    for (const r of todos) if (!activos.includes(r)) r.e.hidden = true;
    colocar();
  }
  suscribir(['capas', 'escenario', 'condiciones'], pintar);
  pintar(obtener());
  alCuadro(colocar);
  return { visibles: () => activos.filter((a) => !a.e.hidden).length };
}
