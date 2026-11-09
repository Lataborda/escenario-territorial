# Bitácora del escenario territorial

## Estado actual

- Etapa siguiente: Etapa 7. Lote, interacciones de especies y suelo (requiere fuentes: sesión local con `/add-dir ../..`). En esa misma sesión local, antes de la etapa 7: cotejar los criterios del índice EAP (pendiente de la 6.b).
- Última etapa cerrada: Etapa 6.b, panel EAP (2026-11-09), con el cotejo de fuentes pendiente. `npm run validar` y `npm run verificar` correctos.
- Índice EAP (6.b, `contenido/eap.json`, `src/ui/eap.js`): panel en la columna derecha con la capa `indices_eap` (P22): diez criterios por fila, F1, F2 y F3 por columna, valor sobre un fondo de intensidad proporcional y total de 100; al pie, «Valores ilustrativos» y las fuentes abreviadas con la marca de pendiente. Sobre cada finca, un rótulo con su total. Nombres, siglas, orden y escala de los criterios redactados sin acceso a las fuentes: estado `verificar`. Los grupos de criterios no se muestran hasta confirmarlos.
- Fincas (6.a, `src/fincas/`, `contenido/fincas.json`): cuatro fincas tipo generadas desde una receta (región en la rejilla de teselas con esquinas recortadas, solar con casa, lotes por área o peso, lindero y cercas vivas). F1 finca faro con las áreas de El Hatico (Calle et al. 2022, §11.1); F2 y F3 en la ladera y F4 predio cañero, con proporciones ilustrativas. Los lotes son coberturas de uso fijo (clase `lotes`); las cercas vivas son leucaena y guamo en el mosaico (`cercas.js`). Capas en la superposición (trazos en píxeles de pantalla, sin oclusión ni desenfoque, `src/escena/lineas.js`): conectores internos y externos, contorno de la EEP y conexión de cada finca con ella (`src/coberturas/eep.js`), resaltado del agroecosistema menor (lote) y mayor (lindero con la casa y la familia). Leyenda de capas y panel de usos de la finca en la columna derecha (`src/ui/capas.js`); marcadores numerados de los lotes (`src/fincas/rotulos.js`). Clic dentro del lindero de una finca: vuelo a la escala de finca.
- Estilo visual: decisión D5 «realismo de maqueta» aplicada a toda la vegetación desde la 5.c.a (ningún material facetado en la vegetación; las teselas conservan caras planas). Luz de diorama desde la 5.c.c: sol algo cálido con sombra PCF suave (radio 3, intensidad 0,85), viento leve en copas, hojas y matas de caña (`src/escena/viento.js`), oclusión ambiental desde la profundidad y desenfoque de miniatura (`posproceso.js`, `sombreadores.js`). Intensidades en el hash: `#ao`, `#mini` y `#viento` (0 apaga, 1 por defecto); tecla M (y botón «Miniatura» del presentador) alterna la miniatura; tecla R muestra el medidor de rendimiento.
- Caña (5.c.a y 5.c.b): lotes de tres edades fijas por lote (recién cortado, en crecimiento, maduro; fracciones ilustrativas en `escenarios.json`, `edades_cana`), distintas por altura y color, sin espigas. Mata según la referencia `referencias/cana-mata.webp` (`mata.js`: tallos con nudos de verde amarillento a morado, hojas en arco con las puntas caídas, hojas secas en la base) en dos niveles, en surco doble y en los bordes, por celda y con cupo (`cana.js`). Dentro del radio con matas (hasta 460 unidades de la cámara) la tapa del lote baja hasta la lámina y queda en sombra; más lejos, bloque con hileras, textura de hojas, altura irregular y caras de tallos (`superficie.js`).
- Terreno: relieve de la cuenca en bloque recortado, ríos, límite departamental y 32 anclas sobre la superficie (`src/terreno/`). Exageración vertical con `#ex=` (1,5 a 3; 2 por defecto).
- Coberturas (`src/coberturas/`): parcelas del plano y del piedemonte (caña en bloque, pastura, silvopastoreo, relictos de bosque seco, humedal), orillas (bosque ripario y guadual), bosque altoandino, páramo y, desde la 5.b, el mosaico campesino de la ladera en parcelas pequeñas (café con sombrío, plátano, frutales, huerta y pastura) con teselas paralelas al relieve. Especies con racimos de hojas y dos niveles de detalle por distancia a la cámara (`instancias.js`, `detalle.js`, `especies.js`, `formas.js`, `mosaico.js`); desde la 5.c.a también la vegetación natural, de la pastura y del silvopastoreo (`arboles.js`: samán, árbol de bosque seco, ceiba, árbol ribereño, guadua, árbol altoandino, helecho arbóreo, frailejón, junco y enea) y setos de leucaena en el silvopastoreo. Proporciones por escenario en `escenarios.json` (borrador); S2 diversifica la ladera y conserva la matriz del plano. Transición de 2 s y leyenda arriba a la derecha.
- Vías y asentamientos (`src/vias/`, `src/asentamientos/`): 23 tramos trazados sobre el relieve (troncales, secundarias y veredales) con 7 puentes y corredor sin parcelas; ciudad de 45 manzanas y nueve cabeceras de 9 manzanas, con tejados y plaza. No cambian con el escenario.
- Navegación: almacén `src/estado.js`; recorrido de 26 paradas (37 estados con pasos; P04 con dos pasos y P05 con tres desde la 6.a) con flechas, espacio y Av Pág/Re Pág, pasos, teclas 0 a 6, O, F, H, V, C, A, M y R; hash `#p=ID&paso=N`; botonera de siete escalas, ficha con fuente abreviada e indicador de momento (`src/navegacion/`, `src/ui/`). Modo libre (tecla O, etapa 3.b): órbita y zoom, doble clic para volar a un punto del relieve, flechas o WASD para avanzar (Mayús acelera), cámara siempre sobre el relieve y objetivo dentro de la maqueta (`libre.js`, `limites.js`).
- Presentación: `npm run presentar` sirve la versión compilada en el puerto 4320 y abre la vista principal y `presentador.html` (notas, siguiente, cronómetro por momento con desvío, fuentes completas, controles e índice; sincronía por BroadcastChannel). `npm run respaldo` genera `respaldo/index.html` (37 imágenes de 1920×1080, abre sin servidor) y `respaldo/notas.md`.
- Contenido: 26 paradas, 4 recetas de finca y el índice EAP en borrador; 71 localizadores y 23 datos por verificar en `verificacion/pendientes-de-fuente.md`, para cerrar en una sesión local (etapa 14 a más tardar).
- Revisión pendiente de Alejandro: ficha de sesión (D4), fichas P01 a P26, vínculos de resultados de la teoría de cambio, proporciones de coberturas por escenario (plano y ladera), fracciones de edad de la caña, rótulos y colores de la leyenda, red vial y trama de la ciudad y las cabeceras, especies de la vegetación (5.c.a), mata de caña, surco doble y empalme de la caña cercana con el bloque lejano (5.c.b), intensidad de la oclusión, del desenfoque de miniatura y del viento (5.c.c), recetas de F2 a F4 (usos, pesos, tamaño y fracción de cercas vivas), colores de las capas, casa y familia, distancias de cámara de P04 a P06 y ancla de F3 (6.a), criterios y valores ilustrativos del índice EAP y su panel (6.b).
- Rendimiento: Alejandro informó fluidez en el MacBook Air con la escena de la 5.a (0,9 millones de triángulos) y con el archivo HTML de la 5.c.a (2,6 a 4,5 millones de cerca). Tras la 6.a (S0): 1,92 millones en la vista general, 3,3 a escala de finca, 4,7 a escala de planta y de suelo y 5,9 en la caña a 70 unidades; 0,89 en modo liviano de cerca. Llamadas de dibujo por cuadro, con sombra, posproceso y capas: 53 a 78 (33 en liviano). Falta la cifra de cuadros por segundo en el MacBook Air: medidor con la tecla R (vista general, finca, planta y suelo, con y sin la tecla V).
- Vista previa: `vista-previa/escenario.html` (archivo único, abre sin servidor) y respaldo en imágenes (`respaldo/`), regenerados al cerrar la 6.a.
- Hito A (recorrido mínimo): completo en lo técnico; falta la prueba manual de Alejandro en videoconferencia (criterio de la etapa 4).
- Hito B (biofísica, etapas 5 a 8): en curso (etapa 6 cerrada; criterios EAP por cotejar).
- Fecha de la prueba oral: por confirmar. La notificación llega por correo con una antelación no inferior a tres días (Guía del Aspirante, literal E); el tema se informa dentro de los tres días siguientes (Res. 356 de 2026, art. 11).
- Plataforma de videoconferencia: por confirmar.
- Decisiones D1 a D7 (`GUION.md`, sección 12): resueltas el 2026-11-04 con las opciones recomendadas; D5 revisada el mismo día («realismo de maqueta»). D4 se redacta con Alejandro en la etapa 1; D7 se registra aquí al recibir la notificación.
- Entorno en la nube: desde el 2026-11-09 este repositorio usa el entorno personal «escenario-territorial» (red limitada con `doi.org`, `revistas.uptc.edu.co` y `www.scielo.org.co`). La revista de Cleves-Leguízamo et al. (2017) responde con una página contra robots y SciELO corta la conexión: las fuentes siguen siendo de sesión local.
- Bloqueos: ninguno. Las etapas con fuentes (cotejo EAP, 7 en adelante) necesitan sesión local.

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

