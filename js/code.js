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

// MISIÓN 11: referencias de la sección de histórico.
const historico = document.querySelector("#historico");
const historicoResumen = document.querySelector("#historicoResumen");
const grafica = document.querySelector("#grafica");
const botonesPeriodo = document.querySelectorAll(".period");

// MISIÓN 11: estado del histórico.
let diasHistorico = 30;      // periodo elegido (7, 30, 90 o 365 días)
let parHistorico = null;     // { origen, destino } de la última conversión exitosa
let ultimaSerie = null;      // última serie dibujada (para redibujar al cambiar el tamaño)
let contadorHistorico = 0;   // identifica la consulta más reciente

// 2. EVENTOS
btnConvertir.addEventListener("click", convertirMoneda);
btnIntercambiar.addEventListener("click", intercambiarMonedas);

// MISIÓN 07: al volver a escribir, el campo deja de marcarse como inválido.
cantidad.addEventListener("input", () => marcarCantidadInvalida(false));

// MISIÓN 11: cada botón de periodo vuelve a cargar el histórico.
botonesPeriodo.forEach((boton) => {
  boton.addEventListener("click", () => {
    diasHistorico = Number(boton.dataset.dias);
    marcarPeriodoActivo();
    cargarHistorico();
  });
});

// MISIÓN 11: la gráfica se redibuja con el nuevo ancho (por ejemplo, al girar el celular).
window.addEventListener("resize", () => {
  if (ultimaSerie) {
    dibujarGrafica(ultimaSerie.serie, ultimaSerie.monedaDestino);
  }
});

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

    // MISIÓN 11: con la conversión lista, se carga el histórico del mismo par.
    // No se espera con await: el histórico tiene su propio estado de carga y errores.
    parHistorico = { origen: monedaOrigen, destino: monedaDestino };
    cargarHistorico();

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

// MISIÓN 09 (reorganizada en la 11): hace la petición con límite de tiempo y
// comprueba response.ok. La usan la conversión y el histórico.
// Si cambiáramos Frankfurter por otra API, aquí y en las URL estaría el cambio.
async function consultarAPI(url) {
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
    return await respuesta.json();

  } finally {
    clearTimeout(temporizador);
  }
}

// MISIÓN 09: obtiene la tasa actual del par y revisa que sea un número válido.
async function obtenerTasa(monedaOrigen, monedaDestino) {
  const url = `https://api.frankfurter.dev/v2/rate/${monedaOrigen}/${monedaDestino}`;
  const datos = await consultarAPI(url);

  if (!Number.isFinite(datos.rate)) {
    throw new SyntaxError("La respuesta no contiene una tasa válida.");
  }

  return datos;
}

// MISIÓN 11: consulta la serie temporal del par en los últimos "dias" días.
// La API regresa un arreglo: [{ date, base, quote, rate }, ...]
async function obtenerHistorico(monedaOrigen, monedaDestino, dias) {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(hasta.getDate() - dias);

  // Para un año se pide un punto por semana (group=week) en lugar de ~365 puntos.
  const agrupar = dias > 90 ? "&group=week" : "";

  const url = `https://api.frankfurter.dev/v2/rates?base=${monedaOrigen}&quotes=${monedaDestino}` +
    `&from=${fechaISO(desde)}&to=${fechaISO(hasta)}${agrupar}`;

  const serie = await consultarAPI(url);

  if (!Array.isArray(serie) || !serie.every((punto) => Number.isFinite(punto.rate))) {
    throw new SyntaxError("La serie histórica no tiene el formato esperado.");
  }

  return serie;
}

