# Plan de construcción del escenario territorial

Versión 1, 1 de noviembre de 2026. Plan para Claude Code, ejecutado por etapas en sesiones separadas. Cada etapa deja el proyecto funcionando, verificado y registrado. El contenido conceptual está en `GUION.md`; el protocolo de cada sesión, en `CLAUDE.md`.

## 1. Propósito

Construir una maqueta 3D navegable de un territorio esquemático (cuenca de ladera, valle y ciudad) que sirva como herramienta pedagógica de la clase «Transición hacia sistemas alimentarios agroecológicos: del agroecosistema al territorio». La maqueta permite acercarse del territorio a la finca, al lote y al suelo, y alejarse hasta la región y la política, y muestra bajo una teoría de cambio qué condiciones llevan la agroecología de fincas aisladas (faros) a territorios.

Restricciones de la prueba que fijan el diseño (Res. 356 de 2026, art. 11):

- Exposición de 40 minutos por videoconferencia, ante tres jurados y un veedor.
- Se evalúan expresión oral, manejo de herramientas pedagógicas y propuesta didáctica. El escenario sirve a una clase; cada parada corresponde a un momento didáctico.
- La fecha se notifica por correo con una antelación no inferior a tres días (Guía del Aspirante, literal E). Por eso el plan alcanza una versión presentable en la etapa 4.

## 2. Decisiones de diseño

### 2.1 Herramienta

| Opción | Decisión | Motivo |
|---|---|---|
| Three.js con Vite y GSAP | elegida | corre en el navegador; gratuita; se construye por etapas desde texto; GSAP ya se usó en el prototipo; admite un archivo HTML único de respaldo |
| Babylon.js | descartada | capacidades equivalentes; Three.js tiene más ejemplos y documentación, lo que reduce iteraciones |
| Godot o Unity | descartadas | motores con edición visual; exportación web pesada; poco aptos para construir por etapas desde texto |
| CesiumJS | descartada | pensada para terreno real del planeta; el territorio es esquemático |
| Hyperframes | se conserva aparte | diapositivas animadas en 2D, sin navegación 3D |
| Video generativo | etapa opcional O2 | alto realismo, sin interactividad, con costo |

### 2.2 Estilo visual

- Realismo de maqueta (decisión D5, revisada en la etapa 5.b): bloque recortado cuyas caras laterales muestran los estratos del suelo, con vegetación de especies reconocibles, copas formadas por racimos de hojas, variación de color y niveles de detalle (alto cerca de la cámara, simple a escala de territorio). Retoma el formato de diorama del video de referencia (bloque en sección, rótulos con punto y línea guía), con geometría generada por código. La etapa 5.c lleva el mismo estilo al resto de la vegetación.
- Fondo neutro, luz cenital suave, una sola sombra direccional.
- Rótulos HTML nítidos (CSS2DRenderer). Tipografías del prototipo Hyperframes (IBM Plex Sans y Fraunces), en archivos locales.
- Semántica fija de flujos: agua azul, sedimentos pardo, nutrientes naranja, semillas violeta, conocimiento amarillo, alimento y mercado verde, gobernanza gris. Cada flujo lleva además forma o trazo propio y rótulo, para no depender del color.
- Transiciones de cámara lentas (1,5 a 3 s) y sin giros bruscos, porque la videoconferencia comprime el movimiento rápido.

### 2.3 Territorio

Territorio esquemático inspirado en el valle geográfico del río Cauca, una cuenca tributaria de la cordillera Central y el norte del Cauca (decisión D1 de `GUION.md`). Orientación: oriente con cordillera y páramo, occidente con el río Cauca, norte en el Valle del Cauca, sur en el Cauca, separados por un límite departamental. El plano esquemático y las posiciones iniciales están en `GUION.md`, sección 2.

### 2.4 Relación con el prototipo Hyperframes

`../Prototipo_Hyperframes/` queda como respaldo y como fuente de contenido de M1 (niveles de organización, funcionamiento del agroecosistema, EAP). No se integra al código de este proyecto ni se modifica.

## 3. Arquitectura técnica

### 3.1 Componentes

| Componente | Función |
|---|---|
| Vite | servidor de desarrollo y compilación con dos entradas (vista principal y vista del presentador) |
| Three.js | escena, terreno, vegetación instanciada, líneas gruesas de red (Line2) |
| CSS2DRenderer (Three.js) | rótulos HTML |
| OrbitControls (Three.js) | modo libre |
| GSAP | transiciones de cámara y de estado |
| simplex-noise | ruido con semilla para el relieve |
| lil-gui | ajustes en modo autor, solo en desarrollo |
| vite-plugin-singlefile | archivo HTML único de respaldo |
| Playwright | recorrido automático, capturas y control de errores |

Todas son gratuitas. Three.js, Vite, simplex-noise, lil-gui y vite-plugin-singlefile usan licencia MIT; Playwright, Apache 2.0; GSAP es de uso gratuito según su fabricante.

### 3.2 Estructura de carpetas

```
Escenario_Territorial/
  CLAUDE.md  PLAN.md  GUION.md  BITACORA.md
  package.json  package-lock.json  vite.config.js
  index.html               vista principal (la que se comparte)
  presentador.html         vista del presentador
  contenido/               datos editables (JSON)
    territorio.json  escalas.json  paradas.json  escenarios.json
    condiciones.json  actores.json  fuentes.json
  src/
    main.js  estado.js
    escena/        renderizador, luces, cámara, bloque de la maqueta
    terreno/       relieve, zonas, ríos, anclas, altura(x, z)
    coberturas/    vegetación y usos del suelo por zona
    fincas/        generador de fincas y conectores EAP
    suelo/         lote e interacciones, corte de suelo
    procesos/      flujos (agua, sedimentos, nutrientes, semillas, polinizadores)
    redes/         actores, enlaces, polígonos, figuras territoriales
    reglas/        teoría de cambio: condiciones a efectos
    navegacion/    paradas, transiciones, teclado, hash
    ui/            botonera de escalas, ficha, leyenda, paneles
    presentador/   sincronización entre ventanas
    util/          azar con semilla, ruido, interpolación
  src/fuentes/             tipografías locales (Vite las incrusta en el archivo único)
  scripts/                 validar-contenido.mjs, verificar.mjs, respaldo.mjs
  verificacion/            capturas e informe de la última verificación
  respaldo/                presentación de imágenes generada
  vista-previa/            escenario.html: copia versionada del archivo único
```

### 3.3 Modelo de datos

Coordenadas del plano normalizadas entre 0 y 1 (x de occidente a oriente, z de norte a sur). Cada entidad de `territorio.json` tiene un `id` que funciona como ancla de cámara. Las paradas definen la cámara respecto de un ancla, de modo que un cambio del relieve no rompe el recorrido.

Ejemplo de parada:

```json
{
  "id": "P06",
  "momento": "M1",
  "minutos": 1.5,
  "saltable": false,
  "titulo": "Finca faro en el plano",
  "escala": "finca",
  "camara": { "ancla": "F1", "distancia": 420, "azimut": 35, "elevacion": 40, "duracion": 2.5 },
  "estado": { "escenario": "S0", "capas": ["conectores", "rotulos_finca"], "lente": null, "anio": "hoy" },
  "ficha": "Texto de pantalla, 60 palabras como máximo.",
  "notas": "Notas del presentador.",
  "fuentes": ["calle:§11.1"],
  "estado_texto": "borrador"
}
```

Ejemplo de condición:

```json
{
  "id": "C7",
  "nombre": "Mercados favorables y circuitos cortos",
  "fuentes": ["zollet:§4(3)", "levidow:§2.2"],
  "efectos": ["mercados_activos"],
  "efecto_territorial_requiere": { "todas": ["C5"], "alguna": ["C4", "C6"] },
  "mensaje_si_falta": "Mercados activos sin organización social que los articule"
}
```

Las dependencias y las reglas visuales usan la misma expresión: `todas` (deben estar activas), `alguna` (al menos una) y `ninguna` (ninguna activa). Una referencia sin localizador conocido se escribe `clave:verificar` y aparece en `verificacion/pendientes-de-fuente.md`.

`fuentes.json` asocia cada clave con referencia, archivo y estado (`en carpeta`, `falta`, `verificar`). El localizador va después de los dos puntos de la clave (`clave:página o sección`).

### 3.4 Estado y navegación

Almacén único en `src/estado.js` con suscripción:

```
{ parada, paso, escala, foco, camara, escenario, condiciones[], lente, anio, capas[], modo,
  interfaz, liviano, miniatura, medidor, anclas, aviso }
modo: recorrido | libre | actividad | autor
```

