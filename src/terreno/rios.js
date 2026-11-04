// Trazos del río Cauca, el río tributario (referencia: río Amaime) y las quebradas. Datos de dibujo, sin escala.
// Trazos en coordenadas del plano, del nacimiento a la desembocadura.
// ancho: [nacimiento, desembocadura] en unidades de escena; profundidad en unidades base.
// valle: descenso ilustrativo del relieve (m) según u, y ancho del valle en unidades de escena.
// serpenteo: meandros en el plano del valle (amplitud y longitud de onda en unidades de escena).
export const RIOS = [
  {
    id: 'rio_cauca',
    ancho: [17, 20],
    profundidad: 2.2,
    puntos: [[0.044, 1.03], [0.036, 0.78], [0.047, 0.52], [0.035, 0.27], [0.043, -0.03]],
    serpenteo: { amplitud: 5, onda: 150 },
  },
  {
    id: 'rio_tributario',
    unirA: 'rio_cauca',
    ancho: [2.5, 12],
    profundidad: 1.8,
    valle: { cotas: [[0.5, 0], [0.6, 150], [0.7, 450], [0.8, 650], [0.88, 700], [0.97, 350]], ancho: 75 },
    puntos: [
      [0.966, 0.446], [0.93, 0.432], [0.88, 0.418], [0.83, 0.407], [0.78, 0.403], [0.7, 0.4],
      [0.62, 0.404], [0.55, 0.41], [0.47, 0.404], [0.38, 0.398], [0.28, 0.405], [0.18, 0.414],
      [0.12, 0.42], [0.05, 0.4],
    ],
    serpenteo: { amplitud: 8, onda: 120, hastaU: 0.5 },
  },
  {
    id: 'quebrada_cabecera',
    unirA: 'rio_tributario',
    ancho: [2, 4.5],
    profundidad: 1.1,
    valle: { cotas: [[0.8, 260], [0.97, 260]], ancho: 28 },
    puntos: [[0.955, 0.31], [0.925, 0.335], [0.895, 0.362], [0.87, 0.39], [0.855, 0.408]],
  },
  {
    id: 'quebrada_norte',
    unirA: 'rio_tributario',
    ancho: [2, 5],
    profundidad: 1.2,
    valle: { cotas: [[0.55, 60], [0.65, 250], [0.9, 300]], ancho: 32 },
    puntos: [
      [0.885, 0.262], [0.84, 0.278], [0.79, 0.296], [0.74, 0.312], [0.695, 0.322], [0.655, 0.34],
      [0.62, 0.368], [0.595, 0.402],
    ],
  },
  {
    id: 'quebrada_sur',
    unirA: 'rio_tributario',
    ancho: [2, 5],
    profundidad: 1.2,
    valle: { cotas: [[0.55, 60], [0.65, 250], [0.9, 300]], ancho: 32 },
    puntos: [
      [0.905, 0.565], [0.855, 0.535], [0.805, 0.505], [0.755, 0.48], [0.705, 0.458], [0.665, 0.44],
      [0.635, 0.422], [0.612, 0.406],
    ],
  },
  {
    id: 'quebrada_meridional',
    unirA: 'rio_cauca',
    ancho: [2, 6],
    profundidad: 1.3,
    valle: { cotas: [[0.5, 0], [0.6, 150], [0.7, 300], [0.9, 320]], ancho: 34 },
    puntos: [
      [0.935, 0.8], [0.87, 0.783], [0.8, 0.766], [0.72, 0.752], [0.64, 0.742], [0.56, 0.737],
      [0.48, 0.742], [0.4, 0.736], [0.3, 0.746], [0.2, 0.741], [0.11, 0.747], [0.05, 0.75],
    ],
    serpenteo: { amplitud: 5, onda: 90, hastaU: 0.48 },
  },
];