### 2026-11-04 · Etapa 5.a. Vegetación natural y matriz cañera

- Modo continuo: propuesta sin espera de aprobación. Sesión en la nube, sin fuentes. La etapa 5 se divide como prevé `PLAN.md`: 5.a (vegetación natural, matriz cañera, coberturas por escenario con transición y leyenda) y 5.b (mosaico campesino, ciudad y vías).
- Hecho:
  - `src/coberturas/`: `tipos.js` (color, altura de la tesela, densidad de vegetación, forma de la leyenda, clases por zona, orden de asignación y reservas; sin Three.js, lo usa también el validador), `unidades.js`, `asignacion.js`, `teselas.js`, `vegetacion.js`, `geometrias.js`, `metricas.js` y `coberturas.js` (montaje, suscripción a `escenario` y `liviano`, transición e interfaz para la verificación).
  - `contenido/territorio.json`: bloque `coberturas` con nombre y rótulo corto de nueve tipos y la leyenda (título, nota «Proporciones ilustrativas» y escalas en que se ve). `contenido/escenarios.json`: `coberturas` de cada escenario por zona y clase de unidad, y `proporciones_coberturas` (nota y estado borrador).
  - `src/ui/leyenda.js`: leyenda arriba a la derecha, dos columnas en el ancho de la ficha, icono con forma y color propios por tipo; muestra solo los tipos presentes en el escenario y se ve en las escalas vereda, cuenca, territorio y región.
  - Validador: `scripts/lib/revisar-proporciones.mjs` (cada tipo con definición, nombre y rótulo de 18 caracteres como máximo; zonas, clases y tipos admitidos; fracciones entre 0 y 1 con suma no mayor que 1).
  - Verificación: `scripts/lib/revisar-coberturas.mjs` (proporciones y aislamiento por escenario, extensión de la caña en S1, transiciones animadas a S1, S3 y S2, modo liviano, leyenda, llamadas de dibujo y una captura por escenario en `capturas/coberturas-S0.jpg` a `S3.jpg`); huella de coberturas igual en la segunda carga y en el archivo único; la leyenda entra en la comprobación de superposición de las fichas.
- Decisiones:
  - Unidades sobre una rejilla de teselas de 6 unidades alineada con el terreno: parcelas de 5 a 10 por 7 a 9 teselas en el plano y el piedemonte (el retiro de 1,5 en su borde deja ver linderos y caminos), orillas de 36 unidades de largo a cada lado de los cauces (18 en el río Cauca, 15 en el tributario, 11 en las quebradas), celdas de 5 × 5 teselas en el bosque altoandino y el páramo. El límite entre zonas sigue al del color del terreno.
  - Asignación por grupo (zona y clase): cada tipo toma su fracción en un orden fijo. Humedal por cercanía a su ancla; bosque seco por dispersión con distancia mínima decreciente y lejos de los cauces (fracción baja, relictos aislados); ripario por dispersión (orillas fragmentadas en S0, continuas en S3); caña de occidente a oriente con ruido; caña orgánica y silvopastoreo por manchas; pastura al azar. Entre escenarios cambian solo las unidades necesarias.
  - S1: la caña orgánica ocupa parte de la misma extensión de caña de S0 (comprobado), cerca de una cuarta parte, en línea con la ficha de P17 («más del 20 %» en la cuenca baja del Amaime). S2 repite S0 hasta la 5.b. S3: en las parcelas del plano, caña convencional 14 %, caña orgánica 34 %, silvopastoreo 24 %, pastura 4 %, bosque seco 14 % y humedal 10 %; orillas con bosque del 90 al 95 %. Todos los valores son ilustrativos y quedan en borrador.
  - Reservas: ciudad (radio 70), cabeceras (22), ingenio (20) y lote (16) quedan sin cobertura para las etapas 5.b, 7 y 9; F1 (46) muestra silvopastoreo provisional hasta la etapa 6.
  - Transición de 2 s: cada unidad e instancia crece o se hunde con curva suave y retardo propio (inicios repartidos en el 45 % del tiempo); salto máximo de 0,023 por cuadro a 60 cuadros por segundo. Una transición interrumpida parte del estado intermedio. La carga inicial y `#captura=1` aplican el escenario sin transición; por eso las coberturas se montan después de la primera parada.
  - Al terminar una transición, lo oculto queda con color cero y fuera del dibujo: el estado no depende del camino recorrido y coincide con la carga directa. Solo se dibujan las instancias visibles o en transición; el modo liviano dibuja la mitad de ellas, repartida en todo el territorio.
  - Colores: caña convencional amarillo verdoso, caña orgánica verde esmeralda con la misma altura de bloque, pastura color paja, silvopastoreo verde claro con árboles dispersos, bosque seco oliva denso, humedal verde azulado con juncos, ripario verde con guadua, bosque altoandino de copas altas y oscuras, páramo con frailejones. Cada tipo tiene además forma propia en la leyenda.
  - Verificación: el inicio de un vuelo de cámara se detecta por el registro del último vuelo antes y después de la acción (con la escena más pesada, el vuelo podía terminar antes de la consulta); la holgura de la transición de coberturas es el intervalo entre cuadros medido durante ella.
- Criterios de aceptación:
  - En S0 la matriz de caña domina el plano y los relictos se ven aislados: cumplido. Caña en el 84 % del plano; 8 relictos, 6 aislados (60 unidades o más de borde a borde de otro bosque) y ninguno contiguo.
  - El cambio de escenario modifica las coberturas sin cortes: cumplido. Transiciones a S1 (76 elementos), S3 (6.708) y S2 (6.741) con elementos a medio camino en cada cuadro, 2 s declarados (2,4 a 2,5 s medidos con SwiftShader, dentro de un intervalo entre cuadros) y estado final igual a la carga directa.
  - Menos de 200 llamadas de dibujo: cumplido (17). 50 cuadros por segundo: pendiente en el MacBook Air (1,5 con SwiftShader, antes 2,7; 0,9 millones de triángulos, antes 0,5).
- Verificación: correcto. Cero errores de consola y cero solicitudes externas en todas las cargas; 17 llamadas de dibujo; generación de coberturas en 171 ms; archivo único de 900 kB; unos 3 min 15 s en total.
- Pendientes:
  - Etapa 5.b: mosaico campesino de la ladera (café con sombrío, plátano, frutales, huertas), ciudad, cabeceras y vías (los caminos pueden seguir los linderos entre parcelas); proporciones de S2 y S3 con el mosaico; regenerar `respaldo/`.
  - Revisión de Alejandro: proporciones por escenario, rótulos y colores de la leyenda.
  - Etapa 6: reemplazar el silvopastoreo provisional de F1 por la finca (P06: silvopastoril, caña agroecológica, guadual, bosque, frutales y corredores).
  - MacBook Air: cuadros por segundo en la vista general con coberturas, con y sin modo liviano.
  - Pendientes heredados: prueba manual del presentador en videoconferencia, fuente `resumenes` en pantalla, encuadre de P17 y P21, lil-gui en modo autor.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 5.b. Mosaico campesino, ciudad y vías.

