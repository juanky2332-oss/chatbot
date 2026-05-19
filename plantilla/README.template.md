# Chatbot {{CLIENT_NAME}}

Chatbot generado por **Flownexion** — https://flownexion.com/

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `chatbot.html` | Versión standalone. Abrir en navegador o servir como página web. |
| `ChatBot.jsx` | Componente React para integrar en Next.js u otro proyecto React. |
| `widget.js` | Script de embed: inyecta el chatbot como burbuja flotante en cualquier web. |
| `config.json` | Configuración completa del chatbot. Editar para actualizar info. |
| `system-prompt.md` | El prompt del sistema documentado. Editar para cambiar el comportamiento. |

## Despliegue

### Opción A — Standalone (más simple)
1. Sustituye `FLOWNEXION_API_KEY` en `chatbot.html` por la API key real de Anthropic.
2. Sube `chatbot.html` a tu hosting (ej: `https://tudominio.com/chatbot/`).
3. Listo.

⚠️ **Riesgo de seguridad**: la API key queda visible en el HTML del navegador.
Cualquiera que vea el código fuente puede usar tu key. **Solo recomendable para demos o desarrollo.**

### Opción B — Con proxy backend (RECOMENDADO producción)
1. Crea un endpoint backend que reciba mensajes del chatbot y los reenvíe a Anthropic.
2. En `chatbot.html`, sustituye `apiProxy: ""` por la URL de tu proxy: `apiProxy: "https://tudominio.com/api/chat"`.
3. El proxy guarda la API key en variables de entorno (nunca expuesta al navegador).

### Opción C — Embed de 1 línea en cualquier web
Para integrar el chatbot en la web del cliente:
1. Aloja `chatbot.html` y `widget.js` en un dominio accesible.
2. Edita `widget.js` y actualiza `chatbotUrl` con la URL pública.
3. El cliente solo pega esto en su `<head>`:

```html
<script src="https://[tu-dominio]/chatbots/{{CLIENT_SLUG}}/widget.js"></script>
```

### Opción D — Componente React/Next.js

```jsx
import ChatBot from './ChatBot.jsx';

function MiWeb() {
  return <ChatBot apiProxy="/api/chat" />;
}
```

## Actualizar la información de la empresa

1. Edita `config.json` con los nuevos datos.
2. Pídele a Claude Code: *"regenera el chatbot de {{CLIENT_NAME}}"*.
3. Claude Code reconstruirá los archivos manteniendo el sistema sincronizado.

## Soporte
Cualquier duda o ampliación: https://flownexion.com/
