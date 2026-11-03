import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateAverageSalary,
  calculateCandidateScore,
  calculateVacancyFillRate,
  countCandidatesByStatus,
  findTopSkills,
  groupCandidatesBySeniority,
  rankCandidatesForVacancy,
  scoreEnglish,
  scoreExperience,
  scoreSalary,
  scoreSeniority,
  scoreSkills,
} from "../src/utils/transformations.ts";
import { sampleCandidates, sampleVacancy } from "../src/data/samples.ts";
import type { Candidate, ProcessStage, SelectionProcess, Vacancy } from "../src/types/models.ts";

const [maria, juan, carolina] = sampleCandidates as [Candidate, Candidate, Candidate];
const candidate = (changes: Partial<Candidate>): Candidate => ({ ...maria, ...changes });
const vacancy = (changes: Partial<Vacancy>): Vacancy => ({ ...sampleVacancy, ...changes });

describe("calculateCandidateScore con los datos de ejemplo", () => {
  it("Carolina: 100 (habilidades 40, experiencia 20, seniority 15, inglés 15, salario 10)", () => {
    assert.equal(calculateCandidateScore(carolina, sampleVacancy), 100);
  });
  it("María: 92 (40 + 20 + 7 + 15 + 10)", () => {
    assert.equal(calculateCandidateScore(maria, sampleVacancy), 92);
  });
  it("Juan: 20 (0 + 10 + 0 + 0 + 10)", () => {
    assert.equal(calculateCandidateScore(juan, sampleVacancy), 20);
  });
  it("siempre queda entre 0 y 100", () => {
    const worst = candidate({ skills: ["Cobol"], yearsOfExperience: 30, seniority: "Executive", englishLevel: "A1", expectedSalary: 99999 });
    assert.equal(calculateCandidateScore(worst, vacancy({ requiredSeniority: "Junior" })), 0);
  });
});

describe("scoreSkills (máx. 40)", () => {
  const v = vacancy({ requiredSkills: ["TypeScript", "React", "Node.js", "SQL"], preferredSkills: ["Docker", "AWS", "GraphQL"] });
  it("todas las requeridas: 40", () => assert.equal(scoreSkills(candidate({ skills: ["TypeScript", "React", "Node.js", "SQL"] }), v), 40));
  it("exactamente la mitad de las requeridas: 20", () => assert.equal(scoreSkills(candidate({ skills: ["TypeScript", "React"] }), v), 20));
  it("menos de la mitad: 0", () => assert.equal(scoreSkills(candidate({ skills: ["TypeScript"] }), v), 0));
  it("+10 por cada preferida", () => assert.equal(scoreSkills(candidate({ skills: ["Docker"] }), v), 10));
  it("las preferidas suman como máximo 20", () => assert.equal(scoreSkills(candidate({ skills: ["Docker", "AWS", "GraphQL"] }), v), 20));
  it("mitad de requeridas + 2 preferidas llega al tope de 40", () => {
    assert.equal(scoreSkills(candidate({ skills: ["TypeScript", "React", "Docker", "AWS"] }), v), 40);
  });
  it("todas las requeridas + preferidas no pasa de 40", () => {
    assert.equal(scoreSkills(candidate({ skills: ["TypeScript", "React", "Node.js", "SQL", "Docker", "AWS"] }), v), 40);
  });
  it("no distingue mayúsculas", () => assert.equal(scoreSkills(candidate({ skills: ["typescript", "REACT", "node.js", "sql"] }), v), 40));
  it("sin habilidades: 0", () => assert.equal(scoreSkills(candidate({ skills: [] }), v), 0));
});

describe("scoreExperience (máx. 20) con rango 4-8", () => {
  for (const [years, points] of [[4, 20], [6, 20], [8, 20], [3, 10], [2, 10], [9, 10], [10, 10], [1, 0], [11, 0], [0, 0]] as const) {
    it(`${years} años: ${points}`, () => assert.equal(scoreExperience(candidate({ yearsOfExperience: years }), sampleVacancy), points));
  }
});

