// Operaciones de colecciones: filtrar y ordenar candidatos sin modificar los arrays recibidos.
import { normalizeSkill, type AvailabilityStatus, type Candidate, type SeniorityLevel } from "../types/models.ts";

export function filterCandidatesBySkills(candidates: Candidate[], requiredSkills: string[]): Candidate[] {
  const wanted = requiredSkills.map(normalizeSkill);
  return candidates.filter((candidate) => {
    const owned = new Set(candidate.skills.map(normalizeSkill));
    return wanted.every((skill) => owned.has(skill));
  });
}

export function filterCandidatesBySeniority(candidates: Candidate[], seniority: SeniorityLevel): Candidate[] {
  return candidates.filter((candidate) => candidate.seniority === seniority);
}

export function filterCandidatesByAvailability(
  candidates: Candidate[],
  availability: AvailabilityStatus[],
): Candidate[] {
  return candidates.filter((candidate) => availability.includes(candidate.availability));
}

export type SortOrder = "asc" | "desc";

export function sortCandidatesBySalary(candidates: Candidate[], order: SortOrder): Candidate[] {
  return sortByNumber(candidates, (candidate) => candidate.expectedSalary, order);
}

export function sortCandidatesByExperience(candidates: Candidate[], order: SortOrder): Candidate[] {
  return sortByNumber(candidates, (candidate) => candidate.yearsOfExperience, order);
}

// Ordena una COPIA por el número que devuelva `getValue`. `sort` es estable: los empates mantienen su orden.
function sortByNumber(candidates: Candidate[], getValue: (candidate: Candidate) => number, order: SortOrder): Candidate[] {
  const direction = order === "asc" ? 1 : -1;
  return [...candidates].sort((a, b) => (getValue(a) - getValue(b)) * direction);
}