`foco` es el ancla del punto de interés; `camara` es la vista pedida (ancla, distancia, azimut, elevación, duración) y el módulo de cámara la anima. Al llegar a una parada con pasos se muestra el primero; al retroceder desde la parada siguiente se llega al último.

Interfaz principal: la botonera de siete escalas (suelo, planta, finca, vereda, cuenca, territorio, región), siempre visible. Cada botón lleva a la vista tipo de su escala desde el punto de interés actual. Un clic en una finca o en un mercado acerca la cámara a ese elemento y lo fija como punto de interés.

Paradas: guion de clase que el presentador recorre con las flechas (o con los controles de la vista del presentador). Nada avanza solo. Ningún temporizador cambia la parada, la escala ni la cámara; cada cambio responde a una acción del presentador.

Flujo: `irA(parada)` anima la cámara con GSAP, aplica el estado de la parada y cada módulo visual reacciona a los cambios que le competen. La botonera y el clic sobre fincas y mercados modifican `escala` y la cámara sin cambiar de parada.

| Tecla | Acción |
|---|---|
| → , espacio o Av Pág | parada o paso siguiente (en modo libre, → mueve la cámara) |
| ← o Re Pág | parada o paso anterior (en modo libre, ← mueve la cámara) |
| 0 a 6 | primera parada del momento M0 a M6 |
| O | modo libre; otra vez O vuelve al recorrido con la cámara de la parada |
| F | pantalla completa |
| H | ocultar o mostrar la interfaz |
| V | modo liviano |
| M | desenfoque de miniatura (etapa 5.c.c) |
| R | medidor de rendimiento: cuadros por segundo y llamadas de dibujo (etapa 5.c.c) |
| C | modo autor: copia la cámara actual en formato de parada |
| A | modo autor: muestra las anclas (en modo libre, A mueve la cámara) |

Modo libre (etapa 3.b): órbita y zoom con el ratón; doble clic en un punto del relieve para volar hasta él (la distancia se reduce a la mitad, hasta 90); flechas o WASD para avanzar sobre el paisaje, con Mayús para ir más rápido. La cámara no baja del relieve y el objetivo no sale de la maqueta. Av Pág, Re Pág y espacio siguen avanzando el recorrido, de modo que el presentador inalámbrico funciona igual. La botonera, en modo libre, toma como punto de interés el objetivo actual de la cámara.

El hash `#p=P06` abre una parada directamente; sirve para pruebas y para recargar en plena exposición sin perder el lugar.

### 3.5 Vista del presentador

`presentador.html` se sincroniza con la vista principal mediante BroadcastChannel. Muestra la parada actual con sus notas, la siguiente, el cronómetro total y por momento frente a la meta, y las fuentes. Sus botones controlan la vista principal. En la videoconferencia se comparte solo la pestaña o ventana principal. La sincronización requiere `npm run presentar` (servidor local). El archivo único de respaldo funciona sin la vista del presentador; para ese caso existe `respaldo/notas.md`.

### 3.6 Verificación automática

`npm run verificar` compila, levanta el servidor de vista previa y recorre con Playwright cada parada en `#p=ID&captura=1` (transiciones instantáneas). Espera el evento `escenario:listo`, guarda una captura JPEG de 1600×900 por parada en `verificacion/capturas/paradas/` (con el ciclo de dibujo en pausa y un cuadro manual por captura, porque el render por software tarda 0,4 s por cuadro), registra errores de consola y solicitudes de red, mide cuadros por segundo en la vista general y escribe `verificacion/informe.md`. Falla si hay errores de consola, alguna solicitud externa o paradas que no cargan. El informe lista además las fichas en `borrador` y las fuentes en `falta` o `verificar`. Desde la etapa 4 abre también la vista principal y la del presentador en dos pestañas del mismo navegador (sincronía en ida y vuelta, cronómetro con reloj simulado, captura `presentador.png`) y el respaldo por `file://` sin red; avisa si el contenido cambió desde la última generación del respaldo. Desde la etapa 3.b revisa también el modo libre: doble clic, marcha con WASD y flechas en cuadros de duración fija, cámara sobre el relieve, objetivo dentro de la maqueta, botonera y salida, con la captura `libre.jpg`.

## 4. Principios técnicos

- Rendimiento: 50 cuadros por segundo o más en el MacBook Air en la vista general. Vegetación con InstancedMesh; menos de 200 llamadas de dibujo; relación de píxeles máxima de 2 (1,5 desde la etapa 7.c). El modo liviano retira sombras y reduce instancias.
- Presupuesto gráfico (desde la auditoría del 2026-11-10): toda capa nueva se mide en triángulos y llamadas por cuadro y se anota en la bitácora. Las capas de las etapas 8 a 12 (flujos, redes, radios, polígonos, paneles) se dibujan con líneas, partículas instanciadas e interfaz HTML, sin geometría densa: 50.000 triángulos por capa como máximo. Nada nuevo se dibuja fuera del encuadre ni recalcula sombras con la cámara quieta. El WebGL corre en el equipo de quien abre la página (también si se publica en la web), así que la calidad adaptable de la etapa 7.c es condición para el uso en clase.
- Legibilidad en videoconferencia: texto de 24 px o más a 1920×1080; contraste AA; fichas de 60 palabras como máximo; siete rótulos simultáneos como máximo.
- Determinismo: semilla fija; la escena es idéntica en cada carga.
- Sin red: bibliotecas, tipografías y datos locales.
- Accesibilidad: color, forma y rótulo para cada categoría.
- Modularidad: un módulo por capa visual, menos de 300 líneas por archivo, comunicación solo a través del estado.
- Robustez: un error en un módulo se registra y deja seguir al resto; el hash permite recargar en la parada actual.

## 5. Hitos

| Hito | Etapas | Resultado |
|---|---|---|
| A. Recorrido mínimo | 0 a 4 | relieve, paradas con fichas, vista del presentador, respaldo; presentable con el prototipo Hyperframes como complemento |
| B. Biofísica | 5 a 8 | M1 y M2 completos |
| C. Territorio | 9 a 11 | M3 a M6 completos |
| D. Clase completa | 12 a 14 | ensayo cronometrado, prueba en videoconferencia, versión congelada |

Cada etapa ocupa una sesión, salvo las marcadas como grandes, que pueden ocupar dos (N.a y N.b). Estimación total entre 15 y 20 sesiones.

## Etapa 0. Entorno y repositorio

- Tamaño: pequeña. Fuentes: no.
- Lecturas: secciones 3 y 4 de este plan.
- Objetivo: proyecto Vite con Three.js funcionando, versionado y con verificación automática.
- Trabajo:
  - `git init`, `.gitignore` (node_modules, dist).
  - `package.json` con versiones exactas de three, gsap, simplex-noise, lil-gui, vite, vite-plugin-singlefile y playwright (desarrollo). Navegador de Playwright instalado, o el Chromium que ya traiga el entorno (ver reglas de código de `CLAUDE.md`).
  - `index.html` y `src/main.js` con escena mínima: base de la maqueta, luz, cámara, OrbitControls.
  - Tipografías locales en `src/fuentes/` (en `public/` no se incrustarían en el archivo único).
  - Scripts `dev`, `build`, `preview`, `build:unico`, `vista-previa`, `verificar`. En esta etapa, `verificar` carga la página, guarda `verificacion/capturas/inicio.png` y escribe el informe.
  - `contenido/` con los siete JSON vacíos y válidos.
  - Al cerrar la etapa, copia del archivo único en `vista-previa/escenario.html`, versionada en el repositorio.
- Fuera de alcance: relieve y contenido.
- Criterios de aceptación:
  - [ ] `npm run dev` muestra la escena mínima.
  - [ ] `npm run build` y `npm run build:unico` terminan sin errores.
  - [ ] El archivo único abre con doble clic, sin servidor y sin internet.
  - [ ] `npm run verificar` produce la captura y un informe sin errores ni solicitudes externas.
  - [ ] `vista-previa/escenario.html` actualizado y en el commit.
  - [ ] Commit `Etapa 0`.
- Prompt de arranque: `Etapa 0 de PLAN.md. Sigue el protocolo de CLAUDE.md. Aún no hay código.`

## Etapa 1. Modelo de contenido

