# Informe de verificación

- Fecha: 2026-11-23T14:59:37.241Z
- Navegador: Chromium 153.0.8010.12
- Resultado: correcto

## Vista compilada (servidor de vista previa)

- Dirección: `http://localhost:4317/`
- Carga: sí, 9098 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Cuadros por segundo en la vista general: 0.7 (navegador sin pantalla; referencia, no equivale al equipo de la prueba)
- Llamadas de dibujo: 39; triángulos: 1253518; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Captura: `capturas/general.png` (1600×900)
- Avisos de consola (no bloquean):
  - [.WebGL-0x1d04001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x1d04001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x1d04001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x1d04001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)

## Archivo único (file://, sin servidor y sin red)

- Dirección: `file:///home/user/escenario-territorial/dist-unico/index.html`
- Carga: sí, 9377 ms hasta `escenario:listo`
- Tamaño: 1132 kB
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

- Unidades: parcelas 863, orillas 178, celdas 290, reservas 12, lotes 25; teselas dibujadas: 1056 unidades, 299880 vértices; generación en 766 ms (unidades y vías 309, asignación 20, teselas 186, vegetación 87, mosaico 81, caña cercana 7)
- Instancias: saman 890 (170 en S0); seco 2682 (734 en S0); ceiba 254 (70 en S0); ribereno 1901 (498 en S0); guadua 563 (147 en S0); andino 1879 (1879 en S0); helecho 420 (420 en S0); frailejon 1308 (1308 en S0); junco 1066 (250 en S0); guamo 519 (449 en S0); cafeto 8944 (7111 en S0); platano 2531 (1473 en S0); citrico 552 (174 en S0); mango 548 (169 en S0); era 1605 (522 en S0); maiz 2271 (733 en S0); leucaena 10412 (551 en S0)
- S0: caña en el 85 % del plano (mínimo 60 %); relictos 8, aislados 7 (separación de 60 unidades o más), contiguos 0; separación mínima 53.1, mediana 97.2
- Plano en S0: cana 0.845, ripario 0.018, bosque_seco 0.038, pastura 0.08, humedal 0.019
- Plano en S1: cana 0.637, ripario 0.018, cana_organica 0.208, bosque_seco 0.038, pastura 0.08, humedal 0.019
- Plano en S2: cana 0.845, ripario 0.018, bosque_seco 0.038, pastura 0.08, humedal 0.019
- Plano en S3: cana_organica 0.328, ripario 0.101, bosque_seco 0.129, silvopastoril 0.208, cana 0.112, pastura 0.041, humedal 0.082
- S1 conserva la extensión de la caña de S0: sí
- Salto máximo de un elemento por cuadro a 60 cuadros por segundo: 0.0227 (máximo 0.05)
- Transición a S1 (calidad liviana): 76 elementos; en curso sí; 3 cuadros (intervalo máximo 1.05 s); máximo de elementos a medio camino en un cuadro: 76; 2.05 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Transición a S3 (calidad liviana): 23797 elementos; en curso sí; 3 cuadros (intervalo máximo 1.58 s); máximo de elementos a medio camino en un cuadro: 15833; 3.09 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Transición a S2 (calidad liviana): 19355 elementos; en curso sí; 3 cuadros (intervalo máximo 1.58 s); máximo de elementos a medio camino en un cuadro: 13194; 3.06 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Leyenda en S0: cana, cana_organica, pastura, silvopastoril, bosque_seco, humedal, ripario, bosque_altoandino, paramo, cafe, platano, frutales, huerta
- Calidad liviana: 17180 instancias dibujadas en la alta, 8594 en la liviana; restaurado sí
- Llamadas de dibujo en la vista general: 39 (máximo 200); triángulos 1253518
- Capturas: `capturas/coberturas-S0.jpg`, `capturas/coberturas-S1.jpg`, `capturas/coberturas-S2.jpg`, `capturas/coberturas-S3.jpg`

## Paisaje: mosaico, vías y asentamientos

