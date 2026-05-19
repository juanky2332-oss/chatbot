---
name: flownexion-chatbot
description: Genera chatbots empresariales completos, profesionales y funcionales para clientes de Flownexion. ACTIVA SIEMPRE este skill cuando el usuario mencione "chatbot", "nuevo chatbot", "chatbot para [empresa]", "cliente nuevo", "asistente virtual", "bot para [negocio]", o cualquier petición similar. Extrae información del mensaje del usuario, aplica defaults por sector, genera 6 archivos organizados en clientes/[slug]/ y verifica calidad antes de entregar. Minimiza preguntas: pregunta SOLO si falta clientName o companyInfo crítica.
---

# Flownexion Chatbot Generator Skill

## Misión
Generar chatbots empresariales en MENOS DE 5 SEGUNDOS de interacción con el usuario,
con calidad profesional production-ready, listos para entregar al cliente final.

## Principios
1. **Mínimas preguntas, máximos defaults.** Si no es crítico, decide tú con la tabla de sectores.
2. **Calidad sobre velocidad — pero ambas.** No entregues nunca algo a medias.
3. **Verifica antes de confirmar.** Pasa el checklist obligatorio.
4. **El "Powered by Flownexion" es sagrado.** Está en todos los archivos.

## Flujo

### FASE 1 — Extracción (mental, sin output)
Parsea el mensaje buscando:
  • Nombre del negocio (suele ir tras "para", "cliente:", "chatbot:")
  • Sector (palabras clave: clínica, restaurante, inmobiliaria, despacho, tienda, industria...)
  • Ciudad (palabras tras "en", o si menciona una ciudad española)
  • Servicios (lo que ofrece)
  • Horarios (patrón "L-V", "lunes a viernes", "9-20h"...)
  • Precios (patrón "€", "desde", "cuesta")
  • Teléfono (9 dígitos, formato español)
  • Email (regex)
  • Web (URL)
  • Color (hex "#xxxxxx" o nombre tipo "azul")
  • Logo URL

### FASE 2 — Validación
Si falta clientName O falta cualquier dato útil para companyInfo:
  Preguntar en UN mensaje agrupando, ejemplo:
  "Para generar el chatbot necesito:
   1. Nombre exacto del cliente
   2. Sector (clínica, restaurante, etc.)
   3. Servicios principales + horarios + teléfono o email de contacto
   ¿Tienes algún color de marca o logo? (opcional)"

Si tienes todo lo necesario, NO PREGUNTES. Avanza directo a FASE 3.

### FASE 3 — Aplicar defaults
  • primaryColor: tabla de sectores en CLAUDE.md
  • welcomeMessage: tabla de sectores
  • allowedTopics: temas base del sector + extras detectados en companyInfo
  • assistantRole: derivado del sector

### FASE 4 — Generar archivos
Crear en clientes/[slug]/:
  1. config.json
  2. system-prompt.md
  3. chatbot.html (sustituir placeholders en plantilla/chatbot.html)
  4. ChatBot.jsx (sustituir placeholders en plantilla/ChatBot.jsx)
  5. widget.js (sustituir placeholders en plantilla/widget.js)
  6. README.md (sustituir placeholders en plantilla/README.template.md)

### FASE 5 — Verificación obligatoria
Antes de decir "hecho", verificar:
  ✓ "Powered by Flownexion" presente en chatbot.html y ChatBot.jsx, enlazando a flownexion.com
  ✓ Logo de Flownexion (URL completa) presente
  ✓ Nombre del cliente en title, header y system prompt
  ✓ Color aplicado en al menos 4 sitios: header, msg user, botón enviar, focus input
  ✓ System prompt NO contiene ningún {{placeholder}} sin sustituir
  ✓ El system prompt incluye el bloque "Reglas inviolables" con el filtro de ámbito
  ✓ widget.js apunta a la ruta correcta del chatbot.html
  ✓ config.json es JSON válido
  ✓ chatbot.html es HTML válido sin errores de sintaxis

### FASE 6 — Output al usuario
Formato exacto:

  ✅ Chatbot creado para [CLIENT_NAME]

  📂 Archivos generados:
    clientes/[slug]/
    ├── chatbot.html        ← entregar al cliente
    ├── ChatBot.jsx         ← para proyectos React/Next.js
    ├── widget.js           ← embed de 1 línea
    ├── config.json
    ├── system-prompt.md
    └── README.md

  🚀 Para embeber en cualquier web (el cliente solo necesita esto):
    <script src="https://[tu-dominio]/chatbots/[slug]/widget.js"></script>

  🧪 Preguntas de prueba que el bot debe responder bien:
    1. [pregunta específica relevante para el cliente]
    2. [pregunta sobre precio/horario]
    3. [pregunta sobre contacto/ubicación]

  ❌ Pregunta fuera de ámbito que debe rechazar:
    "[ejemplo de pregunta off-topic]"

  ⚠️  Antes de entregar al cliente:
    • Sustituir FLOWNEXION_API_KEY en chatbot.html y widget.js
    • Recomendado: usar proxy backend para no exponer la API key
