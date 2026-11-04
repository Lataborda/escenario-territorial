# Guion conceptual del escenario territorial

Documento de contenido. Define qué muestra el escenario y con qué fundamento. Lo edita Alejandro; Claude Code lo convierte en `contenido/*.json` en la etapa 1 y lo sincroniza cuando cambie. Las referencias abreviadas remiten a la sección 11.

Base de este guion: `../RESUMEN-prueba-oral.md` y `../RESUMEN-ESTRATEGIA-PRUEBA-ORAL.md` (1 de noviembre de 2026), contrastados con las fuentes de la carpeta.

## 1. Marco de la clase

- Tema: «Transición hacia sistemas alimentarios agroecológicos: del agroecosistema al territorio» (Res. 356 de 2026, art. 11, temas propuestos del perfil TC7).
- Formato: exposición tipo clase de 40 minutos por videoconferencia, preguntas del jurado hasta por 25 minutos y conversación de suficiencia hasta por 25 minutos (Res. 356 de 2026, art. 11).
- Criterios de la exposición: expresión oral, manejo de herramientas pedagógicas y propuesta didáctica, hasta 100 puntos cada uno (Res. 356 de 2026, art. 11). El escenario es la herramienta pedagógica y soporta la propuesta didáctica.
- La resolución permite usar herramientas didácticas y pedagógicas en la prueba (Res. 356 de 2026, art. 11, parágrafo 3).
- Nivel declarado: posgrado (maestría y doctorado).
- Arquitectura de la clase: columna vertebral biofísica (arquitectura B), casos del Valle en M1 y M4 (arquitectura C) y lectura de las cuatro tradiciones al cierre de M3 (arquitectura A). Fuente: RESUMEN-ESTRATEGIA, §11.
- Pregunta orientadora: ¿por qué la excelencia agroecológica en la finca no produce por sí sola transición territorial?
- Resultado de aprendizaje (borrador, decisión D4): al finalizar la sesión, el estudiante explica qué procesos de la transición exigen escalas supraprediales, distingue agroecosistema mayor y territorio por el límite y el sujeto de decisión, e identifica en un territorio concreto las condiciones de territorialización ausentes.

### Momentos y tiempos

| Momento | Minutos | Escala dominante | Escenario | Contenido |
|---|---|---|---|---|
| M0 Encuadre | 3 | territorio | S0 | ficha de sesión y pregunta detonante |
| M1 Agroecosistema y estructura | 6 | lote y finca | S0 | niveles de organización, agroecosistema menor y mayor, EAP, finca faro |
| M2 Procesos supraprediales | 7 | suelo a región | S0 | qué cierra en la finca y qué no |
| M3 Cambio de objeto | 8 | territorio | S0 y S1 | límite y sujeto, cuatro lecturas, bloqueo, paisaje como registro, El Hatico |
| M4 Territorialización | 8 | territorio | S0 a S2 | siete mercados, actividad, red, sujeto plural |
| M5 Medición | 5 | finca y territorio | S2 | EAP, MESMIS, TAPE, soberanía de datos |
| M6 Cierre | 3 | territorio y finca | S3 | objetivo territorial e instrumento predial, tarea auténtica |

Total 40 minutos. Ensayo objetivo 36 minutos (RESUMEN-ESTRATEGIA, §11).

## 2. Territorio representado

Propuesta (decisión D1): territorio esquemático inspirado en el valle geográfico del río Cauca, una cuenca tributaria de la cordillera Central (referencia: cuenca del río Amaime, donde se ubica El Hatico) y el norte del Cauca. Esquema sin escala. La maqueta no reproduce la cartografía.

Datos del plano del valle para la capa histórica y la matriz: 421.000 ha de planicie; entre 1957 y 1986 se transformó el 66 % de la cobertura forestal de la cuenca alta del río Cauca; hoy queda el 1,76 % del bosque original, en fragmentos de 6 ha en promedio; cerca del 75 % de los fragmentos dista 500 m o más del vecino más cercano; los humedales ocuparon casi una cuarta parte del valle (Calle et al., 2022, §11.2, con base en CVC 1990, Arcila et al. 2012 y Rivera et al. 2007).

### Plano esquemático

Coordenadas normalizadas: x de occidente (0) a oriente (1); z de norte (0) a sur (1).

