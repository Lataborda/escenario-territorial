# Informe de verificación

- Fecha: 2026-11-09T11:21:43.490Z
- Navegador: Chromium 153.0.8010.12
- Resultado: correcto

## Vista compilada (servidor de vista previa)

- Dirección: `http://localhost:4317/`
- Carga: sí, 12344 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Cuadros por segundo en la vista general: 0.7 (navegador sin pantalla; referencia, no equivale al equipo de la prueba)
- Llamadas de dibujo: 53; triángulos: 1925254; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Captura: `capturas/general.png` (1600×900)
- Avisos de consola (no bloquean):
  - [.WebGL-0xc1c00168800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0xc1c00168800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0xc1c00168800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0xc1c00168800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)

## Archivo único (file://, sin servidor y sin red)

- Dirección: `file:///home/user/escenario-territorial/dist-unico/index.html`
- Carga: sí, 13885 ms hasta `escenario:listo`
- Tamaño: 996 kB
- Errores de consola: ninguno
- Solicitudes: 1 en total; externas: ninguna
- Llamadas de dibujo: 53; triángulos: 1925254; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Captura: `capturas/unico.png` (1600×900)
- Avisos de consola (no bloquean): ninguno

## Terreno

- Exageración vertical: 2 (configurable con `#ex=` entre 1,5 y 3)
- Vértices de la rejilla: 120701; anclas: 32
- Huella del terreno: `fee3fa59`
- Idéntico en dos cargas: huella sí; captura de la vista general sí
- Archivo único con la misma huella: sí
- Coberturas idénticas en la segunda carga y en el archivo único: sí (huella `7d808393-82168514-771bf183`)
- Anclas sobre la superficie (rayo vertical): 32 de 32; desvío máximo 0.0003
- Tecla A muestra los marcadores: sí
- Capturas: `capturas/general.png`, `capturas/anclas.png`, `capturas/ladera.png`, `capturas/plano.png`

## Coberturas

- Unidades: parcelas 863, orillas 178, celdas 290, reservas 12, lotes 25; teselas dibujadas: 1056 unidades, 300426 vértices; generación en 687 ms (unidades y vías 253, asignación 18, teselas 188, vegetación 83, mosaico 83, caña cercana 7)
- Instancias: saman 891 (170 en S0); seco 2717 (734 en S0); ceiba 257 (70 en S0); ribereno 1901 (498 en S0); guadua 563 (147 en S0); andino 1879 (1879 en S0); helecho 420 (420 en S0); frailejon 1308 (1308 en S0); junco 1066 (250 en S0); guamo 536 (461 en S0); cafeto 8938 (7110 en S0); platano 2512 (1453 en S0); citrico 550 (164 en S0); mango 558 (189 en S0); era 1602 (521 en S0); maiz 2270 (733 en S0); leucaena 10429 (555 en S0)
- S0: caña en el 85 % del plano (mínimo 60 %); relictos 8, aislados 7 (separación de 60 unidades o más), contiguos 0; separación mínima 53.1, mediana 97.2
- Plano en S0: cana 0.845, ripario 0.018, bosque_seco 0.038, pastura 0.08, humedal 0.019
- Plano en S1: cana 0.637, ripario 0.018, cana_organica 0.208, bosque_seco 0.038, pastura 0.08, humedal 0.019
- Plano en S2: cana 0.845, ripario 0.018, bosque_seco 0.038, pastura 0.08, humedal 0.019
- Plano en S3: cana_organica 0.328, ripario 0.101, bosque_seco 0.129, silvopastoril 0.208, cana 0.112, pastura 0.041, humedal 0.082
- S1 conserva la extensión de la caña de S0: sí
- Salto máximo de un elemento por cuadro a 60 cuadros por segundo: 0.0227 (máximo 0.05)
- Transición a S1 (modo liviano): 76 elementos; en curso sí; 3 cuadros (intervalo máximo 0.97 s); máximo de elementos a medio camino en un cuadro: 76; 2.83 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Transición a S3 (modo liviano): 23832 elementos; en curso sí; 2 cuadros (intervalo máximo 1.31 s); máximo de elementos a medio camino en un cuadro: 21951; 2.6 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Transición a S2 (modo liviano): 19401 elementos; en curso sí; 2 cuadros (intervalo máximo 1.28 s); máximo de elementos a medio camino en un cuadro: 17680; 2.49 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Leyenda en S0: cana, cana_organica, pastura, silvopastoril, bosque_seco, humedal, ripario, bosque_altoandino, paramo, cafe, platano, frutales, huerta
- Modo liviano: 17183 instancias dibujadas, 8596 en liviano; restaurado sí
- Llamadas de dibujo en la vista general: 53 (máximo 200); triángulos 1925254
- Capturas: `capturas/coberturas-S0.jpg`, `capturas/coberturas-S1.jpg`, `capturas/coberturas-S2.jpg`, `capturas/coberturas-S3.jpg`