- Tamaño: mediana. Fuentes: sí (`/add-dir ../..`) en el equipo local; no en la nube.
- Lecturas: `GUION.md` completo; pasajes puntuales de las fuentes para localizar páginas y secciones.
- Sesión en la nube: sin acceso a las fuentes. Se trabaja solo con `GUION.md`. Los localizadores que el guion no trae quedan con estado `verificar` en `fuentes.json` y en `verificacion/pendientes-de-fuente.md`, para cerrarlos en una sesión local (etapa 14 a más tardar).
- Requisito: respuestas de Alejandro a las decisiones D1 a D7 de `GUION.md`. Sin respuesta, se aplican las opciones recomendadas y se registra.
- Objetivo: convertir el guion en datos que el motor leerá.
- Trabajo:
  - Redactar los siete JSON de `contenido/` a partir de `GUION.md`: entidades y anclas, escalas, 26 paradas, escenarios S0 a S3, condiciones C1 a C10 con efectos y dependencias, actores, fuentes.
  - Fichas y notas en estado `borrador`, con las reglas de redacción de `CLAUDE.md`.
  - Completar localizadores de fuente (página o sección) buscando con `rg` o `pdftotext`. En la nube, tomar solo los localizadores de `GUION.md` y marcar el resto `verificar`.
  - `scripts/validar-contenido.mjs` y script `validar`: campos obligatorios, referencias cruzadas (anclas, escalas, escenarios, condiciones, fuentes), 60 palabras por ficha, minutos por momento frente a la meta (M0 3, M1 6, M2 7, M3 8, M4 8, M5 5, M6 3, tolerancia de un minuto), términos vetados («—», «cadena de valor», «stakeholder», «APPA» junto a «1406»).
  - Generar `verificacion/pendientes-de-fuente.md`.
- Fuera de alcance: código 3D.
- Criterios de aceptación:
  - [ ] `npm run validar` sin errores.
  - [ ] Cada parada tiene al menos una fuente con localizador (o con estado `verificar` si la sesión corre en la nube).
  - [ ] Lista de pendientes de fuente generada y resumida en la bitácora.
  - [ ] `GUION.md` sin cambios de fondo; si algo del guion resultó inviable, queda anotado en la bitácora.
- Prompt de arranque: `Etapa 1 de PLAN.md. Sigue el protocolo de CLAUDE.md. Ejecuta /add-dir ../.. antes de buscar en las fuentes.` En la nube: `Etapa 1 de PLAN.md. Sigue el protocolo de CLAUDE.md. Sin fuentes: trabaja solo con GUION.md.`

## Etapa 2. Terreno de la cuenca

- Tamaño: mediana a grande. Fuentes: no.
- Lecturas: `contenido/territorio.json`; sección 2.2 de este plan.
- Objetivo: relieve legible de la cuenca en un bloque tipo maqueta.
- Trabajo:
  - Malla de terreno guiada por el plano: cordillera al oriente, páramo, bosque andino, ladera, piedemonte, plano del valle, río Cauca al occidente. Ruido con semilla para el detalle.
  - Río tributario y quebradas tallados en el relieve; superficie de agua simple.
  - Límite departamental como línea sobre el terreno.
  - Exageración vertical configurable (entre 1,5 y 3).
  - Bloque recortado: caras laterales con estratos del suelo.
  - Color por zona, altitud y pendiente.
  - Función `altura(x, z)` y cálculo de anclas sobre la superficie, exportados para los demás módulos.
- Fuera de alcance: vegetación, fincas, interfaz.
- Criterios de aceptación:
  - [ ] En la captura aérea se distinguen cordillera, ladera, valle y ríos.
  - [ ] La escena es idéntica en dos cargas seguidas.
  - [ ] 50 cuadros por segundo o más en la vista general.
  - [ ] Las anclas quedan sobre la superficie (verificable con la tecla A).
  - [ ] Capturas de vista general, ladera y plano.
- Prompt de arranque: `Etapa 2 de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 3. Navegación por paradas y escalas

- Tamaño: mediana. Fuentes: no.
- Lecturas: sección 3.4 de este plan; `contenido/paradas.json`, `escalas.json`.
- Objetivo: recorrido guiado completo con fichas en pantalla, aunque las capas visuales aún falten.
- Trabajo:
  - `src/estado.js` con suscripción.
  - Navegación: `irA`, siguiente y anterior, saltos por momento, cámara relativa a ancla con GSAP.
  - Botonera de siete escalas siempre visible (interfaz principal, sección 3.4), panel de ficha (título, texto, fuente abreviada), indicador de momento.
  - Hash `#p=ID`, modo libre, modo autor (teclas C y A), teclado de la sección 3.4.
  - Ampliar `verificar` para recorrer todas las paradas.
- Fuera de alcance: vista del presentador, capas visuales nuevas.
- Criterios de aceptación:
  - [ ] Recorre las 26 paradas sin errores.
  - [ ] Transiciones de 1,5 a 3 s, sin saltos.
  - [ ] Fichas legibles en una ventana de 1280×720.
  - [ ] Cada ficha muestra su fuente.
  - [ ] La tecla C produce un bloque de cámara válido para `paradas.json`.
- Prompt de arranque: `Etapa 3 de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 3.b. Modo libre ampliado

- Tamaño: pequeña. Fuentes: no. Origen: pedido de Alejandro del 2026-11-04, intercalada entre la 5.b y la 5.c (la 5.c sigue como etapa siguiente).
- Lecturas: sección 3.4 de este plan; `src/navegacion/camara.js`, `teclado.js`, `foco.js`; `src/escena/escena.js`.
- Objetivo: explorar la maqueta con libertad ante una pregunta del jurado, sin perder el recorrido.
- Trabajo:
  - Doble clic en cualquier punto del relieve (o del agua): vuelo con GSAP hasta ese punto; conserva el azimut, reduce la distancia a la mitad (mínimo 90) y limita la elevación entre 20 y 70 grados. El vuelo se pide al estado con un bloque de cámara que lleva `punto` en lugar de `ancla`. Sin efecto en el recorrido ni fuera de la maqueta.
  - Flechas o WASD: marcha horizontal en la dirección de la vista, con aceleración y frenado suaves; rapidez proporcional a la distancia al objetivo; Mayús la triplica. El objetivo sigue la altura del relieve.
  - Límites: el objetivo queda dentro de la maqueta, con frenado progresivo junto al borde; la cámara queda sobre el relieve vecino con un margen (subida suave) y un piso que nunca cruza, también durante la órbita y el vuelo.
  - Botonera en modo libre: la vista tipo de la escala se toma desde el objetivo actual.
  - Módulos `src/navegacion/libre.js` y `limites.js`; funciones por cuadro en `escena.js`; revisión `scripts/lib/revisar-libre.mjs` en `npm run verificar`.
- Fuera de alcance: arrastre lateral con el ratón, gestos táctiles, marcador del punto de destino.
- Criterios de aceptación:
  - [ ] El doble clic vuela al punto señalado en 1,5 a 2,5 s; en el recorrido y fuera de la maqueta no hace nada.
  - [ ] Flechas y WASD mueven la cámara en modo libre sin cambiar de parada; en el recorrido, las flechas siguen avanzando y retrocediendo.
  - [ ] La cámara nunca queda bajo el relieve y el objetivo nunca sale de la maqueta.
  - [ ] Movimientos sin saltos: aceleración, frenado y llegada al borde graduales.
  - [ ] La tecla O devuelve la cámara de la parada.
- Prompt de arranque: `Etapa 3.b de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 4. Vista del presentador y respaldo

- Tamaño: pequeña a mediana. Fuentes: no.
- Lecturas: sección 3.5 de este plan.
- Objetivo: poder dar la clase con lo construido hasta aquí (hito A).
- Trabajo:
  - `presentador.html` con notas, parada siguiente, cronómetro total y por momento, fuentes y controles, sincronizada por BroadcastChannel.
  - Script `presentar`: compila, sirve y abre las dos vistas.
  - Script `respaldo`: genera `respaldo/index.html` con las capturas de todas las paradas, navegable con flechas, y `respaldo/notas.md` con las notas.
  - Actualizar el archivo único y, al cerrar la etapa, su copia versionada en `vista-previa/escenario.html`.
- Criterios de aceptación:
  - [ ] `vista-previa/escenario.html` actualizado y en el commit.
  - [ ] Las dos ventanas permanecen sincronizadas en ida y vuelta.
  - [ ] El cronómetro marca el desvío frente a la meta de cada momento.
  - [ ] El respaldo abre sin servidor.
  - [ ] Prueba manual de Alejandro: compartir la pestaña principal en una videoconferencia y mirarla desde un segundo dispositivo. Resultado anotado en la bitácora.