```
                      NORTE (Valle del Cauca)
 x=0                                                              x=1
 +----------------------------------------------------------------+
 | rio  | plano del valle: matriz de cana     | pie-  | ladera     | bosque | paramo |
 | Cauca| ciudad, ingenio, finca faro,        | monte | campesina  | andino |        |
 |      | humedal, relictos de bosque seco    |       | F2, F3     |        |        |
 |      |          <---- rio tributario (ref. Amaime) desde el paramo ----   |
 +----------------------- limite departamental (z ~ 0,65) ---------+
 | rio  | plano: consejo comunitario,         | pie-  | ladera:    | bosque | paramo |
 | Cauca| cabecera municipal con mercado      | monte | resguardo  | andino |        |
 +----------------------------------------------------------------+
                      SUR (norte del Cauca)
```

### Zonas y entidades (posiciones iniciales sugeridas)

| Entidad | Tipo | x | z | Notas |
|---|---|---|---|---|
| Río Cauca | río | 0,04 | 0 a 1 | borde occidental |
| Plano del valle | zona | 0,05 a 0,50 | 0 a 1 | matriz de caña en S0 |
| Piedemonte | zona | 0,50 a 0,60 | 0 a 1 | transición |
| Ladera campesina | zona | 0,60 a 0,80 | 0 a 1 | referencia Ayacucho (Palmira), 1.400 a 1.800 m (Romero et al., 2023) |
| Bosque altoandino | zona | 0,80 a 0,92 | 0 a 1 | regulación hídrica |
| Páramo | zona | 0,92 a 1 | 0 a 1 | custodia del agua |
| Río tributario | río | 1 a 0,04 | 0,40 | referencia río Amaime |
| Límite departamental | límite | 0 a 1 | 0,65 | Valle del Cauca y Cauca |
| Ciudad intermedia | asentamiento | 0,22 | 0,30 | consumo, universidad, mercado, colegios |
| Ingenio azucarero | régimen | 0,28 | 0,15 | actor del régimen |
| F1 Finca faro | finca | 0,35 | 0,45 | referencia El Hatico |
| F2 Finca de ladera en sustitución de insumos | finca | 0,68 | 0,35 | referencia Ayacucho |
| F3 Finca de ladera diversificada en red | finca | 0,72 | 0,25 | vende en mercado agroecológico |
| F4 Predio cañero convencional | finca | 0,40 | 0,30 | matriz |
| Humedal relicto | ecosistema | 0,12 | 0,40 | capa histórica |
| Acueducto comunitario | infraestructura | 0,78 | 0,40 | gobernanza del agua |
| Escuela agroecológica | institución | 0,66 | 0,22 | Res. 331, línea 1.2 |
| Resguardo indígena | figura territorial | 0,72 | 0,82 | genérico (decisión D3) |
| Consejo comunitario | figura territorial | 0,18 | 0,85 | genérico (decisión D3) |
| Siete cabeceras con mercado | asentamiento | varias | 0 a 0,65 | al norte del límite; en S2 la red suma cabeceras del sur (referencia: 18 municipios del Valle y 5 del norte del Cauca) |

### Actores

| Actor | Escala | Papel en el escenario |
|---|---|---|
| Familias campesinas de ladera | finca, vereda | prácticas, semillas, mercados |
| Familia propietaria de la finca faro | finca | excelencia predial, difusión vertical |
| Propietarios cañeros y proveedores del ingenio | matriz | régimen |
| Ingenio azucarero | región | régimen sociotécnico y bloqueo |
| Cabildo del resguardo indígena | territorio | gobierno propio, semillas, agua |
| Consejo comunitario afrodescendiente | territorio | gobierno propio, tierra |
| Junta de acción comunal y acueducto comunitario | vereda, cuenca | gobernanza del agua |
| Mercados agroecológicos (siete) | territorio | circuitos cortos |
| Red de mercados (referencia REDMAC) | territorio | articulación, territorio propio |
| Sistema participativo de garantías | territorio | garantía de confianza (sello) |
| Escuelas agroecológicas y de promotoría | vereda, territorio | aprendizaje campesino a campesino |
| Universidad (referencia UNAL Palmira, GIA) | territorio | aliado externo |
| ONG técnica (referencia CIPAV) | región | aliado externo de la finca faro |
| Alcaldía municipal | municipio | recursos, capacitaciones, plan municipal (Res. 331, línea 1.10 y lineamiento 2) |
| Autoridad ambiental regional | cuenca | conservación y agua |
| MADR y ADR | nación | Política 331, IPPTA |
| Colegios con compras públicas | municipio | demanda institucional (Ley 2046 de 2020) |
| Consumidores urbanos | región | demanda, brecha metabólica |

## 3. Escalas de observación

Correspondencia con la lista inicial de Alejandro: suelo (1), planta e interacción de especies (2), finca (3), vereda (4), cuenca (5), territorio (6), departamento (7). Los principios remiten a la tabla 1 de Wezel et al. (2020), con escalas FI (parcela), FA (finca o agroecosistema) y FS (sistema alimentario).