// MISIÓN 11: carga el histórico del último par convertido y lo muestra.
async function cargarHistorico() {
  if (!parHistorico) {
    return;
  }

  const { origen: monedaOrigen, destino: monedaDestino } = parHistorico;
  const consulta = ++contadorHistorico;

  historico.hidden = false;
  historico.classList.remove("error");
  historicoResumen.textContent = `Consultando el histórico ${monedaOrigen} → ${monedaDestino}...`;
  grafica.replaceChildren();
  ultimaSerie = null;

  try {
    const serie = await obtenerHistorico(monedaOrigen, monedaDestino, diasHistorico);

    // Si mientras tanto se pidió otro periodo u otro par, esta respuesta ya no sirve.
    if (consulta !== contadorHistorico) {
      return;
    }

    if (serie.length < 2) {
      historicoResumen.textContent = "No hay suficientes datos para este periodo.";
      return;
    }

    historicoResumen.textContent = resumirSerie(serie, monedaOrigen, monedaDestino);
    ultimaSerie = { serie, monedaDestino };
    dibujarGrafica(serie, monedaDestino);

  } catch (error) {
    if (consulta !== contadorHistorico) {
      return;
    }

    // Reutiliza los mensajes de la Misión 09, pero sin tocar el resultado de la conversión.
    const fallo = describirError(error);
    historico.classList.add("error");
    historicoResumen.textContent = `No se pudo cargar el histórico. ${fallo.mensaje} ${fallo.detalle}`;
    console.error(error);
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

// MISIÓN 11: marca el botón del periodo elegido.
function marcarPeriodoActivo() {
  botonesPeriodo.forEach((boton) => {
    const activo = Number(boton.dataset.dias) === diasHistorico;
    boton.classList.toggle("activo", activo);
    boton.setAttribute("aria-pressed", String(activo));
  });
}

// MISIÓN 11: resumen en texto de la serie (también sirve para lectores de pantalla).
function resumirSerie(serie, monedaOrigen, monedaDestino) {
  const tasas = serie.map((punto) => punto.rate);
  const primera = tasas[0];
  const ultima = tasas[tasas.length - 1];
  const variacion = ((ultima - primera) / primera) * 100;
  const periodo = document.querySelector(".period.activo").textContent;

  let tendencia = "se mantuvo sin cambios";
  if (variacion > 0) {
    tendencia = `subió ${variacion.toFixed(2)}%`;
  } else if (variacion < 0) {
    tendencia = `bajó ${Math.abs(variacion).toFixed(2)}%`;
  }

  return `${monedaOrigen} → ${monedaDestino} ${tendencia} en ${periodo} · ` +
    `mín. ${formatearTasa(Math.min(...tasas))} · máx. ${formatearTasa(Math.max(...tasas))}`;
}

// MISIÓN 11: muestra una tasa con hasta 5 cifras significativas (20.41, 0.0063, 158.24).
function formatearTasa(tasa) {
  return new Intl.NumberFormat("es-MX", { maximumSignificantDigits: 5 }).format(tasa);
}

// MISIÓN 11: convierte un Date a "AAAA-MM-DD", el formato que pide la API.
function fechaISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// MISIÓN 11: crea un elemento SVG con sus atributos.
function crearSVG(etiqueta, atributos) {
  const elemento = document.createElementNS("http://www.w3.org/2000/svg", etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) {
    elemento.setAttribute(nombre, valor);
  }
  return elemento;
}

// MISIÓN 11: dibuja la serie como gráfica de línea en SVG, sin librerías.
function dibujarGrafica(serie, monedaDestino) {
  grafica.replaceChildren();

  // Tamaño real del contenedor: así el texto no se encoge en el celular.
  const ancho = Math.max(grafica.clientWidth, 260);
  const alto = 220;
  const margen = { arriba: 16, derecha: 12, abajo: 28, izquierda: 58 };
  const anchoUtil = ancho - margen.izquierda - margen.derecha;
  const altoUtil = alto - margen.arriba - margen.abajo;

  // Rango del eje Y con un pequeño margen arriba y abajo.
  const tasas = serie.map((punto) => punto.rate);
  let minimo = Math.min(...tasas);
  let maximo = Math.max(...tasas);
  const holgura = (maximo - minimo) * 0.1 || Math.abs(maximo) * 0.01 || 1;
  minimo -= holgura;
  maximo += holgura;

  // Funciones de escala: índice -> X y tasa -> Y (en pixeles).
  const pasoX = anchoUtil / (serie.length - 1);
  const x = (indice) => margen.izquierda + indice * pasoX;
  const y = (tasa) => margen.arriba + ((maximo - tasa) / (maximo - minimo)) * altoUtil;

  const svg = crearSVG("svg", {
    width: ancho,
    height: alto,
    viewBox: `0 0 ${ancho} ${alto}`,
    role: "img",
    "aria-label": historicoResumen.textContent
  });

  // Líneas guía horizontales con su valor (mínimo, medio y máximo).
  [minimo, (minimo + maximo) / 2, maximo].forEach((valor) => {
    svg.append(crearSVG("line", {
      class: "chart-grid", x1: margen.izquierda, x2: ancho - margen.derecha, y1: y(valor), y2: y(valor)
    }));
    const etiqueta = crearSVG("text", {
      class: "chart-axis-text", x: margen.izquierda - 8, y: y(valor) + 4, "text-anchor": "end"
    });
    etiqueta.textContent = formatearTasa(valor);
    svg.append(etiqueta);
  });

  // Fechas de inicio y fin en el eje X.
  [[0, "start"], [serie.length - 1, "end"]].forEach(([indice, ancla]) => {
    const fecha = crearSVG("text", {
      class: "chart-axis-text", x: x(indice), y: alto - 8, "text-anchor": ancla
    });
    fecha.textContent = formatearFecha(serie[indice].date);
    svg.append(fecha);
  });

  // Línea y área bajo la línea.
  const puntos = serie.map((punto, indice) => `${x(indice)},${y(punto.rate)}`);
  const base = margen.arriba + altoUtil;
  svg.append(crearSVG("path", {
    class: "chart-area",
    d: `M${x(0)},${base} L${puntos.join(" L")} L${x(serie.length - 1)},${base} Z`
  }));
  svg.append(crearSVG("path", { class: "chart-line", d: `M${puntos.join(" L")}` }));

  // Elementos para el hover: línea vertical, punto y tooltip.
  const guia = crearSVG("line", { class: "chart-guide", y1: margen.arriba, y2: base, visibility: "hidden" });
  const marcador = crearSVG("circle", { class: "chart-dot", r: 5, visibility: "hidden" });
  const zona = crearSVG("rect", {
    x: margen.izquierda, y: 0, width: anchoUtil, height: alto, fill: "transparent"
  });
  svg.append(guia, marcador, zona);

  const tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip";
  tooltip.hidden = true;

  zona.addEventListener("pointermove", (evento) => {
    const caja = svg.getBoundingClientRect();
    const posicion = evento.clientX - caja.left - margen.izquierda;
    const indice = Math.min(serie.length - 1, Math.max(0, Math.round(posicion / pasoX)));
    const punto = serie[indice];

    guia.setAttribute("x1", x(indice));
    guia.setAttribute("x2", x(indice));
    marcador.setAttribute("cx", x(indice));
    marcador.setAttribute("cy", y(punto.rate));
    guia.setAttribute("visibility", "visible");
    marcador.setAttribute("visibility", "visible");

    tooltip.textContent = `${formatearFecha(punto.date)} · ${formatearTasa(punto.rate)} ${monedaDestino}`;
    tooltip.style.left = `${Math.min(ancho - 80, Math.max(80, x(indice)))}px`;
    tooltip.style.top = `${y(punto.rate)}px`;
    tooltip.hidden = false;
  });

  zona.addEventListener("pointerleave", () => {
    guia.setAttribute("visibility", "hidden");
    marcador.setAttribute("visibility", "hidden");
    tooltip.hidden = true;
  });

  grafica.append(svg, tooltip);
}

// PISTA PARA EL RETO:
// origen.value        -> moneda seleccionada como origen
// destino.value       -> moneda seleccionada como destino
// cantidad.value      -> texto escrito en el input
// Number(...)         -> convierte texto a número
// response.ok         -> indica si la respuesta HTTP fue satisfactoria
// resultado.textContent -> permite modificar texto del DOM