### 2026-11-04 · Etapa 5.b. Mosaico campesino, ciudad y vías

- Modo continuo: propuesta sin espera de aprobación. Sesión en la nube, sin fuentes.
- Observación de Alejandro durante la sesión (MacBook Air): la escena se mueve con fluidez; pide más realismo en la vegetación porque los árboles se ven demasiado facetados. Decisión D5 cambiada de «maqueta estilizada» a «realismo de maqueta» (`GUION.md`, sección 12; `PLAN.md`, sección 2.2). La vegetación nueva de la 5.b se construye con especies reconocibles, copas con racimos de hojas, variación de color y niveles de detalle. La etapa 5.c (dirección de arte) queda registrada en `PLAN.md`: el mismo estilo en la vegetación de la 5.a (bosque ripario, guadua, caña, frailejón), viento leve, sombras suaves, oclusión ambiental y desenfoque de miniatura, con el modo liviano y la legibilidad en videoconferencia como límites.
- Hecho:
  - Vías (`src/vias/`): `red.js` (tres categorías y doce tramos de red entre entidades de `territorio.json` y puntos del borde), `trazado.js` (camino de menor costo sobre la rejilla de teselas, vecindad de 16, costo por pendiente al cuadrado, cruce de cauces y áreas que se rodean, reutilización de tramos; suavizado de Chaikin, recorte en la ciudad y las cabeceras, tramos de puente) y `vias.js` (cinta sobre el relieve, línea central discontinua en las troncales, tablero en arco leve con baranda; una malla). Las teselas bajo la calzada quedan fuera de las parcelas.
  - Asentamientos (`src/asentamientos/`): `trama.js` (cuadrícula girada, plaza central con árboles, lotes en el perímetro de cada manzana, torres en el centro de la ciudad) y `asentamientos.js` (placas de calle y andén, edificaciones, tejados a dos aguas y árboles urbanos; tres mallas instanciadas).
  - Mosaico campesino: la ladera tiene parcelas pequeñas (2 a 4 por 2 a 4 teselas) y cuatro tipos nuevos en `tipos.js` (café con sombrío, plátano, frutales, huerta). Teselas de ladera sobre los vértices de la rejilla del terreno y con su misma diagonal, paralelas al relieve. Criterios nuevos de asignación: `cota` (de abajo hacia arriba con ruido) y parámetros de escala y desfase en `manchas`.
  - Especies (`formas.js`, `especies.js`): racimo de hojas (icosaedro con relieve, normales suaves y color por vértice), tallo, hoja plegada en arco que se seca en el borde, fruto, cono, caja y unión con oclusión simulada. Guamo de sombrío, cafeto con cerezas, plátano con racimo y bellota, cítrico con frutos, mango con brotes, era de hortalizas con seis tonos y maíz con espiga, cada uno en nivel «cerca» y «lejos».
  - `instancias.js`: clase genérica de elementos instanciados (transición, modo liviano y dos niveles de detalle por celdas de 60 unidades). La vegetación de la 5.a (`vegetacion.js`) usa el mismo módulo. `detalle.js` mide la distancia de cada celda a la cámara antes de dibujar las teselas (primeras en el orden de dibujo). `mosaico.js` genera los puestos: hileras en curva de nivel, tresbolillo, eras alineadas y maíz por ciclos de hileras, guamo y plátano dispersos en el café. `rejilla.js` comparte la rejilla de teselas y las distancias a los cauces entre coberturas y vías.
  - Contenido: proporciones de la ladera por escenario y nota de `proporciones_coberturas` (`escenarios.json`); nombres y rótulos de los cuatro tipos (`territorio.json`). Leyenda con forma propia para cada tipo nuevo.
  - Verificación: `scripts/lib/revisar-paisaje.mjs` (ladera por escenario, diversificación de S2 y S3, niveles de detalle en la vista general, a escala de finca y de planta, modo liviano de cerca, llamadas de dibujo por vista, vías y asentamientos, capturas `mosaico-cerca.jpg` y `ciudad.jpg`); tiempos de generación por parte; la huella de determinismo incluye vías y asentamientos.
  - `PLAN.md`: etapa 5.c.
- Decisiones:
  - Ladera (valores ilustrativos, borrador): S0 y S1 con pastura 0,40, café 0,30, plátano 0,10, frutales 0,06 y huerta 0,04 en las parcelas; S2 con pastura 0,24, café 0,30, plátano 0,12, frutales 0,12 y huerta 0,12 (las familias en red diversifican); S3 con pastura 0,06, silvopastoreo 0,10, café 0,34, plátano 0,12, frutales 0,18 y huerta 0,14. Orillas de ladera con ripario 0,45 en S0 a S2 y 0,95 en S3. El café y el plátano ocupan la franja baja de la ladera; las huertas, puntos dispersos; los frutales, manchas.
  - S2 conserva la matriz del plano de S0: la territorialización en red se ve en la ladera y, en etapas posteriores, en mercados y vínculos.
  - Umbrales de detalle (distancia de la cámara a la celda): guamo 480; cítrico y mango 420; plátano 400; eras y maíz 220; cafeto 200. A escala de finca (cámara a 450) solo la parte cercana del encuadre pasa a detalle; a escala de cuenca, territorio y región todo queda simple. El modo liviano fuerza el nivel simple.
  - Las nueve cabeceras se dibujan en todos los escenarios; CAB8 y CAB9 existen como pueblos y lo que se suma en S2 es su mercado. Las vías y los asentamientos no cambian con el escenario.
  - Árboles urbanos en el nivel simple del guamo (pequeños en pantalla). La vegetación de la 5.a conserva su estilo hasta la 5.c.
- Criterios de aceptación (etapa 5 completa):
  - En S0 la matriz de caña domina el plano y los relictos se ven aislados: cumplido (caña en el 84 % del plano; 6 de 8 relictos aislados, ninguno contiguo).
  - El cambio de escenario modifica las coberturas sin cortes: cumplido (transiciones a S1, S3 y S2 con 76, 15.357 y 10.339 elementos, todos a medio camino en algún cuadro; estado final igual a la carga directa; salto máximo de 0,023 por cuadro a 60 cuadros por segundo). La fluidez se juzga en el equipo.
  - Menos de 200 llamadas de dibujo: cumplido (36 en la vista general, 44 a 48 de cerca, 23 en liviano). 50 cuadros por segundo: pendiente de medir en el MacBook Air con la escena de la 5.b.
- Verificación: correcto. Cero errores de consola y cero solicitudes externas en todas las cargas; generación de coberturas y vías en unos 500 ms; archivo único de 928 kB; unos 6 min en total. Con la escena de la 5.b, SwiftShader tarda hasta 2 s por cuadro con sombras: una transición de coberturas alcanzó a pasar sin cuadro intermedio y un vuelo midió más de 3 s. Corrección: las transiciones de escenario y los vuelos de cámara se miden en modo liviano (la prueba revisa la animación, no el rendimiento), y la holgura de los vuelos es el intervalo máximo entre cuadros medido durante el vuelo, como ya se hacía con las coberturas.
- Pendientes:
  - Etapa 5.c: dirección de arte (ver `PLAN.md`).
  - MacBook Air: cuadros por segundo en la vista general, a escala de finca en la ladera (P04, P23) y a escala de planta, con y sin modo liviano. Si no alcanza, bajar los umbrales de detalle en `especies.js`.
  - Revisión de Alejandro: proporciones de la ladera, rótulos y colores nuevos de la leyenda, red vial (`src/vias/red.js`), trama de la ciudad y las cabeceras.
  - Etapa 6: reemplazar el silvopastoreo provisional de F1 por la finca; las vías veredales ya llegan a F2 y F3.
  - Pendientes heredados: prueba manual del presentador en videoconferencia, fuente `resumenes` en pantalla, encuadre de P17 y P21, lil-gui en modo autor.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 5.c. Dirección de arte.

### 2026-11-04 · Ajuste del plan: caña en la etapa 5.c