| N.º | Escala | Unidad | Qué se ve | Conceptos | Principios | Fuentes en carpeta |
|---|---|---|---|---|---|---|
| 1 | Suelo | perfil bajo el lote | horizontes, materia orgánica, raíces, hifas, macrofauna | suelo como ecosistema, biota, materia orgánica | 3 (FI) | Gliessman cap. 8; Calle et al. 2022, §11.3 y §11.4 |
| 2 | Planta e interacciones | agroecosistema menor (lote) | policultivo y monocultivo, niveles de organización | interacciones, diversidad, sinergia | 1, 3, 5, 6 (FI) | Gliessman caps. 3 (fig. 3.1), 7, 12, 13 |
| 3 | Finca | agroecosistema mayor | lotes, casa, familia, lindero, conectores | EAP, frontera del agroecosistema, funcionamiento | 1, 2, 4 a 8 (FA) | León-Sicard 2021; Cleves-Leguízamo et al. 2017; Gliessman caps. 3 (fig. 3.7), 15, 16 |
| 4 | Matriz y vereda | matriz de agroecosistemas | cobertura dominante, relictos, corredores, vecindad | conectividad, matriz agroecológica, control biológico, polinización | 5, 6 | León-Sicard 2021; Wezel et al. 2016; Gliessman caps. 14, 18; Calle et al. 2022, §11.2 y §11.6 |
| 5 | Cuenca | unidad hidrológica | ladera, río, páramo, sedimentos, acueducto | agua y sedimentos, conservación de suelos | 12 | Gliessman caps. 8 y 18 (verificar pasajes); Res. 331, línea 2.1 |
| 6 | Territorio | espacio definido por actores | actores, redes, mercados, SPG, semillas, escuelas, figuras territoriales | territorialización, sujeto plural, proximidades, disputa | 8 a 13 (FA, FS) | Wezel et al. 2016; López-García y González de Molina 2021; Levidow et al. 2023; Zollet 2022; López-García et al. 2025 |
| 7 | Región y política | sistema alimentario regional y nacional | relación ciudad y campo, ingenio, compras públicas, política | brecha metabólica, régimen, bloqueo, política pública | 9 a 13 (FS) | Magrini et al.; Padró et al.; Res. 331; Ley 2046; Decreto 1406; Nehring et al. 2026 |

Duarte et al. (2025) muestran que la literatura se divide en tres frentes por escala (finca, comunidad y paisaje, regional y nacional). La botonera de escalas reproduce esa partición y la amplía hacia el suelo.

## 4. Procesos y escala mínima

Fuente de la tabla: RESUMEN-ESTRATEGIA, §5, corrección 2. La última fila se muestra con el mismo peso que las demás.

| Proceso | Por qué la finca no basta | Escala mínima | Representación |
|---|---|---|---|
| Control biológico por conservación | los enemigos naturales requieren hábitat, refugio y presa alternativa fuera del lote | matriz y paisaje | radios de acción desde parches de hábitat que se superponen entre fincas |
| Polinización | rangos de forrajeo y anidación exceden el predio | matriz y paisaje | radios de forrajeo y corredores |
| Ciclos de N y P | no cierran si el sistema exporta alimento a la ciudad (brecha metabólica) | región ciudad y campo | arcos de nutrientes de las fincas a la ciudad, sin retorno en S0 |
| Agua y sedimentos | la unidad hidrológica es la cuenca | cuenca | escorrentía y sedimentos según la cobertura de la ladera |
| Flujo genético y semillas | los sistemas de semillas funcionan en red | territorio, red de custodios | intercambios entre custodios |
| Biota del suelo | cierra en el lote y la finca | lote y finca | corte de suelo con el rótulo «cierra en la finca» |

## 5. Escenarios

Los escenarios son configuraciones alternativas del mismo territorio. La maqueta evita presentarlos como una secuencia lineal obligatoria (López-García et al., 2025, critican los enfoques lineales de cambio acumulativo; Gliessman et al., 2023, cap. 20, advierten que no hay límites nítidos entre niveles).

