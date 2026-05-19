# Flownexion Chatbots

Sistema de generación de chatbots empresariales basado en Claude Code y la API de Anthropic.

## Estructura

```
chatbot/
├── CLAUDE.md                    ← instrucciones para Claude Code (no tocar)
├── clientes/                    ← un subdirectorio por cliente
│   └── [slug]/
│       ├── chatbot.html
│       ├── ChatBot.jsx
│       ├── widget.js
│       ├── config.json
│       ├── system-prompt.md
│       └── README.md
├── plantilla/                   ← plantillas base (no tocar manualmente)
└── skills/flownexion-chatbot/   ← skill de Claude Code
```

## Crear un nuevo chatbot

En Claude Code, escribe:

```
chatbot para [Nombre del Cliente]
Sector: [clínica/restaurante/etc.]
Info: [servicios, horarios, precios, teléfono, dirección]
```

Ejemplo mínimo:

```
chatbot para Clínica Dental Pérez en Murcia. Ortodoncia, implantes, blanqueamiento.
L-V 9-20h. Tel 968 000 000. Consulta inicial gratis.
```

Claude Code crea todos los archivos automáticamente en `clientes/[slug]/` y te dice cómo desplegarlo.

## Defaults inteligentes

Si no especificas color, mensaje de bienvenida, temas permitidos o tipo de asistente,
Claude Code aplica defaults razonables según el sector (ver CLAUDE.md).

## Clientes generados

| Cliente | Slug | Sector | Estado |
|---|---|---|---|
| ESGAS | `esgas` | Industria — rodamientos y transmisión NTN/SNR | Activo (catálogo PrestaShop pendiente de API) |

## Powered by Flownexion

Todos los chatbots generados incluyen automáticamente el badge "Powered by Flownexion"
enlazando a https://flownexion.com/. Esto es no negociable y forma parte del sistema.

---

*Sistema Flownexion v2 — https://flownexion.com/*
*Stack: HTML/JS vanilla + React/Next.js · API: Anthropic Claude*
