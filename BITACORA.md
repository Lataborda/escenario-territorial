# Bitácora del escenario territorial

## Estado actual

- Etapa siguiente: Etapa 5. Coberturas y matriz del paisaje.
- Última etapa cerrada: Etapa 4 (2026-11-04). `npm run validar` y `npm run verificar` correctos (1 min 27 s en la nube).
- Terreno: relieve de la cuenca en bloque recortado, ríos, límite departamental y 32 anclas sobre la superficie (`src/terreno/`). Exageración vertical con `#ex=` (1,5 a 3; 2 por defecto).
- Navegación: almacén `src/estado.js`; recorrido de 26 paradas con flechas, espacio y Av Pág/Re Pág, pasos, teclas 0 a 6, O, F, H, V, C y A; hash `#p=ID&paso=N`; botonera de siete escalas, ficha con fuente abreviada e indicador de momento (`src/navegacion/`, `src/ui/`).
- Presentación: `npm run presentar` sirve la versión compilada en el puerto 4320 y abre la vista principal y `presentador.html` (notas, siguiente, cronómetro por momento con desvío, fuentes completas, controles e índice; sincronía por BroadcastChannel). `npm run respaldo` genera `respaldo/index.html` (34 imágenes de 1920×1080, abre sin servidor) y `respaldo/notas.md`.
- Contenido: 26 paradas en borrador; 68 localizadores y 20 datos por verificar en `verificacion/pendientes-de-fuente.md`, para cerrar en una sesión local (etapa 14 a más tardar).
- Revisión pendiente de Alejandro: ficha de sesión (D4), fichas P01 a P26 y vínculos de resultados de la teoría de cambio.
- Vista previa: `vista-previa/escenario.html` (archivo único, abre sin servidor), actualizada en la etapa 4.
- Hito A (recorrido mínimo): completo en lo técnico; falta la prueba manual de Alejandro en videoconferencia (criterio de la etapa 4).
- Fecha de la prueba oral: por confirmar. La notificación llega por correo con una antelación no inferior a tres días (Guía del Aspirante, literal E); el tema se informa dentro de los tres días siguientes (Res. 356 de 2026, art. 11).
- Plataforma de videoconferencia: por confirmar.
- Decisiones D1 a D7 (`GUION.md`, sección 12): resueltas el 2026-11-04. Alejandro aceptó las opciones recomendadas. D4 se redacta con Alejandro en la etapa 1; D7 se registra aquí al recibir la notificación.
- Bloqueos: ninguno.

## Prompt de sesión

Pegar al abrir Claude Code dentro de `Escenario_Territorial/`:

```
Sesión nueva. Sigue el protocolo de CLAUDE.md con la etapa indicada en BITACORA.md.
```

## Registro

### 2026-11-01 · Plan inicial

- Etapa: preparación, sin código.
- Hecho: `CLAUDE.md`, `PLAN.md`, `GUION.md` y esta bitácora, a partir de los dos resúmenes de la prueba oral y de la revisión de la carpeta `TC`.
- Decisiones: Three.js con Vite y GSAP; maqueta estilizada en bloque recortado; territorio esquemático inspirado en la cuenca del río Amaime y el norte del Cauca (pendiente de confirmación, D1).
- Hallazgos de la revisión que modifican el guion:
  - Calle et al. (2022, §11.7) documentan más de 20.000 ha de caña convertidas a producción orgánica en el Valle y más del 20 % de la caña de la cuenca baja del Amaime en manejo orgánico. La lectura de El Hatico como isla se matiza: escalamiento vertical y sustitución de insumos dentro de la matriz (escenario S1).
  - Zollet (2022, §4), en la carpeta, sintetiza los factores de Mier y Terán et al. (2018). Sostiene las condiciones C1 a C8 mientras falte el artículo original.
  - Wezel et al. (2020, tabla 1) asignan escala de aplicación a los 13 principios (parcela, finca, sistema alimentario). Se usa en la botonera de escalas.
- Pendiente: respuestas D1 a D7.
- Siguiente: Etapa 0.

### 2026-11-04 · Ajustes previos a la etapa 0