- Prompt de arranque: `Etapa 4 de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 5. Coberturas y matriz del paisaje

- Tamaño: grande (5.a vegetación natural y matriz cañera; 5.b mosaico campesino, ciudad y vías). Fuentes: no.
- Lecturas: `contenido/territorio.json`, `escenarios.json`.
- Objetivo: el paisaje de S0 (matriz de monocultivo con relictos) y la capacidad de cambiar coberturas por escenario.
- Trabajo:
  - Vegetación instanciada por zona: páramo, bosque altoandino, bosque ripario y guadual, relictos de bosque seco y humedal en el plano, caña, pasturas, mosaico campesino (café con sombrío, plátano, frutales, huertas).
  - Ciudad con manzanas simples, cabeceras, vías.
  - Coberturas parametrizadas por escenario (fracciones por zona) con transición suave.
  - Leyenda de coberturas.
- Criterios de aceptación:
  - [ ] En S0 la matriz de caña domina el plano y los relictos se ven aislados.
  - [ ] El cambio de escenario modifica las coberturas sin cortes.
  - [ ] 50 cuadros por segundo o más; menos de 200 llamadas de dibujo.
- Prompt de arranque: `Etapa 5.a de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 5.c. Dirección de arte

- Tamaño: grande. Fuentes: no. Origen: observaciones de Alejandro al cerrar la 5.b (decisión D5, «realismo de maqueta»; árboles facetados; caña en bloques planos escalonados en la vista general). Si la sesión no alcanza, se divide según el protocolo: primero la vegetación y la caña, después la luz y el posproceso (viento, sombras, oclusión y desenfoque).
- Lecturas: `src/coberturas/especies.js`, `formas.js` e `instancias.js` (estilo y niveles de detalle de la 5.b); `teselas.js` y `vegetacion.js` (bloque de caña y vegetación de la 5.a).
- Objetivo: el mismo realismo de maqueta en toda la vegetación, la caña incluida, y una luz de diorama.
- Trabajo:
  - Vegetación de la 5.a con el estilo de la 5.b: bosque ripario, guadua, frailejón, bosque seco, bosque altoandino y árboles de la pastura y del silvopastoreo. Especies reconocibles, copas con racimos de hojas, variación de color y dos niveles de detalle con `instancias.js`.
  - Caña (convencional y orgánica) en lugar de los bloques planos:
    - Cerca de la cámara: tallos instanciados con hojas, generados por celda al acercarse (semilla por celda) para no cargar el plano entero.
    - A distancia: superficie con surcos (orientación propia de cada lote) y altura irregular, en lugar de la tapa plana.
    - Lotes de tres edades: recién cortado (rastrojo bajo y pajizo), en crecimiento (altura media, verde claro) y maduro (altura plena, con espigas). Edad fija por lote con semilla e igual en todos los escenarios; fracciones de edad en `contenido/escenarios.json` como valores ilustrativos.
    - Bordes de lote donde se ven los tallos: franja de tallos en el borde de cada lote en crecimiento o maduro, también en el nivel simple. Un lote recién cortado deja ver la cara de tallos del lote vecino.
  - Viento leve en las copas y las hojas (sombreador de vértices, amplitud pequeña, sin costo de CPU).
  - Sombras suaves (filtro PCF suave o VSM) y oclusión ambiental (SSAO o GTAO), con la relación de píxeles y el modo liviano como límites.
  - Desenfoque de miniatura (tilt-shift) suave, regulable y desactivable, sin afectar la interfaz HTML.
- Criterios de aceptación:
  - [x] Ningún árbol facetado a la escala de finca o vereda (5.c.a).
  - [x] Caña sin bloques planos escalonados: surcos y altura irregular en la vista general; tallos con hojas a escala de finca y de planta; tallos visibles en los bordes de lote (5.c.a).
  - [x] Tres edades de caña distinguibles en la vista general, fijas por lote en todos los escenarios. S1 conserva la extensión de la caña de S0 y cada transición termina igual a la carga directa (5.c.a).
  - [x] El modo liviano retira la oclusión ambiental, el desenfoque, el viento, las sombras y los tallos cercanos de la caña, y reduce instancias (5.c.a: tallos cercanos e instancias; el resto en la 5.c.b y la 5.c.c).
  - [x] Texto y rótulos legibles en videoconferencia (24 px a 1920×1080, contraste AA), sin desenfoque sobre la interfaz (5.c.c).
  - [ ] 50 cuadros por segundo o más en el MacBook Air en la vista general; menos de 200 llamadas de dibujo.
- Prompt de arranque: `Etapa 5.c de PLAN.md. Sigue el protocolo de CLAUDE.md.`
- División (2026-11-04): 5.c.a, vegetación y caña (las dos primeras tareas y los tres primeros criterios; del cuarto, los tallos cercanos y las instancias) y 5.c.b, caña con hojas (observación de Alejandro sobre la 5.c.a) y luz y posproceso (viento, sombras suaves, oclusión ambiental, desenfoque de miniatura, legibilidad y medición en el MacBook Air).

## Etapa 5.c.b. Caña con hojas y luz de diorama

- Tamaño: grande. Fuentes: no. Origen: división de la 5.c y observación de Alejandro del 2026-11-04 sobre la caña de la 5.c.a (las espigas parecen mazorcas y el lote parece un monocultivo de maíz; la tapa del bloque sigue viéndose como una mesa verde lisa con un borde lineal). Si la sesión no alcanza, se divide: primero la caña (5.c.b) y después la luz y el posproceso (5.c.c).
- Referencia: `referencias/cana-mata.webp` (esquema de una mata de caña aportado por Alejandro): seis a diez tallos rectos y algo inclinados, con nudos marcados y tonos de verde amarillento a morado; hojas largas, angostas y en arco desde el tercio superior de cada tallo, con las puntas caídas; hojas secas sueltas en la base; sin flores.
- Lecturas: `src/coberturas/cana.js`, `superficie.js`, `teselas.js` y `arboles.js` (`matasCana`) de la 5.c.a; `src/escena/escena.js` (luces, sombras y ciclo de dibujo); `instancias.js`, `arboles.js` y `especies.js` (materiales y sombra por nivel).
- Objetivo: un lote de caña que se lea como caña a toda escala, solo con hojas, y luz de diorama sobre la vegetación.
- Trabajo, caña (primero):
  - Sin espigas, flores ni formas de mazorca: retirar la malla `espiga` de `cana.js` y las manchas de espiga del sombreador de la tapa. La caña madura se distingue por su altura y su verde más profundo.
  - Mata de caña según la referencia, en el nivel cercano y en la franja de borde: varios tallos con nudos (tramos de `arco`) y hojas largas en arco con puntas caídas, verde claro arriba y más oscuro abajo, puntas algo amarillas; sin espiga ni mazorca, para diferenciarla del maíz de la huerta.
  - Ninguna superficie plana a la vista: la tapa del bloque baja bajo el dosel y queda oscura (sombra entre los tallos), y lo que se ve arriba es una masa de hojas con silueta irregular. En el borde del lote las hojas sobresalen y caen sobre la cara de tallos: sin línea recta verde. A distancia, la tapa muestra textura de hojas en hileras (sin manchas claras) y altura irregular.
  - Edades: se conservan por altura y color, sin espigas. Si en la revisión no aportan, quedan dos (en crecimiento y madura) o una sola; las fracciones siguen en `escenarios.json` (`edades_cana`).
  - Rendimiento: Alejandro informó que el archivo HTML de la 5.c.a corre con fluidez en su computadora. Hay margen para más matas cercanas (cupo de `cana.js`) y para la mata de la referencia, con el modo liviano como respaldo.
- Trabajo, luz y posproceso (después, o en la 5.c.c):
  - Viento leve en las copas, las hojas y las matas de caña (sombreador de vértices, amplitud pequeña, sin costo de CPU).
  - Sombras suaves (PCF suave o VSM) y oclusión ambiental (SSAO o GTAO), con la relación de píxeles y el modo liviano como límites. Revisar la sombra por nivel de detalle de los rodales densos (`sombra: 'cerca'` en `arboles.js`).
  - Desenfoque de miniatura (tilt-shift) suave, regulable y desactivable, sin afectar la interfaz HTML.
  - Rendimiento: medir los cuadros por segundo en el MacBook Air en la vista general (1,87 millones de triángulos en S0 al cerrar la 5.c.a) y a escala de finca, planta y suelo; si no alcanza, bajar los umbrales de detalle (`arboles.js`, `especies.js`) o el cupo de la caña cercana (`cana.js`).