- Observación de Alejandro sobre la vista general: la caña se ve como bloques planos escalonados.
- Hecho: `PLAN.md`, etapa 5.c. La caña pasa a tener tallos instanciados con hojas cerca de la cámara (generados por celda), superficie con surcos y altura irregular a distancia, lotes de tres edades (recién cortado, en crecimiento, maduro) fijos por lote, y bordes de lote con tallos visibles. Dos criterios de aceptación nuevos y el modo liviano retira también los tallos cercanos. Tamaño de la etapa: grande, con división prevista (vegetación y caña; luz y posproceso).
- Siguiente: Etapa 5.c. Dirección de arte.

### 2026-11-04 · Etapa 3.b. Modo libre ampliado

- Modo continuo. Pedido de Alejandro al abrir la sesión: doble clic para volar a un punto del relieve, flechas o WASD para avanzar sobre el paisaje, la cámara nunca bajo el relieve ni fuera de la maqueta, movimientos suaves. Se registró como etapa 3.b en `PLAN.md` (amplía la navegación de la etapa 3) y se ejecutó antes de la 5.c, que sigue como etapa siguiente. Sesión en la nube, sin fuentes.
- Verificación inicial (`npm run verificar`): correcta.
- Hecho:
  - `src/navegacion/libre.js`: doble clic sobre el lienzo (solo en modo libre) que pide al estado un vuelo con `punto` en lugar de `ancla`; marcha con flechas y WASD (Mayús triplica la rapidez) con aceleración y frenado exponenciales, rapidez proporcional a la distancia al objetivo, objetivo que sigue la altura del relieve y frenado progresivo junto al borde; altura mínima de la cámara en cada cuadro del modo libre.
  - `src/navegacion/limites.js`: punto del relieve o del agua bajo un rayo (marcha y bisección sobre `superficie`, recortada a la caja de la maqueta), relieve vecino (máximo en un círculo de 12 unidades), corrección de altura y límite del objetivo.
  - `camara.js`: el bloque de cámara admite `punto { x, y, z }`. `escena.js`: funciones por cuadro, después de los controles y antes del dibujo (una que falla se registra y sale). `teclado.js`: en modo libre deja flechas y WASD a `libre.js`. `foco.js`: en modo libre la botonera toma el objetivo actual. `main.js`: monta el modo libre y amplía `window.escenario` para la verificación.
  - Verificación: `scripts/lib/revisar-libre.mjs` (en la página del recorrido) y vuelo por doble clic en la medición de transiciones; sección «Modo libre» en el informe y captura `libre.jpg`.
  - `PLAN.md`: tabla de teclas y párrafo del modo libre (sección 3.4), mención en la 3.6 y etapa 3.b.
- Decisiones:
  - Doble clic: conserva el azimut, reduce la distancia a la mitad (mínimo 90), limita la elevación entre 20 y 70 grados y dura de 1,5 a 2,5 s según el desplazamiento. Un tercer clic seguido cuenta como clic triple y no vuela: para acercar otra vez basta un doble clic nuevo tras una pausa breve.
  - Marcha: 0,35 de la distancia al objetivo por segundo, entre 25 y 400 unidades por segundo; respuesta de 6 por segundo. Junto al borde, la componente hacia afuera frena en la distancia de medio segundo de marcha.
  - Cámara sobre el relieve vecino: margen de 14 unidades o 4 % de la distancia (mayor que el plano cercano de 10), alcanzado con suavidad; piso de 6 que nunca se cruza. Se aplica en cada cuadro del modo libre, también durante la órbita y el vuelo; el recorrido conserva su regla propia y las paradas no cambian.
  - Teclas: en modo libre, ← y → mueven la cámara (Av Pág, Re Pág y espacio siguen avanzando el recorrido, igual que el presentador inalámbrico); A mueve a la izquierda, y la tecla A muestra las anclas solo fuera del modo libre. Sin arrastre lateral con el ratón: el criterio «sin desplazamiento» de la verificación se refiere al arrastre.
- Criterios de aceptación:
  - Doble clic: cumplido. Vuela al punto señalado (error de 1,1 unidades; distancias 2500 → 1250 → 625 con dos dobles clics); vuelo medido de 1,64 s para 1,6 declarados; sin efecto en el recorrido ni sobre el fondo fuera de la maqueta.
  - Flechas y WASD: cumplido. W avanza 328 unidades en la dirección de la vista y → 219 a la derecha, sin cambiar de parada; las flechas del recorrido siguen correctas en ambos sentidos.
  - Cámara sobre el relieve y objetivo dentro de la maqueta: cumplido. Con Mayús + A durante 30 s el objetivo llega al borde (holgura 0) sin salir; una cámara hundida 43 unidades sube al piso en el primer cuadro y al margen de 14 en un segundo.
  - Movimientos sin saltos: cumplido. El primer cuadro de la marcha es el 26 % del paso mayor y ningún cuadro cambia más que eso; la llegada al borde también (27 %); la marcha se detiene al soltar. A distancia 225 sobre la ladera, la altura de la cámara cambia como máximo 0,2 unidades de un cuadro al siguiente.
  - Tecla O: cumplido (vuelve a la cámara de la parada con desvío menor de 0,5).
  - Pendiente: prueba manual de Alejandro en el MacBook Air.
- Verificación: correcta. Cero errores de consola y cero solicitudes externas; unos 6 min. La primera corrida falló por la prueba nueva: el hash ya era `#p=P01` y reescribirlo no dispara `hashchange`, de modo que la cámara seguía en F1 y no había fondo para el doble clic fuera de la maqueta. Corrección: la revisión vuelve a P01 con `irA`. Vista previa regenerada (`vista-previa/escenario.html`, 933 kB); el respaldo en imágenes no cambia, porque las paradas son las mismas.
- Pendientes:
  - Prueba de Alejandro en el MacBook Air: rapidez de la marcha, sensación del doble clic y altura mínima de la cámara. Los valores están en `MARCHA`, `VUELO` (`libre.js`) y `MARGEN` (`limites.js`).
  - Posibles mejoras fuera de alcance: arrastre lateral con el ratón, gestos táctiles y un marcador breve en el punto de destino.
  - Pendientes heredados de la 5.b.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 5.c. Dirección de arte.

### 2026-11-04 · Etapa 5.c.a. Vegetación y caña

- Modo continuo: propuesta sin espera de aprobación. Sesión en la nube, sin fuentes. Verificación inicial correcta.
- División: la 5.c se dividió según su propia previsión en `PLAN.md`: 5.c.a (vegetación y caña, esta sesión) y 5.c.b (viento, sombras suaves, oclusión ambiental, desenfoque de miniatura, legibilidad y medición en el MacBook Air). La 5.c.b quedó escrita en `PLAN.md`.
- Hecho:
  - `src/coberturas/arboles.js`: especies de la vegetación natural, de la pastura y del silvopastoreo con niveles «cerca» y «lejos», escala, proporción de copa, tintes y umbral de detalle propios: samán (pastura y silvopastoreo), árbol de bosque seco (con follaje amarillento en parte de los individuos), ceiba emergente con aletones, árbol ribereño, guadua (culmos en arco con follaje en la mitad alta), árbol altoandino, helecho arbóreo, frailejón (falda de hojas secas, roseta plateada e inflorescencias) y junco con enea. Al final, las matas de caña del nivel cercano.
  - `vegetacion.js`: una clase instanciada por especie con densidad por tipo en `tipos.js` (reemplaza la copa facetada única y `geometrias.js`, retirado). Las especies de la 5.a pasan por `instancias.js` con dos niveles de detalle, como las de la 5.b. `instancias.js` admite `sombra: 'cerca'` (en los rodales densos de bosque seco, ribereño, guadua y bosque altoandino solo proyecta sombra el nivel cercano).
  - Silvopastoreo: setos de leucaena en hileras (`mosaico.js`, `especies.js`) además de los samanes dispersos.
  - Caña: edad por lote (`asignarCana` en `asignacion.js`, orden aleatorio estable con las fracciones de `escenarios.json`, `edades_cana`) y rumbo de las hileras (lado mayor del lote, perpendicular en el 30 % de los lotes, desvío de ±6°). `teselas.js`: altura del bloque según la edad (0,3, 1,55 y 2,7), color por edad y manejo, tapa subdividida e irregular (`factorCana`), atributos `marca` y `cana` para el sombreador y lectura del estado por lote. `superficie.js`: sombreador de la tapa (hileras y entresurcos con relieve en la luz, rastrojo y suelo en el lote recién cortado, follaje, espigas en la caña madura) y de las caras del borde (tallos con nudos, franja de hojas, pie en sombra), con atenuación según los píxeles por periodo.
  - `cana.js`: matas de caña cercanas (dosel sobre las hileras, tallos con hojas frente a la cara del borde y espigas en la caña madura) en las celdas de caña a menos de 460 unidades de la cámara y dentro del encuadre; se generan al acercarse con semilla por celda, se guardan y llenan un cupo (12.000 de dosel, 6.000 de borde, 4.000 espigas) desde la celda más cercana. Siguen la altura, el peso de caña y el color de su lote durante las transiciones; el lote recién cortado no lleva matas; el modo liviano las retira.
  - `formas.js`: tallo curvo en tramos (`arco`). Contenido: bloque `edades_cana` en `escenarios.json` (nota y fracciones, borrador) y su revisión en `revisar-proporciones.mjs`.
  - Verificación: `scripts/lib/revisar-vegetacion.mjs` (materiales sin facetas, lotes por edad en S0, S1 y S3, alturas del bloque, matas de caña en la vista general, a escala de finca y de planta y en modo liviano, capturas `cana-cerca.jpg` y `vegetacion-ribera.jpg`) y sección «Vegetación y caña» en el informe.