- Ladera en S0: pastura 0.416, frutales 0.06, cafe 0.269, platano 0.088, ninguna 0.098, huerta 0.034, ripario 0.036
- Ladera en S1: pastura 0.416, frutales 0.06, cafe 0.269, platano 0.088, ninguna 0.098, huerta 0.034, ripario 0.036
- Ladera en S2: cafe 0.277, pastura 0.261, platano 0.111, huerta 0.098, ninguna 0.099, frutales 0.119, ripario 0.036
- Ladera en S3: cafe 0.314, platano 0.105, huerta 0.112, pastura 0.05, ninguna 0.06, frutales 0.177, silvopastoril 0.106, ripario 0.076
- Niveles de detalle por vista (general, finca, cerca, liviano, ciudad): general: 59 llamadas, 1267370 triángulos, 0 instancias cerca; finca: 61 llamadas, 946212 triángulos, 1438 instancias cerca; cerca: 54 llamadas, 942147 triángulos, 7079 instancias cerca; liviano: 49 llamadas, 566156 triángulos, 0 instancias cerca; ciudad: 53 llamadas, 1157034 triángulos, 190 instancias cerca
- Instancias cerca a escala de planta: saman 81, seco 26, ceiba 22, ribereno 194, guadua 58, andino 450, helecho 62, frailejon 0, junco 0, guamo 427, cafeto 3179, platano 1239, citrico 174, mango 169, era 329, maiz 460, leucaena 209
- Vías: 23 tramos (troncal 10, secundaria 5, veredal 8); 5019 unidades de largo; 7 puentes; 1478 teselas de corredor sin parcela; 9852 vértices
- Asentamientos: ciudad 45 manzanas y 481 edificaciones; CAB1 9 manzanas y 69 edificaciones; CAB2 9 manzanas y 68 edificaciones; CAB3 9 manzanas y 66 edificaciones; CAB4 9 manzanas y 67 edificaciones; CAB5 9 manzanas y 66 edificaciones; CAB6 9 manzanas y 69 edificaciones; CAB7 9 manzanas y 67 edificaciones; CAB8 9 manzanas y 66 edificaciones; CAB9 9 manzanas y 68 edificaciones; instancias cajas 1339, tejados 1040, arboles 136
- Capturas: `capturas/mosaico-cerca.jpg`, `capturas/ciudad.jpg`

## Vegetación y caña