- Etapa: preparación, sin código. Primera sesión en la nube.
- Decisiones: Alejandro aceptó las opciones recomendadas de D1 a D7 (`GUION.md`, sección 12):
  - D1: territorio esquemático inspirado en la cuenca del río Amaime y el norte del Cauca; relieve real como etapa opcional O1.
  - D2: nombres reales en pantalla (El Hatico, REDMAC, MercUN, Ayacucho) como referencias rotuladas «esquema sin escala».
  - D3: territorios étnicos con figuras genéricas hasta contar con fuente.
  - D4: curso hipotético y resultado de aprendizaje de la ficha de sesión, redactados con Alejandro en la etapa 1.
  - D5: maqueta estilizada en bloque recortado.
  - D6: 26 paradas; las saltables se recortan si el ensayo excede 36 minutos.
  - D7: fecha y plataforma de la prueba, registradas en esta bitácora al recibir la notificación.
- Hecho:
  - `PLAN.md`, sección 3.4: la botonera de escalas es la interfaz principal y está siempre visible; un clic en una finca o un mercado acerca la cámara; las paradas son el guion de clase que el presentador recorre con las flechas; nada avanza solo. Ajustes de coherencia en las etapas 3 y 6.
  - `PLAN.md`: etapa opcional O5, modo exploración.
  - `PLAN.md`, etapa 1: en la nube se trabaja solo con `GUION.md` y los localizadores faltantes quedan en `verificar`.
  - `PLAN.md`, etapas 0 y 4: al cerrar, copia del archivo único en `vista-previa/escenario.html`.
  - `CLAUDE.md`: «modo continuo» omite la espera de aprobación del paso 5; uso del Chromium y el Playwright del entorno cuando existen.
- Siguiente: Etapa 0.

### 2026-11-04 · Etapa 0. Entorno y repositorio

- Modo continuo: propuesta sin espera de aprobación. Sesión en la nube (Linux, Node 22).
- Hecho:
  - `package.json` con versiones exactas: three 0.186.1, gsap 3.15.1, simplex-noise 4.0.3; desarrollo: vite 8.3.5, vite-plugin-singlefile 2.3.4, lil-gui 0.21.0, playwright 1.63.0. `package-lock.json` versionado.
  - `vite.config.js` con dos modos: `dist/` y archivo único en `dist-unico/` (modo `unico`).
  - `index.html`, `src/main.js`, `src/estilos.css`, `src/escena/escena.js` (renderizador, cámara, luz hemisférica y una direccional con sombra, OrbitControls, relación de píxeles máxima 2) y `src/escena/maqueta.js` (bloque de 1200 × 900 × 90 sobre mesa con sombra; exporta `MEDIDAS`).
  - Evento `escenario:listo` y atributo `data-listo` en `<html>` tras cargar tipografías y dibujar el primer cuadro. `window.escenario.estadisticas()` da llamadas de dibujo y triángulos.
  - Tipografías IBM Plex Sans (400, 500, 600) y Fraunces (400, 600), subconjunto latino, con licencias OFL en `src/fuentes/`.
  - `contenido/` con los siete JSON vacíos y válidos (`version` y colección vacía).
  - `scripts/verificar.mjs` y `scripts/lib/revisar-pagina.mjs`: compila los dos modos, revisa la vista en el servidor de vista previa (captura `inicio.png`, cuadros por segundo, llamadas de dibujo, tipografías) y el archivo único por `file://` con toda solicitud http bloqueada (captura `unico.png`); lee `contenido/`; escribe `verificacion/informe.md`.
  - `scripts/vista-previa.mjs` y script `vista-previa`: copia el archivo único en `vista-previa/escenario.html`.
- Decisiones:
  - Playwright 1.63.0 fijado para coincidir con el Chromium del entorno de la nube (revisión 1243); no se instaló navegador. En el MacBook: `npx playwright install chromium` una vez.
  - Tipografías en `src/fuentes/` y no en `public/fuentes/`, para que Vite las incruste en el archivo único. `PLAN.md` actualizado.
  - three 0.186.1 en lugar de 0.187.0 (publicada cinco días antes de la sesión).
  - `verificacion/` (informe y capturas) se versiona, según la sección 3.2. Si el repositorio crece con las 26 capturas, se puede pasar `verificacion/capturas/` a `.gitignore`.
  - La compilación es determinista: dos compilaciones seguidas dan el mismo archivo único (misma suma MD5).
