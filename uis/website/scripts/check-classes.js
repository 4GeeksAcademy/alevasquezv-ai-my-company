// Comprueba que cada clase de Tailwind usada en el HTML y en validation.js existe en el CSS compilado.
// Tailwind descarta en silencio las clases mal escritas o de versiones anteriores (p. ej. bg-gradient-to-r en la v4),
// así que un error de escritura no da ningún aviso: el estilo simplemente no aparece.
// Uso: npm run check:classes (desde uis/website; recompila antes el CSS con npm run build:css).
const fs = require("fs");

const css = fs.readFileSync("assets/tailwind.css", "utf8");
// Mismo escapado que usa CSS para los selectores (: [ ] = / . etc.).
const escapar = (token) => token.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
// Clases que Tailwind usa como marca y para las que no genera una regla propia.
const marcadores = new Set(["group"]);

const clasesEn = {
  "index.html": [...fs.readFileSync("index.html", "utf8").matchAll(/\sclass="([^"]*)"/g)].map((m) => m[1]),
  "application.html": [...fs.readFileSync("application.html", "utf8").matchAll(/\sclass="([^"]*)"/g)].map((m) => m[1]),
  "validation.js": [...fs.readFileSync("validation.js", "utf8").matchAll(/className =\s*"([^"]+)"/g)].map((m) => m[1]),
};

let total = 0;
const sinRegla = [];
for (const [archivo, listas] of Object.entries(clasesEn)) {
  const tokens = new Set(listas.flatMap((lista) => lista.split(/\s+/).filter(Boolean)));
  for (const token of tokens) {
    total++;
    if (!marcadores.has(token) && !css.includes("." + escapar(token))) sinRegla.push(`${archivo}: ${token}`);
  }
}

console.log(`${total} clases distintas revisadas`);
if (sinRegla.length) {
  console.log("Sin regla en el CSS (probable error de escritura):\n  " + sinRegla.join("\n  "));
  process.exit(1);
}
console.log("OK: todas las clases tienen su regla en el CSS");