| Clave | Nombre | Qué se ve | Uso | Referencia |
|---|---|---|---|---|
| S0 | Matriz de monocultivo con finca faro | plano dominado por caña, relictos aislados, finca faro, fincas de ladera en sustitución de insumos, siete mercados sin vínculos | M0 a M3 | situación de partida; 1,33 % del área agrícola en producción alternativa (Res. 331 de 2024, con base en ENA 2019 y MADR-AICD 2023) |
| S1 | Escalamiento sin territorialización | flujos de conocimiento que salen del territorio desde la finca faro; parte de la caña cambia a manejo orgánico sin cambio en la geometría de la matriz | M3 | Calle et al. 2022, §11.7 y §11.8 |
| S2 | Territorialización en red | mercados articulados, SPG, escuelas, semillas en red, territorio de la red que cruza el límite departamental | M4 y M5 | REDMAC (verificar fuentes); Zollet 2022 |
| S3 | Territorio agroecológico | tres dominios de Wezel et al. (2016) activos: prácticas adaptadas, biodiversidad y recursos conservados, sistema alimentario arraigado; gobernanza multiactor y políticas favorables | M6 | escenario de referencia construido para la clase; Wezel et al. 2016; Padró et al.; López-García et al. 2025; Res. 331, objetivo general |

S3 es un escenario de referencia y se rotula así en pantalla. Ningún caso empírico de la carpeta lo representa completo.

## 6. Teoría de cambio

### 6.1 Situación de partida

S0. El aislamiento de la finca agroecológica es estructural. El régimen se autorrefuerza por retornos crecientes de adopción, con cinco mecanismos: aprendizaje por uso, externalidades de red, economías de escala, retornos informacionales crecientes e interrelación tecnológica (Magrini et al., con base en Arthur 1989).

### 6.2 Condiciones

C1 a C8 proceden de los factores de Mier y Terán et al. (2018), según la síntesis de Zollet (2022, §4), que está en la carpeta. C9 y C10 incorporan la dimensión biofísica y de gobernanza de recursos.

| Clave | Condición | Fuente |
|---|---|---|
| C1 | Crisis que motiva la búsqueda de alternativas | Zollet 2022, §4 (1) |
| C2 | Discurso movilizador y liderazgo | Zollet 2022, §4 (1) |
| C3 | Prácticas agroecológicas eficaces | Zollet 2022, §4 (2) |
| C4 | Procesos de enseñanza y aprendizaje constructivistas, de campesino a campesino | Zollet 2022, §4 (2); Res. 331, línea 1.2 |
| C5 | Organización social | Zollet 2022, §4 (3), señalada como uno de los elementos más vitales del escalamiento territorial |
| C6 | Alianzas con actores externos | Zollet 2022, §4 (3) |
| C7 | Mercados favorables y circuitos cortos | Zollet 2022, §4 (3); Levidow et al. 2023, §2.2; Res. 331, lineamiento 3 |
| C8 | Políticas públicas favorables, con compras públicas | Zollet 2022, §4 (3); Ley 2046 de 2020; Res. 331 |
| C9 | Conectividad ecológica entre fincas | León-Sicard 2021 (conexión con la estructura ecológica principal); Res. 331, línea 2.8 |
| C10 | Gobernanza territorial de tierra, agua y semillas | Wezel et al. 2020, principio 12; Decreto 1406 de 2023 (subsistemas de zonas de reserva campesina y de ordenamiento territorial); López-García et al. 2025 |

### 6.3 Supuestos

| Clave | Supuesto | Base |
|---|---|---|
| H1 | La excelencia predial difunde prácticas por canales verticales (visitas, protocolos sectoriales, política nacional) y deja intacta la estructura de la matriz | Calle et al. 2022, §11.7 y §11.8; lectura de la clase |
| H2 | Los mercados alternativos forman territorio cuando la organización social los articula | REDMAC 2009 (verificar fuentes); Zollet 2022 |
| H3 | Los procesos ecológicos supraprediales exigen coordinación entre fincas vecinas | León-Sicard 2021; Wezel et al. 2016; sección 4 |
| H4 | Las políticas favorables tienen efecto territorial cuando combinan producción y consumo | Zollet 2022, §4 (3); Ley 2046 de 2020 |
| H5 | Un instrumento de planificación predial resulta insuficiente para un objetivo territorial | Res. 331, objetivo general y línea 2.2; argumento de la clase |
| H6 | La biota del suelo cierra en la finca | RESUMEN-ESTRATEGIA, §5; Gliessman cap. 8 |
| H7 | Las configuraciones del territorio siguen trayectorias no lineales | López-García et al. 2025; Gliessman et al. 2023, cap. 20 |

### 6.4 Resultados

- Intermedios: R1 red de mercados articulada; R2 garantía participativa en funcionamiento; R3 matriz conectada por corredores; R4 semillas en red de custodios; R5 gobernanza multiactor del sistema alimentario.
- Final: sistema alimentario territorial agroecológico, en los términos del objetivo general de la Res. 331 de 2024 y de los tres dominios con actores de Wezel et al. (2016).

### 6.5 Reglas visuales

Reglas didácticas, editables en `contenido/condiciones.json`. Resumen proposiciones de la literatura citada y carecen de calibración empírica. Se presentan así al jurado.

