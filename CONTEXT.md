# CONTEXT — Nexova Solutions

> Fuente única de verdad del dominio para todo el repo (apps, agentes, prompts, datos de prueba).
> Consolidado a partir de los briefings entregados por 4Geeks (empresa, Hito 1, líneas de servicio,
> modelo de tarifas, SLA de contratación y manejo de objeciones). **No inventes datos de Nexova:
> si algo no está aquí, pregúntalo.** Las contradicciones entre fuentes están al final.

## Resumen

Nexova (nombre completo del proyecto: **Nexova Solutions**; el nombre público de cara al cliente es
**Nexova**) es una consultora de recursos humanos y selección de talento fundada en **2011**, con sede
en **Valencia, España**, y oficina de expansión en **Miami, Florida**. Tiene ~**120 empleados** y factura
~**8 M USD** al año. Sus clientes son medianas empresas de tecnología, retail y servicios financieros que
externalizan parte o toda su gestión de talento.

La CEO, **Laura Mendoza**, ha reunido un equipo de AI Engineering (el rol del usuario en este proyecto)
para automatizar una operación hoy casi 100 % manual y construir los sistemas que permitan escalar:
la ventana para responder a plataformas nuevas, automatizadas y basadas en datos, no es ilimitada.

El usuario trabaja dentro de **Marketing y Comunicación** (líder: Carmen Ruiz) en el Hito 1.

## Líneas de servicio

Cada línea se contrata de forma independiente (un cliente puede contratar una, dos o las tres).

| Línea | Qué incluye | Tarifa | Condiciones |
| --- | --- | --- | --- |
| **Headhunting ejecutivo y de mandos medios** | Búsqueda directa, evaluación por competencias, verificación de referencias | **22 %** del salario anual bruto del cargo | Facturación **30 / 30 / 40**: al iniciar la búsqueda / al presentar la terna final / al contratar. Garantía de reemplazo gratuito si el candidato deja el cargo antes de **6 meses** por causas atribuibles al proceso de selección |
| **Outsourcing de soporte al cliente** | Nexova contrata, entrena y gestiona agentes que trabajan en exclusiva para el cliente y bajo su marca; supervisión de calidad y reporting mensual de SLAs | **1.800–2.400 USD** al mes por agente, según especialización e idioma | Equipo mínimo: **5 agentes**. Contrato mínimo **6 meses**; cancelación anticipada = penalidad de **1 mes** de tarifa. El cliente no paga reclutamiento ni rotación del agente (incluidos en la tarifa) |
| **Formación corporativa** (soft skills y liderazgo) | Diagnóstico inicial, sesiones en vivo, certificado de finalización. Modalidad presencial, virtual o híbrida | 4 semanas: desde **3.500 USD** · 8 semanas: desde **6.200 USD** · 12 semanas: desde **8.900 USD** (grupos de hasta 15 personas) | Más de 15 personas: cotización personalizada, no hay tarifa fija publicada |

## SLA del proceso de contratación (headhunting)

| Tipo de búsqueda | Tiempo promedio | Terna |
| --- | --- | --- |
| Ejecutivo (C-level, VP) | 8 semanas | 3 candidatos |
| Gerencial (director, gerente) | 6 semanas | 3 a 4 candidatos |
| Especializado técnico | 5 semanas | 3 candidatos |

- Son **promedios basados en búsquedas pasadas, no una garantía contractual**, salvo que el contrato lo especifique.
- **Regla de escalamiento:** si a las **4 semanas** de una búsqueda ejecutiva no hay al menos un candidato calificado presentado, el consultor asignado escala a **Javier Almeida** (Gerente de Operaciones) y notifica proactivamente al cliente con un plan de acción.
- Nexova **no garantiza tiempos** en búsquedas con requisitos de ubicación geográfica muy restrictivos (p. ej. un único candidato disponible en una ciudad concreta).

## Manejo de objeciones (material interno de ventas)

| Objeción del prospecto | Respuesta / regla |
| --- | --- |
| "22 % es caro comparado con otras firmas" | La tarifa incluye la garantía de reemplazo de 6 meses y la verificación de referencias, que reducen el riesgo de una mala contratación. **No ofrecer descuento sobre el 22 % sin aprobación de Marcos Ibáñez.** |
| "¿Puedo pagar todo al final, cuando el candidato empiece?" | El esquema 30/30/40 es estándar y **no negociable para clientes nuevos**. Solo clientes con **más de 2 años** de relación pueden pedir un esquema alternativo, y debe aprobarlo **Finanzas**. |
| "¿Y si no estoy conforme con la terna?" | Una ronda adicional de búsqueda **sin costo** si ningún candidato de la terna inicial es aceptable, **siempre que el cliente haya dado feedback específico** de por qué no encajaron. |
| "¿Trabajan con empresas de mi sector que sean competencia directa?" | No toman búsquedas para dos empresas en conflicto directo de interés **en el mismo proceso simultáneamente**, pero sí pueden haber trabajado con competidores en el pasado. Se comunica con transparencia, **nunca se oculta**. |

## Áreas, responsables y problemas

