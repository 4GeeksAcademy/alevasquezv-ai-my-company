import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { binarySearchCandidateBySalary, findCandidateByEmail, findCandidateById } from "../src/utils/search.ts";
import { sortCandidatesBySalary } from "../src/utils/collections.ts";
import { sampleCandidates } from "../src/data/samples.ts";
import type { Candidate } from "../src/types/models.ts";

const withSalary = (id: string, expectedSalary: number): Candidate => ({ ...sampleCandidates[0]!, id, expectedSalary });

describe("findCandidateById", () => {
  it("encuentra al candidato y devuelve el mismo objeto", () => {
    assert.equal(findCandidateById(sampleCandidates, "C-2024-0452"), sampleCandidates[1]);
  });

  it("encuentra al primero y al último de la lista", () => {
    assert.equal(findCandidateById(sampleCandidates, "C-2024-0451")?.fullName, "María González");
    assert.equal(findCandidateById(sampleCandidates, "C-2024-0453")?.fullName, "Carolina Silva");
  });

  it("devuelve null si el id no existe", () => {
    assert.equal(findCandidateById(sampleCandidates, "C-2024-9999"), null);
  });

  it("el id es exacto: no acepta minúsculas ni espacios", () => {
    assert.equal(findCandidateById(sampleCandidates, "c-2024-0451"), null);
    assert.equal(findCandidateById(sampleCandidates, " C-2024-0451"), null);
  });

  it("devuelve null con la lista vacía", () => {
    assert.equal(findCandidateById([], "C-2024-0451"), null);
  });
});

describe("findCandidateByEmail", () => {
  it("encuentra al candidato por su email", () => {
    assert.equal(findCandidateByEmail(sampleCandidates, "juan.perez@email.com")?.id, "C-2024-0452");
  });

  it("no distingue mayúsculas ni espacios sobrantes", () => {
    assert.equal(findCandidateByEmail(sampleCandidates, "  Carolina.SILVA@Email.com ")?.id, "C-2024-0453");
  });

  it("devuelve null si el email no existe o está vacío", () => {
    assert.equal(findCandidateByEmail(sampleCandidates, "nadie@email.com"), null);
    assert.equal(findCandidateByEmail(sampleCandidates, ""), null);
  });

  it("devuelve null con la lista vacía", () => {
    assert.equal(findCandidateByEmail([], "juan.perez@email.com"), null);
  });
});

describe("binarySearchCandidateBySalary", () => {
  const sorted = sortCandidatesBySalary(sampleCandidates, "asc"); // 2800, 4200, 6500

  it("encuentra el índice del salario buscado en cualquier posición", () => {
    assert.equal(binarySearchCandidateBySalary(sorted, 2800), 0);
    assert.equal(binarySearchCandidateBySalary(sorted, 4200), 1);
    assert.equal(binarySearchCandidateBySalary(sorted, 6500), 2);
  });

  it("devuelve -1 si el salario no está (menor, intermedio o mayor que todos)", () => {
    assert.equal(binarySearchCandidateBySalary(sorted, 1000), -1);
    assert.equal(binarySearchCandidateBySalary(sorted, 5000), -1);
    assert.equal(binarySearchCandidateBySalary(sorted, 9000), -1);
  });

  it("devuelve -1 con la lista vacía", () => {
    assert.equal(binarySearchCandidateBySalary([], 4200), -1);
  });

  it("funciona con un solo elemento", () => {
    assert.equal(binarySearchCandidateBySalary([withSalary("A", 3000)], 3000), 0);
    assert.equal(binarySearchCandidateBySalary([withSalary("A", 3000)], 3001), -1);
  });

  it("con salarios repetidos devuelve un índice válido de alguno de ellos", () => {
    const list = [withSalary("A", 1000), withSalary("B", 3000), withSalary("C", 3000), withSalary("D", 3000), withSalary("E", 9000)];
    const index = binarySearchCandidateBySalary(list, 3000);
    assert.equal(list[index]?.expectedSalary, 3000);
  });

  it("encuentra cada elemento en una lista larga (pares e impares)", () => {
    for (const size of [2, 7, 100, 101]) {
      const list = Array.from({ length: size }, (_, i) => withSalary(`S${i}`, 1000 + i * 10));
      for (let i = 0; i < size; i++) assert.equal(binarySearchCandidateBySalary(list, 1000 + i * 10), i);
      assert.equal(binarySearchCandidateBySalary(list, 1005), -1);
    }
  });
});