| Configuración activa | Efecto en la maqueta |
|---|---|
| C3 sola | fincas individuales cambian a mosaico diversificado; el paisaje sigue en S0 (islas) |
| C7 sin C5 | mercados activos y aislados, sin enlaces |
| C5 + C7 + (C4 o C6) | enlaces entre mercados y familias; aparece el polígono del territorio de la red (S2) |
| C8 sin C5 ni C7 | se ilumina una sola finca (IPPTA) y el resto queda igual |
| C9 sin fincas contiguas con C3 | corredor incompleto; los radios de polinizadores no se conectan |
| S2 + C8 + C9 + C10 | S3: corredores continuos, flujos de nutrientes con retorno, compras públicas activas |
| C1 o C2 | rótulos de detonante, sin cambio del paisaje |

Un panel muestra el diagrama de la teoría de cambio (condiciones, supuestos, resultados) sincronizado con los interruptores. Cuando una condición activa no produce efecto territorial, la maqueta indica qué condición falta.

## 7. Lentes de lectura del territorio

Misma maqueta, cuatro lecturas (RESUMEN-ESTRATEGIA, §4). Se usan al cierre de M3.

| Lente | Qué es territorio | Qué resalta la maqueta | Fuentes |
|---|---|---|---|
| ① Sociotécnica francesa | escala de coordinación de actores en torno a un régimen sociotécnico | régimen (ingenio, insumos), nichos (fincas y mercados agroecológicos), arenas de transición | Magrini et al.; Lamine et al. 2023 |
| ② Agronómico-territorial europea | área delimitada con transición en marcha: tres dominios más actores | polígono delimitado y tres dominios | Wezel et al. 2016 y 2020; Lamine et al. 2023; Padró et al. |
| ③ Agroecología política española | esfera de agregación de fuerzas sociales en un sujeto plural | sujeto plural, vínculos urbano y rural, brecha metabólica | López-García y González de Molina 2021; López-García et al. 2025 |
| ④ Territorial latinoamericana | espacio socialmente construido y en disputa | expansión de la matriz frente a territorios campesinos y étnicos; desterritorialización y reterritorialización | Levidow et al. 2023 y autores que cita; Giraldo y Rosset 2018 (falta en carpeta) |

Contraste citado en pantalla: Magrini et al. («es una transición y no una revolución, porque no implica explícitamente la necesidad de otros cambios relativos a los fundamentos capitalistas») frente al título de Giraldo y Rosset (2018), «Agroecology as a territory in dispute: between institutionality and social movements». Verificar la cita textual de Magrini y su página antes de mostrarla.

## 8. Paradas del recorrido

Borrador. Los minutos suman 40. Las paradas marcadas con (s) son saltables si el ensayo excede 36 minutos.

