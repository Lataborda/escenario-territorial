# Informe de verificación

- Fecha: 2026-11-13T14:21:35.627Z
- Navegador: Chromium 153.0.8010.12
- Resultado: correcto

## Vista compilada (servidor de vista previa)

- Dirección: `http://localhost:4317/`
- Carga: sí, 12345 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Cuadros por segundo en la vista general: 0.7 (navegador sin pantalla; referencia, no equivale al equipo de la prueba)
- Llamadas de dibujo: 39; triángulos: 1253518; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Captura: `capturas/general.png` (1600×900)
- Avisos de consola (no bloquean):
  - [.WebGL-0x176400198800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x176400198800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x176400198800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x176400198800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)

## Archivo único (file://, sin servidor y sin red)

- Dirección: `file:///home/user/escenario-territorial/dist-unico/index.html`
- Carga: sí, 13847 ms hasta `escenario:listo`
- Tamaño: 1031 kB
- Errores de consola: ninguno
- Solicitudes: 1 en total; externas: ninguna
- Llamadas de dibujo: 39; triángulos: 1253518; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Captura: `capturas/unico.png` (1600×900)
- Avisos de consola (no bloquean): ninguno

## Terreno

- Exageración vertical: 2 (configurable con `#ex=` entre 1,5 y 3)
- Vértices de la rejilla: 120701; anclas: 33
- Huella del terreno: `fee3fa59`
- Idéntico en dos cargas: huella sí; captura de la vista general sí
- Archivo único con la misma huella: sí
- Coberturas idénticas en la segunda carga y en el archivo único: sí (huella `546bf099-82168514-771bf183`)
- Anclas sobre la superficie (rayo vertical): 33 de 33; desvío máximo 0.0003
- Tecla A muestra los marcadores: sí
- Capturas: `capturas/general.png`, `capturas/anclas.png`, `capturas/ladera.png`, `capturas/plano.png`

## Coberturas

- Unidades: parcelas 863, orillas 178, celdas 290, reservas 12, lotes 25; teselas dibujadas: 1056 unidades, 299880 vértices; generación en 734 ms (unidades y vías 295, asignación 20, teselas 185, vegetación 85, mosaico 84, caña cercana 10)
- Instancias: saman 890 (170 en S0); seco 2682 (734 en S0); ceiba 254 (70 en S0); ribereno 1901 (498 en S0); guadua 563 (147 en S0); andino 1879 (1879 en S0); helecho 420 (420 en S0); frailejon 1308 (1308 en S0); junco 1066 (250 en S0); guamo 519 (449 en S0); cafeto 8944 (7111 en S0); platano 2531 (1473 en S0); citrico 552 (174 en S0); mango 548 (169 en S0); era 1605 (522 en S0); maiz 2271 (733 en S0); leucaena 10412 (551 en S0)
- S0: caña en el 85 % del plano (mínimo 60 %); relictos 8, aislados 7 (separación de 60 unidades o más), contiguos 0; separación mínima 53.1, mediana 97.2
- Plano en S0: cana 0.845, ripario 0.018, bosque_seco 0.038, pastura 0.08, humedal 0.019
- Plano en S1: cana 0.637, ripario 0.018, cana_organica 0.208, bosque_seco 0.038, pastura 0.08, humedal 0.019
- Plano en S2: cana 0.845, ripario 0.018, bosque_seco 0.038, pastura 0.08, humedal 0.019
- Plano en S3: cana_organica 0.328, ripario 0.101, bosque_seco 0.129, silvopastoril 0.208, cana 0.112, pastura 0.041, humedal 0.082
- S1 conserva la extensión de la caña de S0: sí
- Salto máximo de un elemento por cuadro a 60 cuadros por segundo: 0.0227 (máximo 0.05)
- Transición a S1 (modo liviano): 76 elementos; en curso sí; 3 cuadros (intervalo máximo 0.96 s); máximo de elementos a medio camino en un cuadro: 76; 2.81 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Transición a S3 (modo liviano): 23797 elementos; en curso sí; 2 cuadros (intervalo máximo 1.35 s); máximo de elementos a medio camino en un cuadro: 22377; 2.61 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Transición a S2 (modo liviano): 19355 elementos; en curso sí; 2 cuadros (intervalo máximo 1.28 s); máximo de elementos a medio camino en un cuadro: 17867; 2.55 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Leyenda en S0: cana, cana_organica, pastura, silvopastoril, bosque_seco, humedal, ripario, bosque_altoandino, paramo, cafe, platano, frutales, huerta
- Modo liviano: 17180 instancias dibujadas, 8594 en liviano; restaurado sí
- Llamadas de dibujo en la vista general: 39 (máximo 200); triángulos 1253518
- Capturas: `capturas/coberturas-S0.jpg`, `capturas/coberturas-S1.jpg`, `capturas/coberturas-S2.jpg`, `capturas/coberturas-S3.jpg`

