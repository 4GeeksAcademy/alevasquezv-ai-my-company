// Demostración: ejecuta cada función sobre los datos de ejemplo del briefing. `npm run demo`.
import { sampleCandidates, sampleVacancy } from "./data/samples.ts";
import type { SelectionProcess } from "./types/models.ts";
import {
  filterCandidatesByAvailability,
  filterCandidatesBySeniority,
  filterCandidatesBySkills,
  sortCandidatesByExperience,
  sortCandidatesBySalary,
} from "./utils/collections.ts";
import { binarySearchCandidateBySalary, findCandidateByEmail, findCandidateById } from "./utils/search.ts";
import {
  calculateAverageSalary,
  calculateVacancyFillRate,
  countCandidatesByStatus,
  findTopSkills,
  groupCandidatesBySeniority,
  rankCandidatesForVacancy,
} from "./utils/transformations.ts";
import { isValidEmail, validateCandidate, validateVacancy } from "./utils/validations.ts";

const names = (list: { fullName: string }[]): string => list.map((c) => c.fullName).join(", ") || "(ninguno)";
const section = (title: string): void => console.log(`\n=== ${title} ===`);

section("Colecciones");
console.log("Con TypeScript y Node.js:", names(filterCandidatesBySkills(sampleCandidates, ["typescript", "node.js"])));
console.log("Senior:", names(filterCandidatesBySeniority(sampleCandidates, "Senior")));
console.log("Disponibles en 2 semanas o menos:", names(filterCandidatesByAvailability(sampleCandidates, ["Immediate", "2 weeks"])));
console.log("Por salario esperado (asc):", names(sortCandidatesBySalary(sampleCandidates, "asc")));
console.log("Por experiencia (desc):", names(sortCandidatesByExperience(sampleCandidates, "desc")));

section("Búsquedas");
console.log("Id C-2024-0452:", findCandidateById(sampleCandidates, "C-2024-0452")?.fullName ?? null);
console.log("Email CAROLINA.SILVA@EMAIL.COM:", findCandidateByEmail(sampleCandidates, "CAROLINA.SILVA@EMAIL.COM")?.fullName ?? null);
const bySalary = sortCandidatesBySalary(sampleCandidates, "asc");
console.log("Binaria, salario 4200 → índice", binarySearchCandidateBySalary(bySalary, 4200), "| salario 5000 → índice", binarySearchCandidateBySalary(bySalary, 5000));

section(`Ranking para "${sampleVacancy.title}" (${sampleVacancy.companyName})`);
for (const { candidate, score } of rankCandidatesForVacancy(sampleCandidates, sampleVacancy)) {
  console.log(`${String(score).padStart(3)}  ${candidate.fullName}`);
}

section("Reportes");
const groups = groupCandidatesBySeniority(sampleCandidates);
console.log("Por seniority:", Object.entries(groups).map(([level, list]) => `${level} ${list.length}`).join(" · "));
console.log("Por estado:", countCandidatesByStatus(sampleCandidates));
console.log("Salario esperado promedio (USD):", calculateAverageSalary(sampleCandidates));
console.log("Top 3 habilidades:", findTopSkills(sampleCandidates, 3));
const processes: SelectionProcess[] = (["Hired", "Rejected", "Interview", "Hired"] as const).map((stage, i) => ({
  id: `SP-2024-${1520 + i}`, candidateId: sampleCandidates[i % 3]!.id, vacancyId: sampleVacancy.id, stage,
  score: 0, notes: "", createdAt: new Date("2026-10-01"), updatedAt: new Date("2026-10-20"),
}));
console.log("Tasa de cobertura de 4 procesos de prueba (%):", calculateVacancyFillRate(processes));

section("Validaciones");
console.log("¿maria.gonzalez@email.com es válido?", isValidEmail("maria.gonzalez@email.com"), "| ¿maria@email?", isValidEmail("maria@email"));
console.log("María:", validateCandidate(sampleCandidates[0]!));
console.log("Candidato con datos malos:", validateCandidate({ ...sampleCandidates[0]!, yearsOfExperience: 60, skills: [], phone: "" }));
console.log("Vacante de ejemplo:", validateVacancy(sampleVacancy));
console.log("Vacante con rangos invertidos:", validateVacancy({ ...sampleVacancy, minYearsExperience: 8, maxYearsExperience: 4 }));