| Área | Responsable · equipo | Situación actual | Qué necesitan |
| --- | --- | --- | --- |
| **Operaciones de Selección** (negocio principal) | Javier Almeida · 40 consultores | Cribado de CVs manual (30–80 CVs por proceso y consultor); emails individuales sin plantillas; sin estado en tiempo real (los clientes llaman a preguntar); el matching candidato–vacante depende de la intuición | Pipeline de selección con IA (scoring y ranking de CVs, explicable); RAG sobre la base de candidatos ("perfiles con experiencia en ventas B2B y nivel C1 de inglés"); portal de candidatos con estado en tiempo real; agente de comunicación con emails automáticos de seguimiento |
| **Formación Corporativa** | Elena Vargas · 12 | Catálogo en un PDF que se actualiza trimestralmente; inscripciones por Google Form y hoja de cálculo; sin registro de quién completó qué; personalización cero | Plataforma de catálogo con búsqueda e inscripción online; sistema de recomendación según perfil del cliente; portal del alumno con progreso; chatbot de asesoramiento formativo |
| **Soporte al Cliente Externalizado** | Roberto Díaz · 30 agentes | Teléfono, email y chat para clientes tech/retail/finanzas; sin base de conocimiento (un Word en Drive); resolución media **48 h** vs SLA comprometido de **24 h**; supervisores sin visibilidad en tiempo real | Chatbot de primera línea que resuelva el **40 %** de consultas con RAG; base de conocimiento centralizada con búsqueda semántica; dashboard de soporte en tiempo real; análisis de sentimiento de tickets |
| **Ventas y Desarrollo de Negocio** | ver inconsistencia nº 2 · 18 personas (6 account managers + 12 SDRs) | SDRs prospectan a mano en LinkedIn y exportan a Excel; HubSpot, pero solo el **40 %** del equipo lo actualiza; deals perdidos por falta de seguimiento | Dashboard del pipeline; automatización de secuencias (primer contacto → seguimiento → cierre o descarte); alertas de conversaciones sin actividad; agente que sugiera el ángulo de propuesta por prospecto |
| **Marketing y Comunicación** | Carmen Ruiz · equipo pequeño | Web de 2019 lenta, no accesible y desactualizada; contenido manual (LinkedIn, newsletter mensual, blog); miden visitas pero no qué convierte | Rediseño web con SEO/GEO y schema.org; pipeline de contenido asistido por IA; dashboard de marketing (visitas, fuentes, conversión) |
| **Recursos Humanos** (interno, 120 empleados) | Patricia Solís · 4 | Vacaciones, ausencias y consultas por email y hojas de cálculo; onboarding manual; evaluaciones 2 veces al año con Google Forms que nadie revisa; sin métricas | Portal interno de RRHH; onboarding automatizado con checklists progresivos; dashboard de KPIs de RRHH; agente interno de políticas y beneficios |
| **Tecnología e Infraestructura** | Sergio Molina (CTO) · 6 | Herramientas desconectadas; sin telemetría ni logging centralizado (se enteran de los fallos por los usuarios); despliegues manuales | Telemetría y logging centralizados; pipeline de datos que alimente todos los dashboards; monitorización en tiempo real con alertas; agente de ingeniería interna sobre la documentación técnica |
| **Dirección Ejecutiva** | Laura Mendoza (CEO) | Informe semanal en PDF preparado a mano por cada responsable (4–8 h por manager); datos con una semana de retraso | Dashboard ejecutivo unificado con KPIs de todas las áreas; informe semanal autogenerado; alertas por umbrales estratégicos; asistente de IA en lenguaje natural |

### Stack tecnológico actual de Nexova (el "mosaico")

HubSpot (CRM), Zendesk legacy (helpdesk), Google Workspace (tejido conectivo), un ATS hecho a medida de principios
de los 2010 y múltiples hojas de cálculo que actúan como sistemas de gestión. Sin telemetría, sin logs centralizados.

## Hito 1 — Sitio web público

- **Stakeholder:** Carmen Ruiz, Head of Marketing. Pide: landing corporativa, página aparte con formulario de registro de talento, responsive, accesible, SEO, Tailwind y validaciones de formulario correctas.
- **Especificación completa y textual** (secciones, campos, validaciones, mensajes de error y de éxito, Schema.org): [`uis/website/BRIEFING.md`](./uis/website/BRIEFING.md). El sitio implementado está en [`uis/website/`](./uis/website/README.md).
- El formulario es solo para **profesionales que buscan empleo**, no para empresas que quieren contratar servicios; incluye un mensaje visible que redirige a `contacto@nexova.com`.
- Contacto público: `contacto@nexova.com` · Valencia +34 960 123 456 · Miami +1 305 555 0191.

## Inconsistencias conocidas entre fuentes (resolver con el usuario antes de depender de ellas)

1. **Ubicación de Nexova.** La plantilla de 4Geeks (placeholder de `CONTEXT.md`) describía a Nexova como "Chile + Argentina". **Los briefings entregados dicen Valencia (España) + Miami (EE. UU.)** y es lo que rige aquí.
2. **Líder de Ventas.** El resumen organizativo del briefing de empresa nombra a **Megan Clarke**; la sección de departamentos y el documento de objeciones nombran a **Marcos Ibáñez**. Sin resolver. De momento, Marcos Ibáñez figura como aprobador de descuentos porque así lo dice el documento de objeciones.
3. **Años de experiencia en el copy del Hito 1.** El subtítulo del hero dice "más de 10 años", el bloque "Por qué Nexova" dice "12 años de experiencia **en el mercado latinoamericano**", la fundación es 2011 (≈14 años a 2025) y las oficinas son España/EE. UU. El briefing es prescriptivo, así que el copy se usa **tal cual**, pero es candidato a corrección si Carmen lo confirma.