- Criterios de aceptación: cumplidos.
  - `npm run dev` muestra la escena mínima; la órbita con el ratón cambia la vista (prueba con Playwright).
  - `npm run build` y `npm run build:unico` sin errores.
  - Archivo único (682 kB) abierto por `file://` sin servidor y con la red bloqueada: carga, cero errores, cero solicitudes externas, tipografías cargadas.
  - `npm run verificar` correcto; `vista-previa/escenario.html` actualizado.
- Verificación: correcto. Cero errores de consola, cero solicitudes externas en las dos vistas. 13 llamadas de dibujo. 13,5 cuadros por segundo con SwiftShader (render por software del contenedor); cifra de referencia, la medición válida es la del MacBook Air (etapas 2 y 13). Avisos no bloqueantes: «GPU stall due to ReadPixels», propios de la captura.
- Pendientes:
  - Comprobar en el MacBook Air el doble clic sobre `vista-previa/escenario.html` y los cuadros por segundo con GPU.
  - Sin `src/estado.js` todavía (etapa 3); los módulos actuales no se suscriben a nada.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 1. Modelo de contenido.

### 2026-11-04 · Etapa 1. Modelo de contenido

- Modo continuo: propuesta sin espera de aprobación. Sesión en la nube sin acceso a las fuentes; solo `GUION.md`.
- Hecho:
  - `fuentes.json`: las 31 claves de `GUION.md` (sección 11) con referencia, cita corta, archivo, estado y nota.
  - `territorio.json`: 32 entidades con ancla (zonas, ríos, límite, fincas F1 a F4, siete cabeceras con mercado y dos del sur para S2, lote, corte de suelo, vista general), datos del plano del valle y catálogo de 34 capas.
  - `escalas.json`: siete escalas con vista tipo provisional, principios de Wezel et al. (2020), procesos y escala mínima (sección 4), frentes de Duarte et al. (2025).
  - `paradas.json`: momentos M0 a M6 con meta, ficha de sesión y 26 paradas con cámara, estado, ficha, notas y fuentes. P03, P14 y P16 llevan pasos (niveles de organización, lentes, años).
  - `escenarios.json`: S0 a S3, capa histórica (1957, 1986, hoy), lentes L1 a L4 y contraste Magrini y Giraldo y Rosset (estado `verificar`).
  - `condiciones.json`: C1 a C10 con efectos, dependencias y mensaje si falta; reglas visuales V1 a V7 (sección 6.5); supuestos H1 a H7; resultados R1 a R5 y final.
  - `actores.json`: 18 actores con escalas de la botonera y anclas.
  - `scripts/validar-contenido.mjs` con `scripts/lib/contenido.mjs`, `revisar-textos.mjs` y `revisar-referencias.mjs`; script `validar`. Revisa campos obligatorios, ids, referencias cruzadas, coordenadas, 60 palabras por ficha, minutos por momento, títulos sin dos puntos, términos vetados y «APPA» junto a «1406». Las construcciones de contraste dan aviso sin bloquear. Genera `verificacion/pendientes-de-fuente.md`.
  - `npm run verificar` valida el contenido, regenera los pendientes y falla con errores de contenido.
- Decisiones:
  - Referencias `clave:localizador`; sin localizador en el guion, `clave:verificar`. Un campo `verificar` en cualquier objeto anota dudas de dato.
  - Dependencias de condiciones y reglas visuales como expresión `{todas, alguna, ninguna}`. `PLAN.md`, sección 3.3, actualizado.
  - Escala «matriz» del guion asignada al botón `vereda` (escala 4, «Matriz y vereda»). P25 («territorio y finca») usa la escala `territorio`. P16 («capa histórica») y P19 («actividad») usan S0 con año o modo.
  - Títulos ajustados a sintagma nominal: P22 «Índice EAP de tres fincas tipo»; P24 «Soberanía de los datos» (antes «Quién mide»).
  - P04 y P05 sobre F3 (finca diversificada); P22 compara F1, F2 y F3.
  - El mercado de la ciudad intermedia queda fuera de las siete cabeceras. Posiciones de cabeceras, relictos y lote marcadas como `propuesta`.
  - Ubicación de lentes, capa histórica, procesos y principios: `escenarios.json` y `escalas.json`, sin archivos nuevos.
