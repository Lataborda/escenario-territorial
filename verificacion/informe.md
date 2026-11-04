# Informe de verificación

- Fecha: 2026-11-04T21:53:54.070Z
- Navegador: Chromium 153.0.8010.12
- Resultado: correcto

## Vista compilada (servidor de vista previa)

- Dirección: `http://localhost:4317/`
- Carga: sí, 7886 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Cuadros por segundo en la vista general: 1 (navegador sin pantalla; referencia, no equivale al equipo de la prueba)
- Llamadas de dibujo: 36; triángulos: 1540358; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Captura: `capturas/general.png` (1600×900)
- Avisos de consola (no bloquean):
  - [.WebGL-0x144c001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x144c001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x144c001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x144c001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)

## Archivo único (file://, sin servidor y sin red)

- Dirección: `file:///home/user/escenario-territorial/dist-unico/index.html`
- Carga: sí, 9017 ms hasta `escenario:listo`
- Tamaño: 933 kB
- Errores de consola: ninguno
- Solicitudes: 1 en total; externas: ninguna
- Llamadas de dibujo: 36; triángulos: 1540358; relación de píxeles: 1
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
- Coberturas idénticas en la segunda carga y en el archivo único: sí (huella `3db0be41-d81d8648-771bf183`)
- Anclas sobre la superficie (rayo vertical): 32 de 32; desvío máximo 0.0003
- Tecla A muestra los marcadores: sí
- Capturas: `capturas/general.png`, `capturas/anclas.png`, `capturas/ladera.png`, `capturas/plano.png`

## Coberturas

- Unidades: parcelas 887, orillas 181, celdas 290, reservas 13; teselas dibujadas: 1060 unidades, 205959 vértices; generación en 456 ms (unidades y vías 201, asignación 12, teselas 80, vegetación 37, mosaico 70)
- Instancias: arbol 8712 (3787 en S0); guadua 567 (137 en S0); junco 1066 (250 en S0); frailejon 1308 (1308 en S0); guamo 351 (281 en S0); cafeto 8475 (6714 en S0); platano 2492 (1431 en S0); citrico 586 (173 en S0); mango 590 (176 en S0); era 1782 (519 en S0); maiz 2501 (739 en S0)
- S0: caña en el 84 % del plano (mínimo 60 %); relictos 8, aislados 6 (separación de 60 unidades o más), contiguos 0; separación mínima 24.6, mediana 90.2
- Plano en S0: cana 0.838, bosque_seco 0.043, pastura 0.083, ripario 0.018, humedal 0.019
- Plano en S1: cana 0.63, cana_organica 0.208, bosque_seco 0.043, pastura 0.083, ripario 0.018, humedal 0.019
- Plano en S2: cana 0.838, bosque_seco 0.043, pastura 0.083, ripario 0.018, humedal 0.019
- Plano en S3: cana_organica 0.32, ripario 0.101, bosque_seco 0.139, cana 0.106, silvopastoril 0.212, pastura 0.041, ninguna 0, humedal 0.08
- S1 conserva la extensión de la caña de S0: sí
- Salto máximo de un elemento por cuadro a 60 cuadros por segundo: 0.0227 (máximo 0.05)
- Transición a S1 (modo liviano): 76 elementos; en curso sí; 3 cuadros (intervalo máximo 0.75 s); máximo de elementos a medio camino en un cuadro: 63; 2.19 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Transición a S3 (modo liviano): 15357 elementos; en curso sí; 4 cuadros (intervalo máximo 0.97 s); máximo de elementos a medio camino en un cuadro: 15357; 2.89 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 13 tipos
- Transición a S2 (modo liviano): 10339 elementos; en curso sí; 4 cuadros (intervalo máximo 1 s); máximo de elementos a medio camino en un cuadro: 10339; 2.93 s (declarada 2 s); final igual a la carga directa: sí; leyenda: 12 tipos
- Leyenda en S0: cana, pastura, silvopastoril, bosque_seco, humedal, ripario, bosque_altoandino, paramo, cafe, platano, frutales, huerta
- Modo liviano: 19821 instancias dibujadas, 9915 en liviano; restaurado sí
- Llamadas de dibujo en la vista general: 36 (máximo 200); triángulos 1540358
- Capturas: `capturas/coberturas-S0.jpg`, `capturas/coberturas-S1.jpg`, `capturas/coberturas-S2.jpg`, `capturas/coberturas-S3.jpg`