- Materiales facetados en la vegetación: ninguno
- Formas de la caña cercana: cana-cerca-cerca, cana-cerca-lejos (ninguna espiga); triángulos por mata: 236 la detallada y 30 la lejana
- Lotes con caña por edad en S0: cortado 61, crecimiento 101, maduro 157; alturas del bloque 0.3, 1.55, 2.7
- Lotes con caña por edad en S1: cortado 61, crecimiento 101, maduro 157; alturas del bloque 0.3, 1.55, 2.7
- Lotes con caña por edad en S3: cortado 30, crecimiento 48, maduro 72; alturas del bloque 0.3, 1.55, 2.7
- Vista general: 59 llamadas, 1267370 triángulos; matas de caña 0 de dosel y 0 de borde (0 detalladas) en 0 celdas; tapa hundida hasta 0 unidades
- Vista finca: 64 llamadas, 1198968 triángulos; matas de caña 15134 de dosel y 5054 de borde (0 detalladas) en 31 celdas; tapa hundida hasta 460 unidades
- Vista planta: 70 llamadas, 1407180 triángulos; matas de caña 4299 de dosel y 1382 de borde (2202 detalladas) en 19 celdas; tapa hundida hasta 460 unidades
- Vista liviano: 55 llamadas, 600232 triángulos; matas de caña 0 de dosel y 0 de borde (0 detalladas) en 0 celdas; tapa hundida hasta 0 unidades
- Vista cana: 65 llamadas, 1528267 triángulos; matas de caña 13612 de dosel y 4053 de borde (1764 detalladas) en 38 celdas; tapa hundida hasta 460 unidades
- Vista suelo: 72 llamadas, 1299394 triángulos; matas de caña 2603 de dosel y 814 de borde (1345 detalladas) en 14 celdas; tapa hundida hasta 460 unidades
- Vista ribera: 63 llamadas, 1309072 triángulos; matas de caña 0 de dosel y 0 de borde (0 detalladas) en 0 celdas; tapa hundida hasta 0 unidades
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
- P03 organismo: nivel organismo; resaltadas maiz 0, frijol 0, guamo 0, platano 0, cafeto 1, cana 0; cámara a 24 (desvío 0.00); detalle cerca; rótulos de nivel 1, marcadores de interacción 0; anillo sí, contorno de los lotes no, lindero de la finca no; panel de interacciones oculto; rótulos sobre la interfaz 0, fuera 0; 33 llamadas, 750268 triángulos
- P03 poblacion: nivel poblacion; resaltadas maiz 0, frijol 0, guamo 0, platano 0, cafeto 242, cana 420; cámara a 95 (desvío 0.00); detalle cerca; rótulos de nivel 2, marcadores de interacción 0; anillo no, contorno de los lotes no, lindero de la finca no; panel de interacciones oculto; rótulos sobre la interfaz 0, fuera 0; 37 llamadas, 1114835 triángulos
- P03 comunidad: nivel comunidad; resaltadas maiz 72, frijol 42, guamo 9, platano 26, cafeto 242, cana 420; cámara a 125 (desvío 0.00); detalle cerca; rótulos de nivel 2, marcadores de interacción 6; anillo no, contorno de los lotes sí, lindero de la finca no; panel de interacciones 6; rótulos sobre la interfaz 0, fuera 0; 39 llamadas, 1222405 triángulos
- P03 ecosistema: nivel ecosistema; resaltadas maiz 72, frijol 42, guamo 9, platano 26, cafeto 242, cana 420; cámara a 620 (desvío 0.00); detalle lejos; rótulos de nivel 1, marcadores de interacción 0; anillo no, contorno de los lotes no, lindero de la finca sí; panel de interacciones oculto; rótulos sobre la interfaz 0, fuera 0; 47 llamadas, 1010142 triángulos
- P07: corte visible sí, en su lugar sí (base 3.5 sobre el terreno); rótulos 9 de 9; materia orgánica cana «de 2 % (1994) a 4 %», bosque «4,2 %»; rótulos sobre la interfaz 0, fuera 0; 63 llamadas, 1837566 triángulos
- Corte oculto en P06 (con sus paneles): sí; visible con la escala de suelo: sí
- Vuelos del descenso: P03.0→P03.1 70 u, razón 1.85; P03.1→P03.2 31 u, razón 1.99; P03.2→P03.3 495 u, razón 1.92; P03.3→P04.0 537 u, razón 1.97; P06.0→P07.0 307 u, razón 1.79 (máximo 4)
- Capturas: `capturas/lote-niveles.jpg`, `capturas/suelo-corte.jpg`

## Procesos supraprediales

- Flujos apagados en P01: sí
- P09, agua y sedimentos: 6 cauces y 40 rutas de escorrentía de 40; rutas con sedimento por escenario: S0 28, S1 28, S2 23, S3 9; partículas: agua 216, sedimento 842
- P10, nutrientes: 12 orígenes, 12 arcos en S0 (retorno no) y 24 en S3 (retorno sí); partículas: nutrientes 82, retorno 0 en S0 y nutrientes 82, retorno 82 en S3
- P11, semillas: 8 custodios y 11 enlaces; 2 cruzan el límite departamental y 3 unen la ladera con el resguardo; partículas: semillas 48, custodio 8
- P09, presupuesto gráfico de la capa: 11832 triángulos (tope 50000) y 6 llamadas de dibujo; 1058 partículas; reloj: avanza sí, repite sí; leyenda: agua, sedimento; rótulos: ninguno (0 en escena)
- P10, presupuesto gráfico de la capa: 4032 triángulos (tope 50000) y 4 llamadas de dibujo; 82 partículas; reloj: avanza sí, repite sí; leyenda: nutrientes; rótulos: sin_retorno (1 en escena)
- P11, presupuesto gráfico de la capa: 3696 triángulos (tope 50000) y 4 llamadas de dibujo; 56 partículas; reloj: avanza sí, repite sí; leyenda: semillas, custodio; rótulos: custodias, resguardo (2 en escena)
- Capturas: `capturas/flujos-P09.jpg`, `capturas/flujos-P10.jpg`, `capturas/flujos-P11.jpg`, `capturas/flujos-P10-S3.jpg`

## Radios, prácticas de conservación y síntesis