- Criterios de aceptación:
  - [x] La caña se reconoce como caña a escala de suelo, planta y finca: matas de tallos con nudos y hojas largas en arco, como en la referencia; ninguna espiga, flor o forma de mazorca; distinta del maíz de la huerta.
  - [x] Ningún plano verde liso a la vista en los lotes de caña, ni la línea recta del borde: el lote se ve como una masa de hojas de silueta irregular, también en la vista general (hileras y altura irregular sin manchas claras). Dentro del radio con matas la tapa baja hasta la lámina y queda en sombra; más allá (460 unidades o más) el bloque conserva hileras, textura de hojas y altura irregular.
  - [x] S1 conserva la extensión de la caña de S0 y cada transición termina igual a la carga directa.
  - [x] El modo liviano retira la oclusión ambiental, el desenfoque, el viento, las sombras y las matas cercanas de la caña (5.c.b: matas cercanas y tapa hundida; el resto en la 5.c.c).
  - [x] Texto y rótulos legibles en videoconferencia (24 px a 1920×1080, contraste AA), sin desenfoque sobre la interfaz (5.c.c).
  - [ ] 50 cuadros por segundo o más en el MacBook Air en la vista general; menos de 200 llamadas de dibujo (5.c.c).
- Prompt de arranque: `Etapa 5.c.b de PLAN.md. Sigue el protocolo de CLAUDE.md.`
- División (2026-11-04): la 5.c.b quedó en la caña (primer bloque de trabajo y tres primeros criterios); la luz y el posproceso pasan a la 5.c.c.

## Etapa 5.c.c. Luz de diorama y posproceso

- Tamaño: mediano a grande. Fuentes: no. Origen: división de la 5.c.b.
- Lecturas: `src/escena/escena.js` (luces, sombras y ciclo de dibujo); `instancias.js`, `arboles.js` y `especies.js` (materiales y sombra por nivel); `cana.js` (material de la mata, con nudos en el sombreador) y `superficie.js` (tapa hundida bajo las matas).
- Objetivo: luz de diorama sobre la vegetación y la caña, legible en videoconferencia y fluida en el MacBook Air.
- Trabajo:
  - Viento leve en las copas, las hojas y las matas de caña (sombreador de vértices, amplitud pequeña, sin costo de CPU). Las matas de caña ya tienen material propio (`crearMaterial` en `cana.js`).
  - Sombras suaves (PCF suave o VSM) y oclusión ambiental (SSAO o GTAO), con la relación de píxeles y el modo liviano como límites. Revisar la sombra por nivel de detalle de los rodales densos (`sombra: 'cerca'` en `arboles.js`) y la sombra de las teselas de caña: el material de profundidad no hunde la tapa (la tapa hundida queda bajo la sombra del bloque; hoy favorece la lectura de «sombra entre los tallos»).
  - Desenfoque de miniatura (tilt-shift) suave, regulable y desactivable, sin afectar la interfaz HTML.
  - Rendimiento: medir los cuadros por segundo en el MacBook Air en la vista general (1,87 millones de triángulos en S0) y a escala de finca, planta y suelo (3,1 a 5,9 millones con las matas de caña de la 5.c.b); si no alcanza, bajar los umbrales de detalle (`arboles.js`, `especies.js`), el umbral del nivel detallado o los cupos de la caña cercana (`cana.js`).
- Criterios de aceptación:
  - [x] El modo liviano retira la oclusión ambiental, el desenfoque, el viento, las sombras y las matas cercanas de la caña.
  - [x] Texto y rótulos legibles en videoconferencia (24 px a 1920×1080, contraste AA), sin desenfoque sobre la interfaz. Excepción: la marca «Borrador» de las fichas (16,8 px), que desaparece al revisarlas.
  - [ ] 50 cuadros por segundo o más en el MacBook Air en la vista general; menos de 200 llamadas de dibujo (llamadas: cumplido, 44 a 69; cuadros por segundo: medición de Alejandro con la tecla R).
  - [x] Las capturas de la verificación y del respaldo conservan la escena idéntica en cada carga (sin ruido temporal del posproceso).
- Prompt de arranque: `Etapa 5.c.c de PLAN.md. Sigue el protocolo de CLAUDE.md.`
- Resultado (2026-11-05): viento en el sombreador de vértices (`src/escena/viento.js`), posproceso de diorama con oclusión ambiental desde la profundidad y miniatura en dos pasadas (`posproceso.js`, `sombreadores.js`), sombra PCF suave, medidor de rendimiento (tecla R) y revisión de luz y legibilidad (`scripts/lib/revisar-luz.mjs`). Parámetros `#ao`, `#mini` y `#viento` (0 apaga); tecla M y botón «Miniatura» del presentador.

## Etapa 6. Fincas y Estructura Agroecológica Principal

- División (2026-11-05): 6.a, sin fuentes nuevas (generador de finca, cuatro fincas, resaltado, conectores, EEP y clic); 6.b, con fuentes (panel EAP). La 6.a se hizo en la nube; la 6.b requiere sesión local.
- Tamaño: grande. Fuentes: sí, puntuales (León-Sicard 2021; Calle et al. 2022, §11.1).
- Lecturas: `GUION.md`, secciones 2 y 3 (escala 3).
- Objetivo: el agroecosistema mayor visible y comparable.
- Trabajo:
  - Generador de finca a partir de una receta: lotes, casa, lindero, conectores internos y externos.
  - Cuatro fincas tipo: F1 finca faro con las proporciones de El Hatico; F2 ladera en sustitución de insumos; F3 ladera diversificada en red; F4 predio cañero convencional.
  - Resaltado de agroecosistema menor (lote) y mayor (lindero, con la familia dentro).
  - Capa de conectores EAP y conexión con la estructura ecológica principal.
  - Panel EAP con los diez criterios (cinco ecosistémicos, cinco culturales) y valores rotulados como ilustrativos.
  - Clic en una finca acerca la cámara a ella (sección 3.4).
- Criterios de aceptación:
  - [x] Las cuatro fincas se distinguen a escala de finca y de matriz (6.a).
  - [x] Los conectores se leen en la vista de matriz (6.a).
  - [x] El panel EAP toma sus datos de `contenido/` (6.b).
- Prompt de arranque: `Etapa 6 de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 6.b. Panel EAP

- Tamaño: mediano. Fuentes: sí (León-Sicard 2021, cap. 3; Cleves-Leguízamo et al. 2017). Sesión local con `/add-dir ../..`.
- Estado (2026-11-09): panel, datos y verificación hechos en una sesión en la nube sin acceso a las fuentes (el sitio de la revista rechaza la descarga automatizada y SciELO corta la conexión). Cotejo hecho el mismo día, en la nube, con la versión de texto de León-Sicard (2021) en la carpeta de Drive del proyecto: criterios, siglas, orden y escala (0 a 10) del cap. 3 y grupos del cap. 2, tabla 1 (indicadores ecosistémicos y culturales), con encabezados de grupo en el panel. Cleves-Leguízamo et al. (2017) no está en la carpeta; su localizador sigue pendiente en P05 y en la escala de finca.
- Lecturas: `GUION.md`, sección 3 (escala 3) y sección 10 (precaución 8); `contenido/fincas.json`.
- Objetivo: el índice EAP de las fincas tipo, legible y con fuente.
- Trabajo:
  - Localizar en las fuentes los nombres de los diez criterios y sus dos grupos, con página. El PLAN anotó «cinco ecosistémicos, cinco culturales»; confirmar el reparto antes de dibujar.
  - Criterios, grupos, escala de cada criterio y valores por finca en `contenido/` (valores rotulados «valores ilustrativos» si no salen de una fuente).
  - Panel EAP de las fincas tipo (capa `indices_eap`), con la misma columna derecha de la 6.a.
  - Cerrar los localizadores pendientes de la EAP: `leonsicard:verificar` y `cleves:verificar` en P05, escalas y condiciones.
- Criterios de aceptación:
  - [x] El panel EAP toma sus datos de `contenido/`.
  - [x] Cada criterio y cada valor muestra su fuente o el rótulo «valores ilustrativos» (fuentes con localizador pendiente, marcadas en el pie).
  - [x] Texto del panel legible a 1920×1080 (24 px o más, contraste AA).
- Prompt de arranque: `Etapa 6.b de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 7. Lote, interacciones de especies y suelo