## Paisaje: mosaico, vías y asentamientos

- Ladera en S0: pastura 0.413, frutales 0.061, cafe 0.26, platano 0.089, huerta 0.037, ninguna 0.105, ripario 0.034
- Ladera en S1: pastura 0.413, frutales 0.061, cafe 0.26, platano 0.089, huerta 0.037, ninguna 0.105, ripario 0.034
- Ladera en S2: huerta 0.105, pastura 0.257, cafe 0.264, platano 0.113, ninguna 0.109, frutales 0.118, ripario 0.034
- Ladera en S3: huerta 0.125, pastura 0.056, cafe 0.292, platano 0.106, ninguna 0.063, frutales 0.183, silvopastoril 0.097, ripario 0.078
- Niveles de detalle por vista (general, finca, cerca, liviano, ciudad): general: 36 llamadas, 1540358 triángulos, 0 instancias cerca; finca: 44 llamadas, 2154640 triángulos, 1369 instancias cerca; cerca: 48 llamadas, 2706876 triángulos, 5110 instancias cerca; liviano: 23 llamadas, 651823 triángulos, 0 instancias cerca; ciudad: 36 llamadas, 1540358 triángulos, 0 instancias cerca
- Instancias cerca a escala de planta: guamo 248, cafeto 3066, platano 1005, citrico 161, mango 157, era 200, maiz 273
- Vías: 23 tramos (troncal 10, secundaria 5, veredal 8); 5202 unidades de largo; 7 puentes; 1524 teselas de corredor sin parcela; 10090 vértices
- Asentamientos: ciudad 45 manzanas y 481 edificaciones; CAB1 9 manzanas y 69 edificaciones; CAB2 9 manzanas y 68 edificaciones; CAB3 9 manzanas y 66 edificaciones; CAB4 9 manzanas y 67 edificaciones; CAB5 9 manzanas y 66 edificaciones; CAB6 9 manzanas y 69 edificaciones; CAB7 9 manzanas y 67 edificaciones; CAB8 9 manzanas y 66 edificaciones; CAB9 9 manzanas y 68 edificaciones; instancias cajas 1339, tejados 1040, arboles 136
- Capturas: `capturas/mosaico-cerca.jpg`, `capturas/ciudad.jpg`

## Recorrido de paradas (vista compilada)

- Dirección: `http://localhost:4317/#p=P01&captura=1`
- Carga: sí, 9007 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 36; triángulos: 1540358; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Transiciones (vista compilada, sin #captura)

- Dirección: `http://localhost:4317/#p=P05`
- Carga: sí, 6843 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 44; triángulos: 1958294; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Ventana de 1280×720 (vista compilada)

- Dirección: `http://localhost:4317/#p=P14&paso=2&captura=1`
- Carga: sí, 8640 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 36; triángulos: 1540358; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Recorrido

- Paradas por hash (`#p=ID&captura=1`): cargan 26 de 26; ficha correcta 26; con fuente 26; cámara en su lugar 26; escala 26
- Capturas: `capturas/paradas/P01.jpg` a `P26.jpg`
- Flechas, espacio y Av Pág/Re Pág (34 estados con pasos): adelante sí; atrás sí
- Teclas: 0 a 6 sí; O sí; H sí; V sí
- Tecla C: sí, `"camara": { "ancla": "F2", "distancia": 640, "azimut": -47, "elevacion": 33, "duracion": 2.5 }`; desvío al aplicarlo 0
- Botonera: sí; clic en una finca: sí
- Transiciones en modo liviano: entre paradas declarada 2.5 s, medida 2.71 s (intervalo máximo entre cuadros 0.55 s); botonera declarada 2 s, medida 2.51 s (intervalo máximo entre cuadros 0.8 s); doble clic en modo libre declarada 1.6 s, medida 1.64 s (intervalo máximo entre cuadros 0.83 s); correctas sí
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
- Conexión con la vista principal: sí, 63 ms
- Pruebas de sincronía y cronómetro: 19 de 19 correctas
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
- Imágenes: 34 de 34 cargan (1920×1080); estados del recorrido: 34
- Teclado (flechas, Fin, tecla 3, hash): sí
- Contenido igual al de la generación: sí
- Errores de consola: ninguno
- Solicitudes externas: ninguna

## Contenido

- JSON válidos: 7 de 7
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
- Pendientes de fuente: 68 localizadores y 20 datos (`pendientes-de-fuente.md`)