- P08, enemigos naturales: 7 parches de hábitat, radio 70 (ilustrativo); 1 salen del lindero de su finca; fincas alcanzadas: F1, F4; pares de radios superpuestos: 2; rótulos: parche, radio_enemigos, superposicion
- P08, polinizadores (segundo paso): 7 parches de hábitat, radio 125 (ilustrativo); 1 salen del lindero de su finca; fincas alcanzadas: F1, F4; pares de radios superpuestos: 10; corredor ripario sí; rótulos: parche, radio_enemigos, superposicion, radio_polinizadores, corredor (5 en escena)
- P08 en S3: 8 parches de hábitat (los radios siguen la cobertura del escenario)
- P09, prácticas en la finca F3: tramos de curvas a nivel 145, de barreras vivas 71 y de terrazas 59; 24 puntos de barrera y 9 rutas de agua que se infiltra; visibles en el paso de cuenca: no; leyenda: agua, sedimento, curvas_nivel, barreras_vivas, terrazas, infiltracion («Disposición ilustrativa»)
- P12, panel de escala mínima: 6 filas (control_biologico 4, polinizacion 4, nutrientes 7, agua_sedimentos 5, semillas 6, biota_suelo 3); alto de fila 67.6 px y peso 500; leyenda de coberturas oculta: sí; cruza la ficha: no
- Presupuesto gráfico, radios de enemigos naturales: 8512 triángulos (tope 50000) y 4 llamadas de dibujo; 84 partículas; reloj: avanza sí, repite sí
- Presupuesto gráfico, radios de polinizadores: 8512 triángulos (tope 50000) y 4 llamadas de dibujo; 266 partículas; reloj: avanza sí, repite sí
- Presupuesto gráfico, prácticas de conservación: 3300 triángulos (tope 50000) y 8 llamadas de dibujo; 40 partículas; reloj: avanza sí, repite sí
- Capturas: `capturas/flujos-P08.jpg`, `capturas/flujos-P09-ladera.jpg`, `capturas/sintesis-P12.jpg`

## Actores y red

- Capas de la red apagadas en P01: sí
- P13 (S0): lindero resaltado de F1, F2, F3, F4; figuras territoriales resguardo, consejo, reserva (sobre la finca F1); 15 marcadores de 14 actores (familia 3, aliado 2, regimen 2, comunitario 4, institucional 3, consumo 1); enlaces visibles: 0
- P18 (S0): 7 mercados (CAB1, CAB2, CAB3, CAB4, CAB5, CAB6, CAB7), sin capas de enlaces; con todas las capas de la red forzadas en S0: 0 enlaces y 0 vértices de polígono
- P20 (S2): 9 mercados; comercio: 23 enlaces entre 22 nodos, 9 mercados en 1 red, 2 enlaces cruzan el límite departamental; garantía: 9 enlaces entre 13 nodos
- Polígono de la red: 22 nodos (16 al norte y 6 al sur del límite departamental), 287 vértices (179 al norte y 108 al sur) y 2 cruces con el límite
- Límites administrativos: 10 municipios esquemáticos (8 al norte y 2 al sur) y 16 lados de límite municipal
- P21, sujeto plural (S2): enlaces por tipo de relación: comercio 23, garantia 9, conocimiento 6, semillas 6, gobernanza 9; 15 marcadores de actores
- P21, circuitos cortos: enlaces de proximidad 8, compras 4; mercados enlazados por proximidad: 3
- Rótulos (máximo 7): P13 resguardo, consejo, reserva, lindero, ingenio, acueducto (6 en escena); P18 valle, cauca, mercado_aislado (3 en escena); P20 valle, cauca, territorio_red, mercados_sur, universidad (5 en escena); P21 universidad, escuela, consumidores (3 en escena) y proximidad, compras, consumidores (3 en escena)
- Leyenda («Disposición ilustrativa»): P13 familia, comunitario, institucional, aliado, regimen, consumo, lindero, figura_territorial, reserva_natural; P18 mercado, limite_departamental, limite_municipal; P20 mercado, comercio, garantia, familia, aliado, poligono, limite_departamental, limite_municipal; P21 mercado, comercio, garantia, conocimiento, semillas, gobernanza, familia, comunitario, institucional, aliado, regimen, consumo y mercado, proximidad, compras, familia, comunitario, institucional, aliado, regimen, consumo
- Presupuesto gráfico por capa, triángulos y llamadas (tope 50000 triángulos): P13: lindero_territorio 5712 y 2; figuras_territoriales 8140 y 12; actores 0 y 6. P18: mercados 0 y 1; limites_administrativos 14280 y 4. P20: mercados 0 y 1; red_mercados 7728 y 4; poligono_red 18942 y 4; spg 3024 y 5; limites_administrativos 14280 y 4. P21: mercados 0 y 1; red_mercados 7728 y 4; spg 3024 y 5; actores 0 y 6; vinculos_actores 7056 y 9; segundo paso: mercados 0 y 1; actores 0 y 6; proximidades 2688 y 5; compras_publicas 1344 y 5
- Capturas: `capturas/actores-P13.jpg`, `capturas/actores-P18.jpg`, `capturas/actores-P20.jpg`, `capturas/actores-P21-1.jpg`, `capturas/actores-P21-2.jpg`

