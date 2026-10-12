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

  try {
  // MISIÓN 08: activar el estado de carga antes de consultar la API.
    establecerCarga(true);

    // MISIÓN 09: obtenerTasa() hace la petición, comprueba response.ok y
    // valida el JSON; si algo falla lanza un error que llega al catch.
    const datos = await obtenerTasa(monedaOrigen, monedaDestino);

    // MISIÓN 05: conversión completa.
    const conversion = calcularConversion(valor, datos.rate);
    mostrarResultado(valor, conversion, monedaOrigen, monedaDestino, datos);

  } catch (error) {
    // MISIÓN 09: cada tipo de fallo muestra un mensaje distinto y la interfaz
    // se recupera (el finally de la Misión 08 vuelve a habilitar los controles).
    const fallo = describirError(error);
    mostrarError(fallo.mensaje, fallo.detalle);
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

// MISIÓN 09: tiempo máximo de espera de la API (en milisegundos).
const TIEMPO_LIMITE_MS = 10000;

// MISIÓN 09: consulta la API y regresa los datos sólo si la respuesta es correcta.
// Si cambiáramos Frankfurter por otra API, ésta sería la función a modificar.
async function obtenerTasa(monedaOrigen, monedaDestino) {
  const url = `https://api.frankfurter.dev/v2/rate/${monedaOrigen}/${monedaDestino}`;

  // AbortController cancela la petición si tarda más del límite; así los
  // controles que deshabilita la Misión 08 no se quedan bloqueados.
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_LIMITE_MS);

  try {
    const respuesta = await fetch(url, { signal: controlador.signal });

    // fetch() sólo falla cuando no hay red; un 404 o un 500 llegan como una
    // respuesta "normal", por eso hay que revisar response.ok.
    if (!respuesta.ok) {
      const error = new Error(`La API respondió con el código HTTP ${respuesta.status}`);
      error.status = respuesta.status;
      throw error;
    }

    // response.json() lanza SyntaxError si el cuerpo no es JSON válido.
    const datos = await respuesta.json();

    if (!Number.isFinite(datos.rate)) {
      throw new SyntaxError("La respuesta no contiene una tasa válida.");
    }

    return datos;

  } finally {
    clearTimeout(temporizador);
  }
}

// MISIÓN 09: traduce el error técnico a un mensaje claro para el usuario.
function describirError(error) {
  if (error.name === "AbortError") {
    return { mensaje: "La consulta tardó demasiado.", detalle: "El servicio no respondió a tiempo. Inténtalo de nuevo." };
  }

  if (error.status === 404 || error.status === 422) {
    return { mensaje: "La moneda seleccionada no es válida o no está disponible.", detalle: "Elige otra combinación de monedas." };
  }

  if (error.status === 429) {
    return { mensaje: "Demasiadas consultas seguidas.", detalle: "Espera un momento antes de volver a convertir." };
  }

  if (error.status >= 500) {
    return { mensaje: "El servicio de tipos de cambio no está disponible por ahora.", detalle: "Inténtalo más tarde." };
  }

  if (error.status) {
    return { mensaje: `La API respondió con un error (código ${error.status}).`, detalle: "Inténtalo de nuevo." };
  }

  if (error instanceof SyntaxError) {
    return { mensaje: "La respuesta del servicio no tiene el formato esperado.", detalle: "Inténtalo de nuevo más tarde." };
  }

  // fetch() lanza TypeError cuando no hay internet o no se alcanza el servidor.
  if (error instanceof TypeError) {
    return { mensaje: "No hay conexión con el servicio de tipos de cambio.", detalle: "Revisa tu conexión a internet e inténtalo de nuevo." };
  }

  return { mensaje: "No fue posible completar la consulta.", detalle: "Ocurrió un error inesperado. Inténtalo de nuevo." };
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
// MISIÓN 09: "detalle" es opcional; si no se envía se usa el texto de siempre.
function mostrarError(mensaje, detalle = "Revisa los datos e inténtalo nuevamente.") {
  resultado.classList.add("error");
  resultadoTexto.textContent = mensaje;
  detalleTasa.textContent = detalle;
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
