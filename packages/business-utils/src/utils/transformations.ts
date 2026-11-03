// Scoring, ranking, agrupación y reportes. Todo con map/filter/reduce, sin modificar lo que se recibe.
import {
  CANDIDATE_STATUSES,
  SENIORITY_LEVELS,
  englishLevelRank,
  normalizeSkill,
  seniorityRank,
  type Candidate,
  type CandidateStatus,
  type SelectionProcess,
  type SeniorityLevel,
  type Vacancy,
} from "../types/models.ts";

export interface RankedCandidate {
  candidate: Candidate;
  score: number;
}

export interface SkillCount {
  skill: string;
  count: number;
}

// ---------- Scoring (0-100): suma de cinco bloques del briefing ----------

export function calculateCandidateScore(candidate: Candidate, vacancy: Vacancy): number {
  return (
    scoreSkills(candidate, vacancy) +
    scoreExperience(candidate, vacancy) +
    scoreSeniority(candidate, vacancy) +
    scoreEnglish(candidate, vacancy) +
    scoreSalary(candidate, vacancy)
  );
}

// Habilidades (máx. 40): 40 si tiene todas las requeridas, 20 si tiene al menos la mitad, +10 por cada preferida
// (máx. +20). El bloque nunca pasa de 40.
export function scoreSkills(candidate: Candidate, vacancy: Vacancy): number {
  const owned = new Set(candidate.skills.map(normalizeSkill));
  const required = vacancy.requiredSkills.map(normalizeSkill);
  const matchedRequired = required.filter((skill) => owned.has(skill)).length;
  const matchedPreferred = vacancy.preferredSkills.map(normalizeSkill).filter((skill) => owned.has(skill)).length;

  let requiredPoints = 0;
  if (matchedRequired === required.length) requiredPoints = 40;
  else if (matchedRequired / required.length >= 0.5) requiredPoints = 20;

  const preferredPoints = Math.min(matchedPreferred * 10, 20);
  return Math.min(requiredPoints + preferredPoints, 40);
}

// Experiencia (máx. 20): 20 dentro del rango, 10 si está a 2 años o menos de él, 0 si está más lejos.
export function scoreExperience(candidate: Candidate, vacancy: Vacancy): number {
  const years = candidate.yearsOfExperience;
  let distance = 0;
  if (years < vacancy.minYearsExperience) distance = vacancy.minYearsExperience - years;
  else if (years > vacancy.maxYearsExperience) distance = years - vacancy.maxYearsExperience;

  if (distance === 0) return 20;
  if (distance <= 2) return 10;
  return 0;
}

// Seniority (máx. 15): 15 si coincide, 7 si está un nivel arriba o abajo, 0 en otro caso.
export function scoreSeniority(candidate: Candidate, vacancy: Vacancy): number {
  const levelsApart = Math.abs(seniorityRank(candidate.seniority) - seniorityRank(vacancy.requiredSeniority));
  if (levelsApart === 0) return 15;
  if (levelsApart === 1) return 7;
  return 0;
}

// Inglés (máx. 15): 15 si cumple o supera el nivel requerido.
export function scoreEnglish(candidate: Candidate, vacancy: Vacancy): number {
  return englishLevelRank(candidate.englishLevel) >= englishLevelRank(vacancy.requiredEnglishLevel) ? 15 : 0;
}

// Salario (máx. 10): 10 si el esperado no supera el máximo de la vacante (un esperado por debajo del mínimo también
// cabe en el presupuesto), 5 si lo supera hasta un 20 %, 0 si lo supera en más.
export function scoreSalary(candidate: Candidate, vacancy: Vacancy): number {
  const expected = candidate.expectedSalary;
  if (expected <= vacancy.salaryRangeMax) return 10;
  if (expected <= vacancy.salaryRangeMax * 1.2) return 5;
  return 0;
}

// ---------- Ranking y agrupación ----------

export function rankCandidatesForVacancy(candidates: Candidate[], vacancy: Vacancy): RankedCandidate[] {
  return candidates
    .map((candidate) => ({ candidate, score: calculateCandidateScore(candidate, vacancy) }))
    .sort((a, b) => b.score - a.score);
}

export function groupCandidatesBySeniority(candidates: Candidate[]): Record<SeniorityLevel, Candidate[]> {
  const groups = emptyRecord(SENIORITY_LEVELS, (): Candidate[] => []);
  return candidates.reduce((acc, candidate) => {
    acc[candidate.seniority] = [...acc[candidate.seniority], candidate];
    return acc;
  }, groups);
}

// ---------- Agregaciones y reportes ----------

export function countCandidatesByStatus(candidates: Candidate[]): Record<CandidateStatus, number> {
  const counts = emptyRecord(CANDIDATE_STATUSES, () => 0);
  return candidates.reduce((acc, candidate) => {
    acc[candidate.status] += 1;
    return acc;
  }, counts);
}

export function calculateAverageSalary(candidates: Candidate[]): number {
  if (candidates.length === 0) return 0;
  const total = candidates.reduce((sum, candidate) => sum + candidate.expectedSalary, 0);
  return roundToTwoDecimals(total / candidates.length);
}

// Cuenta en cuántos candidatos aparece cada habilidad (sin distinguir mayúsculas). Ordena de más a menos frecuente;
// a igual frecuencia, alfabéticamente. Muestra la habilidad tal como apareció la primera vez.
export function findTopSkills(candidates: Candidate[], topN: number): SkillCount[] {
  if (topN <= 0) return [];

  const counts = candidates.reduce((acc, candidate) => {
    // Una entrada por habilidad distinta del candidato, conservando la primera forma en que la escribió.
    const uniqueSkills = candidate.skills.reduce((seen, skill) => {
      const key = normalizeSkill(skill);
      if (!seen.has(key)) seen.set(key, skill.trim());
      return seen;
    }, new Map<string, string>());
    uniqueSkills.forEach((label, key) => {
      if (key === "") return;
      const current = acc.get(key);
      acc.set(key, { skill: current?.skill ?? label, count: (current?.count ?? 0) + 1 });
    });
    return acc;
  }, new Map<string, SkillCount>());

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill))
    .slice(0, Math.floor(topN));
}

// Porcentaje (0-100) de procesos que terminaron en "Hired".
export function calculateVacancyFillRate(processes: SelectionProcess[]): number {
  if (processes.length === 0) return 0;
  const hired = processes.filter((selectionProcess) => selectionProcess.stage === "Hired").length;
  return roundToTwoDecimals((hired / processes.length) * 100);
}

// ---------- Auxiliares ----------

function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Crea un objeto con TODAS las claves de la lista, cada una con su valor inicial (así un estado sin candidatos sale
// con 0 o con [] en lugar de faltar).
function emptyRecord<K extends string, V>(keys: readonly K[], initialValue: () => V): Record<K, V> {
  return Object.fromEntries(keys.map((key) => [key, initialValue()])) as Record<K, V>;
}