## Paisaje: mosaico, vías y asentamientos

- Ladera en S0: pastura 0.416, frutales 0.06, cafe 0.269, platano 0.088, ninguna 0.098, huerta 0.034, ripario 0.036
- Ladera en S1: pastura 0.416, frutales 0.06, cafe 0.269, platano 0.088, ninguna 0.098, huerta 0.034, ripario 0.036
- Ladera en S2: cafe 0.277, pastura 0.261, platano 0.111, huerta 0.098, ninguna 0.099, frutales 0.119, ripario 0.036
- Ladera en S3: cafe 0.314, platano 0.105, huerta 0.112, pastura 0.05, ninguna 0.06, frutales 0.177, silvopastoril 0.106, ripario 0.076
- Niveles de detalle por vista (general, finca, cerca, liviano, ciudad): general: 39 llamadas, 1253518 triángulos, 0 instancias cerca; finca: 41 llamadas, 933620 triángulos, 1438 instancias cerca; cerca: 34 llamadas, 928295 triángulos, 7079 instancias cerca; liviano: 29 llamadas, 552304 triángulos, 0 instancias cerca; ciudad: 33 llamadas, 1770770 triángulos, 190 instancias cerca
- Instancias cerca a escala de planta: saman 81, seco 26, ceiba 22, ribereno 194, guadua 58, andino 450, helecho 62, frailejon 0, junco 0, guamo 427, cafeto 3179, platano 1239, citrico 174, mango 169, era 329, maiz 460, leucaena 209
- Vías: 23 tramos (troncal 10, secundaria 5, veredal 8); 5019 unidades de largo; 7 puentes; 1478 teselas de corredor sin parcela; 9852 vértices
- Asentamientos: ciudad 45 manzanas y 481 edificaciones; CAB1 9 manzanas y 69 edificaciones; CAB2 9 manzanas y 68 edificaciones; CAB3 9 manzanas y 66 edificaciones; CAB4 9 manzanas y 67 edificaciones; CAB5 9 manzanas y 66 edificaciones; CAB6 9 manzanas y 69 edificaciones; CAB7 9 manzanas y 67 edificaciones; CAB8 9 manzanas y 66 edificaciones; CAB9 9 manzanas y 68 edificaciones; instancias cajas 1339, tejados 1040, arboles 136
- Capturas: `capturas/mosaico-cerca.jpg`, `capturas/ciudad.jpg`

## Vegetación y caña

- Materiales facetados en la vegetación: ninguno
- Formas de la caña cercana: cana-cerca-cerca, cana-cerca-lejos (ninguna espiga)
- Lotes con caña por edad en S0: cortado 61, crecimiento 101, maduro 157; alturas del bloque 0.3, 1.55, 2.7
- Lotes con caña por edad en S1: cortado 61, crecimiento 101, maduro 157; alturas del bloque 0.3, 1.55, 2.7
- Lotes con caña por edad en S3: cortado 30, crecimiento 48, maduro 72; alturas del bloque 0.3, 1.55, 2.7
- Vista general: 39 llamadas, 1253518 triángulos; matas de caña 0 de dosel y 0 de borde (0 detalladas) en 0 celdas; tapa hundida hasta 0 unidades
- Vista finca: 44 llamadas, 1754744 triángulos; matas de caña 15134 de dosel y 5054 de borde (0 detalladas) en 31 celdas; tapa hundida hasta 460 unidades
- Vista planta: 50 llamadas, 1810292 triángulos; matas de caña 4299 de dosel y 1382 de borde (2202 detalladas) en 19 celdas; tapa hundida hasta 460 unidades
- Vista liviano: 35 llamadas, 601500 triángulos; matas de caña 0 de dosel y 0 de borde (0 detalladas) en 0 celdas; tapa hundida hasta 0 unidades
- Vista cana: 45 llamadas, 2231427 triángulos; matas de caña 13612 de dosel y 4053 de borde (1764 detalladas) en 38 celdas; tapa hundida hasta 460 unidades
- Vista suelo: 52 llamadas, 1455404 triángulos; matas de caña 2603 de dosel y 814 de borde (1345 detalladas) en 14 celdas; tapa hundida hasta 460 unidades
- Vista ribera: 43 llamadas, 1295220 triángulos; matas de caña 0 de dosel y 0 de borde (0 detalladas) en 0 celdas; tapa hundida hasta 0 unidades
- Especies en nivel «cerca» a escala de finca: ceiba 3, guamo 71; a escala de planta: saman 77, seco 208, ceiba 34, ribereno 136, guadua 40, guamo 434, cafeto 1416, platano 1322, citrico 121, mango 102, era 40, maiz 57, leucaena 170
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
- Panel EAP (P22): 10 criterios × 3 fincas iguales a `contenido/eap.json`: sí; totales F1 82, F2 38, F3 81; rótulos en la escena: F1 · EAP 82, F2 · EAP 38, F3 · EAP 81; desborde no; sobre la ficha no; pie «Valores ilustrativos · León-Sicard (2021), cap. 2, tabla 1, cap. 3»; oculto en P06 sí
- Capturas: `capturas/fincas-finca.jpg`, `capturas/fincas-matriz.jpg`

