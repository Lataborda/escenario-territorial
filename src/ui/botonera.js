// Botonera de siete escalas, siempre visible: región arriba, suelo abajo.
// Marca la escala activa y, con un punto, la escala propia de la parada.
import { obtener, suscribir } from '../estado.js';
import { ESCALAS, irAEscala } from '../navegacion/foco.js';
import { buscarParada } from '../navegacion/recorrido.js';

export function crearBotonera(contenedor) {
  const botones = new Map();
  for (const s of [...ESCALAS].sort((a, b) => b.numero - a.numero)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'escala';
    b.dataset.escala = s.id;
    b.title = `${s.nombre}. ${s.unidad}`;
    const numero = document.createElement('span');
    numero.className = 'escala-numero';
    numero.textContent = s.numero;
    const rotulo = document.createElement('span');
    rotulo.className = 'escala-rotulo';
    rotulo.textContent = s.rotulo;
    b.append(numero, rotulo);
    // Sin foco tras el clic: la barra espaciadora sigue avanzando el recorrido.
    b.addEventListener('click', () => {
      b.blur();
      irAEscala(s.id);
    });
    contenedor.append(b);
    botones.set(s.id, b);
  }

  function marcar(e) {
    const propia = buscarParada(e.parada)?.escala;
    for (const [id, b] of botones) {
      b.classList.toggle('activa', id === e.escala);
      b.classList.toggle('de-parada', id === propia);
      b.setAttribute('aria-pressed', String(id === e.escala));
    }
  }
  suscribir(['escala', 'parada'], marcar);
  marcar(obtener());
}
