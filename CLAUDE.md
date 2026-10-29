# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este repo

Monorepo de proyecto transversal del curso de AI Engineering de 4Geeks Academy, clonado de la plantilla
`ai-engineering-company-project-monorepo` (remoto `4GeeksAcademy/alevasquezv-ai-my-company`, rama `main`).
Se construye **una sola empresa ficticia, Nexova Solutions** (consultora de RR. HH., Valencia + Miami), a lo largo
de hitos: Web, Programación, Backend, Telemetría, RAG, Agentes, Workflows y Tiempo real. El usuario da las
instrucciones de cada hito en la conversación. Hoy solo está implementado el **Hito 1: sitio web público**, en
`uis/website/`; el resto del repo sigue siendo estructura de carpetas y READMEs.

## Lee esto antes de trabajar

- [`CONTEXT.md`](./CONTEXT.md): fuente única de verdad del dominio (áreas, responsables, tarifas, SLA, reglas de
  negocio) y lista de **inconsistencias conocidas entre fuentes**. No inventes datos de Nexova; si falta uno, pregunta.
- El briefing de cada hito vive junto a su código: [`uis/website/BRIEFING.md`](./uis/website/BRIEFING.md) (Hito 1).
  **No lo modifiques** (la entrega exige que esté intacto). El copy, los campos del formulario y los mensajes de error
  y de éxito son **literales**: impleméntalos tal cual, no los reescribas.
- [`company-choice.md`](./company-choice.md): por qué el usuario eligió Nexova y su idea de proyecto: un agente que
  consolida datos de cada área (validando lo que falte) en un data warehouse que alimenta un **dashboard ejecutivo
  para la CEO**. Reto secundario: unificar el stack tecnológico del CTO.

## Comandos

Todo el código ejecutable está en `uis/website/` (Node 22; no hay linter configurado). Desde la raíz del repo:

```bash
npx -y serve@14.2.6 uis/website -l 3000 --no-clipboard   # ejecutar el sitio (funciona igual en Codespaces)
```

Desde `uis/website/` (la primera vez, `npm install`: solo trae Tailwind para recompilar el CSS):

```bash
npm run build:css      # regenera assets/tailwind.css (obligatorio tras tocar clases en el HTML o en validation.js)
npm test               # las 153 pruebas de las funciones de validación (node:test, sin dependencias)
npm run check          # recompila el CSS, corre las pruebas y verifica que cada clase tenga regla en el CSS
node --test --test-name-pattern="teléfono" tests/validation.test.js   # un solo grupo de pruebas
```

Fuera de una terminal interactiva, Node imprime la salida de las pruebas en formato TAP (cientos de líneas): filtra con
`| grep -E '^# (tests|pass|fail)'`. Lighthouse: `npx -y lighthouse@13.6.0 http://localhost:3000/ --preset=desktop`
(en móvil, sin `--preset`) con el sitio en marcha.

### Trampas conocidas

- **Tailwind descarta en silencio una clase mal escrita** o con nombre de la v3 (`bg-gradient-to-r` ya no existe: es
  `bg-linear-to-r`). Un espacio perdido al editar fusiona dos clases en una inexistente. `npm run check:classes` lo detecta.
- `serve` sin `serve.json` muestra el listado de la carpeta en `/` y redirige `/application.html` a `/application`;
  `uis/website/serve.json` corrige ambas cosas.
- `packages/shared/package.json` declara `main` y `types` como `index.ts`, pero el archivo real es
  `packages/shared/types/index.ts`: `@repo/shared-types` no resolverá hasta corregir una de las dos cosas.
- Los READMEs de `packages/` y `shared/` mencionan una carpeta `apps/` que no existe; es `uis/`.
- `.devcontainer/post-create.sh` ya protege `uv sync` con `[ -f pyproject.toml ]`; sigue sin existir `pyproject.toml`,
  `docker-compose.yml` ni workspace de pnpm. `agents/_template/agent.py` y `skills/_template/SKILL.md` están vacíos; el
  único contenido real en `skills/` es `data-analysis/` (un snippet de pandas para adaptar y fórmulas de KPIs, incluidas
  las de RR. HH.).