## Lote y corte de suelo

- Plantas: maiz 72, frijol 42, guamo 9, platano 26, cafeto 242, cana 420
- P03 organismo: nivel organismo; resaltadas maiz 0, frijol 0, guamo 0, platano 0, cafeto 1, cana 0; cámara a 24 (desvío 0.00); detalle cerca; rótulos de nivel 1, marcadores de interacción 0; anillo sí, contorno de los lotes no, lindero de la finca no; panel de interacciones oculto; rótulos sobre la interfaz 0, fuera 0; 33 llamadas, 851148 triángulos
- P03 poblacion: nivel poblacion; resaltadas maiz 0, frijol 0, guamo 0, platano 0, cafeto 242, cana 420; cámara a 95 (desvío 0.00); detalle cerca; rótulos de nivel 2, marcadores de interacción 0; anillo no, contorno de los lotes no, lindero de la finca no; panel de interacciones oculto; rótulos sobre la interfaz 0, fuera 0; 37 llamadas, 1349225 triángulos
- P03 comunidad: nivel comunidad; resaltadas maiz 72, frijol 42, guamo 9, platano 26, cafeto 242, cana 420; cámara a 125 (desvío 0.00); detalle cerca; rótulos de nivel 2, marcadores de interacción 6; anillo no, contorno de los lotes sí, lindero de la finca no; panel de interacciones 6; rótulos sobre la interfaz 0, fuera 0; 39 llamadas, 1508721 triángulos
- P03 ecosistema: nivel ecosistema; resaltadas maiz 72, frijol 42, guamo 9, platano 26, cafeto 242, cana 420; cámara a 620 (desvío 0.00); detalle lejos; rótulos de nivel 1, marcadores de interacción 0; anillo no, contorno de los lotes no, lindero de la finca sí; panel de interacciones oculto; rótulos sobre la interfaz 0, fuera 0; 47 llamadas, 1058634 triángulos
- P07: corte visible sí, en su lugar sí (base 3.5 sobre el terreno); rótulos 9 de 9; materia orgánica cana «de 2 % (1994) a 4 %», bosque «4,2 %»; rótulos sobre la interfaz 0, fuera 0; 63 llamadas, 2640646 triángulos
- Corte oculto en P06 (con sus paneles): sí; visible con la escala de suelo: sí
- Vuelos del descenso: P03.0→P03.1 70 u, razón 1.85; P03.1→P03.2 31 u, razón 1.99; P03.2→P03.3 495 u, razón 1.92; P03.3→P04.0 537 u, razón 1.97; P06.0→P07.0 307 u, razón 1.79 (máximo 4)
- Capturas: `capturas/lote-niveles.jpg`, `capturas/suelo-corte.jpg`

## Luz de diorama y legibilidad (1920×1080)

- Efectos: oclusión ambiental sí, miniatura sí (intensidades 1 y 1; MSAA 4), viento sí (reloj quieto en la verificación: sí), sombra sí (PCF, radio 3, intensidad 0.85, mapa 2048)
- Vista general: 43 llamadas de dibujo (máximo 200), 1.36 millones de triángulos
- Vista finca: 48 llamadas de dibujo (máximo 200), 1.76 millones de triángulos
- Vista planta: 54 llamadas de dibujo (máximo 200), 1.82 millones de triángulos
- Vista suelo: 56 llamadas de dibujo (máximo 200), 1.51 millones de triángulos
- Captura igual tras seis cuadros más: sí; viento visible con el reloj en 1,3 s: sí; vuelve con el reloj en 0: sí
- Tecla M: miniatura no tras pulsarla, la imagen cambia sí, vuelve igual sí
- Modo liviano: oclusión no, miniatura no, viento no, sombra no, matas de caña 0; 36 llamadas; al salir, igual a la referencia: sí
- Textos revisados: 366 en P01, P03 paso 2, P04 paso 1, P06, P07, P13, P14 paso 2, P22; letra mínima 24.0 px (mínimo 24); contraste mínimo 6.48 (mínimo 4.5); sin fondo propio: 0
- Excepciones (marca de borrador): «borrador» 16.8 px
- Filtros sobre la interfaz: 0; lienzo fuera de la interfaz: sí
- Captura: `capturas/luz-finca.jpg`

