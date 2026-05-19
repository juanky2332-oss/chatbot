# Chatbot ESGAS — Asistente técnico de rodamientos NTN/SNR

Chatbot generado por **Flownexion** — https://flownexion.com/

Asistente técnico especializado en **rodamientos y transmisión de potencia NTN/SNR**:
equivalencias entre marcas, medidas y especificaciones ISO, diagnóstico de fallos y
selección por aplicación.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `chatbot.html` | Versión standalone, tema oscuro, con **streaming** de respuesta. Abrir en navegador o servir como página. |
| `ChatBot.jsx` | Componente React/Next.js (mismo diseño oscuro + streaming). Listo para sustituir a `components/Chatbot` del proyecto actual. |
| `widget.js` | Embed de 1 línea: inyecta el chat como burbuja flotante en cualquier web. |
| `config.json` | Configuración completa (fuente de verdad). Editar y regenerar para actualizar. |
| `system-prompt.md` | Prompt del sistema documentado (conocimiento técnico del asistente). |
| `proxy/chat.js` | Proxy backend recomendado para producción (oculta la API key y deja preparada la conexión del catálogo PrestaShop). |

## Despliegue

### Opción A — Standalone (demo rápida)
1. Sustituye `FLOWNEXION_API_KEY` en `chatbot.html` por la API key real de Anthropic.
2. Sube `chatbot.html` a tu hosting.

⚠️ La API key queda visible en el navegador. **Solo para demos/desarrollo.**

### Opción B — Con proxy backend (RECOMENDADO producción)
1. Despliega `proxy/chat.js` como función serverless (Vercel/Next.js `api/`, Netlify) o en Express.
2. Configura variables de entorno:
   - `ANTHROPIC_API_KEY` — clave de Anthropic (obligatoria).
   - `ALLOWED_ORIGIN` — ej. `https://esgas.es` (recomendada).
3. En `chatbot.html` o al usar `<ChatBot />`, fija `apiProxy` con la URL del proxy
   (ej. `apiProxy: "https://esgas.es/api/chat"`). La API key nunca sale del servidor.
   El proxy ya hace **passthrough de streaming SSE**, así que la respuesta sigue apareciendo en tiempo real.

### Opción C — Embed de 1 línea
1. Aloja `chatbot.html` y `widget.js` en un dominio accesible.
2. Edita en `widget.js` la constante `chatbotUrl` con la URL pública real.
3. El cliente pega esto en su web:

```html
<script src="https://[tu-dominio]/chatbots/esgas/widget.js"></script>
```

### Opción D — Integrar en el proyecto Next.js actual (CHATBOT-ESGAS-2)
Sustituye el componente actual por este `ChatBot.jsx` (mismo diseño oscuro, ahora con
streaming y prompt técnico ampliado):

```jsx
import ChatBot from "@/components/Chatbot"; // este ChatBot.jsx

export default function Page() {
  return <ChatBot apiProxy="/api/chat" />;
}
```

Copia `proxy/chat.js` a `src/app/api/chat/route.js` (o `pages/api/chat.js`) según tu
estructura, y define `ANTHROPIC_API_KEY` en las variables de entorno del proyecto.

## Catálogo PrestaShop (pendiente de API)

La consulta de **stock, precio y plazo en tiempo real aún no está conectada**. El
asistente ya responde con conocimiento técnico (equivalencias, medidas ISO, diagnóstico)
y deriva a https://esgas.es para datos comerciales.

Cuando ESGAS facilite la API de PrestaShop, **no hay que rehacer nada**: el punto de
integración ya está preparado en `proxy/chat.js` (función `lookupCatalog`). Solo habrá que:

1. Definir `PRESTASHOP_API_URL` y `PRESTASHOP_API_KEY` en el entorno del proxy.
2. Ajustar el mapeo de campos del Webservice de PrestaShop dentro de `lookupCatalog`.

A partir de ese momento el asistente enriquecerá automáticamente sus respuestas con
referencia, precio y stock reales.

## Modelo

Usa `claude-sonnet-4-6` (Anthropic). Ajustable en `config.json`, `chatbot.html`,
`ChatBot.jsx` y `proxy/chat.js`.

## Actualizar la información

1. Edita `config.json` o `system-prompt.md`.
2. Pide a Claude Code: *"regenera el chatbot de ESGAS"*.

## Soporte
Cualquier duda o ampliación: https://flownexion.com/
