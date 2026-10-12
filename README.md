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
| 10 | | | |

## Objetivo
Completar una aplicación frontend que consuma Frankfurter API para convertir divisas y demostrar comprensión de eventos, DOM, `fetch()`, JSON, asincronía, validación y manejo de errores.

## Ejecución
1. Descomprime el proyecto.
2. Abre la carpeta en VS Code.
3. Ejecuta `index.html` con Live Server o un servidor local equivalente.
4. Abre DevTools → Console y Network para observar el comportamiento.

## API
Endpoint de referencia:
`https://api.frankfurter.dev/v2/rate/{origen}/{destino}`

## Decisiones técnicas
Registra aquí al menos dos decisiones tomadas por la pareja y explica por qué.

1. Misión 05: usamos `Intl.NumberFormat` para formatear los montos en lugar de sólo `toFixed(2)`, porque agrega separador de miles (2,041.00) y respeta los decimales de cada moneda (el yen no usa decimales).
2. Misión 07: validamos la cantidad antes del `fetch()` para no hacer peticiones innecesarias a la API, y usamos `cantidad.validity.badInput` porque un `<input type="number">` devuelve `""` cuando el texto escrito no es un número, así podemos distinguir "vacío" de "no válido".
3. Misión 09: separamos la consulta en `obtenerTasa()` y le pusimos un límite de 10 segundos con `AbortController`, porque `fetch()` no tiene tiempo límite y, sin él, los controles deshabilitados en la Misión 08 se quedarían bloqueados si la red no responde. Además revisamos `response.ok`, ya que `fetch()` no lanza error ante un 404 o 500.

## Revisión cruzada
- Aspecto bien resuelto:
- Error o comportamiento mejorable:
- Propuesta de mejora:
- Cambio incorporado después de la revisión:

## Reflexión final (150–200 palabras)
Explica el principal aprendizaje técnico, una dificultad relevante y una decisión que haya surgido del trabajo Driver/Navigator.