- Decisiones:
  - Edades (valores ilustrativos, borrador): recién cortado 0,20, en crecimiento 0,35 y maduro 0,45 de los lotes. La caña orgánica conserva la edad del lote; colores por edad para cada manejo (pajizo, verde claro y el color de la leyenda).
  - Surcos exagerados como en una maqueta: hileras cada 4 unidades, visibles en la vista general; cada dibujo del sombreador se atenúa a su promedio cuando su periodo baja de unos 2 píxeles (sin parpadeo).
  - Tallos de borde en dos niveles: en el nivel simple, la cara del bloque dibuja los tallos (sin geometría); cerca de la cámara, matas instanciadas frente a esa cara. Un lote recién cortado deja ver la cara de tallos del lote vecino.
  - Umbrales de detalle de la vegetación ajustados a la maqueta de 1200 × 900 unidades: samán 260, ceiba 300, bosque seco, ribereño, guadua y altoandino 220, helecho y frailejón 200, leucaena 200, junco 150. Con los primeros valores (450 a 600) la escala de planta llegaba a 7,5 millones de triángulos.
- Criterios de aceptación (5.c.a):
  - Ningún árbol facetado a escala de finca o vereda: cumplido (ningún material facetado en la vegetación; las copas lejanas son racimos con normales suaves).
  - Caña sin bloques planos: cumplido (surcos y tapa irregular en la vista general; matas con hojas a escala de finca y de planta; tallos en las caras del borde y matas de borde cercanas).
  - Tres edades distinguibles y fijas por lote: cumplido (alturas 0,3, 1,55 y 2,7 con color propio; en S0, 59 lotes recién cortados, 107 en crecimiento y 149 maduros; S1 conserva los mismos números por edad). S1 conserva la extensión de la caña de S0 y las transiciones terminan iguales a la carga directa.
  - Modo liviano: retira las matas cercanas y reduce instancias (cumplido); oclusión, desenfoque, viento y sombras suaves pasan a la 5.c.b.
- Verificación: correcta. Cero errores de consola y cero solicitudes externas; huella de coberturas igual en la segunda carga y en el archivo único (950 kB); ningún material facetado. Llamadas de dibujo: 40 en la vista general, 45 a escala de finca, 66 a escala de planta y en la vista de la caña de cerca, 28 en liviano. Triángulos: 1,87 millones en la vista general (antes 1,54), 2,6 a escala de finca, 3,7 a escala de planta, 4,5 en la caña de cerca (lote a 70 unidades), 0,87 en liviano de cerca. Matas de caña: 7.646 de dosel y 6.000 de borde (cupo) a escala de finca; 3.172 y 2.151 a escala de planta; ninguna en la vista general ni en liviano. Transiciones a S1, S3 y S2 con elementos a medio camino y final igual a la carga directa. Vista previa y respaldo en imágenes (34 de 34) regenerados.
- Pendientes:
  - Etapa 5.c.b: luz y posproceso (ver `PLAN.md`).
  - MacBook Air: cuadros por segundo con la escena de la 5.c.a en la vista general y a escala de finca, planta y suelo, con y sin modo liviano. Si no alcanza: umbrales en `arboles.js` y `especies.js`, cupo en `cana.js`.
  - Revisión de Alejandro: especies y colores de la vegetación, fracciones de edad de la caña, aspecto de las espigas y de los surcos.
  - Etapa 7: el lote de la escala de planta queda junto a lotes de caña de edad aleatoria; si la parada necesita caña madura al lado del lote, fijar la edad de esos lotes.
  - Pendientes heredados de la 5.b y la 3.b.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 5.c.b. Luz y posproceso.

### 2026-11-04 · Ajuste del plan: caña solo con hojas

- Observación de Alejandro sobre la 5.c.a, con dos capturas y un esquema de referencia: las espigas de la caña madura parecen mazorcas y el lote se lee como un monocultivo de maíz; la tapa del bloque sigue viéndose como una mesa verde lisa con un borde lineal. Pide que la caña se vea solo con sus hojas, fácil de reconocer como caña y distinta del maíz (sin mazorca ni flores). Las edades quedan a criterio: se conservan por altura y color, sin espigas, hasta su revisión.
- Rendimiento: el archivo HTML descargado corre con fluidez en su computadora, sin trabas.
- Hecho: `PLAN.md`, etapa 5.c.b reescrita («Caña con hojas y luz de diorama»): la caña va primero (sin espigas, mata de tallos con nudos y hojas en arco según la referencia, tapa bajo el dosel, bordes con hojas que caen sobre la cara de tallos, textura de hojas a distancia) y la luz y el posproceso después, con división en 5.c.c si no alcanza. Dos criterios nuevos de aceptación. Esquema de referencia guardado en `referencias/cana-mata.webp`.
- Nota: una de las capturas muestra árboles facetados; parece de una versión anterior a la 5.c.a (la vista previa actual ya no los tiene).
- Siguiente: Etapa 5.c.b. Caña con hojas y luz de diorama.

### 2026-11-04 · Etapa 5.c.b. Caña con hojas

- Modo continuo: propuesta anotada en la respuesta, sin espera de aprobación. Sesión en la nube, sin fuentes. Verificación inicial correcta.
- División: la 5.c.b se dividió según su propia previsión en `PLAN.md`: 5.c.b (caña, esta sesión) y 5.c.c (luz de diorama y posproceso: viento, sombras suaves, oclusión ambiental, desenfoque de miniatura, legibilidad y medición en el MacBook Air). La 5.c.c quedó escrita en `PLAN.md`.
- Hecho:
  - `src/coberturas/mata.js` (nuevo): mata de caña según la referencia `referencias/cana-mata.webp`. Siete tallos rectos y algo inclinados (tres en el nivel lejano) con color propio de verde amarillento a morado; cuatro hojas por tallo desde el tercio superior (una erguida y tres en arco con la punta caída y algo amarilla); tres hojas secas en la base. Sin espiga, flor ni mazorca. 430 triángulos en el nivel cercano y 66 en el lejano. Reemplaza `matasCana` de `arboles.js` (dosel, borde y espiga de la 5.c.a).
  - `cana.js`: la misma mata para el dosel y el borde, en dos niveles: detallado en las celdas a menos de 130 unidades (cupo 4.500) y sencillo hasta 460 (cupo 26.000). Dosel en surco doble (dos líneas a ±0,6 de cada cresta, matas alternadas cada 1,7). Borde por dentro de la cara del lote. Material propio: el color del lote tiñe solo las hojas; los tallos conservan su color y llevan los nudos dibujados en el sombreador (anillo oscuro con un borde claro encima). Radio cubierto: distancia de la primera celda que el cupo deja incompleta (460 si todas tienen matas, 0 en la vista general y en liviano).
  - `superficie.js` y `teselas.js`: dentro del radio cubierto (uniforme `uCercaCana`, con un margen de 10 a 60 unidades), la tapa y las caras del lote bajan hasta la lámina (atributo `bajo`) y la tapa queda en sombra entre los tallos. Fuera del radio, la tapa muestra hileras y trazos de hojas sin las manchas claras de espiga, algo más oscura para empalmar con las matas; altura de la tapa más irregular (`factorCana`, ondas 0,12 y grumos 0,07).
  - `tipos.js`: cinco tonos de tallo y el color de las hojas secas; se retira el color de espiga.
  - Verificación: `revisar-vegetacion.mjs` cuenta dosel, borde y matas detalladas, informa el radio de la tapa hundida, falla si aparece una forma de espiga y agrega la vista y la captura `cana-suelo.jpg` (escala de suelo).
