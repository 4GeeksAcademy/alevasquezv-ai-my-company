import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isValidEmail, validateCandidate, validateVacancy } from "../src/utils/validations.ts";
import { sampleCandidates, sampleVacancy } from "../src/data/samples.ts";
import type { Candidate, Vacancy } from "../src/types/models.ts";

const candidate = (changes: Record<string, unknown>): Candidate => ({ ...sampleCandidates[0]!, ...changes }) as Candidate;
const vacancy = (changes: Record<string, unknown>): Vacancy => ({ ...sampleVacancy, ...changes }) as Vacancy;

describe("isValidEmail", () => {
  for (const email of ["maria.gonzalez@email.com", "a@b.co", "ana@sub.dominio.es", "  juan@email.com  "]) {
    it(`acepta ${JSON.stringify(email)}`, () => assert.equal(isValidEmail(email), true));
  }
  for (const email of ["", "maria", "maria.com", "@email.com", "maria@", "maria@email", "maria@.com", "maria@email.", "a@@b.com", "a@b@c.com", "ana maria@email.com"]) {
    it(`rechaza ${JSON.stringify(email)}`, () => assert.equal(isValidEmail(email), false));
  }
  it("rechaza valores que no son texto", () => {
    assert.equal(isValidEmail(null as unknown as string), false);
    assert.equal(isValidEmail(42 as unknown as string), false);
  });
});

describe("validateCandidate", () => {
  it("los tres candidatos de ejemplo son válidos", () => {
    for (const c of sampleCandidates) assert.deepEqual(validateCandidate(c), { valid: true, errors: [] });
  });

  it("acepta los límites exactos de experiencia: 0 y 50", () => {
    assert.equal(validateCandidate(candidate({ yearsOfExperience: 0 })).valid, true);
    assert.equal(validateCandidate(candidate({ yearsOfExperience: 50 })).valid, true);
  });

  for (const years of [-1, 51, Number.NaN, null]) {
    it(`rechaza ${String(years)} años de experiencia`, () => {
      assert.deepEqual(validateCandidate(candidate({ yearsOfExperience: years })).errors, [
        "Los años de experiencia deben estar entre 0 y 50",
      ]);
    });
  }

  it("rechaza salarios en 0, negativos o ausentes", () => {
    assert.deepEqual(validateCandidate(candidate({ currentSalary: 0 })).errors, ["El salario actual debe ser mayor que 0"]);
    assert.deepEqual(validateCandidate(candidate({ expectedSalary: -100 })).errors, ["El salario esperado debe ser mayor que 0"]);
    assert.deepEqual(validateCandidate(candidate({ expectedSalary: undefined })).errors, ["El salario esperado debe ser mayor que 0"]);
  });

  it("exige al menos 1 habilidad (una lista vacía o solo con espacios no cuenta)", () => {
    for (const skills of [[], ["   "], null]) {
      assert.deepEqual(validateCandidate(candidate({ skills })).errors, ["El candidato debe tener al menos 1 habilidad"]);
    }
  });

  it("rechaza un email sin formato válido", () => {
    assert.deepEqual(validateCandidate(candidate({ email: "maria.email.com" })).errors, ["El email no tiene un formato válido"]);
  });

  it("exige teléfono (vacío o solo espacios no vale)", () => {
    for (const phone of ["", "   ", undefined]) {
      assert.deepEqual(validateCandidate(candidate({ phone })).errors, ["El teléfono es obligatorio"]);
    }
  });

  it("reúne todos los errores a la vez, en el orden de las reglas", () => {
    const result = validateCandidate(
      candidate({ yearsOfExperience: 60, currentSalary: 0, expectedSalary: 0, skills: [], email: "x", phone: "" }),
    );
    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 6);
    assert.equal(result.errors[0], "Los años de experiencia deben estar entre 0 y 50");
    assert.equal(result.errors[5], "El teléfono es obligatorio");
  });

  it("no rompe si recibe null", () => {
    assert.deepEqual(validateCandidate(null as unknown as Candidate), { valid: false, errors: ["No se recibió ningún candidato"] });
  });

  it("no modifica el candidato recibido", () => {
    const frozen = Object.freeze({ ...sampleCandidates[0]!, skills: Object.freeze([...sampleCandidates[0]!.skills]) });
    assert.doesNotThrow(() => validateCandidate(frozen as unknown as Candidate));
  });
});

describe("validateVacancy", () => {
  it("la vacante de ejemplo es válida", () => {
    assert.deepEqual(validateVacancy(sampleVacancy), { valid: true, errors: [] });
  });

  it("acepta rangos de un solo valor (mínimo igual al máximo)", () => {
    assert.equal(validateVacancy(vacancy({ minYearsExperience: 5, maxYearsExperience: 5 })).valid, true);
    assert.equal(validateVacancy(vacancy({ salaryRangeMin: 6000, salaryRangeMax: 6000 })).valid, true);
  });

  it("exige al menos 1 habilidad requerida", () => {
    assert.deepEqual(validateVacancy(vacancy({ requiredSkills: [] })).errors, ["La vacante debe requerir al menos 1 habilidad"]);
  });

  it("no exige habilidades preferidas", () => {
    assert.equal(validateVacancy(vacancy({ preferredSkills: [] })).valid, true);
  });

  it("rechaza experiencia mínima negativa", () => {
    assert.deepEqual(validateVacancy(vacancy({ minYearsExperience: -1, maxYearsExperience: 3 })).errors, [
      "La experiencia mínima debe ser mayor o igual a 0",
    ]);
  });

  it("rechaza experiencia máxima menor que la mínima", () => {
    assert.deepEqual(validateVacancy(vacancy({ minYearsExperience: 6, maxYearsExperience: 4 })).errors, [
      "La experiencia máxima debe ser mayor o igual a la mínima",
    ]);
  });

  it("rechaza salario máximo menor que el mínimo", () => {
    assert.deepEqual(validateVacancy(vacancy({ salaryRangeMin: 7000, salaryRangeMax: 5000 })).errors, [
      "El salario máximo debe ser mayor o igual al mínimo",
    ]);
  });

  it("rechaza salarios en 0 o negativos", () => {
    assert.deepEqual(validateVacancy(vacancy({ salaryRangeMin: 0 })).errors, ["El salario mínimo debe ser mayor que 0"]);
    assert.deepEqual(validateVacancy(vacancy({ salaryRangeMin: -10, salaryRangeMax: -5 })).errors, [
      "El salario mínimo debe ser mayor que 0",
      "El salario máximo debe ser mayor que 0",
    ]);
  });

  it("no rompe si recibe null", () => {
    assert.deepEqual(validateVacancy(null as unknown as Vacancy), { valid: false, errors: ["No se recibió ninguna vacante"] });
  });
});
