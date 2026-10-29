"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const V = require("../validation.js");

// Mensajes literales del briefing (sección "Mensajes de error esperados"). Se escriben a mano aquí a propósito:
// si salieran del código bajo prueba, el test no podría detectar que el mensaje se cambió o se cruzó entre campos.
const MSG = {
  fullName: "El nombre debe contener al menos nombre y apellido",
  email: "Ingresa un email válido (ejemplo: nombre@empresa.com)",
  phone: "El teléfono debe incluir código de país (ejemplo: +34 612 345 678)",
  years: "Los años de experiencia deben estar entre 0 y 50",
  linkedin: "Si incluyes LinkedIn, debe ser una URL válida",
  privacy: "Debes aceptar la política de tratamiento de datos para continuar",
};

describe("nombre completo", () => {
  // Rompería si: se exigiera un largo mínimo en vez de dos palabras, o se aceptara ASCII solamente.
  const validos = [
    "Ana García",
    "María José de la Cruz",
    "Jean-Luc Picard",
    "J. Smith",
    "O'Brien Smith",
    "  Ana   Pérez  ", // espacios sobrantes no cuentan como palabras ni invalidan
  ];
  // Rompería si: se aceptara una sola palabra, un texto vacío, o números como si fueran palabras.
  const invalidos = ["Ana", "", "   ", "123 456", "Ana 2"];

  for (const valor of validos) {
    it(`acepta ${JSON.stringify(valor)}`, () => {
      assert.equal(V.validateFullName(valor), null);
    });
  }
  for (const valor of invalidos) {
    it(`rechaza ${JSON.stringify(valor)} con el mensaje del briefing`, () => {
      assert.equal(V.validateFullName(valor), MSG.fullName);
    });
  }
});

describe("email", () => {
  // Rompería si: se rechazaran correos reales (subdominios, "+", dominios con tilde) por una regex demasiado estricta.
  const validos = [
    "usuario@dominio.com",
    "a.b@sub.dominio.co.uk",
    "nombre+etiqueta@empresa.es",
    "info@pérez.es",
    "  usuario@dominio.com  ", // se recortan los espacios sobrantes
  ];
  // Rompería si: bastara con que el texto contenga "@" (el briefing exige un dominio válido) o se admitieran
  // puntos al inicio/fin/dobles en el usuario, o etiquetas de dominio vacías o con guion en los extremos.
  const invalidos = [
    "",
    "usuario.dominio.com",
    "a@b",
    "a@b.c",
    "usuario@dominio",
    "@x.com",
    "a@@x.com",
    "a b@x.com",
    "a@.com",
    "a..b@x.com",
    ".a@x.com",
    "a.@x.com",
    "usuario@-dominio.com",
    "usuario@dominio-.com",
    "usuario@dominio..com",
  ];

  for (const valor of validos) {
    it(`acepta ${JSON.stringify(valor)}`, () => {
      assert.equal(V.validateEmail(valor), null);
    });
  }
  for (const valor of invalidos) {
    it(`rechaza ${JSON.stringify(valor)} con el mensaje del briefing`, () => {
      assert.equal(V.validateEmail(valor), MSG.email);
    });
  }
});

describe("teléfono", () => {
  // Rompería si: se exigiera un formato rígido (solo espacios, solo España) y se rechazaran números reales de
  // Nexova (Valencia, Miami) o escritos con guiones, puntos o paréntesis.
  const validos = [
    "+34 612 345 678", // ejemplo del briefing
    "+34 960 123 456", // oficina de Valencia
    "+1 305 555 0191", // oficina de Miami
    "+34612345678",
    "+34 612-345-678",
    "+1 (305) 555-0191",
    "+52 55 1234 5678",
    "  +34 612 345 678  ",
    "+12345678", // 8 dígitos: el mínimo
    "+123456789012345", // 15 dígitos: el máximo (E.164)
  ];
  // Rompería si: no se exigiera el "+" ni el código de país, si el "+" y el código no fueran contiguos, si el código
  // pudiera empezar por 0, o si se corrieran los límites de 8 a 15 dígitos.
  const invalidos = [
    "",
    "34 612 345 678",
    "612 345 678",
    "+34",
    "+1 2345",
    "+1234567", // 7 dígitos: uno menos que el mínimo
    "+1234567890123456", // 16 dígitos: uno más que el máximo
    "+ 34 612345678",
    "++34 612345678",
    "+0 612345678",
    "+34 abc",
    "+34 612 345 67a",
  ];

  for (const valor of validos) {
    it(`acepta ${JSON.stringify(valor)}`, () => {
      assert.equal(V.validatePhone(valor), null);
    });
  }
  for (const valor of invalidos) {
    it(`rechaza ${JSON.stringify(valor)} con el mensaje del briefing`, () => {
      assert.equal(V.validatePhone(valor), MSG.phone);
    });
  }
});