## Paisaje: mosaico, vías y asentamientos

- Ladera en S0: pastura 0.416, frutales 0.06, cafe 0.269, platano 0.088, ninguna 0.098, huerta 0.034, ripario 0.036
- Ladera en S1: pastura 0.416, frutales 0.06, cafe 0.269, platano 0.088, ninguna 0.098, huerta 0.034, ripario 0.036
- Ladera en S2: cafe 0.277, pastura 0.261, platano 0.111, huerta 0.098, ninguna 0.099, frutales 0.119, ripario 0.036
- Ladera en S3: cafe 0.314, platano 0.105, huerta 0.112, pastura 0.05, ninguna 0.06, frutales 0.177, silvopastoril 0.106, ripario 0.076
- Niveles de detalle por vista (general, finca, cerca, liviano, ciudad): general: 53 llamadas, 1925254 triángulos, 0 instancias cerca; finca: 62 llamadas, 2731576 triángulos, 1424 instancias cerca; cerca: 75 llamadas, 4444240 triángulos, 7051 instancias cerca; liviano: 33 llamadas, 885508 triángulos, 0 instancias cerca; ciudad: 70 llamadas, 3698354 triángulos, 191 instancias cerca
- Instancias cerca a escala de planta: saman 81, seco 27, ceiba 22, ribereno 197, guadua 59, andino 450, helecho 62, frailejon 0, junco 0, guamo 434, cafeto 3167, platano 1203, citrico 164, mango 189, era 328, maiz 459, leucaena 209
- Vías: 23 tramos (troncal 10, secundaria 5, veredal 8); 5019 unidades de largo; 7 puentes; 1478 teselas de corredor sin parcela; 9852 vértices
- Asentamientos: ciudad 45 manzanas y 481 edificaciones; CAB1 9 manzanas y 69 edificaciones; CAB2 9 manzanas y 68 edificaciones; CAB3 9 manzanas y 66 edificaciones; CAB4 9 manzanas y 67 edificaciones; CAB5 9 manzanas y 66 edificaciones; CAB6 9 manzanas y 69 edificaciones; CAB7 9 manzanas y 67 edificaciones; CAB8 9 manzanas y 66 edificaciones; CAB9 9 manzanas y 68 edificaciones; instancias cajas 1339, tejados 1040, arboles 136
- Capturas: `capturas/mosaico-cerca.jpg`, `capturas/ciudad.jpg`

## Vegetación y caña