- Inviable o por resolver con Alejandro:
  - D4: curso hipotético («Agroecología y territorio») y prerrequisitos redactados sin Alejandro.
  - Vínculos de R1 a R5 con condiciones y supuestos inferidos de las reglas visuales; dependencias de C1, C2 y C10 sin base explícita en el guion.
  - Nombres de los 13 principios de Wezel et al. (2020) escritos de memoria; estado `verificar`.
  - Ancla del corte de suelo: `PLAN.md` (etapa 7) pide un lote de policultivo de ladera junto a caña; P07 cita la caña agroecológica de F1. Se resuelve en la etapa 7.
  - P06: los usos de F1 suman 287 ha de 288 ha.
- Pendientes de fuente (resumen de `verificacion/pendientes-de-fuente.md`):
  - 11 fuentes en falta o por verificar: REDMAC, Romero et al., Sánchez de Prager, Mier y Terán, Giraldo y Rosset, Anderson, León-Sicard 2015, Ley 2294, Acto Legislativo 01 de 2023; año de Magrini et al. y de Padró et al.
  - 68 referencias sin localizador en 23 fuentes. Las de más peso: Res. 331 (cifras de P02 y S0, cita de P24), Magrini et al. (cinco mecanismos de P15, cita de P14), REDMAC (P18, P20), Ley 2046 (artículo del 30 %, P21), Calle et al. (materia orgánica, P07), Cleves-Leguízamo et al. (criterios EAP, P05).
  - 20 datos por verificar, entre ellos la frontera según Gliessman (p. 37), los diez criterios de la EAP, «de 2 % a 4 %» como cambio o intervalo, la cobertura de 1957 y las cifras de REDMAC.
- Criterios de aceptación: cumplidos.
  - `npm run validar` sin errores; 26 paradas y 40 minutos (M0 3, M1 6, M2 7, M3 8, M4 8, M5 5, M6 3); saltables P12, P15 y P23.
  - Cada parada tiene al menos una fuente con localizador o con `verificar`.
  - Pendientes generados y resumidos aquí.
  - `GUION.md` sin cambios.
- Verificación: correcto. Cero errores de consola y cero solicitudes externas en las dos vistas; 13 llamadas de dibujo; 13,7 cuadros por segundo con SwiftShader (referencia). El validador se probó con una copia del contenido con fallas introducidas: detectó los 20 errores y los 2 avisos esperados, sin falso positivo con el número QUIPU que contiene «1406».
- Pendientes:
  - Revisión de Alejandro de fichas y notas (estado `borrador`) y de la ficha de sesión.
  - Sesión local para cerrar `pendientes-de-fuente.md`.
  - La interfaz aún no lee `contenido/` (etapa 3).
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 2. Terreno de la cuenca.

### 2026-11-04 · Etapa 2. Terreno de la cuenca

- Modo continuo: propuesta sin espera de aprobación. Sesión en la nube, sin fuentes.
- Hecho:
  - `src/terreno/`: `plano.js` (coordenadas, rejilla, zonas leídas de `territorio.json`), `rios.js` (trazos), `hidrografia.js` (muestreo, confluencias, distancias, lechos, nivel del agua), `relieve.js` (perfil por zonas, ruido con semilla, valles y cauces tallados), `colores.js`, `malla.js` (superficie facetada y agua), `bloque.js` (caras con estratos), `limite.js`, `anclas.js` y `terreno.js` (orquesta y exporta `altura(x, z)`, `superficie(x, z)` y `ancla(id)`).
  - `src/util/azar.js` (mulberry32, ruido simplex con semilla, huella FNV) y `src/util/interpolar.js` (interpolación monótona); `src/parametros.js` (lee `#ex=` y `#anclas=1`).
  - Relieve: rejilla de 401 × 301 vértices (paso 3). Perfil monótono con altitudes ilustrativas en los límites de zona (valle 950 a 1.010 m, páramo hasta 3.650 m; solo para dibujar, nada en pantalla). Filos alargados de oriente a occidente en la cordillera, abanico aluvial en el piedemonte, ondulación leve del plano.
  - Red hídrica: río Cauca al occidente (corre al norte), río tributario desde el páramo con meandros en el plano, tres quebradas que confluyen con el tributario en la ladera y una quebrada al sur del límite que desemboca en el Cauca. Lecho siempre descendente; valles por descenso del relieve; cauce de fondo plano con orillas en talud; lámina de agua azul.
  - Bloque recortado: cuatro caras con agua, horizontes A, B y C, depósito aluvial que pasa a roca alterada bajo la cordillera, lente de gravas bajo el plano y roca de base. La caja de la etapa 0 se retiró de `maqueta.js`, que conserva medidas y mesa.
  - Color por zona (límite irregular), pendiente (roca en lo escarpado), altitud (cumbres claras) y orillas.
  - Límite departamental: línea discontinua gris (Line2) sobre el terreno en z = 0,65.
  - Anclas: las 32 entidades con posición; los ríos se anclan sobre su cauce. Tecla A: conos de marcador (una llamada de dibujo).
  - `escena.js`: `mirar(objetivo, vista)` para colocar la cámara respecto de un ancla; vista general desde el suroccidente (azimut −30).
  - Verificación: `scripts/lib/revisar-terreno.mjs`. Capturas `general`, `ladera`, `plano` y `anclas`; rayo vertical por ancla contra la malla visible; segunda carga con huella y captura comparadas; huella del archivo único. Sección «Terreno» en el informe; cualquier diferencia es falla.
