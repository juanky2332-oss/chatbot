/**
 * ESGAS — Proxy backend para el asistente técnico.
 * Generado por Flownexion (https://flownexion.com/).
 *
 * Función serverless para Vercel (carpeta `api/`). Usa la API de OpenAI.
 * En este repo el proxy activo en producción es `/api/chat.js` (raíz);
 * esta copia es la de referencia documentada para el cliente.
 *
 * Qué hace:
 *  1. Recibe los mensajes del chatbot del navegador.
 *  2. Añade la API key de OpenAI desde variable de entorno (NUNCA en el frontend).
 *  3. Reenvía a la API de OpenAI y devuelve la respuesta (con streaming SSE).
 *  4. Traduce la respuesta al formato que ya entiende el chatbot, así el
 *     frontend (chatbot.html / ChatBot.jsx) no necesita cambios.
 *  5. Punto de extensión PRESTASHOP: enriquece el contexto con datos de
 *     catálogo en tiempo real CUANDO se disponga de la API.
 *
 * Variables de entorno:
 *  - OPENAI_API_KEY        (obligatoria — clave de OpenAI, empieza por sk-...)
 *  - OPENAI_MODEL          (opcional — por defecto: gpt-4o)
 *  - ALLOWED_ORIGIN        (recomendada, ej: https://esgas.es)
 *  - PRESTASHOP_API_URL    (futuro — webservice de PrestaShop)
 *  - PRESTASHOP_API_KEY    (futuro — clave del webservice de PrestaShop)
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o";
const MAX_MESSAGES = 24;          // límite anti-abuso
const MAX_CHARS_PER_MSG = 4000;   // límite anti-abuso

// ─────────────────────────────────────────────────────────────
// PUNTO DE EXTENSIÓN PRESTASHOP (pendiente de API)
// ─────────────────────────────────────────────────────────────
async function lookupCatalog(userText) {
  const base = process.env.PRESTASHOP_API_URL;
  const key = process.env.PRESTASHOP_API_KEY;
  if (!base || !key) return null; // API aún no configurada → sin enriquecimiento

  const ref = (userText.match(/\b[0-9A-Z]{3,}(?:[-/][0-9A-Z]+)*\b/i) || [])[0];
  if (!ref) return null;

  try {
    const auth = "Basic " + Buffer.from(key + ":").toString("base64");
    const url = `${base.replace(/\/$/, "")}/products?filter[reference]=${encodeURIComponent(ref)}&display=full&output_format=JSON`;
    const r = await fetch(url, { headers: { Authorization: auth } });
    if (!r.ok) return null;
    const data = await r.json();
    const p = data?.products?.[0];
    if (!p) return null;
    return [
      "## Catálogo ESGAS (datos en tiempo real)",
      `Referencia: ${p.reference || ref}`,
      p.name ? `Producto: ${typeof p.name === "string" ? p.name : p.name?.[0]?.value || ""}` : "",
      p.price ? `Precio: ${p.price} €` : "",
      typeof p.quantity !== "undefined" ? `Stock: ${p.quantity} ud.` : "",
    ].filter(Boolean).join("\n");
  } catch {
    return null;
  }
}
// ─────────────────────────────────────────────────────────────

function setCors(res) {
  const origin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

// Evento SSE en el formato que ya parsea el chatbot (estilo Anthropic).
function sseDelta(text) {
  return `data: ${JSON.stringify({
    type: "content_block_delta",
    delta: { type: "text_delta", text },
  })}\n\n`;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: "OPENAI_API_KEY no configurada" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { system, messages, max_tokens = 1024, stream = false } = body || {};

  // Guardarraíles básicos
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: "messages requerido" });
  if (messages.length > MAX_MESSAGES)
    return res.status(400).json({ error: "Demasiados mensajes" });
  for (const m of messages) {
    if (typeof m?.content === "string" && m.content.length > MAX_CHARS_PER_MSG)
      return res.status(400).json({ error: "Mensaje demasiado largo" });
  }

  // Enriquecimiento con catálogo PrestaShop (si está configurado)
  let sys = system || "";
  try {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (lastUser?.content) {
      const ctx = await lookupCatalog(String(lastUser.content));
      if (ctx) sys += "\n\n" + ctx + "\n\nUsa estos datos de catálogo en tiempo real cuando respondas a esta consulta.";
    }
  } catch { /* sin enriquecimiento */ }

  // Formato OpenAI: el system va como primer mensaje con role "system".
  const oaMessages = [];
  if (sys) oaMessages.push({ role: "system", content: sys });
  for (const m of messages) {
    if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      oaMessages.push({ role: m.role, content: m.content });
  }

  const upstream = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      max_tokens,
      messages: oaMessages,
      stream: !!stream,
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return res.status(upstream.status).json({ error: "Upstream error", detail });
  }

  // ── Streaming: traducir SSE de OpenAI → eventos que entiende el chatbot ──
  if (stream && upstream.body) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const reader = upstream.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        const l = line.trim();
        if (!l.startsWith("data:")) continue;
        const payload = l.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let ev; try { ev = JSON.parse(payload); } catch { continue; }
        const chunk = ev?.choices?.[0]?.delta?.content;
        if (chunk) res.write(sseDelta(chunk));
      }
    }
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  // ── Sin streaming: devolver en el formato que espera el frontend ──
  const data = await upstream.json();
  const text = data?.choices?.[0]?.message?.content || "Disculpa, no pude generar una respuesta.";
  return res.status(200).json({ content: [{ type: "text", text }] });
}

/**
 * ─── Uso con Express (alternativa a serverless) ───────────────
 *
 *   import express from "express";
 *   import handler from "./chat.js";
 *   const app = express();
 *   app.use(express.json({ limit: "256kb" }));
 *   app.post("/api/chat", (req, res) => handler(req, res));
 *   app.listen(3001);
 *
 * En el chatbot, fijar:  apiProxy: "https://tudominio.com/api/chat"
 */
