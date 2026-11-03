# Utilidades de candidatos y vacantes (Hito 2)

Funciones TypeScript puras para el sistema de gestión de candidatos de Nexova: modelar candidatos, vacantes y procesos
de selección; filtrarlos, ordenarlos y buscarlos; puntuar y rankear candidatos contra una vacante; generar reportes y
validar los datos antes de procesarlos. Es la capa lógica sobre la que se construirá la interfaz de los consultores.
La especificación es [`BRIEFING.md`](./BRIEFING.md) (**sin modificar**: manda sobre cualquier otro criterio).

No usa APIs de Node en `src/` (salvo `demo.ts`), así que funciona igual en el navegador.

## Comandos

Desde esta carpeta (la primera vez, `npm install`):

```bash
npm run typecheck   # tsc --noEmit: comprueba los tipos sin generar archivos
npm test            # las pruebas (node:test ejecutado con tsx)
npm run demo        # ejecuta cada función con los datos de ejemplo del briefing
npm run check       # typecheck + pruebas
```

Una sola suite: `npx tsx --test --test-name-pattern="scoreSkills" tests/transformations.test.ts`.

## Estructura

| Archivo | Contenido |
| --- | --- |
| `src/types/models.ts` | Interfaces `Candidate`, `Vacancy`, `SelectionProcess` y sus tipos; orden de seniority e inglés y auxiliares (`seniorityRank`, `englishLevelRank`, `normalizeSkill`) |
| `src/utils/collections.ts` | `filterCandidatesBySkills`, `filterCandidatesBySeniority`, `filterCandidatesByAvailability`, `sortCandidatesBySalary`, `sortCandidatesByExperience` |
| `src/utils/search.ts` | `findCandidateById` y `findCandidateByEmail` (búsqueda lineal), `binarySearchCandidateBySalary` (búsqueda binaria) |
| `src/utils/transformations.ts` | `calculateCandidateScore` (y un `score…` por bloque), `rankCandidatesForVacancy`, `groupCandidatesBySeniority`, `countCandidatesByStatus`, `calculateAverageSalary`, `findTopSkills`, `calculateVacancyFillRate` |
| `src/utils/validations.ts` | `isValidEmail`, `validateCandidate`, `validateVacancy` |
| `src/data/samples.ts` | Datos de ejemplo del briefing, literales |
| `src/demo.ts` | Demostración por consola |
| `tests/` | Una suite por archivo de `utils` |

## Reglas que se cumplen en todo el paquete

- **Sin mutaciones:** filtros y ordenamientos devuelven arrays nuevos (las pruebas pasan arrays congelados).
- **Funciones puras:** solo usan sus parámetros; las únicas constantes de módulo son de solo lectura.
- **Casos límite:** arrays vacíos devuelven `[]`, `null`, `-1` o `0` (nunca `NaN`); las validaciones también rechazan
  `NaN`, `null` y textos vacíos, porque los datos pueden llegar de fuera sin pasar por el compilador.

## Cómo se interpretaron los huecos del briefing

| Hueco | Decisión |
| --- | --- |
| Habilidades: 40 por las requeridas más hasta 20 por preferidas podría pasar de 40 | El bloque tiene **tope de 40** ("40 puntos máx"). Por eso Carolina, a la que le falta React, también llega a 40 |
| Salario esperado **por debajo** del mínimo de la vacante | **10 puntos**: cabe en el presupuesto; penalizar a un candidato más barato no tiene sentido de negocio |
| "1-2 años fuera del rango" | Hasta 2 años de distancia (incluidos decimales) da 10 puntos |
| Comparación de habilidades | Sin distinguir mayúsculas ni espacios sobrantes, en filtros, scoring y `findTopSkills` |
| Orden de niveles | `Junior < Semi-Senior < Senior < Lead < Executive`; `A1 < A2 < B1 < B2 < C1 < C2 < Native` |
| Agrupar y contar | El resultado trae **todas** las claves, aunque estén vacías o en 0 |
| Promedios y tasas sin datos | Devuelven 0 |
| `findTopSkills` | Cuenta una vez por candidato; a igual frecuencia, orden alfabético; `topN <= 0` devuelve `[]` |
| Empates en ordenamientos y ranking | Se conserva el orden original (`sort` es estable) |
| Email válido | Una sola `@` con texto antes, y un punto en el dominio que no esté pegado a la `@` ni al final; sin espacios |
| Mensajes de validación | En español, uno por regla incumplida |
| Filtro de disponibilidad con lista vacía | Devuelve `[]` (no hay estado con el que coincidir) |

Puntajes con los datos de ejemplo: **Carolina 100**, **María 92** (40 + 20 + 7 + 15 + 10) y **Juan 20** (0 + 10 + 0 + 0 + 10).