## Teoría de cambio (etapas 10.a y 10.b.a)

- Reglas (contenido/condiciones.json, 1024 combinaciones de condiciones): S0 704, S1 128, S2 180, S3 12; condiciones mínimas por escenario: S0 0, S1 2, S2 3, S3 7
- Cada condición sola: C1 S0, C2 S0, C3 S0, C4 S0, C5 S0, C6 S0, C7 S0, C8 S0, C9 S0, C10 S0

| Preajuste | Condiciones | Escenario | Capas derivadas | Rótulos de escena | Triángulos | Llamadas |
|---|---|---|---|---|---|---|
| S0 | ninguna | S0 («S0 · Situación de partida») | ninguna | 3 | 1267798 | 44 |
| S1 | C3, C6 | S1 («S1 · Escalamiento vertical») | flujos_conocimiento | 3 | 1267798 | 44 |
| S2 | C3, C4, C5, C6, C7 | S2 («S2 · Territorio de la red») | red_mercados, spg, poligono_red | 5 | 1394428 | 57 |
| S3 | C1, C2, C3, C4, C5, C6, C7, C8, C9, C10 | S3 («S3 · Escenario de referencia») | red_mercados, spg, poligono_red, eep, flujos_nutrientes, compras_publicas | 6 | 2192632 | 72 |

- Diferencia entre capturas de los preajustes (fracción de la maqueta que cambia; mínimo 2 %): S0 y S1 4.5 %; S0 y S2 42.9 %; S0 y S3 56.4 %; S1 y S2 44.5 %; S1 y S3 55.3 %; S2 y S3 38.3 %; coberturas distintas en todos los pares: sí
- Condición sola: escenario de base en 10 de 10; aviso con la condición que falta en 10 de 10 (C1 · Falta C5; C2 · Falta C5; C3 · Falta C9; C4 · Faltan C5 y C7; C5 · Faltan C7 y (C4 o C6); C6 · Faltan C5 y C7; C7 · Faltan C5 y (C4 o C6); C8 · Faltan C5 y C7; C9 · Falta C3; C10 · Falta C5)
- Panel: dentro de la ventana y sin cortes en los 4 preajustes: sí; letra mínima 1.00 rem; botonera oculta con el panel abierto: sí
- Carga directa con `#c=`: C3, C6 deja S1: sí; un segundo clic desactiva y borra `c` del hash: sí
- Tecla T en P17: abre con el preajuste del escenario sí, conserva las capas de la parada sí, restituye al cerrar sí; el panel se cierra al avanzar de parada: sí
- Reglas en el código (src/reglas/motor.js, src/reglas/reglas.js, src/ui/condiciones.js, src/ui/diagrama.js): ninguna clave de condición, regla, efecto ni escenario
- Presupuesto gráfico: el panel es HTML (cero triángulos); las capas derivadas son las ya medidas en las etapas 6 a 9
- Capturas: `capturas/reglas-S0.jpg`, `capturas/reglas-S1.jpg`, `capturas/reglas-S2.jpg`, `capturas/reglas-S3.jpg`, `capturas/diagrama-S0.jpg`, `capturas/diagrama-S1.jpg`, `capturas/diagrama-S2.jpg`, `capturas/diagrama-S3.jpg`

