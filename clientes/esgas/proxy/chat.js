/**
 * ESGAS — Proxy backend para el asistente técnico.
 * Generado por Flownexion (https://flownexion.com/).
 *
 * Función serverless lista para Vercel / Next.js (carpeta `api/`).
 * Adaptable a Netlify Functions, Cloudflare Workers o Express (ver al final).
 *
 * Qué hace:
 *  1. Recibe los mensajes del chatbot del navegador.
 *  2. Añade la API key de Anthropic desde variable de entorno (NUNCA en el frontend).
 *  3. Reenvía a la API de Anthropic y devuelve la respuesta (con streaming SSE).
 *  4. Punto de extensión PRESTASHOP: enriquece el contexto con datos de catálogo
 *     en tiempo real (stock, precio, referencia) CUANDO se disponga de la API.
 *
 * Variables de entorno necesarias:
 *  - ANTHROPIC_API_KEY      (obligatoria)
 *  - ALLOWED_ORIGIN         (recomendada, ej: https://esgas.es)
 *  - PRESTASHOP_API_URL     (futuro — webservice de PrestaShop, ej: https://esgas.es/api)
 *  - PRESTASHOP_API_KEY     (futuro — clave del webservice de PrestaShop)
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_MESSAGES = 24;          // límite anti-abuso
const MAX_CHARS_PER_MSG = 4000;   // límite anti-abuso

// ─────────────────────────────────────────────────────────────
// PUNTO DE EXTENSIÓN PRESTASHOP (pendiente de API)
// ─────────────────────────────────────────────────────────────
// Cuando ESGAS facilite la API de PrestaShop, implementar aquí la
// búsqueda de producto/stock/precio. El resultado se inyecta como
// contexto adicional en el `system` para que el asistente responda
// con datos reales de catálogo en lugar de derivar a la web.
//
// PrestaShop Webservice (ejemplo de referencia, NO activo):
//   GET {PRESTASHOP_API_URL}/products?filter[reference]=[ref]&output_format=JSON
//   Header:  Authorization: Basic base64(PRESTASHOP_API_KEY + ":")
//
async function lookupCatalog(userText) {
  const base = process.env.PRESTASHOP_API_URL;
  const key = process.env.PRESTASHOP_API_KEY;
  if (!base || !key) return null; // API aún no configurada → sin enriquecimiento

  // Heurística simple: extraer una posible referencia de rodamiento del texto.
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
    return null; // ante cualquier fallo, el asistente sigue funcionando sin catálogo
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

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY no configurada" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { model, system, messages, max_tokens = 1024, stream = false } = body || {};

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

  const upstream = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: model || "claude-sonnet-4-6",
      max_tokens,
      system: sys,
      messages,
      stream: !!stream,
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return res.status(upstream.status).json({ error: "Upstream error", detail });
  }

  // Streaming SSE: passthrough directo al navegador
  if (stream && upstream.body) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    const reader = upstream.body.getReader();
    const dec = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(dec.decode(value, { stream: true }));
    }
    return res.end();
  }

  const data = await upstream.json();
  return res.status(200).json(data);
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