- Decisiones:
  - Vista general desde el suroccidente: con azimut 35 (sureste) la ladera, orientada al occidente, queda de espaldas a la cámara.
  - Cauce tallado de 9,6 unidades como mínimo (lámina de 8,6): con cauces más angostos la rejilla no los resuelve y el agua se corta. Las quebradas se ven casi tan anchas como el tributario aguas arriba.
  - Tecla A provisional: `anclas.js` escucha el teclado hasta que exista `src/estado.js`.
  - Quebrada meridional sin entidad en `territorio.json`: dato de dibujo, sin rótulo ni ancla.
  - Sombras del terreno conservadas: retirarlas apenas cambia el rendimiento con SwiftShader (2,8 a 3,0 cuadros por segundo).
- Criterios de aceptación:
  - Cumplido: en la captura aérea (`general.png`) se distinguen cordillera, ladera, valle y ríos.
  - Cumplido: escena idéntica en dos cargas (misma huella y captura idéntica byte a byte); el archivo único da la misma huella.
  - Pendiente: 50 cuadros por segundo en la vista general. No verificable en la nube: SwiftShader da 2,5 y está limitado por geometría (517 mil triángulos por cuadro con la pasada de sombras; 16 veces menos píxeles solo suben a 4). Se mide en el MacBook Air.
  - Cumplido: anclas sobre la superficie, 32 de 32, desvío máximo 0,0003 unidades; la tecla A muestra los marcadores (`anclas.png`).
  - Cumplido: capturas de vista general, ladera y plano.
- Verificación: correcto. Cero errores de consola y cero solicitudes externas en las dos vistas; 7 llamadas de dibujo; carga en 3,4 a 3,7 s con SwiftShader; archivo único de 742 kB.
- Pendientes:
  - Etapa 3: los azimuts de `paradas.json` (35) miran la ladera de espaldas; usar azimuts negativos (−30 en la vista general).
  - MacBook Air: medir cuadros por segundo en la vista general. Si no llega a 50: rejilla de paso 4 (los cauces mínimos pasan a 12,8) o sombras del terreno solo fuera del modo liviano.
  - Relieve y colores provisionales hasta las coberturas de la etapa 5; el plano se ve liso y claro sin la matriz de caña.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 3. Navegación por paradas y escalas.

### 2026-11-04 · Etapa 3. Navegación por paradas y escalas