## Rendimiento

Triángulos por cuadro con la cámara quieta (todas las pasadas; la sombra no se recalcula). Línea base: commit `97baa57`.

| Vista | Línea base | Ahora | Límite | Llamadas | Instancias de vegetación | Matas de caña dibujadas (del cupo) | Sombra fija igual a la recalculada |
|---|---|---|---|---|---|---|---|
| General (P01) | 1,93 M | 1,25 M (65 %) | 1,3 M | 39 | 17180 | 0 (0) | sí |
| Finca faro (P06) | 3,71 M | 1,92 M (52 %) | 2,8 M | 48 | 2162 | 18412 (23119) | sí |
| Lote (P03, comunidad) | 5,3 M | 1,51 M (28 %) | 3 M | 39 | 1074 | 1222 (3516) | sí |
| Suelo (P07) | 5,42 M | 2,64 M (49 %) | 3,5 M | 63 | 7359 | 6001 (10699) | sí |

- Ritmo del dibujo: tope de 60 cuadros por segundo en movimiento y 30 con la cámara quieta y viento; con la cámara quieta y el viento detenido, 2 cuadros dibujados en 5,4 s (3 cuadros del navegador)
- Los cuadros por segundo reales se miden en el equipo de la prueba con la tecla R (sin tope mientras el medidor está visible).

## Ventana de 1920×1080 (vista compilada)

- Dirección: `http://localhost:4317/#p=P01&captura=1`
- Carga: sí, 13136 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 39; triángulos: 1253518; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Recorrido de paradas (vista compilada)

- Dirección: `http://localhost:4317/#p=P01&captura=1`
- Carga: sí, 14617 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 39; triángulos: 1253518; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Transiciones (vista compilada, sin #captura)

- Dirección: `http://localhost:4317/#p=P05&paso=2`
- Carga: sí, 11339 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 43; triángulos: 984034; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Ventana de 1280×720 (vista compilada)

- Dirección: `http://localhost:4317/#p=P14&paso=2&captura=1`
- Carga: sí, 10794 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 39; triángulos: 1253518; relación de píxeles: 1
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
- Transiciones en modo liviano: entre paradas declarada 2.5 s, medida 2.61 s (intervalo máximo entre cuadros 0.77 s); botonera declarada 2 s, medida 2.6 s (intervalo máximo entre cuadros 1.15 s); doble clic en modo libre declarada 1.6 s, medida 2.34 s (intervalo máximo entre cuadros 1.18 s); correctas sí
- Modo libre: correcto sí; captura `capturas/libre.jpg`
  - Doble clic: en el recorrido sin efecto sí; fuera de la maqueta sin efecto sí; vuelo al punto sí (error 1.1, distancias 2500 → 1250 → 625, duración 1.5 s)
  - Marcha con W: 328.1 unidades, dirección 1, salto 0.26, detenida sí, cámara a 389.1 o más sobre el relieve, dentro sí
  - Marcha con flecha derecha: 218.7 unidades, dirección 1, salto 0.26, detenida sí, cámara a 437.9 o más sobre el relieve, dentro sí; sin cambio de parada sí
  - Borde (Mayús + A, 30 s): dentro sí; holgura final 0; salto 0.27; cámara a 382.3 o más sobre el relieve
  - Cámara bajo el relieve: -42.9 → 6 en el primer cuadro → 14 (sí)
  - Botonera desde el objetivo actual sí; tecla O de vuelta a la parada sí
- Trayectorias muestreadas: 36 tramos (24 con movimiento); razón máxima entre paso mayor y paso medio 2.59 (límite 4); extremos exactos sí
- Hash directo `#p=P14&paso=2`: sí
- Fichas a 1280×720: legibles 26 de 26 (sin desborde, dentro de la ventana, sin superposición, letra ≥ 16 px); letra mínima 16 px; ficha más alta P14 (488 px de 720); captura `capturas/ficha-1280.png`

## Vista del presentador (dos pestañas del mismo navegador)

- Dirección: `http://localhost:4317/presentador.html`
- Conexión con la vista principal: sí, 96 ms
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
- Carga: sí, 51 ms
- Imágenes: 37 de 37 cargan (1920×1080); estados del recorrido: 37
- Teclado (flechas, Fin, tecla 3, hash): sí
- Contenido igual al de la generación: sí
- Errores de consola: ninguno
- Solicitudes externas: ninguna

## Contenido

- JSON válidos: 10 de 10
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
- Pendientes de fuente: 66 localizadores y 17 datos (`pendientes-de-fuente.md`)