## Arquitectura

Una sola empresa, una carpeta por responsabilidad. Lo que no se ve desde un solo archivo (el árbol de decisión
"¿Dónde pongo esto?" está en `README.es.md`):

- **Flujo de datos:** `data/raw` → `data/pipelines` → `data/process` → consumido por `services/`, `uis/` o `agents/`.
  `data/eval` guarda golden sets y métricas para demostrar la calidad de RAG, agentes y pipelines. En `data/raw`
  documenta el origen y la PII de cada dataset y evita subir datos sensibles.
- **Backend único:** `services/` aloja **una sola app FastAPI** con routers por dominio, no microservicios. Extrae un
  worker solo cuando de verdad deba correr aparte.
- **Capa de IA, tres carpetas con roles distintos:** `agents/` (un agente por subcarpeta, copiando
  `agents/_template/`; herramientas compartidas en `agents/tools/`), `skills/` (capacidades reutilizables: `SKILL.md` +
  `scripts/` + `resources/` + `examples/`) y `mcps/` (un servidor MCP por subcarpeta, para dar a los agentes acceso en
  vivo a datos o acciones).
- **Automatización, reutilización y operaciones:** `workflows/` (n8n) conecta `services/`, `data/pipelines/` y
  `agents/`; el código que importan 2+ carpetas va a `packages/`; `docker-compose.yml` va en la **raíz**, no en `infra/`.
- **`uis/website` (HTML estático, sin framework ni bundler).** Tres piezas acopladas por contrato:
  - **`application.html` ↔ `validation.js`.** `validation.js` es un script clásico (no módulo, para que `index.html` y
    el formulario funcionen abiertos con `file://`) con dos capas: funciones puras de validación, probadas en Node, y
    `initForm`, que solo actúa si existe `#formulario-talento`. El contrato: cada control lleva `name` y `data-field`
    iguales a una clave de `FIELD_ORDER`; su error es `#error-<clave>`; los `value` de selects y radios deben coincidir con
    `OPTIONS`; y el **orden del DOM debe ser el de `FIELD_ORDER`** (el primer error recibe el foco). Los mensajes son los
    literales del briefing y viven en `MESSAGES`.
  - **Estados sin tocar clases desde JS.** El JS solo cambia atributos (`aria-invalid`, `data-state`, `data-over`) y el
    HTML los estila con variantes de Tailwind (`aria-[invalid=true]:`, `data-[state=valid]:`). No añadas clases desde
    JS salvo como cadenas literales completas (Tailwind lee `validation.js` como texto).
  - **CSS precompilado y commiteado.** `assets/tailwind.css` es generado; `src/input.css` usa `source(none)` más
    `@source` explícitos, así que **un HTML nuevo no se escanea hasta añadirlo ahí**. Se escribe sintaxis de Tailwind v4.

## Convenciones y reglas del proyecto

- Cada app, servicio, agente o pipeline nuevo lleva **su subcarpeta y su README** (objetivo, tecnología, cómo
  ejecutarlo). No tires código en la raíz.
- Los READMEs de la plantilla vienen en pares EN/ES (`README.md` / `README.es.md`): si editas uno, mantén el par
  sincronizado. Los documentos propios del proyecto (`CONTEXT.md`, briefings, `uis/website/README.md`) están solo en español.
- **Solo Tailwind:** nada de CSS escrito a mano (lo exige el manager del Hito 1) salvo que sea absolutamente necesario.
- **Idioma base del sitio: español**; un segundo idioma queda fuera de la entrega actual.
- Las **tarifas y el manejo de objeciones son material interno de ventas** y no aparecen en el copy del sitio: no los
  publiques en páginas públicas sin confirmarlo con el usuario.
- El formulario de talento solo **simula** el envío (valida y muestra el mensaje de éxito) y captura datos personales:
  no lo conectes a ningún servicio externo ni guardes los datos sin que el usuario lo pida.
- No hagas commit, push ni abras PR sin que el usuario lo pida: la entrega del Hito 1 incluye una URL pública de
  Codespaces y una captura de PageSpeed o Lighthouse que solo el usuario puede generar.
