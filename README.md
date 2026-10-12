# Currency Explorer · Starter Project

## Integrantes
- Estudiante A: Christian Raul Paramo Bautista 
- Estudiante B: Pablo Alexander Alejos Macias

## Pair Programming
| Misión | Driver | Navigator | Commit / evidencia |
|---|---|---|---|
| 04 | Christian | Alex | Selección dinámica de monedas mediante origen.value y destino.value. |
| 05 | Pablo | Christian | Conversión completa: cálculo separado en funciones y resultado formateado con Intl.NumberFormat. |
| 06 | Christian | Pablo | Intercambio de monedas y recalculo |
| 07 | Pablo | Christian | Validación completa: vacío, no numérico, cero y negativo, con mensajes específicos y sin consultar la API. |
| 08 | Christian | Pablo | Estado de carga, controles deshabilitados y restauración con finally  |
| 09 | Pablo | Christian | Manejo de errores: response.ok, límite de 10 s con AbortController y mensaje claro según el tipo de fallo. |
| 10 | Christian | Pablo | Diseño responsive para movil y escritorio |
| 11 | Pablo | Christian | Histórico: serie temporal con /v2/rates, gráfica de línea en SVG con tooltip y resumen de variación por periodo. |

## Objetivo
Completar una aplicación frontend que consuma Frankfurter API para convertir divisas y demostrar comprensión de eventos, DOM, `fetch()`, JSON, asincronía, validación y manejo de errores.

## Funcionalidades
| Funcionalidad | Descripción | Misión |
|---|---|---|
| Conversión de divisas | Convierte la cantidad entre EUR, USD, MXN, GBP y JPY con el tipo de cambio real de Frankfurter API. | 01–04 |
| Resultado formateado | Muestra el monto con separador de miles y los decimales de cada moneda (el yen sin decimales), además de la tasa y su fecha. | 05 |
| Intercambio de monedas ⇄ | Invierte origen y destino y vuelve a calcular automáticamente. | 06 |
| Validación de la cantidad | Detecta cantidad vacía, no numérica, cero o negativa; muestra un mensaje específico, marca el campo en rojo y no consulta la API. | 07 |
| Estado de carga | Muestra "Consultando..." y deshabilita los controles mientras llega la respuesta. | 08 |
| Manejo de errores | Comprueba `response.ok`, cancela la consulta después de 10 segundos y muestra un mensaje claro según el fallo (sin conexión, tiempo agotado, moneda inválida, demasiadas consultas, error del servidor o respuesta inválida). | 09 |
| Diseño responsive | Se adapta a celular, tablet y escritorio; en pantallas pequeñas los selectores se acomodan uno debajo del otro. | 10 |
| Histórico con gráfica | Después de convertir muestra la evolución del tipo de cambio en 7 días, 30 días, 90 días o 1 año, con gráfica de línea, tooltip y resumen de variación, mínimo y máximo. | 11 |

## Ejecución
Requisitos

1. Navegador web actualizado.
2. Conexión a internet.
3. Visual Studio Code, recomendado.
4. Extensión Live Server o servidor local equivalente.

Instrucciones

1. Clonar el repositorio:

git clone https://github.com/Shinon16/Pair-Programming.git

2. Abrir la carpeta Pair-Programming en Visual Studio Code.
3. Abrir index.html utilizando Live Server.
4. Ingresar una cantidad mayor que cero.
5. Seleccionar las monedas de origen y destino.
6. Presionar Convertir para obtener el resultado.
7. Utilizar el botón de intercambio para invertir las monedas cuando sea necesario.
8. Para observar la comunicación con la API, abrir las herramientas de desarrollador del navegador mediante F12 y acceder a las pestañas Console y Network.
9. Después de convertir aparece la sección Histórico: elegir 7 días, 30 días, 90 días o 1 año y pasar el cursor sobre la gráfica para ver la tasa de cada fecha.

## API
Endpoint de referencia:
`https://api.frankfurter.dev/v2/rate/{origen}/{destino}`

## Decisiones técnicas
Registra aquí al menos dos decisiones tomadas por la pareja y explica por qué.