- División (2026-11-09): 7.a, sin fuentes (lote de policultivo y monocultivo, cuatro pasos de P03 con cámara por paso, marcadores y panel de interacciones, corte de suelo, panel de materia orgánica y verificación, con los rótulos en `contenido/lote.json` en estado `borrador` y localizadores `verificar`); 7.b, con fuentes (cotejo). La 7.a se hizo en la nube; la 7.b requiere sesión local y va junto al cotejo de la 6.b.
- Tamaño: mediana a grande. Fuentes: sí (Gliessman caps. 3, 7, 8 y 12; Calle et al. 2022, cap. 11).
- Objetivo: el descenso continuo de la finca al lote y al suelo.
- Trabajo:
  - Lote de policultivo de ladera junto a un lote de caña en monocultivo.
  - Rótulos de interacciones según Gliessman caps. 7 y 12 (competencia, complementariedad, facilitación, mutualismo, fijación de nitrógeno, sombrío).
  - Secuencia de niveles de organización en cuatro pasos (fig. 3.1).
  - Corte de suelo: horizontes, raíces, hifas, macrofauna, materia orgánica; rótulo «cierra en la finca».
  - Contraste de materia orgánica con los datos de El Hatico.
  - Transición de cámara sin cortes de finca a lote y a suelo.
- Criterios de aceptación:
  - [x] Descenso continuo en las paradas P03, P04 y P07 (7.a: vuelos sin saltos entre los pasos de P03, de P03 a P04 y de P06 a P07).
  - [x] Cada rótulo conceptual tiene fuente en `contenido/` (7.a: clave de fuente en cada rótulo; localizadores pendientes en la 7.b).
- Prompt de arranque: `Etapa 7 de PLAN.md. Sigue el protocolo de CLAUDE.md. Ejecuta /add-dir ../.. antes de buscar en las fuentes.`
- Resultado 7.a (2026-11-09): `contenido/lote.json` (especies, lotes, niveles, interacciones, corte y materia orgánica) y su validador; `src/lote/` (disposición con semilla, plantas instanciadas con apagado por nivel, fríjol, corte de suelo con perfil dibujado en un lienzo, rótulos); paneles de interacciones y de materia orgánica (`src/ui/`); cámara por paso en `recorrido.js`; anclas con alto (`territorio.json`); entidad `organismo`; revisión `scripts/lib/revisar-lote.mjs`.

## Etapa 7.b. Cotejo del lote y del suelo

- Tamaño: pequeño. Fuentes: sí. Sesión local con `/add-dir ../..`, en la misma sesión del cotejo de la 6.b.
- Lecturas: `contenido/lote.json` (campos `verificar` y fuentes con `verificar`); `GUION.md`, sección 10.
- Trabajo:
  - Gliessman et al. (2023): fig. 3.1 (niveles de organización y texto de cada nivel); caps. 7 y 12 (pasaje y ejemplo de especies de cada interacción); cap. 8 (horizontes y grupos de biota del corte). Ajustar rótulos y cerrar localizadores.
  - Calle et al. (2022, cap. 11): sección con la materia orgánica de la caña agroecológica y del bosque; precisar si «de 2 % a 4 %» es un cambio en el tiempo o un intervalo y ajustar la barra del panel (`desde` y `hasta`).
  - Sánchez de Prager (2018): localizador o retiro de la referencia.
  - Confirmar con Alejandro la composición del policultivo de ladera (maíz y fríjol; cafeto con guamo y plátano).
- Criterios de aceptación:
  - [x] Sin localizadores `verificar` en `contenido/lote.json`, P03 y P07, salvo Sánchez de Prager (2018), ausente de la carpeta de Drive.
  - [x] Rótulos de niveles, interacciones y biota iguales al término de la fuente.
- Resultado (2026-11-09, en la nube con la carpeta de Drive): niveles según la fig. 3.1 (el cuarto paso dibuja el lindero de una finca con los dos lotes: «la finca en el contexto de su cuenca»); interacciones con página de los caps. 7 y 12 (facilitación cambiada: «el maíz sostiene al fríjol» no está en la fuente); horizontes y biota del cap. 8; materia orgánica de Calle et al. (2022, §11.4.2): de 2 % en 1994 a 4 %, bosque de referencia 4,2 %.
- Prompt de arranque: `Etapa 7.b de PLAN.md. Sigue el protocolo de CLAUDE.md. Ejecuta /add-dir ../.. antes de buscar en las fuentes.`

## Etapa 7.c. Rendimiento sin cambio visible y calidad adaptable

- Origen: auditoría del 2026-11-10 (entrada de la bitácora). Alejandro informó que en el MacBook Air M1 corre bien, «tal vez un poco lento», y que en un equipo antiguo de poca gráfica no corre bien. Va antes de la etapa 8, que añade partículas.
- Tamaño: mediana. Fuentes: no. Si resulta grande, dividir: primero los puntos 1 a 4; después la calidad adaptable y el HTML.
- División (2026-11-13): 7.c.a, cerrada, con los puntos 1 a 4 y la tabla de triángulos del punto 8 (criterios 1 y 2). 7.c.b, pendiente, con los puntos 5 a 7 y el resto del punto 8 (criterio 3). El criterio 4 lo toma Alejandro.
- Ajustes de la 7.c.a frente a este texto: el lienzo conserva `antialias` (los trazos de la superposición y el modo liviano se dibujan directo en él); el nivel de detalle y el encuadre se miden antes del dibujo (`coberturas.cuadro`), ya no en `onBeforeRender`; la caña cercana dibuja solo las matas que tocan el encuadre con la cámara quieta; con el medidor visible (tecla R) no hay tope de cuadros.
- Objetivo: la misma imagen con la mitad del trabajo de la tarjeta gráfica, y una calidad que se adapta sola al equipo.
- Línea base (versión compilada, S0, ventana de 1600×900; triángulos por cuadro sumando todas las pasadas; `renderer.info`):

| Vista | Total | Caña cercana | Pasada de sombra | Llamadas |
|---|---|---|---|---|
| General (P01) | 1,93 M | 0 | 0,67 M | 55 |
| Finca faro (P06) | 3,71 M | 1,53 M | 0,79 M | 84 |
| Lote (P03, comunidad) | 5,30 M | 1,43 M | 1,47 M | 88 |
| Suelo (P07) | 5,42 M | 2,27 M | 1,23 M | 99 |
| Modo liviano (tecla V) | 0,89 a 0,93 M | 0 | 0 | 35 a 49 |

- Trabajo (ningún punto debe cambiar la imagen; comprobar con las capturas de la verificación):
  1. Sombra fija. La sombra ya no sigue el viento, pero el mapa se recalcula en cada cuadro. Usar `renderizador.shadowMap.autoUpdate = false` y pedir `needsUpdate` solo al cambiar el escenario (durante su transición), el nivel de detalle (cuando `detalle.medir` devuelve cambio de celdas, `src/coberturas/coberturas.js`), el modo liviano, la subida del corte de suelo y el primer cuadro (`src/escena/escena.js`).
  2. Descarte por zonas de la vegetación. Las mallas instanciadas de `src/coberturas/instancias.js` llevan `frustumCulled = false` y dibujan todo el mapa en cada cuadro. Ordenar las instancias por celda (`detalle.js`, celdas de 60 unidades) y dibujar solo las celdas dentro del encuadre, como ya hace `cana.js` (`encuadre.intersectsBox`). El nivel «cerca» también debe limitarse al encuadre. Cuidado: la pasada de sombra usa otra cámara; con la sombra fija del punto 1, el mapa se calcula con todas las instancias que proyectan sombra y el descarte se aplica solo a la pasada principal.
  3. Tope de cuadros. El ciclo de `escena.js` dibuja a 60 cuadros por segundo aunque la cámara esté quieta. Tope de 30 con la cámara quieta y viento activo; 60 durante los vuelos y en el modo libre. Parámetro `#cps=` para ajustarlo. Con viento apagado y cámara quieta, no dibujar.
  4. Suavizado de bordes. El lienzo se crea con `antialias: true` y además el destino del posproceso lleva MSAA ×4 (`posproceso.js`); con posproceso activo el suavizado del lienzo no se usa. Crear el lienzo sin suavizado cuando el posproceso está activo, bajar el MSAA a ×2 con relación de píxeles de 1,5 o más, y limitar la relación de píxeles a 1,5 (`RELACION_PIXELES_MAX`). Comparar una captura ampliada antes y después.
  5. Calidad adaptable. Tres niveles en el estado (`calidad`: `alta`, `media`, `liviana`), en reemplazo del booleano `liviano`: alta, la actual con los puntos 1 a 4; media, sin oclusión ni miniatura, relación de píxeles 1, caña cercana a la mitad del cupo y del radio; liviana, la actual de la tecla V. La tecla V recorre los tres. Parámetro `#calidad=` en el hash (se conserva al recargar) y detección al arrancar: medir los primeros 60 cuadros tras `escenario:listo` y bajar un nivel si el promedio queda por debajo de 30 cuadros por segundo (una sola vez; sin subir solo). Adelanta el «modo liviano automático» de la etapa 13. Actualizar la vista del presentador (`src/presentador/`), el indicador de `src/ui/momentos.js` y el medidor.
  6. HTML de salida. Aviso «Cargando…» en `index.html` (visible hasta `escenario:listo`; hoy la pantalla queda en blanco mientras se genera la escena). Aviso breve si la calidad bajó sola («Calidad media. Tecla V para cambiarla»).
  7. Rótulos del lote y del corte (`src/lote/rotulos.js`): `colocar` lee `offsetWidth` y `offsetHeight` en cada cuadro. Medir cada rótulo una vez al mostrarlo y no recolocar si la cámara no se movió.
  8. Verificación: `scripts/lib/revisar-lote.mjs` y `revisar-luz.mjs` deben seguir pasando; añadir al informe los triángulos por vista de la tabla y un límite por vista (la mitad de la línea base, salvo la general). Como la verificación corre sin tarjeta gráfica, los cuadros por segundo reales los mide Alejandro con la tecla R.