- Modo continuo: propuesta sin espera de aprobación. Sesión en la nube, sin fuentes.
- Hecho:
  - `src/estado.js`: almacén único con `obtener`, `cambiar` y `suscribir` por claves; los cambios pedidos durante una notificación esperan su turno; un suscriptor que falla se registra y no detiene a los demás. Campos: parada, paso, escala, foco, camara, escenario, condiciones, lente, anio, capas, modo, interfaz, liviano, anclas, aviso.
  - `src/navegacion/`: `recorrido.js` (`irA`, siguiente y anterior con pasos, saltos por momento, modo libre), `camara.js` (vuelo con GSAP relativo al ancla, tecla C), `foco.js` (botonera y clic), `teclado.js`, `hash.js`, `seleccion.js` y `pruebas.js` (funciones para la verificación).
  - `src/ui/`: botonera de siete escalas (región arriba, suelo abajo; un punto marca la escala propia de la parada), ficha (título, pasos, texto, fuente abreviada, etiqueta «borrador»), indicador de momento (barra M0 a M6 con ancho según la meta, parada N de 26, modo), rótulo «Esquema sin escala» y aviso de la tecla C. Estilos en `src/ui/interfaz.css`.
  - `escena.js`: `colocar`, controles de órbita solo en modo libre, modo liviano (sin sombras, relación de píxeles 1) y desplazamiento de la vista. `anclas.js` reacciona a `anclas` del estado; se retiró el oyente provisional de la tecla A.
  - `contenido/paradas.json`: azimut −30 en todas las cámaras (P05 −55, P09 −65); vista general a 2.500 (antes 2.300); P10 en la vista general a 3.100 y P15 sobre el plano a 1.700, porque con la ciudad y el ingenio como centro la maqueta quedaba bajo la ficha.
  - `contenido/escalas.json`: vista tipo con ancla por defecto; territorio a 2.500 y región a 3.100; bloque `seleccion` (finca a escala finca, asentamiento a escala vereda, vuelo de 2 s).
  - Validador: rangos de cámara (elevación 5 a 85, azimut −180 a 180, duración 1,5 a 3 s), ancla de la vista tipo y escalas de `seleccion`.
  - Verificación (`revisar-paradas.mjs`, `revisar-legibilidad.mjs`, `informe-recorrido.mjs`): 26 paradas por hash con captura JPEG en `verificacion/capturas/paradas/`, comparación de ficha, fuente, cámara y escala; flechas por los 34 estados con pasos en ambos sentidos; teclas 0 a 6, O, H, V y C; botonera y clic en una finca; duración real de dos vuelos; muestreo de las 25 trayectorias; hash directo `#p=P14&paso=2`; fichas a 1280×720 (`ficha-1280.png`). Segundos transcurridos por fase en la consola.
- Decisiones:
  - Pasos: al llegar a una parada se muestra el primero; al retroceder desde la parada siguiente se llega al último. Un paso cambia el estado visual y conserva cámara y modo; una parada nueva toma el modo de la parada (sale del modo libre).
  - Botonera: distancia y elevación de la vista tipo, azimut actual, desde el punto de interés; si el punto es la vista general, el ancla por defecto de la escala (suelo: corte de suelo; planta: lote; finca y vereda: F1; cuenca: río tributario; territorio y región: vista general). La otra vez O devuelve escala y cámara de la parada.
  - Clic en fincas y mercados por proyección de las anclas en pantalla (radio de 3,5 % del alto), sin geometría hasta las etapas 6 y 9. CAB8 y CAB9 responden solo en S2 y S3. Cursor de mano al pasar por encima.
  - Modo libre con órbita y zoom, sin desplazamiento lateral: el objetivo queda en el ancla y la tecla C da un bloque exacto. Distancia mínima de 40 (el suelo se ve a 70).
  - Teclas C y A activas en cualquier modo. C copia al portapapeles (si el navegador lo permite) y muestra el bloque 8 s. El valor `autor` de `modo` queda reservado para lil-gui.
  - Av Pág y Re Pág equivalen a las flechas (presentadores inalámbricos). Sin repetición por tecla sostenida.
  - Vuelo: interpolación esférica alrededor de un objetivo que se desplaza, distancia en escala logarítmica, alejamiento a mitad de vuelo proporcional al desplazamiento horizontal, curva `power2.inOut`; la cámara no baja de max(6, 8 % de la distancia) sobre la superficie. El reloj de GSAP se pone al día al iniciar el vuelo y sin suavizado de retrasos, para que la duración se respete.
  - Tamaño de interfaz: 1 rem = min(alto/45, ancho/80), es decir 24 px a 1920×1080 y 16 px a 1280×720. Todo texto en pantalla mide 1 rem o más, salvo la etiqueta «borrador» y el aviso de la tecla C. Con la interfaz visible, la vista se corre 8 rem a la izquierda para centrar el objetivo entre la botonera y la ficha.
  - Fuente abreviada: forma corta de `fuentes.json` con sus localizadores; con localizador `verificar` o fuente en `falta`/`verificar`, subrayado punteado y nota emergente.
  - Capturas de paradas en JPEG de calidad 60 (unos 85 kB cada una, 2,2 MB en total). Durante el recorrido de la verificación el ciclo de dibujo se pausa y se dibuja un cuadro por captura: con SwiftShader cada interacción tardaba 0,7 s y cada captura 2,8 s (6 min 17 s en total; ahora 1 min 25 s).