### Diagrama de la teoría de cambio (etapa 10.b.a)

| Preajuste | Escenario | Resultados alcanzados | Supuestos en juego | Sincronía | Texto fuera | Letra mínima |
|---|---|---|---|---|---|---|
| S0 | S0 · Situación de partida | ninguno | ninguno | sí | 0 | 1.00 rem |
| S1 | S1 · Escalamiento vertical | ninguno | H1 | sí | 0 | 1.00 rem |
| S2 | S2 · Territorio de la red | R1, R2 | H2 | sí | 0 | 1.00 rem |
| S3 | S3 · Escenario de referencia | R1, R2, R3, R4, R5, RF | H2, H3, H4, H5, H8 | sí | 0 | 1.00 rem |

- Resultado final «Sistema alimentario territorial agroecológico que contribuye a la soberanía alimentaria» con fuente en los 4 preajustes: sí; alcanzado solo en S3
- Supuestos con fuente: H1, H2, H3, H4, H5, H6, H7, H8; grupos de condiciones con fuente: 2; enlaces trazados: 15 de 15
- Cada condición sola con el diagrama abierto: resaltado igual al motor en 10 de 10
- Ventana de 1280 × 720: texto fuera del recuadro 0; letra mínima 1.00 rem
- Botón del panel abre: sí; tecla D cierra sí y abre sí; se cierra al avanzar de parada: sí; en una parada sin panel, D abre panel y diagrama sí y T cierra los dos sí
- Capturas: `capturas/diagrama-S0.jpg`, `capturas/diagrama-S1.jpg`, `capturas/diagrama-S2.jpg`, `capturas/diagrama-S3.jpg`

## Luz de diorama y legibilidad (1920×1080)

- Efectos: oclusión ambiental sí, miniatura sí (intensidades 1 y 1; MSAA 4), viento sí (reloj quieto en la verificación: sí), sombra sí (PCF, radio 3, intensidad 0.85, mapa 2048)
- Vista general: 43 llamadas de dibujo (máximo 200), 1.36 millones de triángulos
- Vista finca: 48 llamadas de dibujo (máximo 200), 1.19 millones de triángulos
- Vista planta: 54 llamadas de dibujo (máximo 200), 1.40 millones de triángulos
- Vista suelo: 56 llamadas de dibujo (máximo 200), 1.34 millones de triángulos
- Captura igual tras seis cuadros más: sí; viento visible con el reloj en 1,3 s: sí; vuelve con el reloj en 0: sí
- Tecla M: miniatura no tras pulsarla, la imagen cambia sí, vuelve igual sí
- Calidad liviana: oclusión no, miniatura no, viento no, sombra no, matas de caña 0; 36 llamadas; al salir, igual a la referencia: sí
- Textos revisados: 374 en P01, P03 paso 2, P04 paso 1, P06, P07, P13, P14 paso 2, P22; letra mínima 24.0 px (mínimo 24); contraste mínimo 6.48 (mínimo 4.5); sin fondo propio: 0
- Excepciones (marca de borrador): «borrador» 16.8 px
- Filtros sobre la interfaz: 0; lienzo fuera de la interfaz: sí
- Captura: `capturas/luz-finca.jpg`

## Rendimiento

Triángulos por cuadro con la cámara quieta (todas las pasadas; la sombra no se recalcula). Línea base: commit `97baa57`.

| Vista | Línea base | Ahora | Límite | Llamadas | Instancias de vegetación | Matas de caña dibujadas (del cupo) | Sombra fija igual a la recalculada |
|---|---|---|---|---|---|---|---|
| General (P01) | 1,93 M | 1,25 M (65 %) | 1,3 M | 39 | 17180 | 0 (0) | sí |
| Finca faro (P06) | 3,71 M | 1,24 M (33 %) | 2,8 M | 48 | 2162 | 18412 (23119) | sí |
| Lote (P03, comunidad) | 5,3 M | 1,22 M (23 %) | 3 M | 39 | 1074 | 1222 (3516) | sí |
| Suelo (P07) | 5,42 M | 1,84 M (34 %) | 3,5 M | 63 | 7359 | 6001 (10699) | sí |

