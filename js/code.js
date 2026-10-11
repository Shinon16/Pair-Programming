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

// MISIÓN 07: al volver a escribir, el campo deja de marcarse como inválido.
cantidad.addEventListener("input", () => marcarCantidadInvalida(false));

// 3. FUNCIÓN PRINCIPAL
async function convertirMoneda() {
  // Misiones guiadas 1-3: ya existe un flujo mínimo funcional EUR -> USD.
  // A partir de la Misión 4 debes convertirlo en una solución dinámica.

  // MISIÓN 07: validación completa antes de consultar la API.
  // Si la cantidad no es válida se muestra el motivo y no se hace el fetch().
  const validacion = validarCantidad();

  if (validacion.error) {
    marcarCantidadInvalida(true);
    mostrarError(validacion.error);
    return;
  }

  marcarCantidadInvalida(false);
  const valor = validacion.valor;

  // TODO · MISIÓN 04: reemplazar EUR y USD por los valores elegidos en los <select>.
  const monedaOrigen = origen.value;
  const monedaDestino = destino.value;

  const url = `https://api.frankfurter.dev/v2/rate/${monedaOrigen}/${monedaDestino}`;

  try {
  // MISIÓN 08: activar el estado de carga antes de consultar la API.
    establecerCarga(true);

    const respuesta = await fetch(url);

    // TODO · MISIÓN 09: comprobar response.ok y lanzar un error si corresponde.
    const datos = await respuesta.json();

    // MISIÓN 05: conversión completa.
    const conversion = calcularConversion(valor, datos.rate);
    mostrarResultado(valor, conversion, monedaOrigen, monedaDestino, datos);

  } catch (error) {
    // TODO · MISIÓN 09: mejorar el manejo de errores.
    mostrarError("No fue posible completar la consulta.");
    console.error(error);

  } finally {
    // MISIÓN 08: restaurar los controles cuando termine la consulta.
    establecerCarga(false);
  }
}

// MISIÓN 05: el cálculo vive en su propia función para poder entenderlo,
// probarlo y reutilizarlo (por ejemplo, al recalcular en la Misión 06).
function calcularConversion(valor, tasa) {
  return valor * tasa;
}

// MISIÓN 07: revisa la cantidad escrita y regresa { valor } si es válida
// o { error } con un mensaje específico si no lo es.
function validarCantidad() {
  // Un <input type="number"> deja .value vacío cuando el texto no es un número
  // (por ejemplo "1e" o "--5"); validity.badInput permite distinguir ese caso.
  if (cantidad.validity.badInput) {
    return { error: "La cantidad no es un número válido." };
  }

  const texto = cantidad.value.trim();

  if (texto === "") {
    return { error: "Escribe una cantidad para convertir." };
  }

  const valor = Number(texto);

  if (!Number.isFinite(valor)) {
    return { error: "La cantidad no es un número válido." };
  }

  if (valor === 0) {
    return { error: "La cantidad debe ser mayor que cero." };
  }

  if (valor < 0) {
    return { error: "No se permiten cantidades negativas." };
  }

  return { valor };
}

function intercambiarMonedas() {
  // Guardamos temporalmente la moneda de origen
  const monedaTemporal = origen.value;

  // Intercambiamos los valores de los selectores
  origen.value = destino.value;
  destino.value = monedaTemporal;

  // Realizamos nuevamente la conversión
  convertirMoneda();
}

// 4. UTILIDADES DE INTERFAZ
function mostrarError(mensaje) {
  resultado.classList.add("error");
  resultadoTexto.textContent = mensaje;
  detalleTasa.textContent = "Revisa los datos e inténtalo nuevamente.";
}

// MISIÓN 07: marca (o desmarca) el campo de cantidad como inválido.
function marcarCantidadInvalida(invalida) {
  cantidad.classList.toggle("invalido", invalida);
  cantidad.setAttribute("aria-invalid", String(invalida));
}

// MISIÓN 08: controla el estado de carga de la aplicación.
function establecerCarga(cargando) {

  // Deshabilitar botones mientras se consulta la API.
  btnConvertir.disabled = cargando;
  btnIntercambiar.disabled = cargando;

  // Deshabilitar temporalmente los campos.
  cantidad.disabled = cargando;
  origen.disabled = cargando;
  destino.disabled = cargando;

  // Mostrar un mensaje mientras esperamos la respuesta.
  if (cargando) {
    resultado.classList.remove("error");

    resultadoTexto.textContent = "Consultando...";

    detalleTasa.textContent =
      "Obteniendo el tipo de cambio actualizado.";
  }
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
