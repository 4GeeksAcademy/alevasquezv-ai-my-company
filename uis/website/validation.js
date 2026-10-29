/*
 * Validación del formulario de talento de Nexova (Hito 1).
 *
 * Las reglas y los mensajes salen de BRIEFING.md ("Validaciones específicas" y "Mensajes de error esperados").
 * Este archivo es un script clásico (no módulo) para que el sitio también funcione abierto con file://.
 * Las funciones de validación son puras y se prueban en Node: node --test tests/validation.test.js
 */
(function (root) {
  "use strict";

  // Mensajes literales del briefing. Cada validador devuelve null si el valor es válido, o su mensaje si no lo es.
  const MESSAGES = {
    fullName: "El nombre debe contener al menos nombre y apellido",
    email: "Ingresa un email válido (ejemplo: nombre@empresa.com)",
    phone: "El teléfono debe incluir código de país (ejemplo: +34 612 345 678)",
    years: "Los años de experiencia deben estar entre 0 y 50",
    linkedin: "Si incluyes LinkedIn, debe ser una URL válida",
    privacy: "Debes aceptar la política de tratamiento de datos para continuar",
    country: "Selecciona tu país de residencia",
    sector: "Selecciona el sector de tu interés",
    english: "Indica tu nivel de inglés",
    availability: "Selecciona tu disponibilidad",
  };

  // Opciones permitidas, tal como las define el briefing. Los atributos value del HTML deben coincidir con ellas.
  const OPTIONS = {
    country: ["España", "Estados Unidos", "Otro"],
    sector: ["Tecnología", "Retail", "Servicios Financieros", "Consultoría", "Otro"],
    english: ["Básico", "Intermedio", "Avanzado", "Nativo"],
    availability: ["Inmediata", "1 mes", "2-3 meses", "Solo explorando"],
  };

  // Una palabra de nombre: empieza por una letra (cualquier alfabeto) y admite apóstrofo, punto y guion.
  const NAME_WORD = "[\\p{L}][\\p{L}'’.-]*";
  const FULL_NAME_RE = new RegExp(`^${NAME_WORD}(?:\\s+${NAME_WORD})+$`, "u");

  function validateFullName(value) {
    const name = String(value ?? "").trim();
    return FULL_NAME_RE.test(name) ? null : MESSAGES.fullName;
  }

  // Usuario sin espacios, "@" ni puntos al inicio, al final o dobles; dominio con etiquetas alfanuméricas
  // (sin guion en los extremos) y una extensión de al menos 2 letras.
  const DOMAIN_LABEL = "[\\p{L}\\p{N}](?:[\\p{L}\\p{N}-]*[\\p{L}\\p{N}])?";
  const EMAIL_RE = new RegExp(`^[^\\s@.]+(?:\\.[^\\s@.]+)*@(?:${DOMAIN_LABEL}\\.)+\\p{L}{2,}$`, "u");

  function validateEmail(value) {
    return EMAIL_RE.test(String(value ?? "").trim()) ? null : MESSAGES.email;
  }

  // Empieza por "+", el primer dígito (del código de país) no es 0, solo hay dígitos y separadores habituales,
  // y el total está entre 8 y 15 dígitos (máximo del estándar E.164).
  const PHONE_BODY_RE = /^[1-9][\d\s().-]*$/;

  function validatePhone(value) {
    const phone = String(value ?? "").trim();
    if (!phone.startsWith("+")) return MESSAGES.phone;
    const body = phone.slice(1);
    const digits = body.replace(/\D/g, "").length;
    return PHONE_BODY_RE.test(body) && digits >= 8 && digits <= 15 ? null : MESSAGES.phone;
  }

  // Solo notación decimal con punto (el navegador normaliza la coma del teclado en español); admite decimales.
  const YEARS_RE = /^\d+(?:\.\d+)?$/;

  function validateYears(value) {
    const text = String(value ?? "").trim();
    return YEARS_RE.test(text) && Number(text) <= 50 ? null : MESSAGES.years;
  }

  // Campo opcional: vacío es válido. Si se llena, debe ser una URL http(s) con un host que tenga al menos un punto.
  function validateLinkedIn(value) {
    const text = String(value ?? "").trim();
    if (text === "") return null;
    let url;
    try {
      url = new URL(text);
    } catch {
      return MESSAGES.linkedin;
    }
    const host = url.hostname;
    const validProtocol = url.protocol === "http:" || url.protocol === "https:";
    const validHost = host.includes(".") && !host.startsWith(".") && !host.endsWith(".") && !host.includes("..");
    return validProtocol && validHost ? null : MESSAGES.linkedin;
  }

  const COMMENTS_MAX = 500;

  // Se cuentan caracteres (puntos de código), no unidades UTF-16: un emoji cuenta 1. No se recorta el texto.
  function remainingComments(value) {
    return COMMENTS_MAX - Array.from(String(value ?? "")).length;
  }

  // Campo opcional. Como el briefing pide "(quedan X)", X es lo que queda: negativo cuando el texto se excede.
  function validateComments(value) {
    const remaining = remainingComments(value);
    return remaining >= 0
      ? null
      : `Los comentarios no pueden exceder ${COMMENTS_MAX} caracteres (quedan ${remaining})`;
  }

  // Debe ser exactamente true: un valor "truthy" cualquiera no cuenta como aceptar la política.
  function validatePrivacy(accepted) {
    return accepted === true ? null : MESSAGES.privacy;
  }

  // Coincidencia exacta con la lista (sin recortar ni ignorar mayúsculas): los valores vienen de un select o un radio.
  function choiceValidator(options, message) {
    return (value) => (options.includes(value) ? null : message);
  }

  const validateCountry = choiceValidator(OPTIONS.country, MESSAGES.country);
  const validateSector = choiceValidator(OPTIONS.sector, MESSAGES.sector);
  const validateEnglishLevel = choiceValidator(OPTIONS.english, MESSAGES.english);
  const validateAvailability = choiceValidator(OPTIONS.availability, MESSAGES.availability);

  // Los 11 campos del briefing, en el orden de su tabla (también el orden visual del formulario). El primer error de
  // esta lista es el campo que recibe el foco al enviar. LinkedIn y comentarios son opcionales: vacíos no dan error.
  const FIELD_ORDER = [
    "fullName",
    "email",
    "phone",
    "country",
    "years",
    "sector",
    "english",
    "availability",
    "linkedin",
    "comments",
    "privacy",
  ];

  const VALIDATORS = {
    fullName: validateFullName,
    email: validateEmail,
    phone: validatePhone,
    country: validateCountry,
    years: validateYears,
    sector: validateSector,
    english: validateEnglishLevel,
    availability: validateAvailability,
    linkedin: validateLinkedIn,
    comments: validateComments,
    privacy: validatePrivacy,
  };

  // values: { fullName, email, ..., privacy } con los valores crudos del formulario. Un campo ausente cuenta como vacío.
  function validateForm(values) {
    const errors = {};
    for (const field of FIELD_ORDER) {
      const message = VALIDATORS[field](values?.[field]);
      if (message !== null) errors[field] = message;
    }
    return { valid: Object.keys(errors).length === 0, errors };
  }

  const api = {
    MESSAGES,
    OPTIONS,
    FIELD_ORDER,
    VALIDATORS,
    validateFullName,
    validateEmail,
    validatePhone,
    validateYears,
    validateLinkedIn,
    remainingComments,
    validateComments,
    validatePrivacy,
    validateCountry,
    validateSector,
    validateEnglishLevel,
    validateAvailability,
    validateForm,
  };

  // ---------------------------------------------------------------------------------------------
  // Capa DOM. Solo actúa en application.html (donde existe #formulario-talento); en la landing y en
  // Node no hace nada. Comunica el estado con atributos (aria-invalid, data-state, data-over) que las
  // variantes de Tailwind del HTML convierten en estilos: este script no escribe CSS.
  // ---------------------------------------------------------------------------------------------
  function initForm(doc) {
    const form = doc.getElementById("formulario-talento");
    if (!form) return;

    const summary = doc.getElementById("resumen-errores");
    const summaryTitle = doc.getElementById("titulo-resumen");
    const summaryList = doc.getElementById("resumen-errores-lista");
    const success = doc.getElementById("exito");
    const successTitle = doc.getElementById("titulo-exito");
    const intro = doc.getElementById("introduccion");
    const announcer = doc.getElementById("anunciador");
    const counter = doc.getElementById("contador-comentarios");
    // Campos que el usuario ya visitó: antes de eso no se le muestran errores mientras escribe.
    const touched = new Set();

    // El elemento que lleva aria-invalid: el propio control o, en la disponibilidad, el fieldset del grupo.
    const hostOf = (key) => form.querySelector(`[data-field="${key}"]`);
    const keyOf = (element) => (element && FIELD_ORDER.includes(element.name) ? element.name : null);

    // Los radios no tienen valor propio (se lee el marcado) y el checkbox devuelve un booleano.
    function readValue(key) {
      if (key === "availability") {
        const checked = form.querySelector('input[name="availability"]:checked');
        return checked ? checked.value : "";
      }
      const host = hostOf(key);
      return key === "privacy" ? host.checked : host.value;
    }
    const readAll = () => Object.fromEntries(FIELD_ORDER.map((key) => [key, readValue(key)]));

    // Un mensaje en la región de estado se lee por lector de pantalla; vaciarla antes permite repetir el mismo texto.
    function announce(message) {
      announcer.textContent = "";
      setTimeout(() => {
        announcer.textContent = message;
      }, 50);
    }

    function showError(key, message) {
      const error = doc.getElementById(`error-${key}`);
      error.textContent = message;
      error.hidden = false;
      const host = hostOf(key);
      host.setAttribute("aria-invalid", "true");
      host.dataset.state = "invalid";
    }

    function clearError(key) {
      const error = doc.getElementById(`error-${key}`);
      error.textContent = "";
      error.hidden = true;
      const host = hostOf(key);
      host.removeAttribute("aria-invalid");
      // Verde solo en campos visitados y con contenido: un opcional vacío o un checkbox no se "aprueban".
      const value = readValue(key);
      if (touched.has(key) && typeof value === "string" && value.trim() !== "") host.dataset.state = "valid";
      else delete host.dataset.state;
    }

    function validateField(key, speak) {
      const message = VALIDATORS[key](readValue(key));
      if (message) {
        showError(key, message);
        if (speak) announce(message);
      } else {
        clearError(key);
      }
      return message;
    }

    function updateCounter() {
      const remaining = remainingComments(readValue("comments"));
      const amount = Math.abs(remaining);
      const unit = amount === 1 ? "carácter" : "caracteres";
      counter.textContent =
        remaining >= 0 ? `${amount === 1 ? "Queda" : "Quedan"} ${amount} ${unit}` : `Te pasaste por ${amount} ${unit}`;
      counter.dataset.over = String(remaining < 0);
    }

    function focusField(key) {
      const host = hostOf(key);
      (host.matches("fieldset") ? host.querySelector("input") : host).focus();
    }

    function showSummary(errors) {
      const keys = Object.keys(errors);
      summaryTitle.textContent = keys.length === 1 ? "Hay 1 campo por corregir" : `Hay ${keys.length} campos por corregir`;
      summaryList.replaceChildren(
        ...keys.map((key) => {
          const item = doc.createElement("li");
          const link = doc.createElement("a");
          link.href = `#${hostOf(key).id}`;
          link.dataset.fieldKey = key;
          link.textContent = errors[key];
          link.className =
            "underline decoration-red-700 underline-offset-4 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700";
          item.append(link);
          return item;
        }),
      );
      summary.hidden = false;
    }

    // Al salir de un campo se valida y se anuncia el error. Dentro del grupo de radios, pasar de una
    // opción a otra no cuenta como salir.
    form.addEventListener("focusout", (event) => {
      const key = keyOf(event.target);
      if (!key) return;
      if (key === "availability" && hostOf(key).contains(event.relatedTarget)) return;
      touched.add(key);
      validateField(key, true);
    });

    // Ya visitado, el campo se revalida al escribir (sin anunciar) para que el error desaparezca al corregirlo.
    form.addEventListener("input", (event) => {
      const key = keyOf(event.target);
      if (!key) return;
      if (key === "comments") updateCounter();
      if (touched.has(key)) validateField(key, false);
    });

    form.addEventListener("change", (event) => {
      const key = keyOf(event.target);
      if (!key) return;
      touched.add(key);
      validateField(key, false);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const { valid, errors } = validateForm(readAll());
      for (const key of FIELD_ORDER) {
        touched.add(key);
        if (errors[key]) showError(key, errors[key]);
        else clearError(key);
      }
      if (!valid) {
        showSummary(errors);
        focusField(Object.keys(errors)[0]);
        return;
      }
      // Envío simulado (briefing): los datos no salen de la página. Se muestra el mensaje de éxito.
      summary.hidden = true;
      form.hidden = true;
      if (intro) intro.hidden = true;
      success.hidden = false;
      successTitle.focus();
    });

    // El evento "reset" se dispara antes de vaciar los campos, así que el estado se recalcula en el ciclo siguiente.
    form.addEventListener("reset", () => {
      setTimeout(() => {
        touched.clear();
        for (const key of FIELD_ORDER) clearError(key);
        summary.hidden = true;
        updateCounter();
      }, 0);
    });

    summaryList.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-field-key]");
      if (!link) return;
      event.preventDefault();
      focusField(link.dataset.fieldKey);
    });

    updateCounter();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => initForm(document));
    } else {
      initForm(document);
    }
  }

  root.NexovaValidation = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