- Criterios de aceptación: cumplidos.
  - Recorre las 26 paradas sin errores: 26 de 26 cargan por hash, con ficha, fuente, cámara y escala correctas; cero errores de consola.
  - Transiciones de 1,5 a 3 s sin saltos: 2,5 s declarados entre paradas (medidos 2,75 s con SwiftShader, el vuelo termina en el primer cuadro tras su duración) y 2 s en la botonera (medidos 2,4 s). Trayectorias continuas: razón máxima de 2,1 entre el paso mayor y el paso medio (2 es la aceleración suave pura), extremos exactos. La fluidez a 60 cuadros por segundo se comprueba en el MacBook Air.
  - Fichas legibles a 1280×720: 26 de 26 sin desborde, dentro de la ventana y sin superposición; letra de 16 px; la ficha más alta (P14) ocupa 488 de 720 px.
  - Cada ficha muestra su fuente: 26 de 26.
  - La tecla C produce `"camara": { "ancla": "F2", "distancia": 640, "azimut": -47, "elevacion": 33, "duracion": 2.5 }`, válido para `paradas.json`; aplicado de nuevo, desvío 0.
- Verificación: correcto. Cero errores de consola y cero solicitudes externas en las cinco cargas y en el archivo único; 7 llamadas de dibujo; 2,8 cuadros por segundo con SwiftShader (referencia); archivo único de 864 kB.
- Pendientes:
  - Revisión de Alejandro: la fuente `resumenes` (síntesis propia de la estrategia) aparece en pantalla como «Resúmenes de estrategia» en P01, P12, P13, P14, P20 y P26; conviene sustituirla por la fuente primaria antes de la prueba.
  - P17 y P21 centran la cámara en F1 y en la ciudad; la cordillera queda en parte bajo la ficha. Revisar el encuadre cuando existan las capas (etapas 5 a 9).
  - MacBook Air: fluidez de los vuelos, presentador inalámbrico (Av Pág y Re Pág), copia de la tecla C al portapapeles por `file://` y cuadros por segundo de la vista general (pendiente de la etapa 2).
  - lil-gui en modo autor: sin implementar (fuera del alcance de la etapa).
  - El estado ya publica escenario, capas, lente, año y condiciones; ningún módulo visual los consume todavía (etapas 5 a 11).
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 4. Vista del presentador y respaldo.

### 2026-11-04 · Etapa 4. Vista del presentador y respaldo

- Modo continuo: propuesta sin espera de aprobación. Sesión en la nube, sin fuentes.
- Hecho:
  - `presentador.html` y `src/presentador/`: `canal.js` (BroadcastChannel y protocolo), `sincronia.js` (lado principal: publica parada, paso, escala, modo, interfaz y liviano; ejecuta órdenes con las mismas funciones del teclado), `presentador.js` (montaje, conexión, teclado), `paneles.js` (parada actual con pasos, notas, ficha y fuentes completas; siguiente; controles; índice por momento) y `cronometro.js` (modelo y vista). Estilos en `presentador.css` y `paneles.css`.
  - `src/tipografias.css`: tipografías y paleta compartidas por las dos vistas (salen de `estilos.css` e `interfaz.css` sin cambio visual). `src/util/fuentes.js`: abreviatura de fuentes como función pura, usada por la ficha, el presentador y el script de notas.
  - `vite.config.js`: dos entradas en la compilación normal; el archivo único conserva solo la vista principal.
  - `scripts/presentar.mjs` (`npm run presentar`, opción `--sin-abrir`), `scripts/respaldo.mjs` (`npm run respaldo`), `scripts/lib/plantilla-respaldo.mjs`, `scripts/lib/notas.mjs`.
  - Verificación: `revisar-presentador.mjs` (19 pruebas de sincronía y cronómetro en dos pestañas), `revisar-respaldo.mjs` (apertura por `file://`, imágenes y teclado, huella del contenido) e `informe-presentador.mjs`. `revisar-pagina.mjs` exporta `vigilar` y `bloquearExternas`.
  - `respaldo/` versionado (4,8 MB) y `vista-previa/escenario.html` actualizado.