- Ritmo del dibujo: tope de 60 cuadros por segundo en movimiento y 30 con la cámara quieta y viento; con la cámara quieta y el viento detenido, 2 cuadros dibujados en 4,2 s (3 cuadros del navegador)
- Los cuadros por segundo reales se miden en el equipo de la prueba con la tecla R (sin tope mientras el medidor está visible).

## Calidad

Triángulos por cuadro con la cámara quieta, llamadas de dibujo y matas de caña del cupo por nivel (tecla V).

| Vista | Alta | Media | Liviana |
|---|---|---|---|
| General (P01) | 1,25 M, 39 llamadas, 0 matas | 1,25 M, 35 llamadas, 0 matas | 0,89 M, 35 llamadas, 0 matas |
| Finca faro (P06) | 1,24 M, 48 llamadas, 23119 matas | 0,69 M, 44 llamadas, 899 matas | 0,57 M, 35 llamadas, 0 matas |
| Lote (P03, comunidad) | 1,22 M, 39 llamadas, 3516 matas | 1,19 M, 35 llamadas, 3516 matas | 0,57 M, 33 llamadas, 0 matas |
| Suelo (P07) | 1,84 M, 63 llamadas, 10699 matas | 1,62 M, 59 llamadas, 6728 matas | 0,67 M, 41 llamadas, 0 matas |

- Calidad alta: efectos oclusión, miniatura, sombra, viento; 17180 instancias de vegetación en la vista general; radio de la caña cercana en P07 460; indicador «Parada 7 de 26»; hash `calidad=null`
- Calidad media: efectos sombra, viento; 17180 instancias de vegetación en la vista general; radio de la caña cercana en P07 230; indicador «Parada 7 de 26 · Calidad media»; hash `calidad=media`
- Calidad liviana: efectos ninguno; 8594 instancias de vegetación en la vista general; radio de la caña cercana en P07 0; indicador «Parada 7 de 26 · Calidad liviana»; hash `calidad=liviana`
- Tecla V: recorre los tres niveles sí; al volver a la alta, imagen igual a la inicial: sí
- Pantalla densa (dos píxeles por punto): relación de píxeles 1,5 (alta), 1 (media), 1 (liviana)
- Hash: `#p=P07&captura=1&calidad=media`; tras la recarga, calidad media y detección inactiva; cambio manual de `#calidad=` aplicado: sí; carga directa con `#calidad=liviana`: liviana
- Detección con umbral forzado (`#deteccion=100000`): hecha, 0,5 cuadros por segundo en 3 cuadros (umbral 100000); calidad media; aviso «Calidad media. Tecla V para cambiarla»; tras la recarga, calidad media y detección inactiva
- Detección con umbral mínimo (`#deteccion=0.001`): hecha, 0,5 cuadros por segundo en 3 cuadros (umbral 0.001); calidad alta; aviso: ninguno
- Detección con la tecla V durante la medida: cancelada; calidad media
- En la verificación automática, sin `#deteccion=`: detección inactiva. Los cuadros por segundo de la detección corresponden a un equipo sin tarjeta gráfica.
- Aviso de carga: «Cargando…» visible antes de `escenario:listo` (cuadros del navegador con el aviso a la vista: 1); oculto al quedar lista: sí
- Rótulos del lote y del corte: 9 en P07 y 8 en P03; recolocaciones en 15 cuadros con la cámara quieta: 0; se recolocan al cambiar de vista: sí; mismo lugar al volver: sí
- Errores de consola: ninguno

## Ventana de 1920×1080 (vista compilada)

- Dirección: `http://localhost:4317/#p=P01&captura=1`
- Carga: sí, 2907 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 55; triángulos: 1925730; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Recorrido de paradas (vista compilada)

