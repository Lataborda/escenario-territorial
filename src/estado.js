// Almacén único del escenario. Los módulos leen con obtener(), proponen cambios con cambiar()
// y reaccionan con suscribir(). Ningún módulo modifica a otro directamente.

const inicial = {
  parada: null, // id de la parada actual (P01 a P26)
  paso: 0, // índice del paso dentro de la parada (0 si no tiene pasos)
  escala: 'territorio', // botón activo de la botonera
  foco: 'general', // ancla del punto de interés
  camara: null, // vista pedida: { ancla, distancia, azimut, elevacion, duracion }
  escenario: 'S0',
  condiciones: [],
  lente: null,
  anio: 'hoy',
  capas: [],
  modo: 'recorrido', // recorrido | libre | actividad | autor
  interfaz: true, // tecla H
  liviano: false, // tecla V
  miniatura: true, // tecla M: desenfoque de miniatura
  medidor: false, // tecla R: cuadros por segundo y llamadas de dibujo
  anclas: false, // tecla A
  aviso: null, // mensaje breve del modo autor: { titulo, texto }
};

let estado = { ...inicial };
const suscriptores = new Set();
const cola = [];
let notificando = false;

export const obtener = () => estado;

// Suscribe fn(estado, cambiadas) a una clave, a una lista de claves o a todas (null).
export function suscribir(claves, fn) {
  const lista = claves == null ? null : [].concat(claves);
  const s = { lista, fn };
  suscriptores.add(s);
  return () => suscriptores.delete(s);
}

function notificar(cambiadas) {
  for (const s of [...suscriptores]) {
    if (s.lista && !s.lista.some((k) => cambiadas.includes(k))) continue;
    try {
      s.fn(estado, cambiadas);
    } catch (error) {
      console.error('Suscriptor del estado:', error);
    }
  }
}

// Mezcla los valores nuevos; notifica solo las claves que cambian (comparación por identidad).
function aplicar(parcial) {
  const cambiadas = Object.keys(parcial).filter((k) => {
    if (!(k in inicial)) {
      console.warn(`Estado: clave desconocida «${k}»`);
      return false;
    }
    return estado[k] !== parcial[k];
  });
  if (!cambiadas.length) return;
  estado = { ...estado, ...Object.fromEntries(cambiadas.map((k) => [k, parcial[k]])) };
  notificar(cambiadas);
}

// Un cambio pedido durante una notificación espera su turno, para conservar el orden.
export function cambiar(parcial) {
  cola.push(parcial);
  if (notificando) return;
  notificando = true;
  try {
    while (cola.length) aplicar(cola.shift());
  } finally {
    notificando = false;
  }
}