- Decisiones:
  - Tapa hundida hasta la lámina bajo las matas cercanas (primero se probó un dosel de hojas sobre la tapa bajada al 60 % y al 15 %: la tapa seguía leyéndose como mesa o plataforma). De cerca, el lote es suelo en sombra con matas enteras y se ven los tallos entre hileras; a distancia sigue el bloque con su altura.
  - Surco doble: la separación de 4 unidades entre surcos (exagerada para la vista general) dejaba entresurcos anchos de cerca. Dos líneas por surco cierran el dosel sin cambiar el periodo del dibujo lejano.
  - Nudos en el sombreador: cada tallo es un solo tramo y la mata detallada baja de 584 a 430 triángulos.
  - Sombras: el material de profundidad de las teselas no hunde la tapa; la tapa hundida queda bajo la sombra del bloque, lo que refuerza la sombra entre los tallos. Se revisa en la 5.c.c.
  - Edades: se conservan las tres por altura y color, sin espigas, hasta la revisión de Alejandro.
- Criterios de aceptación (5.c.b):
  - Caña reconocible a escala de suelo, planta y finca, sin espiga, flor ni mazorca y distinta del maíz: cumplido (mata de tallos con nudos y hojas en arco; formas cercanas `cana-cerca-cerca` y `cana-cerca-lejos`; capturas `cana-suelo.jpg` y `cana-cerca.jpg`).
  - Ningún plano verde liso ni línea recta de borde a la vista: cumplido dentro del radio con matas (tapa hundida y en sombra, matas de borde con hojas sobre el lindero). Más allá de 460 unidades el bloque conserva su silueta recta, con hileras, textura de hojas y altura irregular sin manchas claras; a esa distancia el borde ocupa pocos píxeles.
  - S1 conserva la extensión de la caña de S0 y cada transición termina igual a la carga directa: cumplido.
  - Modo liviano: retira las matas cercanas y la tapa hundida (cumplido); oclusión, desenfoque, viento y sombras suaves pasan a la 5.c.c, con la legibilidad y los cuadros por segundo.
- Verificación: correcta. Cero errores de consola y cero solicitudes externas; huella de coberturas igual en la segunda carga y en el archivo único (952 kB); ningún material facetado. Llamadas de dibujo: 40 en la vista general, 43 a escala de finca, 65 a escala de planta y en la caña a 70 unidades, 63 a escala de suelo, 28 en liviano. Triángulos: 1,87 millones en la vista general (sin cambio), 3,09 a escala de finca (antes 2,6), 4,65 a escala de planta (antes 3,7), 4,78 a escala de suelo, 5,94 en la caña a 70 unidades (antes 4,5), 0,87 en liviano. Matas de caña: 13.898 de dosel y 4.543 de borde a escala de finca; 5.525 y 1.595 a escala de planta (2.026 detalladas); ninguna en la vista general ni en liviano. Tapa hundida hasta 460 unidades a escala de finca, planta y suelo. Vista previa y respaldo en imágenes (34 de 34) regenerados.
- Pendientes:
  - Etapa 5.c.c: luz y posproceso (ver `PLAN.md`).
  - MacBook Air: cuadros por segundo con la escena de la 5.c.b en la vista general y a escala de finca, planta y suelo, con y sin modo liviano. Si no alcanza: umbral del nivel detallado y cupos en `cana.js`, umbrales en `arboles.js` y `especies.js`.
  - Revisión de Alejandro: aspecto de la mata (hojas, tallos, nudos), surco doble, oscuridad de la tapa bajo las matas, empalme entre la caña cercana y el bloque a unas 460 unidades, y si las tres edades aportan.
  - Etapa 7: el lote de la escala de planta queda junto a lotes de caña de edad aleatoria; si la parada necesita caña madura al lado del lote, fijar la edad de esos lotes.
  - Pendientes heredados de la 5.b y la 3.b.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 5.c.c. Luz de diorama y posproceso.

### 2026-11-05 · Etapa 5.c.c. Luz de diorama y posproceso

- Modo continuo: propuesta anotada en la respuesta, sin espera de aprobación. Sesión en la nube, sin fuentes. Verificación inicial correcta.
- Hecho:
  - `src/escena/viento.js` (nuevo): vaivén en el sombreador de vértices (después de la matriz de la instancia, en coordenadas de la maqueta), proporcional al cuadrado de la altura relativa de la forma y a la escala de la instancia, con una onda que recorre el plano y ráfagas lentas. `conViento` encadena el `onBeforeCompile` previo; alto y amplitud van en uniformes propios (un programa por tipo de material). Copas y hojas de `instancias.js` (1,2 % del alto en la punta; la cama de la huerta queda quieta) y matas de caña de `cana.js` (4,5 %; los tallos se mueven un 30 % de las hojas). Reloj quieto con `#captura=1` y en el navegador automatizado; fuerza 0 en el modo liviano.
  - `src/escena/posproceso.js` y `sombreadores.js` (nuevos): la escena se dibuja en un destino con MSAA 4 (color sRGB de 8 bits) y textura de profundidad. Oclusión ambiental desde esa profundidad, a media resolución y sin un segundo dibujo de la escena: normal reconstruida con los vecinos, 12 muestras en espiral con radio del 2,2 % del alto de la imagen (entre 0,4 y 8 unidades), rotación fija por píxel (patrón de Bayer de 4×4) y suavizado de 4×4 que respeta los saltos de profundidad. Composición y desenfoque de miniatura en dos pasadas separables (banda nítida de ±15 % del alto; radio máximo del 0,65 % del alto); la última escribe en sRGB. Sin oclusión ni miniatura, o en modo liviano, dibujo directo como antes.
  - `escena.js`: sol algo cálido (0xfff4e2, 2,05) y cielo algo frío; sombra PCF con radio 3 e intensidad 0,85; cifras de dibujo de todas las pasadas del cuadro (`info.autoReset` desactivado); `luz()` y `fijarViento(t)` para la verificación.
  - Estado y teclas: claves `miniatura` (tecla M) y `medidor` (tecla R). `parametros.js`: `#ao` y `#mini` (0 a 2) y `#viento` (0 a 3); 0 apaga, 1 por defecto. Vista del presentador: botón «Miniatura» y tecla M, sincronizados por el canal.
  - `src/ui/medidor.js` (nuevo, tecla R): cuadros por segundo (de cada segundo y media de cinco), duración media y peor del cuadro, llamadas, triángulos, relación de píxeles y efectos activos. Fuera de la interfaz: sigue visible con la tecla H.
  - Legibilidad: el rótulo «Esquema sin escala» va sobre un panel (era el único texto directo sobre la escena).
  - Verificación: `scripts/lib/revisar-luz.mjs` (nuevo), en una carga de 1920×1080: efectos por vista y llamadas de dibujo, captura igual tras seis cuadros más, viento visible con el reloj en 1,3 s y de vuelta en 0, tecla M, modo liviano (sin oclusión, miniatura, viento, sombra ni matas; al salir, captura igual a la referencia), textos de la interfaz en P01, P13 y P14 paso 2 (tamaño, contraste en el peor caso detrás del panel, fondo propio, filtros). Captura `luz-finca.jpg`. `revisar-presentador.mjs`: botón «Miniatura» y tecla M.