1. Misión 04 – Selección dinámica de monedas: decidimos utilizar origen.value y destino.value para obtener las monedas seleccionadas por el usuario, en lugar de mantener valores fijos. Esto permite construir dinámicamente la URL de la API y realizar conversiones entre diferentes divisas sin modificar el código.
2. Misión 05: usamos `Intl.NumberFormat` para formatear los montos en lugar de sólo `toFixed(2)`, porque agrega separador de miles (2,041.00) y respeta los decimales de cada moneda (el yen no usa decimales).
3. Misión 06 – Intercambio de monedas: utilizamos una variable temporal para intercambiar los valores de los selectores y llamamos nuevamente a convertirMoneda(). De esta manera, el resultado se actualiza automáticamente sin necesidad de presionar otra vez el botón Convertir.
4. Misión 07: validamos la cantidad antes del `fetch()` para no hacer peticiones innecesarias a la API, y usamos `cantidad.validity.badInput` porque un `<input type="number">` devuelve `""` cuando el texto escrito no es un número, así podemos distinguir "vacío" de "no válido".
5. Misión 08 – Estado de carga: implementamos la función establecerCarga() para mostrar el mensaje "Consultando..." y deshabilitar temporalmente los controles mientras se realiza la solicitud. Utilizamos finally para asegurar que los controles vuelvan a habilitarse, incluso cuando ocurre un error.
6. Misión 09: separamos la consulta en `obtenerTasa()` y le pusimos un límite de 10 segundos con `AbortController`, porque `fetch()` no tiene tiempo límite y, sin él, los controles deshabilitados en la Misión 08 se quedarían bloqueados si la red no responde. Además revisamos `response.ok`, ya que `fetch()` no lanza error ante un 404 o 500.
7. Misión 10 – Diseño responsive: utilizamos CSS Grid y media queries para adaptar la interfaz a diferentes dispositivos. Decidimos organizar los selectores horizontalmente en computadoras y verticalmente en celulares, mejorando la visualización y facilidad de uso sin modificar la lógica JavaScript.
8. Misión 11 – Histórico: dibujamos la gráfica con SVG y JavaScript puro en lugar de usar una librería como Chart.js, para mantener el proyecto en HTML, CSS y JavaScript Vanilla y poder explicar cada parte (escalas, línea, área y tooltip). Para el periodo de 1 año pedimos `group=week`, un punto por semana, para no traer ~365 puntos que no aportan a la gráfica. Además reutilizamos `consultarAPI()` y `describirError()` de la Misión 09, así el histórico tiene el mismo límite de tiempo y los mismos mensajes de error.

## Revisión cruzada
- Aspecto bien resuelto:
La aplicación integra correctamente la selección dinámica de monedas, el consumo de una API pública y el cálculo de conversiones. La separación de responsabilidades entre funciones JavaScript facilita comprender y revisar el código.

- Error o comportamiento mejorable:
Durante la revisión se identificó que las solicitudes a la API podían tardar demasiado o presentar errores, lo que podía generar incertidumbre para el usuario. También se observó que la disposición horizontal de los selectores no era la más adecuada para pantallas pequeñas.

- Propuesta de mejora:
Implementar un límite de tiempo para las solicitudes, mensajes de error específicos y controles deshabilitados durante la consulta. Asimismo, mejorar la distribución de los elementos mediante media queries para facilitar el uso desde dispositivos móviles.

- Cambio incorporado después de la revisión:
Se implementó AbortController con un límite de espera de 10 segundos, se mejoró el manejo de errores mediante response.ok y se incorporaron mensajes específicos para diferentes fallos. Además, se ajustó el diseño responsive para presentar los selectores verticalmente en pantallas pequeñas y mejorar la visualización de los resultados.

## Reflexión final (150–200 palabras)
Christian: Durante el desarrollo de Currency Explorer aprendimos cómo una aplicación web puede consumir información de una API pública y utilizarla para realizar operaciones en tiempo real. Comprendimos el funcionamiento de fetch(), async/await y la interpretación de respuestas JSON, así como la importancia de actualizar el DOM para mostrar información sin recargar la página. También reforzamos nuestros conocimientos sobre validaciones, manejo de errores y diseño responsive.

Una de las principales dificultades fue asegurar que la aplicación respondiera correctamente ante diferentes situaciones, como cantidades inválidas, problemas de conexión o respuestas inesperadas de la API. Para resolverlo, implementamos validaciones antes de realizar las solicitudes y mejoramos el manejo de errores mediante funciones específicas.

El trabajo mediante Pair Programming nos permitió compartir conocimientos y revisar nuestras decisiones constantemente. Al alternar los roles de Driver y Navigator, ambos participamos en la programación, las pruebas y la identificación de mejoras. Una decisión importante fue separar la lógica de consulta de la API del cálculo y la presentación de resultados, facilitando el mantenimiento del código y la comprensión de su funcionamiento.

Pablo: Mi principal aprendizaje técnico fue entender que fetch() sólo falla cuando no hay red: un 404 o un 422 llegan como respuestas "normales", por lo que es necesario revisar response.ok antes de usar los datos. También aprendí a presentar la información de forma clara con Intl.NumberFormat, a validar lo que escribe el usuario antes de consultar la API y a dibujar una gráfica en SVG a partir del arreglo que regresa la serie histórica.

La dificultad más relevante fue el manejo de errores. Al principio, si la moneda no era válida la aplicación mostraba NaN, y si la red no respondía la consulta podía quedarse esperando indefinidamente. Lo resolvimos separando la consulta en una función con un límite de 10 segundos y con mensajes distintos según el tipo de fallo.

Esa decisión surgió del trabajo Driver/Navigator: al revisar como Navigator la Misión 08 de Christian, notamos que los controles se deshabilitaban durante la consulta, por lo que sin un límite de tiempo podían quedarse bloqueados. Por eso, en la Misión 09 agregamos AbortController y después reutilizamos esa misma función en el histórico.