- Fuera de alcance: cambiar formas, densidades o materiales (etapa 7.d).
- Criterios de aceptación:
  - [x] Capturas de P01, P03, P06 y P07 sin diferencia apreciable frente a las del commit `97baa57` (7.c.a: idénticas píxel a píxel con relación de píxeles 1).
  - [x] Triángulos por cuadro con la cámara quieta: P01 1,3 M o menos; P06 2,8 M o menos; P03 (comunidad) 3,0 M o menos; P07 3,5 M o menos (7.c.a: 1,25; 1,92; 1,51 y 2,64 M).
  - [ ] La calidad queda en el hash y sobrevive a la recarga; la detección baja de nivel en un equipo lento (prueba con un umbral forzado).
  - [ ] Cifras de Alejandro en el MacBook Air (tecla R) en P01, P06, P03 y P07, anotadas en la bitácora.
- Prompt de arranque: `Etapa 7.c.b de PLAN.md (puntos 5 a 7 de la etapa 7.c). Sigue el protocolo de CLAUDE.md.`

## Etapa 7.d. Caña y materiales con aprobación visual

- Origen: auditoría del 2026-11-10. Cambios que alteran un poco la imagen: se entregan con capturas de antes y después y esperan la aprobación de Alejandro (sin modo continuo).
- Tamaño: pequeña a mediana. Fuentes: no.
- Objetivo: bajar el mayor costo de la escena, la caña cercana, sin perder la mata de la referencia `referencias/cana-mata.webp`.
- Trabajo:
  1. Mata detallada (`src/coberturas/mata.js`): hoy 430 triángulos por mata, hasta 4.500 matas. Meta: 200 a 240 (menos segmentos por hoja y menos caras por tallo), con nudos y hojas en arco.
  2. Mata lejana: hoy 66 triángulos, hasta 26.000 matas (1,5 M en P06). Meta: 30 a 36, o cupo y radio menores (`CUPO`, `UMBRAL_CANA` y `UMBRAL_DETALLE` en `cana.js`). Revisar el empalme con el bloque lejano.
  3. Material mate: toda la escena usa `MeshStandardMaterial`. Probar `MeshLambertMaterial` en la vegetación, la caña y las teselas (los sombreadores propios de `viento.js`, `cana.js` y `lote/formas.js` usan fragmentos comunes a ambos). Adoptarlo solo si la diferencia no se nota.
  4. El lote de la etapa 7 (`src/lote/lote.js`) se dibuja en detalle a menos de 280 unidades aunque la parada sea otra (aparece en P07): limitar el nivel cercano a la escala de planta o al encuadre.
- Criterios de aceptación:
  - [ ] Mosaico de antes y después (P06, P07 y `cana-cerca.jpg`) aprobado por Alejandro.
  - [ ] Caña cercana en P07: 1,2 M de triángulos o menos (hoy 2,27 M).
- Prompt de arranque: `Etapa 7.d de PLAN.md. Sigue el protocolo de CLAUDE.md. Sin modo continuo: presenta el antes y el después y espera aprobación.`

## Etapa 8. Procesos supraprediales

- Tamaño: mediana a grande. Fuentes: sí, puntuales.
- Lecturas: `GUION.md`, sección 4.
- Objetivo: cada proceso visible en su escala mínima (hito B).
- Trabajo:
  - Sistema reutilizable de flujos (partículas sobre curvas).
  - Agua y sedimentos según la cobertura de la ladera; prácticas de conservación en la vista de ladera (curvas a nivel, barreras vivas, terrazas).
  - Polinización y control biológico: radios desde parches de hábitat y su superposición entre fincas.
  - Nutrientes de las fincas a la ciudad, sin retorno en S0 y con retorno en S3.
  - Semillas entre custodios.
  - Parada de síntesis con la tabla de escala mínima. Leyenda de flujos.
- Criterios de aceptación:
  - [ ] Paradas P07 a P12 completas.
  - [ ] La biota del suelo aparece como proceso que cierra en la finca.
  - [ ] 50 cuadros por segundo o más con los flujos activos.
- Prompt de arranque: `Etapa 8 de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 9. Actores, redes y figuras territoriales

- Tamaño: grande. Fuentes: no, salvo verificaciones.
- Lecturas: `contenido/actores.json`; `GUION.md`, secciones 2 y 10.
- Objetivo: el territorio como espacio de actores.
- Trabajo:
  - Marcadores simbólicos de actores con rótulo. Sin figuras humanas estereotipadas.
  - Figuras territoriales: resguardo, consejo comunitario, reserva natural de la sociedad civil, límites departamental y municipal.
  - Siete mercados en cabeceras, aislados en S0.
  - Enlaces gruesos por tipo de relación: comercio, conocimiento, garantía (SPG), semillas, gobernanza.
  - Polígono del territorio de la red, trazado por sus actores, que cruza el límite departamental.
  - Actores institucionales: alcaldía (recursos y capacitaciones), autoridad ambiental, MADR y ADR, universidad, ONG, colegios con compras públicas, ingenio.
- Criterios de aceptación:
  - [ ] Siete mercados aislados en S0 y en red en S2.
  - [ ] El polígono de la red cruza el límite departamental.
  - [ ] Rótulos legibles con siete visibles como máximo.
- Prompt de arranque: `Etapa 9 de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 10. Escenarios y teoría de cambio

- Tamaño: grande. Fuentes: no.
- Lecturas: `GUION.md`, secciones 5 y 6; `contenido/condiciones.json`, `escenarios.json`.
- Objetivo: la teoría de cambio operable desde la vista lejana.
- Trabajo:
  - Motor de reglas en `src/reglas/`: lee condiciones, efectos y dependencias, y deriva el estado del territorio.
  - Panel de condiciones (interruptores C1 a C10) y preajustes S0 a S3.
  - Transición animada entre estados.
  - Diagrama 2D de la teoría de cambio (condiciones, supuestos, resultados) sincronizado con los interruptores.
  - Aviso cuando una condición activa carece de efecto territorial por falta de otra.
- Criterios de aceptación:
  - [ ] Los cuatro preajustes producen paisajes distinguibles en captura.
  - [ ] Ninguna condición sola produce S2.
  - [ ] Todas las reglas están en `contenido/`, sin reglas escritas en el código.
- Prompt de arranque: `Etapa 10 de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 11. Lentes, capa histórica y cierre

- Tamaño: mediana. Fuentes: sí, puntuales (Calle et al. 2022, §11.2 y §11.7; Res. 331).
- Objetivo: M3 a M6 recorribles (hito C).
- Trabajo:
  - Lentes ① a ④ sobre la misma maqueta (resaltados, rótulos y polígonos propios), según `GUION.md`, sección 7.
  - Línea de tiempo 1957, 1986, hoy y escenario, con coberturas según Calle et al. (2022, §11.2) y la fuente en pantalla.
  - Vista S1 de El Hatico: flujos que salen del territorio y caña en manejo orgánico sin cambio de la geometría de la matriz.
  - Cierre «objetivo territorial, instrumento predial»: horizonte S3 y, sobre él, el IPPTA en una sola finca.
- Criterios de aceptación:
  - [ ] Cambio de lente en un segundo o menos.
  - [ ] Paradas P13 a P26 completas.
- Prompt de arranque: `Etapa 11 de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 12. Ficha de sesión, actividad y tarea