- Decisiones:
  - El presentador no guarda parada propia: refleja en su almacén el estado que publica la vista principal y envía órdenes. La ida y la vuelta pasan por el almacén de la vista principal. Saludo cada 2 s; sin respuesta en 5 s, aviso «Sin vista principal».
  - Teclas del presentador: las de la vista principal salvo F, C y A. Un presentador inalámbrico funciona con cualquiera de las dos ventanas al frente.
  - Cronómetro: arranca con «Iniciar»; el tiempo se asigna al momento de la parada actual. Desvío por momento = real − meta. Desvío acumulado = momentos visitados más el actual solo cuando excede su meta. Con desvío acumulado mayor que la tolerancia (1 min), las paradas saltables se resaltan y «Siguiente» ofrece omitir la saltable. Registro en `localStorage` (sobrevive a una recarga; puerto fijo 4320 para conservarlo entre reinicios del servidor). «Reiniciar» solo en pausa.
  - Respaldo: una imagen por parada y por paso (34), 1920×1080, JPEG de calidad 75, con la interfaz visible (es lo que vería la audiencia). Mismas teclas de la vista principal (más Inicio y Fin) y hash `#p=ID&paso=N`. Ayuda breve en pantalla hasta la primera tecla. Las notas no aparecen en la página compartida; van en `notas.md` con inicio previsto, número de diapositiva, ficha y fuentes.
  - La huella del respaldo cubre `paradas.json` y `fuentes.json`; un cambio visual de la maqueta no la altera. Regenerar el respaldo al cerrar las etapas 5 a 11 que cambien la escena, y en la etapa 14.
- Criterios de aceptación:
  - `vista-previa/escenario.html` actualizado y en el commit: cumplido (866 kB).
  - Ventanas sincronizadas en ida y vuelta: cumplido. Botones, teclado e índice del presentador mueven la principal; flechas, hash y modo de la principal llegan al presentador (19 de 19 pruebas).
  - Cronómetro con desvío frente a la meta de cada momento: cumplido (reloj simulado: M0 −2:00, M1 +1:00, acumulado +2:00 con aviso de retraso; pausa y recarga conservan el tiempo).
  - Respaldo sin servidor: cumplido (34 de 34 imágenes por `file://`, teclado correcto, cero solicitudes).
  - Prueba manual de Alejandro (compartir la pestaña principal en videoconferencia y mirarla desde un segundo dispositivo): pendiente, no se puede hacer en la nube.
- Verificación: correcto. Cero errores de consola y cero solicitudes externas en todas las cargas, incluidas las dos pestañas del presentador, el archivo único y el respaldo; 7 llamadas de dibujo; 2,6 cuadros por segundo con SwiftShader (referencia); archivo único de 866 kB. `npm run presentar -- --sin-abrir` sirve las dos vistas (respuesta 200); la apertura automática del navegador no se probó en la nube.
- Pendientes:
  - Prueba manual de Alejandro en el MacBook Air: `npm run presentar`, arrastrar la pestaña del presentador a otra ventana, compartir solo la principal en la plataforma de videoconferencia y mirarla desde un segundo dispositivo. Anotar el resultado aquí. Comprobar también el presentador inalámbrico con cada ventana al frente.
  - Revisar la vista del presentador a la resolución del portátil (`verificacion/capturas/presentador.png` a 1440×900): el índice queda corto y se desplaza.
  - Regenerar `respaldo/` cuando cambie la escena (etapas 5 a 11) y en la versión congelada (etapa 14).
  - Pendientes heredados de la etapa 3: fuente `resumenes` en pantalla, encuadre de P17 y P21, fluidez y teclas en el MacBook Air, lil-gui en modo autor.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 5. Coberturas y matriz del paisaje.

## Plantilla de entrada

```
### AAAA-MM-DD · Etapa N. Nombre

- Hecho:
- Decisiones:
- Criterios de aceptación: cumplidos / pendientes (cuáles)
- Verificación: resultado de npm run verificar (errores, fps, solicitudes externas)
- Pendientes:
- Consumo aproximado (/cost):
- Siguiente:
```
