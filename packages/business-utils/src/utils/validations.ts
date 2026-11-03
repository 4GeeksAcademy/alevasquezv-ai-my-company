// Validaciones de negocio: comprueban un candidato o una vacante antes de procesarlo o guardarlo.
// Cada regla incumplida añade un mensaje; `valid` es true solo si no hay ninguno.
import type { Candidate, ValidationResult, Vacancy } from "../types/models.ts";

const MAX_YEARS_OF_EXPERIENCE = 50;

// Verificación básica (no de producción): una sola @, con texto antes, y un punto en el dominio que no esté
// pegado a la @ ni al final. Sin espacios.
export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const value = email.trim();
  if (value.includes(" ")) return false;

  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts as [string, string];
  if (local.length === 0) return false;

  const dotIndex = domain.lastIndexOf(".");
  return dotIndex > 0 && dotIndex < domain.length - 1;
}

export function validateCandidate(candidate: Candidate): ValidationResult {
  if (!candidate) return { valid: false, errors: ["No se recibió ningún candidato"] };

  const errors: string[] = [];
  const years = candidate.yearsOfExperience;

  if (!isFiniteNumber(years) || years < 0 || years > MAX_YEARS_OF_EXPERIENCE) {
    errors.push(`Los años de experiencia deben estar entre 0 y ${MAX_YEARS_OF_EXPERIENCE}`);
  }
  if (!isPositiveNumber(candidate.currentSalary)) errors.push("El salario actual debe ser mayor que 0");
  if (!isPositiveNumber(candidate.expectedSalary)) errors.push("El salario esperado debe ser mayor que 0");
  if (!hasAtLeastOneSkill(candidate.skills)) errors.push("El candidato debe tener al menos 1 habilidad");
  if (!isValidEmail(candidate.email)) errors.push("El email no tiene un formato válido");
  if (!isNonEmptyText(candidate.phone)) errors.push("El teléfono es obligatorio");

  return { valid: errors.length === 0, errors };
}

export function validateVacancy(vacancy: Vacancy): ValidationResult {
  if (!vacancy) return { valid: false, errors: ["No se recibió ninguna vacante"] };

  const errors: string[] = [];
  const { minYearsExperience, maxYearsExperience, salaryRangeMin, salaryRangeMax } = vacancy;

  if (!hasAtLeastOneSkill(vacancy.requiredSkills)) errors.push("La vacante debe requerir al menos 1 habilidad");
  if (!isFiniteNumber(minYearsExperience) || minYearsExperience < 0) {
    errors.push("La experiencia mínima debe ser mayor o igual a 0");
  }
  if (!isFiniteNumber(maxYearsExperience) || maxYearsExperience < minYearsExperience) {
    errors.push("La experiencia máxima debe ser mayor o igual a la mínima");
  }
  if (!isPositiveNumber(salaryRangeMin)) errors.push("El salario mínimo debe ser mayor que 0");
  if (!isPositiveNumber(salaryRangeMax)) errors.push("El salario máximo debe ser mayor que 0");
  if (isFiniteNumber(salaryRangeMin) && isFiniteNumber(salaryRangeMax) && salaryRangeMax < salaryRangeMin) {
    errors.push("El salario máximo debe ser mayor o igual al mínimo");
  }

  return { valid: errors.length === 0, errors };
}

// Auxiliares de las reglas. Comprueban también el tipo, porque los datos pueden llegar de fuera (un formulario, un
// archivo) sin pasar por el compilador: `NaN`, `null` o un texto donde va un número no deben colarse.

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPositiveNumber(value: unknown): boolean {
  return isFiniteNumber(value) && value > 0;
}

function isNonEmptyText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasAtLeastOneSkill(skills: unknown): boolean {
  return Array.isArray(skills) && skills.some(isNonEmptyText);
}