| Id | Momento | Min | Escala | Estado | Contenido | Fuentes |
|---|---|---|---|---|---|---|
| P01 | M0 | 1,5 | territorio | S0 | Ficha de sesión sobre la vista aérea: curso, nivel, resultado de aprendizaje, evaluación, prerrequisitos | Res. 356, art. 11 |
| P02 | M0 | 1,5 | territorio | S0 | Pregunta detonante con datos: 1,33 % del área agrícola en producción alternativa (61.435,70 ha de 4.617.116 ha); 104 escuelas agroecológicas, Cauca 16, Valle 10, Nariño 8 | Res. 331 de 2024 |
| P03 | M1 | 1,5 | planta | S0 | Niveles de organización en cuatro pasos: organismo, población, comunidad, ecosistema (finca en su cuenca) | Gliessman fig. 3.1 |
| P04 | M1 | 1,5 | finca | S0 | Agroecosistema menor (lote) y mayor (finca, con la familia dentro del lindero); frontera según Gliessman y según León-Sicard | León-Sicard 2021, pp. 24 a 26; Gliessman p. 37 |
| P05 | M1 | 1,5 | finca | S0 | EAP: conectores internos y externos, conexión con la estructura ecológica principal; diez criterios en dos grupos | León-Sicard 2021, p. 31 y cap. 3; Cleves-Leguízamo et al. 2017 |
| P06 | M1 | 1,5 | finca | S0 | Finca faro en el plano: 288 ha con silvopastoril (140 ha), caña agroecológica (100 ha), bosque (14 ha), guadual (26 ha), corredores (2 ha), frutales (5 ha) | Calle et al. 2022, §11.1 |
| P07 | M2 | 1,5 | suelo | S0 | Biota del suelo, proceso que cierra en la finca; materia orgánica en caña agroecológica de 2 % a 4 %, referencia del bosque 4,3 % | Gliessman cap. 8; Calle et al. 2022, cap. 11 (localizar sección) |
| P08 | M2 | 1,5 | matriz | S0 | Control biológico y polinización: radios que exceden el predio; enemigos naturales en la finca faro | Gliessman caps. 14 y 18; Calle et al. 2022, §11.6 |
| P09 | M2 | 1,5 | cuenca | S0 | Agua y sedimentos: escorrentía en ladera, sedimento al río, prácticas de conservación (curvas a nivel, barreras vivas, terrazas, infiltración) | Gliessman caps. 8 y 18 (verificar pasajes) |
| P10 | M2 | 1 | región | S0 | Nutrientes de las fincas a la ciudad sin retorno: brecha metabólica | López-García y González de Molina 2021, §4; Padró et al. |
| P11 | M2 | 1 | territorio | S0 | Semillas en red de custodios | Gliessman cap. 11; Res. 331, lineamiento 4 |
| P12 | M2 | 0,5 (s) | territorio | S0 | Síntesis: escala mínima de cada proceso (sección 4) | RESUMEN-ESTRATEGIA, §5 |
| P13 | M3 | 1,5 | territorio | S0 | Límite y sujeto: lindero de la propiedad frente a territorio definido por actores | León-Sicard 2021, p. 24; RESUMEN-ESTRATEGIA, §5 |
| P14 | M3 | 2,5 | territorio | S0 | Cuatro lecturas del territorio (sección 7) | ver sección 7 |
| P15 | M3 | 1 (s) | región | S0 | Bloqueo del régimen: cinco mecanismos sobre el ingenio y la matriz | Magrini et al. |
| P16 | M3 | 1,5 | matriz | capa histórica | El paisaje como registro: 1957, 1986, hoy | Calle et al. 2022, §11.2; León-Sicard 2021, presentación del libro |
| P17 | M3 | 1,5 | territorio | S1 | Escalamiento sin territorialización: 13.732 visitantes de 815 instituciones y 59 países (2005 a 2016); más de 20.000 ha de caña en producción orgánica en el Valle; más del 20 % de la caña de la cuenca baja del Amaime en manejo orgánico | Calle et al. 2022, §11.7 (con base en Murgueitio 2019) |
| P18 | M4 | 1 | territorio | S0 | Siete mercados desarticulados antes de 2009 | REDMAC (verificar fuentes) |
| P19 | M4 | 4 | territorio | actividad | Actividad: ¿qué tuvo que ocurrir para que siete mercados que no se hablaban se volvieran una red? Activación progresiva de condiciones | Zollet 2022; sección 6 |
| P20 | M4 | 1,5 | territorio | S2 | La red desde 2009: cerca de 500 familias, 330 productoras, 23 municipios (18 del Valle y 5 del norte del Cauca); territorio que cruza el límite departamental; SPG con el GIA (proyecto QUIPU 31401001406, 2015) | REDMAC (verificar fuentes); RESUMEN-ESTRATEGIA, §8 y §9 |
| P21 | M4 | 1,5 | territorio | S2 | Sujeto plural y proximidades; circuitos cortos y compras públicas (30 % mínimo) | López-García y González de Molina 2021, §6; Levidow et al. 2023, §2.2; Ley 2046 de 2020 |
| P22 | M5 | 2 | finca | S2 | EAP de tres fincas tipo (valores ilustrativos salvo medición) | León-Sicard 2021, cap. 3 |
| P23 | M5 | 1,5 (s) | finca | S2 | MESMIS en Ayacucho y TAPE (CAET, diez elementos) | Romero et al. 2023 (falta en carpeta); Mottet et al. 2020 |
| P24 | M5 | 1,5 | territorio | S2 | Quién mide: el registro de iniciativas implicaba acceso a internet; en Amazonas, Guainía, San Andrés y Providencia y Vaupés no se registraron procesos, «debido, posiblemente, a la carencia de conectividad a internet y/o información, y no por falta de procesos agroecológicos»; líneas 1.1 y 1.6 de la política | Res. 331 de 2024 (con base en MADR-FAO 2024a) |
| P25 | M6 | 1,5 | territorio y finca | S3 | Objetivo territorial, instrumento predial: horizonte territorial de la política y, sobre él, el IPPTA iluminando una sola finca | Res. 331, objetivo general y línea 2.2 |
| P26 | M6 | 1,5 | territorio | S3 | Tarea auténtica y retorno a la pregunta detonante | RESUMEN-ESTRATEGIA, §11 |