describe("scoreSeniority (máx. 15) con vacante Senior", () => {
  for (const [level, points] of [["Senior", 15], ["Semi-Senior", 7], ["Lead", 7], ["Junior", 0], ["Executive", 0]] as const) {
    it(`${level}: ${points}`, () => assert.equal(scoreSeniority(candidate({ seniority: level }), sampleVacancy), points));
  }
});

describe("scoreEnglish (máx. 15) con requisito B2", () => {
  for (const [level, points] of [["B2", 15], ["C1", 15], ["Native", 15], ["B1", 0], ["A1", 0]] as const) {
    it(`${level}: ${points}`, () => assert.equal(scoreEnglish(candidate({ englishLevel: level }), sampleVacancy), points));
  }
});

describe("scoreSalary (máx. 10) con rango 5000-7000", () => {
  for (const [salary, points] of [[5000, 10], [7000, 10], [4200, 10], [7001, 5], [8400, 5], [8401, 0], [10000, 0]] as const) {
    it(`esperado ${salary}: ${points}`, () => assert.equal(scoreSalary(candidate({ expectedSalary: salary }), sampleVacancy), points));
  }
});

describe("rankCandidatesForVacancy", () => {
  it("ordena de mayor a menor puntaje e incluye el puntaje", () => {
    const ranking = rankCandidatesForVacancy(sampleCandidates, sampleVacancy);
    assert.deepEqual(ranking.map((r) => [r.candidate.id, r.score]), [["C-2024-0453", 100], ["C-2024-0451", 92], ["C-2024-0452", 20]]);
    assert.equal(ranking[0]?.candidate, carolina);
  });
  it("ante empates conserva el orden original", () => {
    const a = candidate({ id: "A" });
    const b = candidate({ id: "B" });
    assert.deepEqual(rankCandidatesForVacancy([a, b], sampleVacancy).map((r) => r.candidate.id), ["A", "B"]);
  });
  it("con la lista vacía devuelve un array vacío", () => assert.deepEqual(rankCandidatesForVacancy([], sampleVacancy), []));
  it("no modifica el array original", () => {
    const frozen = Object.freeze([...sampleCandidates]);
    rankCandidatesForVacancy(frozen as Candidate[], sampleVacancy);
    assert.deepEqual(frozen.map((c) => c.id), sampleCandidates.map((c) => c.id));
  });
});

describe("groupCandidatesBySeniority", () => {
  it("agrupa por nivel e incluye todos los niveles, aunque estén vacíos", () => {
    const groups = groupCandidatesBySeniority(sampleCandidates);
    assert.deepEqual(Object.keys(groups), ["Junior", "Semi-Senior", "Senior", "Lead", "Executive"]);
    assert.deepEqual(groups.Junior, [juan]);
    assert.deepEqual(groups["Semi-Senior"], [maria]);
    assert.deepEqual(groups.Senior, [carolina]);
    assert.deepEqual(groups.Lead, []);
    assert.deepEqual(groups.Executive, []);
  });
  it("varios candidatos del mismo nivel conservan su orden", () => {
    const a = candidate({ id: "A", seniority: "Lead" });
    const b = candidate({ id: "B", seniority: "Lead" });
    assert.deepEqual(groupCandidatesBySeniority([a, b]).Lead.map((c) => c.id), ["A", "B"]);
  });
  it("con la lista vacía devuelve todos los niveles vacíos", () => {
    assert.deepEqual(groupCandidatesBySeniority([]), { Junior: [], "Semi-Senior": [], Senior: [], Lead: [], Executive: [] });
  });
});

describe("countCandidatesByStatus", () => {
  it("cuenta cada estado e incluye los que están en 0", () => {
    assert.deepEqual(countCandidatesByStatus(sampleCandidates), { Active: 3, "In process": 0, Hired: 0, Inactive: 0 });
  });
  it("con estados mezclados", () => {
    const list = [candidate({ status: "Hired" }), candidate({ status: "Hired" }), candidate({ status: "Inactive" }), candidate({ status: "Active" })];
    assert.deepEqual(countCandidatesByStatus(list), { Active: 1, "In process": 0, Hired: 2, Inactive: 1 });
  });
  it("con la lista vacía todo en 0", () => {
    assert.deepEqual(countCandidatesByStatus([]), { Active: 0, "In process": 0, Hired: 0, Inactive: 0 });
  });
});