- Materiales facetados en la vegetación: ninguno
- Formas de la caña cercana: cana-cerca-cerca, cana-cerca-lejos (ninguna espiga)
- Lotes con caña por edad en S0: cortado 61, crecimiento 101, maduro 157; alturas del bloque 0.3, 1.55, 2.7
- Lotes con caña por edad en S1: cortado 61, crecimiento 101, maduro 157; alturas del bloque 0.3, 1.55, 2.7
- Lotes con caña por edad en S3: cortado 30, crecimiento 48, maduro 72; alturas del bloque 0.3, 1.55, 2.7
- Vista general: 53 llamadas, 1925254 triángulos; matas de caña 0 de dosel y 0 de borde (0 detalladas) en 0 celdas; tapa hundida hasta 0 unidades
- Vista finca: 58 llamadas, 3334426 triángulos; matas de caña 15134 de dosel y 5054 de borde (0 detalladas) en 31 celdas; tapa hundida hasta 460 unidades
- Vista planta: 78 llamadas, 4972994 triángulos; matas de caña 4581 de dosel y 1400 de borde (2377 detalladas) en 17 celdas; tapa hundida hasta 460 unidades
- Vista liviano: 33 llamadas, 885508 triángulos; matas de caña 0 de dosel y 0 de borde (0 detalladas) en 0 celdas; tapa hundida hasta 0 unidades
- Vista cana: 78 llamadas, 5998826 triángulos; matas de caña 13114 de dosel y 3927 de borde (2203 detalladas) en 37 celdas; tapa hundida hasta 460 unidades
- Vista suelo: 76 llamadas, 4829076 triángulos; matas de caña 2176 de dosel y 684 de borde (1784 detalladas) en 12 celdas; tapa hundida hasta 460 unidades
- Vista ribera: 77 llamadas, 4205302 triángulos; matas de caña 0 de dosel y 0 de borde (0 detalladas) en 0 celdas; tapa hundida hasta 0 unidades
- Especies en nivel «cerca» a escala de finca: ceiba 4, guamo 71; a escala de planta: saman 77, seco 190, ceiba 34, ribereno 140, guadua 40, guamo 446, cafeto 1898, platano 1341, citrico 111, mango 122, era 40, maiz 57, leucaena 173
- Capturas: `capturas/cana-cerca.jpg`, `capturas/cana-suelo.jpg`, `capturas/vegetacion-ribera.jpg`

## Fincas

- F1: 163 teselas, 9 lotes (ripario, bosque_seco, frutales, silvopastoril, cana_organica); lindero 360 u; cercas vivas internas 378 u y del lindero 264 u; conexión con la EEP en S0 72 u; en pantalla a escala de finca 377 × 251 px
- F2: 48 teselas, 5 lotes (huerta, cafe, pastura, platano); lindero 336 u; cercas vivas internas 24 u y del lindero 114 u; conexión con la EEP en S0 12 u; en pantalla a escala de finca 233 × 215 px
- F3: 98 teselas, 7 lotes (ripario, huerta, frutales, cafe, platano, silvopastoril); lindero 360 u; cercas vivas internas 288 u y del lindero 258 u; conexión con la EEP en S0 66 u; en pantalla a escala de finca 268 × 281 px
- F4: 212 teselas, 4 lotes (cana); lindero 372 u; cercas vivas internas 0 u y del lindero 0 u; conexión con la EEP en S0 0 u; en pantalla a escala de finca 396 × 262 px
- F1 frente a las áreas de Calle et al. (2022, §11.1): Guadual 0.093 (0.091); Bosque 0.049 (0.049); Frutales 0.019 (0.018); Sistema silvopastoril 0.494 (0.491); Caña agroecológica 0.346 (0.351); diferencia máxima 0.005 (máximo 0.05)
- Distinción (composición por uso y conectores por unidad de lindero): mínima 1.61 (mínimo 0.3); F1-F2 3.37, F1-F3 1.61, F1-F4 3.78, F2-F3 2.19, F2-F4 2.41, F3-F4 3.52
- Casas: 4; figuras de la familia: 12
- Vista de vereda desde F1 (vereda): píxeles de conectores internos 2356 y externos 3360 con la capa; 0 y 0 sin ella (mínimo 400)
- Vista de vereda desde F3 (vereda): píxeles de conectores internos 1283 y externos 2562 con la capa; 0 y 0 sin ella (mínimo 400)
- P04: paso 1 lote resaltado sí con 1 rótulo; paso 2 lindero resaltado sí con 1 rótulo; finca F3
- P05: paso 1 internos sí, externos no, EEP no (2005 tramos, conexión 25); paso 2 internos sí, externos sí, EEP no (2005 tramos, conexión 25); paso 3 internos sí, externos sí, EEP sí (2005 tramos, conexión 25)
- Clic dentro del lindero de F4: punto de interés F4, escala finca
- Panel EAP (P22): 10 criterios × 3 fincas iguales a `contenido/eap.json`: sí; totales F1 82, F2 38, F3 81; rótulos en la escena: F1 · EAP 82, F2 · EAP 38, F3 · EAP 81; desborde no; sobre la ficha no; pie «Valores ilustrativos · León-Sicard (2021) · Cleves-Leguízamo et al. (2017)»; oculto en P06 sí
- Capturas: `capturas/fincas-finca.jpg`, `capturas/fincas-matriz.jpg`