- Decisiones:
  - Oclusión desde la profundidad del dibujo principal: el `GTAOPass` de Three.js r186 falla con una profundidad externa (usa `normalRenderTarget`, que no existe en ese caso) y sin ella dibuja la escena otra vez con un material sustituto que ignora la tapa hundida y el viento. El sombreador propio evita el segundo dibujo (1,9 a 5,9 millones de triángulos).
  - Sombra: `PCFSoftShadowMap` está retirado en r186; el PCF actual usa `shadow.radius` con muestreo de Vogel. Mapa de 2048 (sin cambio); la intensidad 0,85 deja ver el color bajo la sombra.
  - Viento sin movimiento en la sombra proyectada (amplitud de 0,2 unidades en la copa de un árbol de 15).
  - Miniatura activa por defecto y suave; la tecla M y el presentador la apagan durante la clase si estorba.
  - Excepción de legibilidad: la marca «Borrador» de las fichas (0,7 rem, 16,8 px a 1920×1080) queda bajo 24 px; desaparece al marcar las fichas como `revisado`.
- Criterios de aceptación (5.c.c):
  - Modo liviano sin oclusión, desenfoque, viento, sombras ni matas de caña: cumplido.
  - Texto legible a 1920×1080 sin desenfoque sobre la interfaz: cumplido (118 textos de la interfaz en tres paradas con letra de 24 px o más y contraste mínimo de 6,48 en el peor caso; ningún texto directo sobre la escena; ningún filtro sobre la interfaz; el posproceso solo actúa sobre el lienzo). Excepción: la marca «Borrador».
  - 50 cuadros por segundo en el MacBook Air: pendiente de la medición de Alejandro con la tecla R. Menos de 200 llamadas de dibujo: cumplido (44 en la vista general, 47 a escala de finca, 69 a escala de planta, 67 a escala de suelo; 28 en liviano).
  - Escena idéntica en cada carga: cumplido (captura de la vista general igual en dos cargas, captura a escala de finca igual tras seis cuadros más y al salir del modo liviano; respaldo generado cuatro veces: 28 de 34 imágenes iguales byte a byte en las cuatro). Observaciones: en P17 a P21 cambian 26 píxeles (5 niveles como máximo) bajo el panel translúcido del botón «3 Finca», y alternan entre dos estados de una generación a otra; P03-3 cambió en la primera generación y quedó igual en las tres siguientes. Fuera de esos píxeles, la escena visible es idéntica.
- Verificación: correcta. Cero errores de consola y cero solicitudes externas; huellas de terreno y coberturas iguales en la segunda carga y en el archivo único (963 kB). Avisos «GPU stall due to ReadPixels» en la vista compilada, como en el informe anterior (del navegador sin pantalla). Cuadros por segundo con render por software: 0,8 a 0,9 con y sin posproceso (el posproceso cuesta cerca de un 10 % en ese render; referencia, no equivale al equipo de la prueba). Vista previa y respaldo en imágenes (34 de 34) regenerados.
- Pendientes:
  - MacBook Air: con la tecla R, cuadros por segundo en la vista general y a escala de finca, planta y suelo, con y sin la tecla V. Si no alcanza 50: probar `#ao=0` o `#mini=0` (cada uno quita sus pasadas), bajar `RELACION_PIXELES_MAX` de `escena.js` a 1,5 con el posproceso, o los umbrales de detalle y cupos de la 5.c.b.
  - Revisión de Alejandro: intensidad de la oclusión (`FUERZA_OCLUSION`), banda y radio de la miniatura (`MINIATURA` en `posproceso.js`), amplitud del viento (`VAIVEN` en `instancias.js` y `cana.js`), tono del sol y suavidad de la sombra (`SOMBRA` en `escena.js`).
  - Respaldo: revisar si los 26 píxeles que alternan bajo el botón «3 Finca» en P17 a P21 (y el cambio de P03-3 en la primera generación) vienen de la escena o del compositor (sin efecto visible).
  - Etapa 7: el lote de la escala de planta queda junto a lotes de caña de edad aleatoria; si la parada necesita caña madura al lado del lote, fijar la edad de esos lotes.
  - Pendientes heredados de la 5.c.b, la 5.b y la 3.b.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 6. Fincas y Estructura Agroecológica Principal (requiere fuentes).

### 2026-11-05 · Etapa 6.a. Fincas tipo, lindero, conectores y EEP

- Modo continuo: propuesta anotada en la respuesta, sin espera de aprobación. Sesión en la nube, sin fuentes. Verificación inicial correcta.
- División: la etapa 6 pide fuentes solo para el panel EAP (nombres y grupos de los diez criterios, León-Sicard 2021, cap. 3; Cleves-Leguízamo et al. 2017). Se dividió en 6.a (todo lo demás, sin fuentes nuevas) y 6.b (panel EAP, sesión local). Registrado en `PLAN.md`.
- Hecho:
  - `contenido/fincas.json` (nuevo, validado por `scripts/lib/revisar-fincas-contenido.mjs`): receta de cada finca (tamaño en teselas, rumbo de las franjas, casa, familia, lotes con uso, rótulo, área o peso, ubicación y divisiones, fracción de cercas vivas internas y del lindero, proporciones con fuente o ilustrativas) y rótulos de las capas. F1 con las áreas de Calle et al. (2022, §11.1): guadual 26 ha, bosque 14, frutales 5, silvopastoreo 140 en cuatro potreros, caña agroecológica 100 en dos lotes y corredores 2 ha como cercas vivas internas.
  - Generador (`src/fincas/region.js`, `lotes.js`, `trazado.js`, sin Three.js): región desde el ancla dentro del rectángulo de la receta, con esquinas recortadas por semilla, sin cruzar cauces (las vías la atraviesan); solar de la casa junto a una vía; lotes «cauce» desde la orilla, lotes «casa» desde el solar y el resto en franjas cortadas en el cambio de columna (linderos rectos); piezas sueltas unidas al lote vecino. Bordes del lindero y entre lotes, y cercas vivas elegidas por tramo recto o por par de lotes. Resultado: F1 163 teselas en 9 lotes, F2 48 en 5, F3 98 en 7, F4 212 en 4.
  - Coberturas: clase `lotes` con uso fijo en todos los escenarios (`unidades.js`; fuera de la asignación por proporciones y de las métricas del plano); F1 deja de ser reserva provisional. Cercas vivas de leucaena con un guamo cada tres plantas en el mosaico (`cercas.js`). Leyenda con los usos de las fincas (`tiposPresentes`).
  - Superposición (`escena.js`): una segunda escena dibujada después del posproceso, sin prueba de profundidad, para los trazos de las capas; `src/escena/lineas.js` dibuja segmentos sobre el relieve con ancho en píxeles y halo oscuro (LineSegments2).
  - `src/fincas/fincas.js`, `casa.js`, `estilo.js`: casa (vivienda o bodega) y familia de cuatro peones genéricos sin rasgos (GUION, precaución 7); lindero físico (2,2 px, con profundidad); trazos de conectores internos (ámbar) y externos (rosa), de la finca del punto de interés a escala de finca o menor y de todas desde la vereda; resaltado del agroecosistema menor (lote mayor del uso `lote_menor`, amarillo) y mayor (lindero, blanco).
  - `src/coberturas/eep.js`: contorno de la EEP del escenario (bosque ripario y guadual, bosque seco, humedal, bosque altoandino, páramo y agua) y conexión de cada finca: tramos del lindero cubiertos por dentro (lote de la EEP o cerca viva) con la EEP afuera.
  - Interfaz: columna derecha con la leyenda de coberturas, la leyenda de capas y el panel de usos de la finca (números, icono de la cobertura, área con fuente o «Proporciones ilustrativas»); marcadores numerados sobre los lotes y rótulos del resaltado sobre el punto más alto de su contorno (`src/ui/capas.js`, `capas.css`, `src/fincas/rotulos.js`).
  - Clic: además del ancla, el punto del relieve bajo el puntero dentro del lindero de una finca (`seleccion.js`).
  - Paradas: P04 con los pasos «Agroecosistema menor» y «Agroecosistema mayor»; P05 con «Conectores internos», «Conectores externos» y «Conexión con la EEP». Capas nuevas en `territorio.json`: `agroecosistema_menor`, `agroecosistema_mayor`, `conectores_internos` y `conectores_externos` (la capa `agroecosistema_menor_mayor` se retiró). Cámara más cerca en P04 (320), P05 (330) y P06 (340).
  - Verificación: `scripts/lib/revisar-fincas.mjs` (nuevo, en su propia carga): fracciones de F1 frente a sus áreas, distinción por composición y conectores, tamaño en pantalla a escala de finca, píxeles del color de cada conector en la vista de vereda con y sin la capa, pasos de P04 y P05, conexión con la EEP, clic dentro del lindero de F4 y capturas `fincas-finca.jpg` (las cuatro fincas) y `fincas-matriz.jpg` (vereda desde F1 y F3, con y sin la EEP). Textos a 1920×1080 también en P04 paso 2 y P06; superposición de la ficha con toda la columna derecha.
