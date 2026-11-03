import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  filterCandidatesByAvailability,
  filterCandidatesBySeniority,
  filterCandidatesBySkills,
  sortCandidatesByExperience,
  sortCandidatesBySalary,
} from "../src/utils/collections.ts";
import { sampleCandidates } from "../src/data/samples.ts";
import type { Candidate } from "../src/types/models.ts";

const ids = (list: { id: string }[]): string[] => list.map((c) => c.id);

describe("filterCandidatesBySkills", () => {
  it("devuelve solo a quienes tienen TODAS las habilidades pedidas", () => {
    // TypeScript + Node.js: María y Carolina sí; Juan no.
    assert.deepEqual(ids(filterCandidatesBySkills(sampleCandidates, ["TypeScript", "Node.js"])), [
      "C-2024-0451",
      "C-2024-0453",
    ]);
  });

  it("no distingue mayúsculas ni espacios sobrantes", () => {
    assert.deepEqual(ids(filterCandidatesBySkills(sampleCandidates, ["  react ", "TYPESCRIPT"])), ["C-2024-0451"]);
  });

  it("con una habilidad que nadie tiene devuelve un array vacío", () => {
    assert.deepEqual(filterCandidatesBySkills(sampleCandidates, ["Rust"]), []);
  });

  it("sin habilidades pedidas devuelve a todos (nadie incumple un requisito vacío)", () => {
    assert.deepEqual(ids(filterCandidatesBySkills(sampleCandidates, [])), ids(sampleCandidates));
  });

  it("con la lista de candidatos vacía devuelve un array vacío", () => {
    assert.deepEqual(filterCandidatesBySkills([], ["React"]), []);
  });

  it("no modifica el array original y devuelve uno nuevo", () => {
    const frozen = Object.freeze([...sampleCandidates]);
    const result = filterCandidatesBySkills(frozen as typeof sampleCandidates, []);
    assert.notEqual(result, frozen);
    assert.equal(frozen.length, 3);
  });
});

describe("filterCandidatesBySeniority", () => {
  it("devuelve solo a quienes tienen ese nivel exacto", () => {
    assert.deepEqual(ids(filterCandidatesBySeniority(sampleCandidates, "Senior")), ["C-2024-0453"]);
  });

  it("no incluye niveles vecinos (Senior no trae a Semi-Senior ni a Lead)", () => {
    assert.deepEqual(ids(filterCandidatesBySeniority(sampleCandidates, "Semi-Senior")), ["C-2024-0451"]);
  });

  it("con un nivel que nadie tiene devuelve un array vacío", () => {
    assert.deepEqual(filterCandidatesBySeniority(sampleCandidates, "Executive"), []);
  });

  it("con la lista vacía devuelve un array vacío", () => {
    assert.deepEqual(filterCandidatesBySeniority([], "Junior"), []);
  });

  it("no modifica el array original y devuelve uno nuevo", () => {
    const frozen = Object.freeze([...sampleCandidates]);
    const result = filterCandidatesBySeniority(frozen as typeof sampleCandidates, "Junior");
    assert.notEqual(result, frozen);
    assert.equal(frozen.length, 3);
  });
});

describe("filterCandidatesByAvailability", () => {
  it("devuelve a quienes coinciden con CUALQUIERA de los estados pedidos", () => {
    // Juan es "Immediate" y Carolina "2 weeks"; María ("1 month") queda fuera.
    assert.deepEqual(ids(filterCandidatesByAvailability(sampleCandidates, ["Immediate", "2 weeks"])), [
      "C-2024-0452",
      "C-2024-0453",
    ]);
  });

  it("con un solo estado funciona igual", () => {
    assert.deepEqual(ids(filterCandidatesByAvailability(sampleCandidates, ["1 month"])), ["C-2024-0451"]);
  });

  it("sin estados pedidos devuelve un array vacío (no hay nada con qué coincidir)", () => {
    assert.deepEqual(filterCandidatesByAvailability(sampleCandidates, []), []);
  });

  it("con un estado que nadie tiene devuelve un array vacío", () => {
    assert.deepEqual(filterCandidatesByAvailability(sampleCandidates, ["Not available"]), []);
  });

  it("con la lista vacía devuelve un array vacío", () => {
    assert.deepEqual(filterCandidatesByAvailability([], ["Immediate"]), []);
  });

  it("no modifica el array original y devuelve uno nuevo", () => {
    const frozen = Object.freeze([...sampleCandidates]);
    const result = filterCandidatesByAvailability(frozen as typeof sampleCandidates, ["Immediate"]);
    assert.notEqual(result, frozen);
    assert.equal(frozen.length, 3);
  });
});

