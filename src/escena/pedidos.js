// Pedidos al ciclo de dibujo (etapa 7.c). La sombra no se recalcula en cada cuadro y, con la cámara quieta y sin
// viento, tampoco se dibuja: el módulo que cambia algo visible fuera del estado (una transición, un nivel de detalle,
// la subida del corte) lo avisa aquí y escena.js decide. Mismo patrón del reloj compartido de viento.js: ningún módulo
// toca a otro.
const pendiente = { sombra: true, cuadro: true }; // el primer cuadro calcula la sombra

/** Lo que proyecta sombra cambió: el mapa de sombras se recalcula en el cuadro siguiente. */
export function pedirSombra() {
  pendiente.sombra = true;
  pendiente.cuadro = true;
}

/** La imagen cambió sin que se moviera la cámara: hay que dibujar un cuadro. */
export function pedirCuadro() {
  pendiente.cuadro = true;
}

export const hayPedido = () => pendiente.cuadro;

/** Uso de escena.js, antes de dibujar: devuelve los pedidos y los deja en cero. */
export function tomarPedidos() {
  const tomados = { ...pendiente };
  pendiente.sombra = false;
  pendiente.cuadro = false;
  return tomados;
}