- Dirección: `http://localhost:4317/#p=P01&captura=1`
- Carga: sí, 8417 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 39; triángulos: 1253518; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Transiciones (vista compilada, sin #captura)

- Dirección: `http://localhost:4317/#p=P05&paso=2`
- Carga: sí, 2995 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 74; triángulos: 2792858; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Ventana de 1280×720 (vista compilada)

- Dirección: `http://localhost:4317/#p=P14&paso=2&captura=1`
- Carga: sí, 7659 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 39; triángulos: 1253518; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Recorrido

- Paradas por hash (`#p=ID&captura=1`): cargan 26 de 26; ficha correcta 26; con fuente 26; cámara en su lugar 26; escala 26
- Capturas: `capturas/paradas/P01.jpg` a `P26.jpg`
- Flechas, espacio y Av Pág/Re Pág (40 estados con pasos): adelante sí; atrás sí
- Teclas: 0 a 6 sí; O sí; H sí; V sí
- Tecla C: sí, `"camara": { "ancla": "F2", "distancia": 640, "azimut": -47, "elevacion": 33, "duracion": 2.5 }`; desvío al aplicarlo 0
- Botonera: sí; clic en una finca: sí
- Transiciones en la calidad liviana: entre paradas declarada 2.5 s, medida 2.8 s (intervalo máximo entre cuadros 0.62 s); botonera declarada 2 s, medida 2.03 s (intervalo máximo entre cuadros 0.9 s); doble clic en modo libre declarada 1.6 s, medida 2.17 s (intervalo máximo entre cuadros 1.18 s); correctas sí
- Modo libre: correcto sí; captura `capturas/libre.jpg`
  - Doble clic: en el recorrido sin efecto sí; fuera de la maqueta sin efecto sí; vuelo al punto sí (error 1.1, distancias 2500 → 1250 → 625, duración 1.5 s)
  - Marcha con W: 328.1 unidades, dirección 1, salto 0.26, detenida sí, cámara a 389.1 o más sobre el relieve, dentro sí
  - Marcha con flecha derecha: 218.7 unidades, dirección 1, salto 0.26, detenida sí, cámara a 437.9 o más sobre el relieve, dentro sí; sin cambio de parada sí
  - Borde (Mayús + A, 30 s): dentro sí; holgura final 0; salto 0.27; cámara a 382.3 o más sobre el relieve
  - Cámara bajo el relieve: -42.9 → 6 en el primer cuadro → 14 (sí)
  - Botonera desde el objetivo actual sí; tecla O de vuelta a la parada sí
- Trayectorias muestreadas: 39 tramos (26 con movimiento); razón máxima entre paso mayor y paso medio 2.59 (límite 4); extremos exactos sí
- Hash directo `#p=P14&paso=2`: sí
- Fichas a 1280×720: legibles 26 de 26 (sin desborde, dentro de la ventana, sin superposición, letra ≥ 16 px); letra mínima 16 px; ficha más alta P14 (488 px de 720); captura `capturas/ficha-1280.png`

## Vista del presentador (dos pestañas del mismo navegador)

- Dirección: `http://localhost:4317/presentador.html`
- Conexión con la vista principal: sí, 95 ms
- Pruebas de sincronía y cronómetro: 25 de 25 correctas
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
  - sí: botón Calidad del presentador pasa la principal a la calidad media
  - sí: tecla V en el presentador recorre liviana y vuelve a la alta
  - sí: cambio de hash en la principal llega al presentador (P20)
  - sí: tecla T y tecla D en la principal: el presentador muestra condiciones, escenario y diagrama
  - sí: al cerrar el panel en la principal, el presentador oculta la teoría de cambio
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
- Carga: sí, 61 ms
- Imágenes: 40 de 40 cargan (1920×1080); estados del recorrido: 40
- Teclado (flechas, Fin, tecla 3, hash): sí
- Contenido igual al de la generación: no (respaldo 118d50110eb0, actual a26643d27f51); regenerar con `npm run respaldo`
- Errores de consola: ninguno
- Solicitudes externas: ninguna

## Contenido

- JSON válidos: 11 de 11
- Paradas: 26; minutos: 40; saltables: P12, P15, P23
- Errores de contenido: ninguno
- Avisos de redacción: ninguno
- Fichas en borrador (26): P01, P02, P03, P04, P05, P06, P07, P08, P09, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22, P23, P24, P25, P26
- Fuentes en falta o verificar:
  - magrini (verificar)
  - padro (verificar)
  - anderson (falta)
  - leonsicard2015 (falta)
  - sanchezprager (falta)
  - romero (falta)
  - redmac (falta)
  - ley2294 (falta)
  - al012023 (falta)
- Pendientes de fuente: 65 localizadores y 24 datos (`pendientes-de-fuente.md`)
