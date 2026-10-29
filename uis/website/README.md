# Sitio web público de Nexova (Hito 1)

Landing corporativa y formulario de registro de talento, en HTML estático con Tailwind CSS y JavaScript sin
dependencias. Sin backend: el formulario valida los datos y **simula** el envío.

| Página | Archivo | Qué hace |
| --- | --- | --- |
| Landing | `index.html` | Encabezado, hero, servicios, por qué Nexova, contacto y pie. Incluye el marcado Schema.org del briefing. |
| Formulario | `application.html` | Los 11 campos del briefing con validación en tiempo real, resumen de errores, botón de limpiar y mensaje de éxito. |
| Validación | `validation.js` | Reglas puras (probadas en Node) y la capa que las conecta con el formulario. |
| Briefing | `BRIEFING.md` | Especificación original, **sin modificar**. Manda sobre cualquier otro criterio. |

## Ejecutar el sitio

Desde la raíz del repositorio (funciona igual en tu Mac y en Codespaces):

```bash
npx -y serve@14.2.6 uis/website -l 3000 --no-clipboard
```

Abre <http://localhost:3000>. También sirve `cd uis/website && npm start`. Y si solo quieres mirarlo, `index.html`
se puede abrir con doble clic, sin servidor.

### URL pública en Codespaces (para que lo audite otra persona)

1. En GitHub: botón **Code → Codespaces → Create codespace** sobre la rama del PR.
2. En la terminal del Codespace, ejecuta el comando de arriba. El puerto 3000 se reenvía solo.
3. Pestaña **Ports**, clic derecho en el puerto 3000, **Port Visibility → Public**.
4. Copia la **Forwarded Address** y pégala en <https://pagespeed.web.dev/>. Si PageSpeed no puede alcanzarla, abre esa
   misma URL en Chrome y usa **DevTools → Lighthouse**. Guarda la captura para la descripción del PR.
5. El sitio solo responde mientras el Codespace está encendido. Se apaga a los 30 min sin actividad: súbelo en
   <https://github.com/settings/codespaces> (**Default idle timeout**, hasta 4 h) y mantén la terminal abierta.

## Cambiar estilos

Todo el diseño usa **solo clases de Tailwind** en el HTML; no hay CSS escrito a mano. El navegador carga
`assets/tailwind.css`, que es un archivo **generado** (no se edita) y está guardado en el repositorio para que el sitio
se sirva sin ningún paso de compilación.

Cuando cambies clases en `index.html`, `application.html` o `validation.js`:

```bash
cd uis/website
npm install          # solo la primera vez
npm run build:css    # regenera assets/tailwind.css
npm run check        # recompila, corre las pruebas y verifica que todas las clases existen
```

`npm run dev:css` recompila solo mientras editas. **Cuidado:** Tailwind ignora en silencio una clase mal escrita (el
estilo simplemente no aparece). `npm run check:classes` te avisa de cuáles no existen.

Se usa la sintaxis de Tailwind v4 (por ejemplo `bg-linear-to-b`, no `bg-gradient-to-b`).

## Pruebas

```bash
cd uis/website
npm test                                                                  # las 153 pruebas
node --test --test-name-pattern="teléfono" tests/validation.test.js       # solo un grupo
```

Las pruebas cubren las funciones de validación (nombre, email, teléfono, años, LinkedIn, comentarios, política y listas
de opciones) con los casos límite del briefing. La capa que las conecta con la página no se puede probar en Node sin
dependencias: se verificó en el navegador (ver abajo).

## Estructura

```text
uis/website/
├── index.html · application.html · validation.js · BRIEFING.md
├── package.json · package-lock.json     dependencias solo para recompilar el CSS
├── serve.json                           evita que /application.html se redirija a /application y sirve / como index.html
├── src/input.css                        entrada de Tailwind (solo importa Tailwind y lista los archivos a leer)
├── assets/                              tailwind.css (generado) · hero.svg · favicon.svg
├── scripts/check-classes.js             verificador de clases
└── tests/validation.test.js
```

## Decisiones de diseño

- **Copy, campos y mensajes de error del briefing van literales.** Dónde el correo del manager o el criterio propio
  difieren, gana el briefing.
- **Solo español.** El briefing recomienda un segundo idioma; queda fuera de esta entrega (PR aparte).
- **Sin campo `date`** aunque el checklist del bootcamp lo cite como ejemplo: los campos del formulario son exactamente
  los del briefing.
- **Años de experiencia admite decimales** (el briefing solo pide entre 0 y 50).
- **Comentarios sin límite duro:** al pasar de 500 caracteres aparece el error con el contador (con `maxlength`
  nunca se vería). El texto "(quedan X)" usa X = 500 menos la longitud, que es negativo al excederse.
- **El pie repite email y teléfonos**, además del copyright y las redes del briefing, porque el checklist pide
  información de contacto en el `<footer>`.
- **`role="list"` en listas sin viñetas:** el reset de Tailwind quita las viñetas y Safari/VoiceOver deja de anunciar
  la lista; el rol lo corrige. Un validador estricto lo marca como redundante.
- **Sin `canonical` ni `og:url`** hasta tener dominio real (la documentación de Lighthouse marca como fallo un canonical
  que apunte a otro dominio, y en Codespaces el dominio no es `nexova.com`).
- **Sin página de política de datos:** el checkbox queda como texto. No se inventó una política legal.
- **Iconos:** [Phosphor Icons](https://phosphoricons.com) 2.1.1 (licencia MIT), pegados como SVG en línea.

## Qué se verificó y qué no

| Verificación | Resultado |
| --- | --- |
| Lighthouse 13 en local (Chrome), móvil y escritorio, ambas páginas | 100 en Performance, Accessibility, Best Practices y SEO en las 4 mediciones |
| 153 pruebas unitarias + 17 mutaciones del código detectadas por las pruebas | OK |
| 75 comprobaciones del formulario en el navegador (reglas, mensajes literales, corrección en vivo, limpiar, envío vacío y válido) | OK |
| Recorrido solo con teclado (Tab real): 25 paradas en orden lógico, todas con foco visible, enlace de salto funcional | OK |
| Zoom al 200 % y ancho de 320 px: sin desbordes; objetivos táctiles de 44 px | OK |
| JSON-LD idéntico al del briefing; todas las frases del copy presentes; enlaces e ids internos válidos | OK |
| HTML con `html-validate` (salvo `role="list"`, `for` junto a etiqueta envolvente y teléfonos con espacios) | OK |

**No verificado:** lector de pantalla real (VoiceOver/NVDA), Safari y Firefox (solo se probó en Chromium), y
PageSpeed Insights sobre la URL pública de Codespaces (depende de tu Codespace; las cifras de arriba son locales y
sin la latencia del proxy).