- Decisiones:
  - Trazos de las capas en una superposición sin profundidad y sin posproceso: se leen sobre copas y caña, con el mismo ancho en pantalla a escala de finca y de vereda.
  - Conexión con la EEP calculada en las coberturas, porque la EEP cambia con el escenario.
  - F3 se movió de z 0,25 a 0,275 en `territorio.json` (y se amplió a 12 × 10 teselas) para tocar la quebrada: su bosque conecta con la EEP. F2 se amplió a 11 × 9. GUION (sección 2) conserva la posición sugerida anterior; Alejandro decide si actualizarla.
  - Semilla del bosque seco (`semilla: 11` en `ASIGNACION`): al recortar la matriz con las fincas, los relictos de S0 quedaron con 4 de 8 aislados; con la semilla elegida, 7 de 8 aislados y ninguno contiguo. La métrica de relictos excluye los bosques de las fincas.
  - La leyenda de coberturas muestra los usos de las fincas en todos los escenarios: desde la 6.a la caña agroecológica de F1 está en S0 y la leyenda ya no cambia entre S0 y S1. La verificación compara la leyenda con los tipos presentes.
  - Proporciones y fracciones de cercas vivas de F2 a F4: valores de dibujo ilustrativos, rotulados en el panel de usos.
- Criterios de aceptación (6.a):
  - Las cuatro fincas se distinguen a escala de finca y de matriz: cumplido (distancia mínima entre composiciones 1,61, mínimo 0,3; cada finca de 233 a 396 px de lado a escala de finca; capturas `fincas-finca.jpg` y `fincas-matriz.jpg`).
  - Los conectores se leen en la vista de matriz: cumplido (vista de vereda desde F1: 2356 píxeles de conectores internos y 3360 de externos; desde F3: 1283 y 2562; ninguno sin la capa).
  - El panel EAP toma sus datos de `contenido/`: pendiente para la 6.b.
- Verificación: correcta. Cero errores de consola y cero solicitudes externas; huellas de terreno y coberturas iguales en la segunda carga y en el archivo único (991 kB). S0: caña en el 85 % del plano; relictos 8, aislados 7, contiguos 0. Llamadas de dibujo: 53 en la vista general (antes 44), 58 a escala de finca, 78 a escala de planta; 33 en liviano. Textos de la interfaz a 1920×1080 en cinco paradas (189 textos): letra mínima 24 px y contraste mínimo 6,48. Transición entre paradas medida desde el último paso de P05 (2,5 s declarada, 2,54 s medida). Primera corrida con tres fallas, corregidas en la sesión: aislamiento de relictos (semilla del bosque seco), leyenda (comparación con los tipos presentes) y transición entre paradas (P05 tiene pasos). Respaldo en imágenes (37 de 37) y vista previa regenerados.
- Pendientes:
  - 6.b: panel EAP con los diez criterios, sus grupos y valores; confirmar el reparto de los grupos (el PLAN dice «cinco ecosistémicos, cinco culturales»).
  - Revisión de Alejandro: recetas de F2 a F4, tamaño de las fincas, colores y anchos de las capas (`src/fincas/estilo.js`), casa y familia, distancias de cámara de P04 a P06, nueva posición de F3.
  - Etapa 10: las recetas no cambian con el escenario (F2 y F4 iguales en S3); si los escenarios deben transformar las fincas, añadir usos por escenario a la receta.
  - Etapa 9: la escuela agroecológica (0,66; 0,22) queda al norte de F3; revisar su relación con la finca al ubicar actores.
  - Pendientes heredados de la 5.c.c, la 5.c.b, la 5.b y la 3.b.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 6.b. Panel EAP (requiere fuentes).

### 2026-11-09 · Etapa 6.b. Panel EAP

- Modo continuo: propuesta anotada en la respuesta, sin espera de aprobación. Sesión en la nube, sin las fuentes locales. Verificación inicial correcta.
- Fuentes: sin `../Transition/` ni `../../Libros completos/`. Búsqueda en Google Drive sin resultados propios. Con un entorno personal nuevo (aprobado por Alejandro) se consultó en línea el artículo de Cleves-Leguízamo et al. (2017): el DOI 10.17584/rcch.2017v11i2.7350 resuelve a la revista (registrado en `fuentes.json`), pero el sitio responde con una página contra robots (no se eludió) y SciELO corta la conexión. No se leyó texto de ninguna fuente.
- Hecho:
  - `contenido/eap.json` (nuevo, validado por `revisarEap` en `scripts/lib/revisar-fincas-contenido.mjs`): título, rótulo «Valores ilustrativos», escala (1 a 10 por criterio, total 100), fincas F1, F2 y F3, diez criterios con sigla, rótulo corto y nombre, y valores por finca. Valores ilustrativos coherentes con los conectores dibujados: F1 82, F2 38, F3 81. Fuentes `leonsicard:verificar` y `cleves:verificar`; tres datos por verificar (nombres y orden de los criterios, grupos, escala).
  - `src/ui/eap.js` y estilos en `capas.css`: tabla en la columna derecha con la capa `indices_eap`; cabecera con el título y las fincas, un renglón por criterio, valor sobre un fondo del color de acento con opacidad proporcional (texto oscuro, contraste en todo el intervalo), total y pie con el rótulo de valores ilustrativos y las fuentes abreviadas (marca de pendiente).
  - `src/fincas/rotulos.js`: rótulo «F1 · EAP 82» sobre la casa de cada finca del panel.
  - Verificación: `revisar-fincas.mjs` revisa el panel en P22 (criterios, valores y totales iguales a `contenido/eap.json`, sin desborde, sin superposición con la ficha, rótulo de valores ilustrativos, un total por finca, oculto en P06); textos a 1920×1080 también en P22.
- Decisiones:
  - Nombres de los criterios redactados sin la fuente y marcados `verificar`, para tener el panel listo; el cotejo en sesión local corrige `contenido/eap.json` sin tocar el código.
  - Grupos de criterios fuera del panel hasta confirmarlos: el PLAN anotó «cinco ecosistémicos, cinco culturales» y no fue posible comprobarlo. El modelo admite el campo `grupo` en cada criterio.
  - Tres fincas en el panel, como dice la ficha de P22; F4 queda fuera.
  - Entorno personal «escenario-territorial» para este repositorio (el Default lo comparten todos los repositorios).
- Criterios de aceptación (6.b):
  - El panel EAP toma sus datos de `contenido/`: cumplido (criterios, valores y totales leídos del panel iguales a `contenido/eap.json`).
  - Cada criterio y cada valor muestra su fuente o el rótulo «valores ilustrativos»: cumplido (rótulo y fuentes al pie; localizadores pendientes marcados).
  - Texto del panel legible a 1920×1080: cumplido (267 textos en seis paradas, P22 incluida; letra mínima 24 px, contraste mínimo 6,48).
- Verificación: correcta. Cero errores de consola y cero solicitudes externas; huellas de terreno y coberturas iguales en la segunda carga y en el archivo único (996 kB); 53 llamadas de dibujo en la vista general. Panel EAP en P22 igual a `contenido/eap.json`, sin desborde ni superposición con la ficha, oculto en P06. Respaldo en imágenes (37 de 37) y vista previa regenerados.
- Pendientes:
  - Sesión local: cotejar en León-Sicard (2021, cap. 3) y Cleves-Leguízamo et al. (2017) los nombres, siglas, orden, grupos y escala de los criterios; si hay grupos, añadirlos al panel; cerrar los localizadores de `eap.json`, P05, P22, escalas y condiciones.
  - Revisión de Alejandro: valores ilustrativos de F1 a F3 y diseño del panel.
  - Pendientes heredados de la 6.a, la 5.c.c, la 5.c.b, la 5.b y la 3.b.
- Consumo aproximado (/cost): no disponible en la sesión en la nube.
- Siguiente: Etapa 7 (requiere fuentes), con el cotejo EAP en la misma sesión local.

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