Texto de la tarea auténtica (RESUMEN-ESTRATEGIA, §11): «Elijan un territorio. Diagnostiquen en qué nivel está su sistema productivo dominante, identifiquen qué mecanismo de territorialización está ausente, y propongan un instrumento de la Política 0331 que lo active. Dos páginas + defensa oral de 5 minutos.»

## 9. Términos fijos

| Término | Uso |
|---|---|
| agroecosistema menor | lote o cultivo, mínima unidad conmensurable (León-Sicard 2021) |
| agroecosistema mayor | finca, unidad ambiental con lindero de propiedad privada o comunal (León-Sicard 2021) |
| matriz de agroecosistemas | cobertura dominante del paisaje (León-Sicard 2021) |
| Estructura Agroecológica Principal (EAP) | configuración espacial de la agrobiodiversidad y su conectividad (León-Sicard 2021, p. 31) |
| estructura ecológica principal (EEP) | estructura del paisaje con la que conecta la finca |
| escalamiento | expansión vertical, institucional o sectorial |
| masificación | término de la Res. 331 de 2024 |
| amplificación | expansión horizontal entre pares |
| territorialización | arraigo y disputa de la transición en un territorio |
| sistema agroalimentario, redes | términos de la clase; nunca «cadena de valor» |
| actores | término general; nunca «stakeholders» |
| campesinado | sujeto de derechos (Acto Legislativo 01 de 2023, verificar texto) |
| circuitos cortos de comercialización | definición de la Ley 2046 de 2020 |
| sistema participativo de garantías (SPG) | garantía de confianza; equivale al «sello» de la idea inicial |
| figuras territoriales | resguardo indígena, consejo comunitario, zona de reserva campesina, reserva natural de la sociedad civil |

## 10. Precauciones de contenido

1. El contraste entre finca y territorio se plantea por el límite y el sujeto de decisión. El agroecosistema mayor ya contiene poder, mercado y política pública (León-Sicard 2021, p. 24).
2. La biota del suelo cierra en la finca. Afirmar que todo proceso exige territorio es un error que un jurado de biología detecta.
3. El Hatico es isla en el paisaje y tiene influencia documentada en otras escalas (Calle et al. 2022, §11.7 y §11.8), incluida la conversión de más de 20.000 ha de caña a producción orgánica. La maqueta muestra esa influencia como escalamiento vertical y sustitución de insumos dentro de la matriz. Mostrarla sin efecto sería inexacto.
4. El Decreto 1406 de 2023 reglamenta el Sistema Nacional de Reforma Agraria y Desarrollo Rural (zonas de reserva campesina, ordenamiento territorial). No trata las APPA. Para las APPA, el paquete de correcciones del componente escrito remite a la Ley 2294 de 2023, art. 32 (verificar en el texto de la ley, que no está en la carpeta).
5. El SPG del GIA con REDMAC (QUIPU 31401001406, 2015) es un antecedente que se cita como tal.
6. La advertencia sobre la linealidad de los niveles la formuló el propio Gliessman (cap. 20). El conteo de palabras de su libro no aparece en la maqueta.
7. Los territorios étnicos se representan por sus figuras de gobierno propio y con fuente. Sin rasgos folclóricos ni figuras humanas estereotipadas.
8. Los valores de índices llevan fuente o el rótulo «valores ilustrativos».
9. Los datos de REDMAC provienen de fuentes en línea consultadas en septiembre de 2026 (RESUMEN-prueba-oral, nota final). Deben quedar citados antes de la prueba.
10. Biología del suelo en la tradición de Palmira: citar Sánchez de Prager (2018), *Aportes de la biología del suelo a la agroecología* (RESUMEN-prueba-oral, §8).

## 11. Fuentes