describe("calculateAverageSalary", () => {
  it("promedia el salario esperado de los ejemplos: (4200 + 2800 + 6500) / 3 = 4500", () => {
    assert.equal(calculateAverageSalary(sampleCandidates), 4500);
  });
  it("redondea a 2 decimales", () => {
    const list = [candidate({ expectedSalary: 1000 }), candidate({ expectedSalary: 1000 }), candidate({ expectedSalary: 1001 })];
    assert.equal(calculateAverageSalary(list), 1000.33);
  });
  it("redondea hacia arriba un 5 en el tercer decimal aunque el número binario quede justo por debajo (1,005 → 1,01)", () => {
    // 1,005 en binario es 1,00499999…; sin compensarlo, Math.round daría 1.
    assert.equal(calculateAverageSalary([candidate({ expectedSalary: 1 }), candidate({ expectedSalary: 1.01 })]), 1.01);
  });
  it("con la lista vacía devuelve 0, no NaN", () => assert.equal(calculateAverageSalary([]), 0));
});

describe("findTopSkills", () => {
  it("devuelve las N más comunes, de más a menos frecuente; empates en orden alfabético", () => {
    // TypeScript 2, React 2, Node.js 2, PostgreSQL 2; el resto 1.
    assert.deepEqual(findTopSkills(sampleCandidates, 3), [
      { skill: "Node.js", count: 2 },
      { skill: "PostgreSQL", count: 2 },
      { skill: "React", count: 2 },
    ]);
  });
  it("cuenta una vez por candidato y sin distinguir mayúsculas", () => {
    const list = [candidate({ skills: ["React", "react", "REACT"] }), candidate({ skills: ["react"] })];
    assert.deepEqual(findTopSkills(list, 5), [{ skill: "React", count: 2 }]);
  });
  it("si pides más de las que hay, devuelve todas", () => assert.equal(findTopSkills(sampleCandidates, 100).length, 9));
  it("con topN 0 o negativo devuelve []", () => {
    assert.deepEqual(findTopSkills(sampleCandidates, 0), []);
    assert.deepEqual(findTopSkills(sampleCandidates, -2), []);
  });
  it("con la lista vacía devuelve []", () => assert.deepEqual(findTopSkills([], 3), []));
  it("ignora habilidades vacías", () => assert.deepEqual(findTopSkills([candidate({ skills: ["", "  ", "SQL"] })], 5), [{ skill: "SQL", count: 1 }]));
});

describe("calculateVacancyFillRate", () => {
  const process = (stage: ProcessStage, i: number): SelectionProcess => ({
    id: `SP-${i}`, candidateId: "C", vacancyId: "V", stage, score: 50, notes: "", createdAt: new Date(2026, 0, 1), updatedAt: new Date(2026, 0, 2),
  });
  const processes = (stages: ProcessStage[]) => stages.map(process);

  it("porcentaje de procesos en Hired", () => assert.equal(calculateVacancyFillRate(processes(["Hired", "Rejected", "Interview", "Hired"])), 50));
  it("redondea a 2 decimales (1 de 3 = 33,33)", () => assert.equal(calculateVacancyFillRate(processes(["Hired", "Offer", "Rejected"])), 33.33));
  it("todos contratados: 100; ninguno: 0", () => {
    assert.equal(calculateVacancyFillRate(processes(["Hired", "Hired"])), 100);
    assert.equal(calculateVacancyFillRate(processes(["Offer", "Rejected"])), 0);
  });
  it("una oferta no es una contratación", () => assert.equal(calculateVacancyFillRate(processes(["Offer"])), 0));
  it("con la lista vacía devuelve 0, no NaN", () => assert.equal(calculateVacancyFillRate([]), 0));
});