describe("años de experiencia", () => {
  // Rompería si: se corrieran los límites (0 y 50 son válidos), o se exigieran enteros (el briefing solo pide 0–50).
  const validos = ["0", "10", "2.5", "49.9", "50", " 7 ", 12];
  // Rompería si: se aceptaran negativos o más de 50, el campo vacío, texto, o notaciones que un Number() laxo
  // convertiría en número ("0x10" = 16, "1e1" = 10).
  const invalidos = ["-1", "50.1", "51", "", "   ", "abc", "1e1", "0x10", NaN];

  for (const valor of validos) {
    it(`acepta ${JSON.stringify(valor)}`, () => {
      assert.equal(V.validateYears(valor), null);
    });
  }
  for (const valor of invalidos) {
    it(`rechaza ${String(JSON.stringify(valor))} con el mensaje del briefing`, () => {
      assert.equal(V.validateYears(valor), MSG.years);
    });
  }
});

describe("LinkedIn", () => {
  // Rompería si: el campo vacío se tratara como error (es opcional) o se exigiera un dominio concreto de LinkedIn
  // (el briefing solo pide una URL válida que empiece por http:// o https://).
  const validos = [
    "",
    "   ",
    "https://www.linkedin.com/in/ana-garcia",
    "http://x.co",
    "https://linkedin.com/in/ana?utm_source=web",
    "  https://www.linkedin.com/in/ana  ",
  ];
  // Rompería si: se aceptara una dirección sin protocolo, otro protocolo (incluido "javascript:", que new URL()
  // parsea sin quejarse) o un host sin punto o con etiquetas vacías.
  const invalidos = [
    "linkedin.com/in/ana",
    "www.linkedin.com/in/ana",
    "http//x.com",
    "ftp://x.com",
    "javascript:alert(1)",
    "https://",
    "https://a b.com",
    "https://linkedin",
    "https://x..com",
    "https://.com",
  ];

  for (const valor of validos) {
    it(`acepta ${JSON.stringify(valor)}`, () => {
      assert.equal(V.validateLinkedIn(valor), null);
    });
  }
  for (const valor of invalidos) {
    it(`rechaza ${JSON.stringify(valor)} con el mensaje del briefing`, () => {
      assert.equal(V.validateLinkedIn(valor), MSG.linkedin);
    });
  }
});

describe("comentarios", () => {
  // El briefing: "Los comentarios no pueden exceder 500 caracteres (quedan X)", con X = caracteres que quedan.
  // Al excederse, X es negativo: -1 con 501 caracteres, -20 con 520.
  const excedido = (restantes) => `Los comentarios no pueden exceder 500 caracteres (quedan ${restantes})`;

  it("acepta el campo vacío (es opcional)", () => {
    assert.equal(V.validateComments(""), null);
  });
  it("acepta exactamente 500 caracteres", () => {
    // Rompería si: el límite fuera < 500 en lugar de <= 500.
    assert.equal(V.validateComments("a".repeat(500)), null);
  });
  it("rechaza 501 caracteres e indica que quedan -1", () => {
    assert.equal(V.validateComments("a".repeat(501)), excedido(-1));
  });
  it("rechaza 520 caracteres e indica que quedan -20", () => {
    // Rompería si: el número del mensaje no reflejara cuánto se pasó el usuario.
    assert.equal(V.validateComments("a".repeat(520)), excedido(-20));
  });
  it("cuenta cada emoji como un solo carácter", () => {
    // Rompería si: se contara con .length (cada emoji ocupa 2 unidades UTF-16 y 500 emojis darían 1000).
    assert.equal(V.validateComments("😀".repeat(500)), null);
    assert.equal(V.validateComments("😀".repeat(501)), excedido(-1));
  });
  it("cuenta espacios y saltos de línea como caracteres", () => {
    // Rompería si: se recortara el texto antes de contar, dejando pasar 502 caracteres.
    assert.equal(V.validateComments("a\n".repeat(251)), excedido(-2));
  });

  describe("caracteres restantes (contador visible)", () => {
    const casos = [
      ["", 500],
      ["hola", 496],
      ["😀😀", 498],
      ["a".repeat(500), 0],
      ["a".repeat(501), -1],
    ];
    for (const [texto, restantes] of casos) {
      it(`quedan ${restantes} con ${Array.from(texto).length} caracteres`, () => {
        assert.equal(V.remainingComments(texto), restantes);
      });
    }
  });
});

describe("política de datos", () => {
  it("acepta el checkbox marcado", () => {
    assert.equal(V.validatePrivacy(true), null);
  });
  // Rompería si: se dejara pasar un checkbox sin marcar, o se aceptara cualquier valor "truthy" que no sea el booleano
  // true (el texto "false", "on" o el número 1 son truthy pero no significan "marcado").
  for (const valor of [false, undefined, null, 0, "false", "on", 1]) {
    it(`rechaza ${JSON.stringify(valor) ?? String(valor)} con el mensaje del briefing`, () => {
      assert.equal(V.validatePrivacy(valor), MSG.privacy);
    });
  }
});