| Clave | Referencia abreviada | Archivo (desde el proyecto) | Estado |
|---|---|---|---|
| res356 | Resolución 356 de 2026, FCA, UNAL Palmira | `../Agroecologia resolucion.pdf` | en carpeta |
| res331 | Resolución 000331 de 2024, MADR, Política Pública de Agroecología | `../Normative/RESOLUCION_No._000331_de_2024_15_12_2024.pdf` | en carpeta |
| ley2046 | Ley 2046 de 2020 | `../Normative/Ley 2046 de 2020.pdf` | en carpeta |
| dec1406 | Decreto 1406 de 2023 | `../Normative/Decreto_1406_de_2023.pdf` | en carpeta |
| gliessman | Gliessman et al. (2023), *Agroecology*, 4.ª ed. | `../Agroecologia_Grafo/raw/cap-NN-*.md` | en carpeta |
| leonsicard | León-Sicard (2021), *La Estructura Agroecológica Principal de los agroecosistemas* | `../../Libros completos/LeonSicard-21-EAP-agroecosistemas.pdf`; versión condensada en `../Transition/` | en carpeta |
| cleves | Cleves-Leguízamo et al. (2017), *Rev. Col. Cienc. Hortícolas* 11(2) | `../EAPnovedosaherramientaplanificacion.pdf` | en carpeta |
| calle | Calle et al. (2022), cap. 11, en Montagnini (ed.), *Biodiversity Islands* | `../Transition/M1. capitulo_11_el_hatico.md`; libro en `../../Libros completos/978-3-030-92234-4.pdf` | en carpeta |
| wezel2016 | Wezel et al. (2016), *Agroecology territories* | `../Transition/AgroecologyTerritoryWezeletal2016.md` | en carpeta |
| wezel2020 | Wezel et al. (2020), *Agroecological principles and elements* | `../Transition/Agroecological_principles_review.md` | en carpeta |
| magrini | Magrini et al., *Agroecological transition from farms to territorialised agri-food systems* | `../Transition/Agroecological Transition from Farms.md` | en carpeta; año por verificar |
| lopezgdm | López-García y González de Molina (2021), *Sustainability* 13 | `../Transition/An Operational Approach to Agroecology-Based Local.md` | en carpeta |
| lopez2025 | López-García et al. (2025), *Agroecology and Sustainable Food Systems* 49(7) | `../Transition/what_is_transformative_in_participatory_approaches_to_territorial_agroecological_transitions.md` | en carpeta |
| levidow | Levidow, Sansolo y Schiavinatto (2023), *Land* 12 | `../Transition/ Territorialising Local Food Systems .md` | en carpeta |
| zollet | Zollet (2022), *Journal of Rural Problems* 58(1) | `../Transition/Territorial Scaling of Agroecology.md` | en carpeta |
| duarte | Duarte et al. (2025), *Agroecology and Sustainable Food Systems* 49(6) | `../Transition/territorial_embeddedness_of_sustainable_agri_food_systems_a_systematic_review.md` | en carpeta |
| padro | Padró et al., modelo SAFRA | `../Transition/Modelling the Scaling Up of Sustainable Farming .md` | en carpeta; año por verificar |
| nehring | Nehring et al. (2026) | `../Transition/Power, policy, and practice.md` | en carpeta |
| mottet | Mottet et al. (2020), TAPE | `../Transition/Assessing Transitions to Sustainable Agricultural.md` | en carpeta |
| lamine | Lamine et al. (2023) | `../Transition/Italian_biodistricts_and_French_territorial_food_p.md` | en carpeta |
| stone | Stone et al. (2025), *Agroecology Living Labs* | `../Transition/Agroecology_Living_Labs_review.md` | en carpeta |
| resumenes | Resúmenes de estrategia de la prueba oral | `../RESUMEN-prueba-oral.md`; `../RESUMEN-ESTRATEGIA-PRUEBA-ORAL.md` | en carpeta |
| mieryteran | Mier y Terán et al. (2018) | se usa vía Zollet (2022) | falta |
| giraldorosset | Giraldo y Rosset (2018) | | falta |
| anderson | Anderson et al. (2019), dominios de transformación | | falta |
| leonsicard2015 | León-Sicard et al. (2015), historia de la agroecología en Colombia | | falta |
| sanchezprager | Sánchez de Prager (2018) | | falta |
| romero | Romero et al. (2023), MESMIS en Ayacucho | | falta |
| redmac | Fuentes sobre REDMAC | | falta |
| ley2294 | Ley 2294 de 2023, art. 32 (APPA) | | falta |
| al012023 | Acto Legislativo 01 de 2023 | | falta |

## 12. Decisiones pendientes

Responder antes de la etapa 1. Sin respuesta, Claude Code aplica la opción recomendada y lo registra en la bitácora.

| Clave | Decisión | Opción recomendada |
|---|---|---|
| D1 | Territorio | esquemático inspirado en la cuenca del río Amaime y el norte del Cauca; relieve real como etapa opcional O1 |
| D2 | Nombres reales en pantalla (El Hatico, REDMAC, MercUN, Ayacucho) | sí, como referencias rotuladas «esquema sin escala» |
| D3 | Territorios étnicos | figuras genéricas hasta contar con fuente |
| D4 | Curso hipotético y resultado de aprendizaje de la ficha de sesión | redactar con Alejandro en la etapa 1 |
| D5 | Estilo visual | realismo de maqueta en bloque recortado (cambio del 2026-11-04, etapa 5.b; antes «maqueta estilizada») |
| D6 | Número de paradas | 26; recortar las saltables si el ensayo excede 36 minutos |
| D7 | Fecha y plataforma de la prueba | registrar en la bitácora al recibir la notificación |