## Luz de diorama y legibilidad (1920×1080)

- Efectos: oclusión ambiental sí, miniatura sí (intensidades 1 y 1; MSAA 4), viento sí (reloj quieto en la verificación: sí), sombra sí (PCF, radio 3, intensidad 0.85, mapa 2048)
- Vista general: 57 llamadas de dibujo (máximo 200), 2.08 millones de triángulos
- Vista finca: 62 llamadas de dibujo (máximo 200), 3.49 millones de triángulos
- Vista planta: 82 llamadas de dibujo (máximo 200), 5.32 millones de triángulos
- Vista suelo: 80 llamadas de dibujo (máximo 200), 5.21 millones de triángulos
- Captura igual tras seis cuadros más: sí; viento visible con el reloj en 1,3 s: sí; vuelve con el reloj en 0: sí
- Tecla M: miniatura no tras pulsarla, la imagen cambia sí, vuelve igual sí
- Modo liviano: oclusión no, miniatura no, viento no, sombra no, matas de caña 0; 37 llamadas; al salir, igual a la referencia: sí
- Textos revisados: 267 en P01, P04 paso 1, P06, P13, P14 paso 2, P22; letra mínima 24.0 px (mínimo 24); contraste mínimo 6.48 (mínimo 4.5); sin fondo propio: 0
- Excepciones (marca de borrador): «borrador» 16.8 px
- Filtros sobre la interfaz: 0; lienzo fuera de la interfaz: sí
- Captura: `capturas/luz-finca.jpg`

## Ventana de 1920×1080 (vista compilada)

- Dirección: `http://localhost:4317/#p=P01&captura=1`
- Carga: sí, 13401 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 53; triángulos: 1925254; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Recorrido de paradas (vista compilada)

