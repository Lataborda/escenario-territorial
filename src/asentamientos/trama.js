// Trama de la ciudad y de las cabeceras: manzanas en cuadrícula, plaza central y edificaciones en el perímetro
// de cada manzana. Datos de dibujo, sin escala ni Three.js; las alturas del terreno se aplican al dibujar.

// Radio del área construida (unidades de escena). Las vías terminan en su borde.
export const RADIO = { ciudad: 64, cabecera: 20 };

const MEDIDAS = {
  ciudad: { lado: 11, calle: 3.2, frente: [2.2, 3.4], fondo: [3.4, 4.2], altura: [1.6, 2.6], centro: 22, torre: [4, 9], torres: 0.55 },
  cabecera: { lado: 7.4, calle: 2.6, frente: [1.9, 2.8], fondo: [2.6, 3.2], altura: [1.4, 2.1], centro: 0, torre: [0, 0], torres: 0 },
};

export const COLORES = {
  calle: 0x6c6964,
  anden: 0xd2cabd,
  plaza: 0x8eab5c,
  paredes: [0xf2eee6, 0xeae0c8, 0xe3d3b0, 0xeed8cc, 0xd8e0e0, 0xf0e4bc],
  torres: [0xdcd9d2, 0xc9c5bc, 0xe8e4dc, 0xd4cec2],
  tejados: [0xa65232, 0xb4623e, 0x96492e, 0xb87050, 0x9c5a3c],
};

const entre = (azar, [a, b]) => a + (b - a) * azar();
const elegir = (azar, lista) => lista[Math.floor(azar() * lista.length)];

// Lotes a lo largo de un lado de la manzana: frentes de ancho variable hasta cubrir el largo.
function lotes(largo, azar, frente) {
  const lista = [];
  let s = -largo / 2;
  while (s < largo / 2 - 0.8) {
    const a = Math.min(entre(azar, frente), largo / 2 - s);
    lista.push({ centro: s + a / 2, ancho: a });
    s += a;
  }
  return lista;
}

// Devuelve, en coordenadas de escena, las manzanas, las edificaciones y los árboles de la plaza y los patios.
export function crearTrama({ x, z, clase, giro, azar }) {
  const m = MEDIDAS[clase];
  const radio = RADIO[clase];
  const paso = m.lado + m.calle;
  const c = Math.cos(giro);
  const s = Math.sin(giro);
  const aMundo = (lx, lz) => ({ x: x + lx * c - lz * s, z: z + lx * s + lz * c });
  const n = Math.ceil(radio / paso);
  const manzanas = [];
  const edificios = [];
  const arboles = [];
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const lx = i * paso;
      const lz = j * paso;
      // La manzana entera queda dentro del radio.
      if (Math.hypot(lx, lz) + m.lado * Math.SQRT1_2 > radio) continue;
      const plaza = i === 0 && j === 0;
      manzanas.push({ ...aMundo(lx, lz), lado: m.lado, paso, giro, plaza });
      if (plaza) {
        // Árboles alrededor de la plaza.
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2 + 0.4;
          arboles.push(aMundo(lx + Math.cos(a) * m.lado * 0.36, lz + Math.sin(a) * m.lado * 0.36));
        }
        continue;
      }
      const centro = Math.hypot(lx, lz) < m.centro;
      // Cuatro lados: norte y sur de esquina a esquina; oriente y occidente entre ellos.
      for (let lado = 0; lado < 4; lado++) {
        const fondo = entre(azar, m.fondo);
        const largo = lado < 2 ? m.lado : m.lado - 2 * fondo;
        const angulo = giro + (lado < 2 ? 0 : Math.PI / 2);
        const signo = lado % 2 ? 1 : -1;
        for (const l of lotes(largo, azar, m.frente)) {
          const px = lado < 2 ? l.centro : signo * (m.lado / 2 - fondo / 2);
          const pz = lado < 2 ? signo * (m.lado / 2 - fondo / 2) : l.centro;
          const torre = centro && azar() < m.torres;
          edificios.push({
            ...aMundo(lx + px, lz + pz),
            ancho: l.ancho - 0.12,
            fondo,
            alto: torre ? entre(azar, m.torre) : entre(azar, m.altura),
            giro: angulo,
            tejado: !torre,
            pared: torre ? elegir(azar, COLORES.torres) : elegir(azar, COLORES.paredes),
            techo: elegir(azar, COLORES.tejados),
          });
        }
      }
      // Árbol de patio en algunas manzanas.
      if (azar() < 0.45) arboles.push(aMundo(lx + (azar() - 0.5) * 2, lz + (azar() - 0.5) * 2));
    }
  }
  return { manzanas, edificios, arboles };
}
