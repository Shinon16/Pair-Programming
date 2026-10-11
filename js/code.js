// ============================================================
// CURRENCY EXPLORER · STARTER PROJECT
// Archivo principal de trabajo para las misiones de JavaScript
// ============================================================

// 1. REFERENCIAS AL DOM
const cantidad = document.querySelector("#cantidad");
const origen = document.querySelector("#origen");
const destino = document.querySelector("#destino");
const btnConvertir = document.querySelector("#convertir");
const btnIntercambiar = document.querySelector("#intercambiar");
const resultado = document.querySelector("#resultado");
const resultadoTexto = document.querySelector("#resultadoTexto");
const detalleTasa = document.querySelector("#detalleTasa");

// 2. EVENTOS
btnConvertir.addEventListener("click", convertirMoneda);
btnIntercambiar.addEventListener("click", intercambiarMonedas);

// 3. FUNCIÓN PRINCIPAL
async function convertirMoneda() {
  // Misiones guiadas 1-3: ya existe un flujo mínimo funcional EUR -> USD.
  // A partir de la Misión 4 debes convertirlo en una solución dinámica.

  const valor = Number(cantidad.value);

  // TODO · MISIÓN 07: sustituir esta validación mínima por una validación completa.
  if (!Number.isFinite(valor) || valor <= 0) {
    mostrarError("Escribe una cantidad mayor que cero.");
    return;
  }

  // TODO · MISIÓN 04: reemplazar EUR y USD por los valores elegidos en los <select>.
  const monedaOrigen = origen.value;
  const monedaDestino = destino.value;

  const url = `https://api.frankfurter.dev/v2/rate/${monedaOrigen}/${monedaDestino}`;

  try {
    // TODO · MISIÓN 08: activar un estado visual de carga antes de consultar.
    const respuesta = await fetch(url);

    // TODO · MISIÓN 09: comprobar response.ok y lanzar un error si corresponde.
    const datos = await respuesta.json();

    // MISIÓN 05: conversión completa (cantidad + tasa + resultado formateado).
    const conversion = calcularConversion(valor, datos.rate);
    mostrarResultado(valor, conversion, monedaOrigen, monedaDestino, datos);

  } catch (error) {
    // TODO · MISIÓN 09: mejora el mensaje y analiza qué errores pueden llegar aquí.
    mostrarError("No fue posible completar la consulta.");
    console.error(error);
  }
}

// MISIÓN 05: el cálculo vive en su propia función para poder entenderlo,
// probarlo y reutilizarlo (por ejemplo, al recalcular en la Misión 06).
function calcularConversion(valor, tasa) {
  return valor * tasa;
}

function intercambiarMonedas() {
  // TODO · MISIÓN 06:
  // 1) guardar temporalmente el valor de origen
  // 2) intercambiar origen.value y destino.value
  // 3) volver a calcular
  mostrarError("Misión 06 pendiente: implementa el intercambio de monedas.");
}

// 4. UTILIDADES DE INTERFAZ
function mostrarError(mensaje) {
  resultado.classList.add("error");
  resultadoTexto.textContent = mensaje;
  detalleTasa.textContent = "Revisa los datos e inténtalo nuevamente.";
}

// MISIÓN 05: muestra en el DOM el resultado ya formateado.
function mostrarResultado(valor, conversion, monedaOrigen, monedaDestino, datos) {
  resultado.classList.remove("error");
  resultadoTexto.textContent =
    `${formatearMonto(valor, monedaOrigen)} = ${formatearMonto(conversion, monedaDestino)}`;
  detalleTasa.textContent =
    `1 ${monedaOrigen} = ${datos.rate} ${monedaDestino} · Tasa del ${formatearFecha(datos.date)} (Frankfurter)`;
}

// MISIÓN 05: agrega separador de miles y usa los decimales propios de cada
// moneda (EUR, USD, MXN y GBP usan 2; JPY usa 0).
function formatearMonto(monto, moneda) {
  const decimales = new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda })
    .resolvedOptions().maximumFractionDigits;

  const numero = new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(monto);

  return `${numero} ${moneda}`;
}

// MISIÓN 05: convierte la fecha de la API ("AAAA-MM-DD") a "DD/MM/AAAA".
function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

// PISTA PARA EL RETO:
// origen.value        -> moneda seleccionada como origen
// destino.value       -> moneda seleccionada como destino
// cantidad.value      -> texto escrito en el input
// Number(...)         -> convierte texto a número
// response.ok         -> indica si la respuesta HTTP fue satisfactoria
// resultado.textContent -> permite modificar texto del DOM
