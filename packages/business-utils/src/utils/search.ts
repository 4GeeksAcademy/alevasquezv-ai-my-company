// Búsquedas: lineal para arrays sin orden, binaria para arrays ya ordenados por salario esperado.
import type { Candidate } from "../types/models.ts";

// Búsqueda lineal: revisa los candidatos uno a uno hasta dar con el id. Coste: hasta n comparaciones.
export function findCandidateById(candidates: Candidate[], id: string): Candidate | null {
  for (const candidate of candidates) {
    if (candidate.id === id) return candidate;
  }
  return null;
}

// Búsqueda lineal sin distinguir mayúsculas ni espacios sobrantes en el email.
export function findCandidateByEmail(candidates: Candidate[], email: string): Candidate | null {
  const target = email.trim().toLowerCase();
  for (const candidate of candidates) {
    if (candidate.email.trim().toLowerCase() === target) return candidate;
  }
  return null;
}

// Búsqueda binaria: exige el array ordenado por `expectedSalary` ascendente. En cada vuelta mira el elemento del
// medio y descarta la mitad donde el salario no puede estar. Coste: unas log2(n) comparaciones.
export function binarySearchCandidateBySalary(sortedCandidates: Candidate[], targetSalary: number): number {
  let low = 0;
  let high = sortedCandidates.length - 1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const salary = sortedCandidates[middle]!.expectedSalary;

    if (salary === targetSalary) return middle;
    if (salary < targetSalary) low = middle + 1;
    else high = middle - 1;
  }
  return -1;
}