- Tamaño: pequeña a mediana. Fuentes: no.
- Objetivo: la propuesta didáctica visible en pantalla.
- Trabajo:
  - Panel de ficha de sesión (M0).
  - Modo actividad para P19: pregunta en pantalla, activación progresiva de condiciones desde la vista del presentador, respuesta esperada en las notas.
  - Panel de tarea auténtica (M6).
  - Paradas saltables y alertas del cronómetro por momento.
- Criterios de aceptación:
  - [ ] Recorrido M0 a M6 completo en un ensayo de 36 a 40 minutos.
  - [ ] La actividad funciona solo desde la vista del presentador, sin tocar la vista compartida.
- Prompt de arranque: `Etapa 12 de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 13. Rendimiento y prueba en videoconferencia

- Tamaño: mediana. Fuentes: no.
- Objetivo: funcionamiento estable en las condiciones reales de la prueba.
- Trabajo:
  - Medición de cuadros por segundo, llamadas de dibujo y memoria en el MacBook Air mientras se comparte pantalla.
  - Modo liviano automático si el rendimiento cae (adelantado a la etapa 7.c como calidad adaptable; aquí se prueba compartiendo pantalla y se ajusta el umbral).
  - Revisión de contraste y tamaño de texto.
  - Prueba con la plataforma de la notificación (o Meet si aún no se conoce) y un segundo dispositivo como receptor.
  - Video del recorrido completo como respaldo adicional; respaldo de imágenes actualizado.
- Criterios de aceptación:
  - [ ] 45 cuadros por segundo o más compartiendo pantalla.
  - [ ] Texto legible en el receptor a 720p.
  - [ ] Cero solicitudes de red en el informe.
- Prompt de arranque: `Etapa 13 de PLAN.md. Sigue el protocolo de CLAUDE.md.`

## Etapa 14. Ensayo general y versión congelada

- Tamaño: pequeña. Fuentes: sí, para cerrar pendientes.
- Objetivo: versión final de la prueba (hito D).
- Trabajo:
  - Ensayo cronometrado completo y ajuste de tiempos y textos.
  - Cierre de pendientes de fuente: cada dato en `verificar` o `falta` se resuelve o se retira de la pantalla.
  - Fichas en estado `revisado`.
  - Etiqueta git `version-prueba-oral` y copia del archivo único y del respaldo fuera del proyecto.
  - Lista de chequeo del día de la prueba en la bitácora: equipo cargado, notificaciones apagadas, pestañas cerradas, `npm run presentar` probado, respaldo abierto en segundo plano, prototipo Hyperframes disponible.
- Criterios de aceptación:
  - [ ] Cero fuentes `verificar` o `falta` en pantalla.
  - [ ] Cero fichas en `borrador`.
  - [ ] Ensayo entre 36 y 40 minutos.
- Prompt de arranque: `Etapa 14 de PLAN.md. Sigue el protocolo de CLAUDE.md. Ejecuta /add-dir ../.. antes de buscar en las fuentes.`

## Ruta corta

Si la notificación llega antes del hito D, se reordena así:

1. Etapas 0 a 4 completas (hito A).
2. Etapa 6 reducida a F1, F2 y F4.
3. Etapa 9 reducida a los siete mercados, sus enlaces y el polígono de la red.
4. Etapa 11 reducida al cierre del IPPTA.
5. Etapa 13 reducida a la prueba en videoconferencia.

El prototipo Hyperframes cubre M1 y el respaldo de imágenes cubre cualquier falla del 3D.

## Etapas opcionales

| Clave | Etapa | Nota |
|---|---|---|
| O1 | Relieve real | Alejandro descarga un modelo digital de elevación (SRTM o ALOS) de la cuenca de referencia; Claude Code lo convierte en mapa de alturas y reemplaza el relieve procedimental. Las capas esquemáticas se conservan |
| O2 | Insertos de video generativo | clips cortos tipo diorama en paradas puntuales (campo `video` de la parada). Herramientas de pago |
| O3 | Grafo de conocimiento | requiere construir el grafo de `../Agroecologia_Grafo/` con una clave de API; enlaza paradas con conceptos |
| O4 | Versión para docencia en la web | Alejandro quiere usar el escenario en sus clases desde ya (2026-11-10) y publicarlo en GitHub Pages. Requisitos: etapa 7.c cerrada (calidad adaptable: el WebGL corre en el equipo de cada estudiante); publicar la carpeta `dist/` (rutas relativas, ya abre desde cualquier carpeta) con un flujo de GitHub Actions o una rama `gh-pages`; sin la vista del presentador ni las notas; rótulo de versión en borrador mientras las fichas no estén revisadas. Decisiones de Alejandro antes de publicar: repositorio público o plan de pago (Pages en repositorio privado exige plan de pago; confirmar en la documentación de GitHub) y si se publica antes de la prueba oral de enero, porque la clase quedaría a la vista. Enlace al respaldo en imágenes para equipos sin WebGL |
| O5 | Modo exploración | vuelo de un ave o una abeja sobre la cuenca; puntos de interés que abren fichas de `contenido/`; misiones cortas. Nuevo valor `exploracion` en el campo `modo` del estado |
| O6 | Juego de encargos para estudiantes (proyecto futuro) | idea de Alejandro (2026-11-10): usar esta maqueta como base de un juego donde estudiantes de ingeniería agroecológica reciben encargos y aprenden haciendo (diagnosticar una finca, medir la EAP, conectar con la EEP, activar condiciones de la teoría de cambio). Lo que ya sirve: contenido en `contenido/*.json`, almacén de estado, escena con semilla fija, fincas por receta y O5 como primer paso (misiones de un jugador). Lo que falta para un juego en línea tipo Roblox: servidor y cuentas (GitHub Pages solo sirve archivos; alcanza para un jugador con progreso guardado en el navegador), avatar y controles, edición del territorio por el jugador y evaluación de encargos. Proyecto aparte, después de la prueba oral; no condiciona las etapas 8 a 14 |

## Riesgos y respaldo

| Riesgo | Medida |
|---|---|
| WebGL falla o el equipo se bloquea | respaldo de imágenes con notas; archivo único; prototipo Hyperframes |
| Rendimiento bajo al compartir pantalla | modo liviano; prueba de la etapa 13 |
| Texto ilegible por compresión | tipografía grande, siete rótulos como máximo, transiciones lentas |
| Error de contenido ante el jurado | fuentes con localizador, validación automática, precauciones de la sección 10 del guion |
| Exceso de tiempo | cronómetro por momento y paradas saltables |
| Pregunta del jurado fuera del guion | modo libre y salto por hash a cualquier parada |
| Crecimiento del alcance | una etapa por sesión, lista de fuera de alcance, pendientes en la bitácora |
| Agotamiento del cupo de uso | etapas pequeñas, `/clear` entre etapas, ruta corta |

## Uso de Claude Code

- Abrir Claude Code dentro de `Escenario_Territorial/`. Así se carga este `CLAUDE.md` y no el del prototipo Hyperframes.
- `/add-dir ../..`: da acceso a la carpeta `TC` durante la sesión local, en las etapas con fuentes. En la nube, las fuentes se leen de la carpeta de Google Drive del proyecto (ver `CLAUDE.md`, «Acceso a las fuentes»).
- Ritmo (2026-11-10): la prueba oral será en enero. Una etapa por sesión, sin modo continuo salvo indicación, con revisión de Alejandro entre etapas (avance, calidad y contenido). Las etapas divididas (N.a, N.b) se cierran una por sesión.
- Modo plan (`/plan` o Shift+Tab): para la propuesta inicial de cada sesión.
- `/clear` entre etapas; `/compact` si el contexto crece dentro de una etapa; `/context` para ver qué ocupa el contexto.
- `/cost` y `/usage`: consumo de la sesión y estado del cupo. Anotar el consumo aproximado en la bitácora ayuda a planear las siguientes etapas.
- `/rewind` (o Esc dos veces) y git: para deshacer.
- `/model`: las etapas grandes de código (5, 6, 9 y 10) se benefician del modelo más capaz; las de ajuste (4, 12 y 14) admiten uno más económico.

Referencias sobre Claude Code: guía de memoria y `CLAUDE.md` (https://code.claude.com/docs/en/memory), que recomienda mantener cada `CLAUDE.md` por debajo de 200 líneas; hoja de comandos (https://support.claude.com/en/articles/14553413-claude-code-cheatsheet).