- Dirección: `http://localhost:4317/#p=P01&captura=1`
- Carga: sí, 11848 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 53; triángulos: 1925254; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Transiciones (vista compilada, sin #captura)

- Dirección: `http://localhost:4317/#p=P05&paso=2`
- Carga: sí, 13649 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 72; triángulos: 2806280; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Ventana de 1280×720 (vista compilada)

- Dirección: `http://localhost:4317/#p=P14&paso=2&captura=1`
- Carga: sí, 14307 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 53; triángulos: 1925254; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Recorrido

- Paradas por hash (`#p=ID&captura=1`): cargan 26 de 26; ficha correcta 26; con fuente 26; cámara en su lugar 26; escala 26
- Capturas: `capturas/paradas/P01.jpg` a `P26.jpg`
- Flechas, espacio y Av Pág/Re Pág (37 estados con pasos): adelante sí; atrás sí
- Teclas: 0 a 6 sí; O sí; H sí; V sí
- Tecla C: sí, `"camara": { "ancla": "F2", "distancia": 640, "azimut": -47, "elevacion": 33, "duracion": 2.5 }`; desvío al aplicarlo 0
- Botonera: sí; clic en una finca: sí
- Transiciones en modo liviano: entre paradas declarada 2.5 s, medida 2.87 s (intervalo máximo entre cuadros 0.83 s); botonera declarada 2 s, medida 2.29 s (intervalo máximo entre cuadros 1.18 s); doble clic en modo libre declarada 1.6 s, medida 2.24 s (intervalo máximo entre cuadros 1.15 s); correctas sí
- Modo libre: correcto sí; captura `capturas/libre.jpg`
  - Doble clic: en el recorrido sin efecto sí; fuera de la maqueta sin efecto sí; vuelo al punto sí (error 1.1, distancias 2500 → 1250 → 625, duración 1.5 s)
  - Marcha con W: 328.1 unidades, dirección 1, salto 0.26, detenida sí, cámara a 389.1 o más sobre el relieve, dentro sí
  - Marcha con flecha derecha: 218.7 unidades, dirección 1, salto 0.26, detenida sí, cámara a 437.9 o más sobre el relieve, dentro sí; sin cambio de parada sí
  - Borde (Mayús + A, 30 s): dentro sí; holgura final 0; salto 0.27; cámara a 382.3 o más sobre el relieve
  - Cámara bajo el relieve: -42.9 → 6 en el primer cuadro → 14 (sí)
  - Botonera desde el objetivo actual sí; tecla O de vuelta a la parada sí
- Trayectorias muestreadas: 25 tramos (21 con movimiento); razón máxima entre paso mayor y paso medio 2.1 (límite 4); extremos exactos sí
- Hash directo `#p=P14&paso=2`: sí
- Fichas a 1280×720: legibles 26 de 26 (sin desborde, dentro de la ventana, sin superposición, letra ≥ 16 px); letra mínima 16 px; ficha más alta P14 (488 px de 720); captura `capturas/ficha-1280.png`

## Vista del presentador (dos pestañas del mismo navegador)

- Dirección: `http://localhost:4317/presentador.html`
- Conexión con la vista principal: sí, 90 ms
- Pruebas de sincronía y cronómetro: 21 de 21 correctas
  - sí: estado inicial P01 en las dos vistas
  - sí: botón Siguiente del presentador mueve la principal a P02
  - sí: flecha en la principal llega al presentador (P03, paso 1)
  - sí: flecha en el presentador avanza un paso (P03, paso 2)
  - sí: flecha izquierda y Re Pág en el presentador retroceden a P02
  - sí: clic en el índice lleva la principal a P14
  - sí: tecla 5 en el presentador lleva a la primera parada de M5
  - sí: modo libre desde el presentador
  - sí: tecla O en el presentador vuelve al recorrido
  - sí: tecla H en el presentador oculta la interfaz principal
  - sí: botón Interfaz la muestra de nuevo
  - sí: botón Miniatura del presentador apaga el desenfoque de la principal
  - sí: tecla M en el presentador lo enciende de nuevo
  - sí: cambio de hash en la principal llega al presentador (P20)
  - sí: «Omitir» salta la parada saltable P12
  - sí: M0 tras 1 min: desvío −2:00 frente a 3 min
  - sí: M1 tras 7 min: desvío +1:00 frente a 6 min; total 8:00
  - sí: desvío acumulado +2:00 marca retraso y resalta las saltables
  - sí: en pausa el total no avanza (11:00)
  - sí: una recarga del presentador conserva el cronómetro y la parada
  - sí: Reiniciar deja el cronómetro en cero
- Cronómetro con reloj simulado: M0 −2:00; M1 +1:00; desvío acumulado +2:00
- Captura: `capturas/presentador.png` (1440×900)
- Errores de consola (ambas pestañas): ninguno
- Solicitudes: 25 en total; externas: ninguna
- Avisos de consola (no bloquean): ninguno

## Respaldo en imágenes (file://, sin servidor y sin red)

- Dirección: `respaldo/index.html`
- Carga: sí, 42 ms
- Imágenes: 37 de 37 cargan (1920×1080); estados del recorrido: 37
- Teclado (flechas, Fin, tecla 3, hash): sí
- Contenido igual al de la generación: sí
- Errores de consola: ninguno
- Solicitudes externas: ninguna

## Contenido

- JSON válidos: 9 de 9
- Paradas: 26; minutos: 40; saltables: P12, P15, P23
- Errores de contenido: ninguno
- Avisos de redacción: ninguno
- Fichas en borrador (26): P01, P02, P03, P04, P05, P06, P07, P08, P09, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22, P23, P24, P25, P26
- Fuentes en falta o verificar:
  - magrini (verificar)
  - padro (verificar)
  - mieryteran (falta)
  - giraldorosset (falta)
  - anderson (falta)
  - leonsicard2015 (falta)
  - sanchezprager (falta)
  - romero (falta)
  - redmac (falta)
  - ley2294 (falta)
  - al012023 (falta)
- Pendientes de fuente: 71 localizadores y 23 datos (`pendientes-de-fuente.md`)