// Copia de un candidato de ejemplo con otro id y otros valores, para probar empates.
const withChanges = (base: Candidate, changes: Partial<Candidate>): Candidate => ({ ...base, ...changes });

describe("sortCandidatesBySalary", () => {
  it("ordena por salario esperado de menor a mayor con 'asc'", () => {
    // Juan 2800, María 4200, Carolina 6500
    assert.deepEqual(ids(sortCandidatesBySalary(sampleCandidates, "asc")), ["C-2024-0452", "C-2024-0451", "C-2024-0453"]);
  });

  it("ordena de mayor a menor con 'desc'", () => {
    assert.deepEqual(ids(sortCandidatesBySalary(sampleCandidates, "desc")), ["C-2024-0453", "C-2024-0451", "C-2024-0452"]);
  });

  it("usa el salario ESPERADO, no el actual", () => {
    const a = withChanges(sampleCandidates[0]!, { id: "A", currentSalary: 1000, expectedSalary: 9000 });
    const b = withChanges(sampleCandidates[0]!, { id: "B", currentSalary: 8000, expectedSalary: 2000 });
    assert.deepEqual(ids(sortCandidatesBySalary([a, b], "asc")), ["B", "A"]);
  });

  it("ante empates conserva el orden original", () => {
    const a = withChanges(sampleCandidates[0]!, { id: "A", expectedSalary: 3000 });
    const b = withChanges(sampleCandidates[0]!, { id: "B", expectedSalary: 3000 });
    assert.deepEqual(ids(sortCandidatesBySalary([a, b], "asc")), ["A", "B"]);
    assert.deepEqual(ids(sortCandidatesBySalary([a, b], "desc")), ["A", "B"]);
  });

  it("con la lista vacía devuelve un array vacío", () => {
    assert.deepEqual(sortCandidatesBySalary([], "asc"), []);
  });

  it("no modifica el array original (un array congelado no se puede reordenar en sitio)", () => {
    const frozen = Object.freeze([...sampleCandidates]);
    const result = sortCandidatesBySalary(frozen as Candidate[], "desc");
    assert.notEqual(result, frozen);
    assert.deepEqual(ids([...frozen]), ids(sampleCandidates));
  });
});

describe("sortCandidatesByExperience", () => {
  it("ordena por años de experiencia de menor a mayor con 'asc'", () => {
    // Juan 3, María 5, Carolina 8
    assert.deepEqual(ids(sortCandidatesByExperience(sampleCandidates, "asc")), ["C-2024-0452", "C-2024-0451", "C-2024-0453"]);
  });

  it("ordena de mayor a menor con 'desc'", () => {
    assert.deepEqual(ids(sortCandidatesByExperience(sampleCandidates, "desc")), ["C-2024-0453", "C-2024-0451", "C-2024-0452"]);
  });

  it("ordena bien números que como texto saldrían mal (2 antes que 10)", () => {
    const a = withChanges(sampleCandidates[0]!, { id: "A", yearsOfExperience: 10 });
    const b = withChanges(sampleCandidates[0]!, { id: "B", yearsOfExperience: 2 });
    assert.deepEqual(ids(sortCandidatesByExperience([a, b], "asc")), ["B", "A"]);
  });

  it("ante empates conserva el orden original", () => {
    const a = withChanges(sampleCandidates[0]!, { id: "A", yearsOfExperience: 4 });
    const b = withChanges(sampleCandidates[0]!, { id: "B", yearsOfExperience: 4 });
    assert.deepEqual(ids(sortCandidatesByExperience([a, b], "desc")), ["A", "B"]);
  });

  it("con la lista vacía devuelve un array vacío", () => {
    assert.deepEqual(sortCandidatesByExperience([], "desc"), []);
  });

  it("no modifica el array original", () => {
    const frozen = Object.freeze([...sampleCandidates]);
    const result = sortCandidatesByExperience(frozen as Candidate[], "desc");
    assert.notEqual(result, frozen);
    assert.deepEqual(ids([...frozen]), ids(sampleCandidates));
  });
});