describe("campos de selección", () => {
  // Las opciones y los mensajes son los del briefing. En cada campo se prueba como inválida una opción de OTRA
  // lista: rompería si dos validadores quedaran cruzados o compartieran la misma lista.
  const campos = [
    {
      nombre: "país de residencia",
      validar: "validateCountry",
      opciones: ["España", "Estados Unidos", "Otro"],
      invalidos: ["", "   ", undefined, null, "Francia", "españa", "Retail"],
      mensaje: "Selecciona tu país de residencia",
    },
    {
      nombre: "sector de interés",
      validar: "validateSector",
      opciones: ["Tecnología", "Retail", "Servicios Financieros", "Consultoría", "Otro"],
      invalidos: ["", "   ", undefined, null, "Minería", "tecnología", "España"],
      mensaje: "Selecciona el sector de tu interés",
    },
    {
      nombre: "nivel de inglés",
      validar: "validateEnglishLevel",
      opciones: ["Básico", "Intermedio", "Avanzado", "Nativo"],
      invalidos: ["", "   ", undefined, null, "Fluido", "básico", "Inmediata"],
      mensaje: "Indica tu nivel de inglés",
    },
    {
      nombre: "disponibilidad",
      validar: "validateAvailability",
      opciones: ["Inmediata", "1 mes", "2-3 meses", "Solo explorando"],
      invalidos: ["", "   ", undefined, null, "Mañana", "inmediata", "Nativo"],
      mensaje: "Selecciona tu disponibilidad",
    },
  ];

  for (const campo of campos) {
    describe(campo.nombre, () => {
      for (const opcion of campo.opciones) {
        it(`acepta ${JSON.stringify(opcion)}`, () => {
          assert.equal(V[campo.validar](opcion), null);
        });
      }
      for (const valor of campo.invalidos) {
        it(`rechaza ${String(JSON.stringify(valor))} con el mensaje del briefing`, () => {
          assert.equal(V[campo.validar](valor), campo.mensaje);
        });
      }
    });
  }
});

describe("formulario completo", () => {
  const completo = {
    fullName: "Ana García",
    email: "ana@empresa.com",
    phone: "+34 612 345 678",
    country: "España",
    years: "5",
    sector: "Tecnología",
    english: "Avanzado",
    availability: "Inmediata",
    linkedin: "",
    comments: "",
    privacy: true,
  };
  // Mismo orden que la tabla de campos del briefing y que el orden visual del formulario: el primer error de esta
  // lista es el campo al que se mueve el foco al enviar.
  const ordenDelBriefing = [
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

  it("acepta un envío con todos los obligatorios y los opcionales vacíos", () => {
    assert.deepEqual(V.validateForm(completo), { valid: true, errors: {} });
  });

  it("con el formulario vacío marca los 9 obligatorios y ninguno de los 2 opcionales", () => {
    // Rompería si: LinkedIn o comentarios se trataran como obligatorios, o algún obligatorio quedara sin validar.
    const { valid, errors } = V.validateForm({});
    assert.equal(valid, false);
    assert.deepEqual(errors, {
      fullName: "El nombre debe contener al menos nombre y apellido",
      email: "Ingresa un email válido (ejemplo: nombre@empresa.com)",
      phone: "El teléfono debe incluir código de país (ejemplo: +34 612 345 678)",
      country: "Selecciona tu país de residencia",
      years: "Los años de experiencia deben estar entre 0 y 50",
      sector: "Selecciona el sector de tu interés",
      english: "Indica tu nivel de inglés",
      availability: "Selecciona tu disponibilidad",
      privacy: "Debes aceptar la política de tratamiento de datos para continuar",
    });
  });

  it("devuelve los errores en el orden del briefing", () => {
    // Rompería si: los errores salieran en otro orden y el foco se moviera a un campo que no es el primero del formulario.
    const todoMal = {
      fullName: "x",
      email: "x",
      phone: "x",
      country: "x",
      years: "x",
      sector: "x",
      english: "x",
      availability: "x",
      linkedin: "x",
      comments: "x".repeat(501),
      privacy: false,
    };
    assert.deepEqual(Object.keys(V.validateForm(todoMal).errors), ordenDelBriefing);
  });

  it("valida los opcionales cuando se rellenan: LinkedIn inválido y comentarios excedidos", () => {
    const { valid, errors } = V.validateForm({
      ...completo,
      linkedin: "linkedin.com/in/ana",
      comments: "a".repeat(510),
    });
    assert.equal(valid, false);
    assert.deepEqual(errors, {
      linkedin: "Si incluyes LinkedIn, debe ser una URL válida",
      comments: "Los comentarios no pueden exceder 500 caracteres (quedan -10)",
    });
  });

  it("un solo campo inválido produce un solo error, el de ese campo", () => {
    // Rompería si: un validador usara el mensaje de otro campo.
    const { errors } = V.validateForm({ ...completo, phone: "612 345 678" });
    assert.deepEqual(errors, { phone: "El teléfono debe incluir código de país (ejemplo: +34 612 345 678)" });
  });
});
