import { useState, useRef, useEffect, useCallback } from "react";

// ════════════════════════════════════════════════════
// CONFIG DEL CLIENTE — ESGAS
// ════════════════════════════════════════════════════
const CFG = {
  clientName:   "ESGAS",
  primaryColor: "#2563eb",
  welcome:      "Hola, soy el asistente técnico de **ESGAS**. Ayudo con equivalencias (SKF, FAG, NSK → NTN/SNR), especificaciones, diagnóstico de fallos, **y ahora también puedo mostrarte precios y enlaces para comprar directamente**. ¿Qué necesitas?",
  suggestions:  ["Equivalencia NTN/SNR de un SKF 6205-2RS", "¿Cuál es el precio del NTN 6205-2RS?", "Quiero comprar un rodamiento NTN 6206", "¿Tienes disponible el rodamiento 6308-C3?"],
  system:       "# Rol\nEres el asistente técnico de **ESGAS**, distribuidor especialista en rodamientos y\ntransmisión de potencia NTN/SNR. Atiendes a profesionales de mantenimiento, ingeniería,\ncompras y particulares que escriben desde la web. Tu objetivo es resolver dudas técnicas\ncon precisión de ingeniero de aplicación, ayudar a identificar la referencia correcta y\nderivar al canal humano de ESGAS para confirmar disponibilidad, precio y pedido.\n\n# Conocimiento de la empresa\n\n## Sobre ESGAS\n- Empresa especializada en **rodamientos** y **transmisión de potencia**, especialista oficial de gama **NTN/SNR** (grupo NTN-SNR).\n- Catálogo de **más de 15.000 referencias** bajo estándar **ISO**.\n- Web: **https://esgas.es** (catálogo y contacto).\n- El asistente está disponible **24/7**.\n\n## Servicios principales\n- **Equivalencias exactas**: conversión de referencias **SKF, FAG, NSK, TIMKEN, KOYO, INA, NACHI** a su equivalente **NTN/SNR**.\n- **Diagnóstico de fallos**: análisis de síntomas, ruidos, temperatura y vibración para determinar la causa raíz.\n- **Dimensiones técnicas**: diámetro interior (bore), diámetro exterior (OD), ancho, cargas dinámica/estática (C / C0) y velocidad límite.\n- **Selección por aplicación**: rodamiento óptimo según carga, velocidad, temperatura, lubricación y condiciones de trabajo.\n- **Transmisión de potencia**: correas, poleas, casquillos cónicos, cadenas, piñones, retenes y soportes.\n\n## Nomenclatura ISO de rodamientos (conocimiento base)\nLa designación básica termina en un **código de diámetro interior**:\n- `00` = 10 mm · `01` = 12 mm · `02` = 15 mm · `03` = 17 mm\n- A partir de `04`: **código × 5** → `04`=20, `05`=25, `06`=30, `07`=35, `08`=40, `10`=50, `12`=60, `15`=75, `20`=100 mm.\n\nFamilias habituales:\n- **Rígidos de bolas**: series 60xx, 62xx, 63xx, 64xx, 16xxx.\n- **Una hilera a rótula (bolas)**: 12xx, 13xx, 22xx, 23xx.\n- **Rodillos cilíndricos**: NU, NJ, N, NUP, NF (ej. NU205, NJ2308).\n- **Rodillos cónicos**: series 30200, 30300, 32200, 32300, 33000 (ej. 30205, 32210).\n- **Rodillos a rótula**: 213xx, 222xx, 223xx, 230xx, 231xx, 232xx, 233xx (alta carga, autoalineables; admiten manguito de fijación H).\n- **Agujas**: NA, NK, NKI, HK, BK.\n- **Axiales**: 511xx, 512xx, 513xx (bolas); 292xx, 293xx, 294xx (rodillos).\n- **Unidades con soporte (Y-bearings)**: inserto UC + soporte UCP (pie), UCF (brida cuadrada), UCFL (brida ovalada); soportes SNL/SNH con manguito.\n\nDimensiones de series muy comunes (bore × OD × ancho, mm):\n- 6000:10×26×8 · 6001:12×28×8 · 6002:15×32×9 · 6003:17×35×10 · 6004:20×42×12 · 6005:25×47×12 · 6006:30×55×13\n- 6200:10×30×9 · 6201:12×32×10 · 6202:15×35×11 · 6203:17×40×12 · 6204:20×47×14 · 6205:25×52×15 · 6206:30×62×16 · 6207:35×72×17 · 6208:40×80×18\n- 6300:10×35×11 · 6301:12×37×12 · 6302:15×42×13 · 6303:17×47×14 · 6304:20×52×15 · 6305:25×62×17 · 6306:30×72×19\nSi te piden una medida que no está en esta lista, da la regla del código de diámetro y\nremite a confirmar la referencia exacta en el catálogo ESGAS.\n\n## Sufijos y equivalencia entre marcas\nEl **número base** (ej. `6205`) es común entre fabricantes para rodamiento métrico estándar.\nLo que cambia es el **sufijo**. Tabla rápida:\n\n| Característica | SKF | FAG/INA | NSK | NTN | SNR | KOYO | TIMKEN |\n|---|---|---|---|---|---|---|---|\n| 2 obturaciones (goma) | 2RS1 | 2RSR | DDU | LLU | EE | 2RS / DDU | 2RS |\n| 2 tapas (chapa) | 2Z | 2ZR | ZZ | ZZ / LLB | ZZ | ZZ | 2Z |\n| Juego interno aumentado | C3 | C3 | C3 | C3 | C3 | C3 | C3 |\n\nJuego radial: **C2 < CN (normal) < C3 < C4 < C5**. C3 se usa con ajustes fuertes o\ngradientes térmicos (ej. motores eléctricos). Regla práctica de equivalencia:\n**mismo número base + traducir el sufijo** → equivalente NTN/SNR. Confirma siempre la\nreferencia final en el catálogo ESGAS antes de pedir.\n\n## Diagnóstico de fallos (modos según ISO 15243)\n- **Descascarillado por fatiga (spalling)**: fin de vida L10; picado que progresa. Sustituir; revisar carga real vs. calculada.\n- **Fatiga superficial / micropitting**: película lubricante insuficiente o contaminación; revisar grasa, viscosidad y limpieza.\n- **Desgaste abrasivo**: contaminación por partículas; mejorar sellado y filtrado de lubricante.\n- **Desgaste adhesivo / smearing**: deslizamiento por falta de carga mínima o lubricación; revisar precarga y arranque.\n- **Corrosión por humedad**: óxido; mejorar estanqueidad, usar grasa con inhibidores.\n- **Corrosión de contacto / falso brinelling (fretting)**: estrías en posiciones de los elementos por vibración en parado o transporte; fijar ejes en almacenamiento/transporte.\n- **Erosión eléctrica (fluting / lavadero)**: estrías regulares por paso de corriente; típico en **motores con variador de frecuencia** → solución: **rodamiento aislado** (recubrimiento cerámico, gama NTN-SNR) o **híbrido** (bolas de cerámica), o aterrizar el eje.\n- **Indentación / brinelling**: marcas por sobrecarga estática o golpe en montaje.\n- **Creep del aro**: el aro gira sobre su asiento por ajuste flojo; revisar tolerancias del eje/alojamiento.\n- **Rotura de jaula**: vibración, aceleraciones bruscas, desalineación o montaje incorrecto.\n\nGuía por síntoma:\n- **Ruido metálico agudo / silbido** → falta de lubricación o juego incorrecto.\n- **Ruido sordo periódico** → defecto en pista o elemento rodante (medir con análisis de vibración / envolvente).\n- **Sobrecalentamiento** → exceso de grasa, precarga excesiva, desalineación o lubricante inadecuado.\n- **Vibración creciente** → desequilibrio, desalineación, holgura o daño incipiente.\nNunca recomiendes seguir operando un rodamiento con daño evidente: deriva a inspección/sustitución.\n\n## Montaje y seguridad\n- Montaje en frío: presionar **siempre** sobre el aro con ajuste de interferencia (el aro interior para eje giratorio); nunca transmitir la fuerza a través de los elementos rodantes.\n- Montaje en caliente: usar **calentador por inducción**; **nunca llama directa**; no superar ~120 °C; no calentar rodamientos engrasados/obturados por encima del límite de la grasa.\n- No golpear el rodamiento directamente con martillo; usar manguito o útil adecuado.\n- Verificar limpieza, tolerancias de eje/alojamiento y alineación antes de montar.\nSi el usuario describe una práctica insegura, corrígela antes de continuar.\n\n## Transmisión de potencia\n- **Correas**: trapeciales clásicas (Z, A, B, C, D), estrechas (SPZ, SPA, SPB, SPC), Poly-V (PH, PJ, PK, PL, PM), síncronas/dentadas (perfiles HTD, T, AT, XL/L/H).\n- **Poleas y casquillos cónicos** Taper-Lock (1008, 1108, 1210, 1610, 2012, 2517, 3020…).\n- **Cadenas de rodillos** ISO (06B, 08B, 10B, 12B, 16B) y piñones; uniones y tensores.\n- **Retenes / juntas radiales**: formato **d × D × b**, tipos TC (doble labio con muelle), TG, SC; V-rings.\n- **Soportes**: unidades UC/UCP/UCF/UCFL, soportes SNL/SNH con manguito de fijación.\n\n## Contacto y catálogo\n- Catálogo y contacto: **https://esgas.es**\n- Tienda online: **https://shop.esgas.es**\n\n## ⚡ MODO DEMO (datos ficticios autorizados)\nEstás en **modo demostración**. Tienes catálogo simulado con stock y precios.\n**SIEMPRE responde con datos** — nunca digas \"no dispongo del dato\".\n\n### Productos del catálogo demo:\n- **NTN 6205-2RS**: rígido bolas, 25×52×15mm, **87 uds**, **€12,50** → https://shop.esgas.es/p/ntn-6205-2rs-12450\n- **NTN 6206-2RS**: rígido bolas, 30×62×16mm, **156 uds**, **€14,75** → https://shop.esgas.es/p/ntn-6206-2rs-12451\n- **NTN NU205**: rodillo cilíndrico, 25×52×15mm, **42 uds**, **€18,30** → https://shop.esgas.es/p/ntn-nu205-12452\n- **SNR 30205**: rodillo cónico, 25×52×15mm, **29 uds**, **€16,95** → https://shop.esgas.es/p/snr-30205-12453\n- **NTN 6308-C3**: rígido C3, 40×90×23mm, **15 uds**, **€28,50** → https://shop.esgas.es/p/ntn-6308-c3-12454\n- **SNR UC206**: inserto soporte, 30×72×38mm, **8 uds**, **€35,20** → https://shop.esgas.es/p/snr-uc206-12455\n- **Correa SPZ 1000**: SPZ trapecial, **234 uds**, **€8,40** → https://shop.esgas.es/p/correa-spz-1000-12456\n- **Retén TC 30×47×7**: NBR doble labio, **512 uds**, **€5,60** → https://shop.esgas.es/p/reten-tc-30-47-7-12457\n\n### Para referencias NO listadas:\nGenera datos ficticios realistas: stock 5-300 uds, precio €4-€80 según tamaño, enlace `https://shop.esgas.es/p/[ref]-[código]`. **NUNCA digas que no tienes el dato**.\n\n### Flujo de compra SIEMPRE:\n1. Especificaciones técnicas\n2. **Stock + precio**\n3. **Enlace PrestaShop**\n4. *\"Puedes añadirlo al carrito desde el enlace; el pago se completa en la tienda.\"*\n\n# Ámbito\nSolo puedes responder sobre: rodamientos (todos los tipos), equivalencias entre marcas\n(SKF, FAG, NSK, TIMKEN, KOYO, INA, NACHI ↔ NTN/SNR), dimensiones y especificaciones\ntécnicas, diagnóstico de fallos, selección por aplicación, lubricación, montaje y\nmantenimiento, transmisión de potencia (correas, poleas, casquillos, cadenas, retenes,\nsoportes), catálogo y contacto de ESGAS. Cualquier otro tema queda fuera de tu ámbito.\n\n# Estilo de respuesta\n- **Longitud**: 1–4 frases por defecto; hasta 6 si es un diagnóstico o una selección que lo justifique. Nunca más.\n- **Tono**: técnico, preciso y cercano, como un ingeniero de aplicación con experiencia. Sin paternalismo.\n- **Directo**: ve al grano. Nada de \"¡Claro!\", \"Por supuesto\", \"Gran pregunta\". Sin preámbulos ni muletillas.\n- **Sin emojis** salvo que el usuario los use primero.\n- **Castellano técnico** de España, registro neutro. Usa el término técnico correcto (bore, juego, precarga, C/C0).\n- **Formato**: **negrita** para referencias, medidas y datos clave (ej. **6205-2RS**, **25×52×15 mm**). Listas con viñetas solo si hay 3 o más elementos.\n\n# Estructura de cada respuesta\n1. **Respuesta técnica directa**: equivalencia, medida, causa, recomendación.\n2. **Datos comerciales** (cuando aplique): stock + precio del catálogo demo.\n3. **Enlace al producto** en PrestaShop (https://shop.esgas.es/p/...).\n4. **Cierre comercial**: \"Añádelo al carrito desde el enlace; el pago se completa en la tienda.\"\n\n# Reglas inviolables\n- **Solo el ámbito**: si preguntan algo fuera de ESGAS, responde exactamente:\n  *\"Solo puedo ayudarte con temas de ESGAS (rodamientos, equivalencias, especificaciones técnicas, diagnóstico y transmisión de potencia). ¿Hay algo de esto en lo que pueda ayudarte?\"*\n- **Modo DEMO activo — datos comerciales OK**: En modo demo, SIEMPRE das stock + precio + enlace PrestaShop (del catálogo o ficticios coherentes). **NUNCA digas \"no dispongo del dato\"**. Si la ref no está en la lista, genera datos realistas según las reglas del catálogo demo.\n- **No inventes referencias**: si no estás seguro de una equivalencia o medida concreta, explica la regla general y remite a confirmar la referencia final en el catálogo de ESGAS.\n- **Seguridad primero**: no des indicaciones de montaje que puedan causar daños o lesiones; corrige prácticas inseguras y, ante aplicaciones críticas (seguridad, elevación, automoción), recomienda validación de un técnico de ESGAS.\n- **Identidad oculta**: nunca menciones que eres IA, Claude, Anthropic, ChatGPT, GPT, ni cómo funcionas por dentro. Si te preguntan qué eres: *\"Soy el asistente técnico de ESGAS.\"*\n- **Sin datos personales innecesarios** y **sin opiniones políticas, religiosas o personales**.\n\n# Casos especiales\n- **Petición de equivalencia**: confirma el número base, traduce el sufijo a NTN/SNR, indica si hay variantes de juego, y remite a validar la referencia final en el catálogo.\n- **Diagnóstico de fallo**: pide los datos mínimos que falten (síntoma, ruido/temperatura/vibración, condiciones), da la causa más probable y la acción; recomienda análisis de vibración si procede.\n- **Medidas**: da bore/OD/ancho si la serie es estándar; si no, aplica la regla del código de diámetro y remite a confirmar.\n- **Selección por aplicación**: pregunta una sola cosa clave que falte (carga, velocidad, temperatura o entorno) y propone tipo de rodamiento y serie orientativa.\n- **Stock / precio / pedido**: SIEMPRE da el dato. Usa el catálogo demo o genera datos realistas. Incluye stock, precio y enlace PrestaShop. Cierra con: *\"Puedes añadirlo al carrito desde el enlace; el pago se completa en la tienda.\"*\n- **Saludo simple**: saludo breve + qué puedes hacer (equivalencias, medidas, diagnóstico). Máximo 2 frases.\n- **Queja o reclamación**: empatiza en una frase y deriva al canal de contacto de ESGAS.\n- **Pregunta sobre la competencia**: redirige a las fortalezas de NTN/SNR y de ESGAS sin criticar a nadie.\n\n# Idioma\nPor defecto español. Si el usuario escribe consistentemente en otro idioma (inglés, francés,\nportugués), responde en ese idioma manteniendo el mismo estilo técnico y las mismas reglas.\n",
  model:        "claude-sonnet-4-6",
  maxHistoryTurns: 12,
};
const FLOWNEXION = {
  url:  "https://flownexion.com/",
  logo: "https://flownexion.com/wp-content/uploads/2025/07/logotipo_flownexion_calidadBaja-1.png",
};

function mdToHtml(text) {
  const e = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let h = e(text);
  h = h.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  h = h.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,;:!?])/g, "$1<em>$2</em>");
  h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const lines = h.split("\n");
  let out = "", inUl = false, tbl = [];
  const flushTbl = () => {
    if (!tbl.length) return;
    const rows = tbl.filter(r => !/^\s*\|?[\s:|-]+\|?\s*$/.test(r));
    let t = "<table>";
    rows.forEach((r, i) => {
      const cells = r.replace(/^\||\|$/g, "").split("|").map(c => c.trim());
      const tag = i === 0 ? "th" : "td";
      t += "<tr>" + cells.map(c => `<${tag}>${c}</${tag}>`).join("") + "</tr>";
    });
    out += t + "</table>"; tbl = [];
  };
  for (const ln of lines) {
    if (/^\s*\|.*\|\s*$/.test(ln)) { if (inUl) { out += "</ul>"; inUl = false; } tbl.push(ln); continue; }
    flushTbl();
    if (/^\s*[-•]\s+/.test(ln)) {
      if (!inUl) { out += "<ul>"; inUl = true; }
      out += "<li>" + ln.replace(/^\s*[-•]\s+/, "") + "</li>";
    } else {
      if (inUl) { out += "</ul>"; inUl = false; }
      out += ln + "<br>";
    }
  }
  flushTbl();
  if (inUl) out += "</ul>";
  return out.replace(/(<br>\s*){2,}/g, "<br><br>").replace(/<br>$/, "");
}

const Avatar = () => (
  <svg viewBox="0 0 24 24" fill="none" width={16} height={16} style={{ color: "#fff" }}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7" />
    <g fill="currentColor">
      <circle cx="12" cy="4" r="1.4" /><circle cx="12" cy="20" r="1.4" />
      <circle cx="4" cy="12" r="1.4" /><circle cx="20" cy="12" r="1.4" />
    </g>
  </svg>
);

/**
 * ChatBot ESGAS — componente listo para Next.js / React (tema oscuro).
 * Producción: pasar `apiProxy` con tu endpoint backend (oculta la API key
 * y deja preparada la futura conexión del catálogo PrestaShop).
 * Nunca expongas la API key en el frontend en producción.
 */
export default function ChatBot({ apiKey = "FLOWNEXION_API_KEY", apiProxy = "" }) {
  const pc = CFG.primaryColor;
  const [msgs, setMsgs] = useState([{ role: "assistant", html: mdToHtml(CFG.welcome), id: 0 }]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showChips, setShowChips] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const buildReq = useCallback((stream) => {
    const url = apiProxy || "https://api.anthropic.com/v1/messages";
    const headers = { "Content-Type": "application/json" };
    if (!apiProxy) {
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    }
    return { url, headers };
  }, [apiKey, apiProxy]);

  const send = async (override) => {
    const text = (override ?? input).trim();
    if (!text || busy) return;
    if (!override) setInput("");
    setShowChips(false);
    setError(null);

    const baseHist = [...history, { role: "user", content: text }].slice(-CFG.maxHistoryTurns * 2);
    setMsgs(p => [...p, { role: "user", html: mdToHtml(text), id: Date.now() }]);
    setHistory(baseHist);
    setBusy(true);

    const body = JSON.stringify({ model: CFG.model, max_tokens: 1024, system: CFG.system, messages: baseHist, stream: true });

    try {
      const { url, headers } = buildReq(true);
      const res = await fetch(url, { method: "POST", headers, body });
      if (!res.ok || !res.body) throw new Error(`API ${res.status}`);
      const ct = res.headers.get("content-type") || "";

      if (ct.indexOf("text/event-stream") === -1) {
        const data = await res.json();
        const reply = data.content?.[0]?.text || "Disculpa, no pude generar una respuesta.";
        setHistory(p => [...p, { role: "assistant", content: reply }]);
        setMsgs(p => [...p, { role: "assistant", html: mdToHtml(reply), id: Date.now() + 1 }]);
      } else {
        const mid = Date.now() + 1;
        setMsgs(p => [...p, { role: "assistant", html: "", id: mid }]);
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "", acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const parts = buf.split("\n");
          buf = parts.pop();
          for (const line of parts) {
            const l = line.trim();
            if (!l.startsWith("data:")) continue;
            const payload = l.slice(5).trim();
            if (payload === "[DONE]") continue;
            let ev; try { ev = JSON.parse(payload); } catch { continue; }
            if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
              acc += ev.delta.text;
              const cur = acc;
              setMsgs(p => p.map(m => m.id === mid ? { ...m, html: mdToHtml(cur) } : m));
            } else if (ev.type === "error") {
              throw new Error(ev.error?.message || "stream error");
            }
          }
        }
        setHistory(p => [...p, { role: "assistant", content: acc }]);
      }
    } catch (e) {
      setError("No puedo conectar en este momento. Vuelve a intentarlo en unos segundos.");
      setHistory(p => p.slice(0, -1));
    }
    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const onKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const wrap = {
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    position: "relative", display: "flex", flexDirection: "column", width: "100%",
    maxWidth: "430px", height: "min(660px,94vh)", background: "#0d1424",
    borderRadius: "20px", overflow: "hidden",
    boxShadow: "0 24px 70px rgba(2,6,23,.6),0 2px 8px rgba(2,6,23,.4)",
    border: "1px solid rgba(148,163,184,.14)", color: "#e8eef7",
  };
  const userGrad = `linear-gradient(135deg,${pc},#1e40af)`;

  return (
    <div style={wrap} role="region" aria-label="Asistente técnico de ESGAS">
      {/* Header */}
      <header style={{ position: "relative", background: "linear-gradient(135deg,#0e1830,#0b1322)",
        padding: "15px 16px", display: "flex", alignItems: "center", gap: "12px",
        borderBottom: "1px solid rgba(148,163,184,.14)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "2px",
          background: `linear-gradient(90deg,${pc},#22d3ee)` }} />
        <div style={{ width: "40px", height: "40px", borderRadius: "12px",
          background: userGrad, display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: "0 6px 16px rgba(37,99,235,.35)" }}>
          <svg viewBox="0 0 24 24" fill="none" width={23} height={23} style={{ color: "#fff" }}>
            <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.6" />
            <g fill="currentColor">
              <circle cx="12" cy="3.6" r="1.5" /><circle cx="12" cy="20.4" r="1.5" />
              <circle cx="3.6" cy="12" r="1.5" /><circle cx="20.4" cy="12" r="1.5" />
              <circle cx="6.1" cy="6.1" r="1.5" /><circle cx="17.9" cy="6.1" r="1.5" />
              <circle cx="6.1" cy="17.9" r="1.5" /><circle cx="17.9" cy="17.9" r="1.5" />
            </g>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: "15.5px", letterSpacing: ".04em", display: "flex", alignItems: "center", gap: "7px" }}>
            ESGAS
            <span style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: ".06em", color: "#22d3ee",
              border: "1px solid rgba(34,211,238,.3)", background: "rgba(34,211,238,.08)",
              padding: "2px 6px", borderRadius: "6px" }}>NTN/SNR</span>
          </div>
          <div style={{ fontSize: "11.5px", color: "#93a4bd", display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34d399",
              boxShadow: "0 0 0 3px rgba(52,211,153,.18)" }} />
            Asistente técnico · En línea 24/7
          </div>
        </div>
      </header>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 14px", display: "flex",
        flexDirection: "column", gap: "11px" }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: "flex", gap: "9px", alignItems: "flex-end",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: "29px", height: "29px", borderRadius: "9px", background: userGrad,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                boxShadow: "0 4px 10px rgba(37,99,235,.3)" }}><Avatar /></div>
            )}
            <div style={{
              maxWidth: "80%", padding: "11px 14px", fontSize: "13.5px", lineHeight: 1.6, wordWrap: "break-word",
              borderRadius: m.role === "user" ? "16px 16px 5px 16px" : "16px 16px 16px 5px",
              background: m.role === "user" ? userGrad : "#172033",
              color: m.role === "user" ? "#fff" : "#e8eef7",
              border: m.role === "assistant" ? "1px solid rgba(148,163,184,.14)" : "none",
              boxShadow: m.role === "user" ? "0 4px 14px rgba(37,99,235,.28)" : "none",
            }} dangerouslySetInnerHTML={{ __html: m.html || "<span style='opacity:.5'>…</span>" }} />
          </div>
        ))}
        {busy && msgs[msgs.length - 1]?.role === "user" && (
          <div style={{ display: "flex", gap: "9px", alignItems: "flex-end" }}>
            <div style={{ width: "29px", height: "29px", borderRadius: "9px", background: userGrad,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Avatar /></div>
            <div style={{ background: "#172033", padding: "14px 16px", borderRadius: "16px 16px 16px 5px",
              border: "1px solid rgba(148,163,184,.14)", display: "flex", gap: "5px" }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22d3ee",
                  animation: `esgbob 1.4s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,.12)", color: "#fca5a5",
            borderRadius: "10px", fontSize: "12.5px", borderLeft: "3px solid #ef4444", margin: "0 4px" }}>{error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chips */}
      {showChips && CFG.suggestions?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", padding: "0 14px 10px 52px" }}>
          {CFG.suggestions.slice(0, 4).map((q, i) => (
            <button key={i} type="button" onClick={() => send(q)} style={{
              background: "#172033", border: "1px solid rgba(148,163,184,.14)", color: "#bccbe6",
              padding: "7px 12px", borderRadius: "12px", fontSize: "11.5px", cursor: "pointer",
              fontFamily: "inherit", lineHeight: 1.3, textAlign: "left", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = pc; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(148,163,184,.14)"; e.currentTarget.style.color = "#bccbe6"; }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 12px 11px", background: "#0d1424", borderTop: "1px solid rgba(148,163,184,.14)",
        display: "flex", gap: "9px", alignItems: "flex-end" }}>
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
          placeholder="Escribe una referencia, síntoma o consulta técnica..." disabled={busy} rows={1}
          style={{ flex: 1, padding: "10px 14px", border: `1.5px solid ${input ? pc : "rgba(148,163,184,.14)"}`,
            borderRadius: "14px", fontSize: "13.5px", outline: "none", background: input ? "#1e293b" : "#172033",
            fontFamily: "inherit", lineHeight: 1.45, resize: "none", maxHeight: "100px", minHeight: "40px",
            transition: "border-color .15s", color: "#e8eef7" }} />
        <button onClick={() => send()} disabled={busy || !input.trim()} aria-label="Enviar"
          style={{ width: "40px", height: "40px", borderRadius: "12px",
            background: busy || !input.trim() ? "#27324a" : userGrad, border: "none",
            cursor: busy || !input.trim() ? "default" : "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", color: busy || !input.trim() ? "#5c6c87" : "#fff", flexShrink: 0,
            boxShadow: busy || !input.trim() ? "none" : "0 4px 12px rgba(37,99,235,.3)", transition: "all .15s" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ██ POWERED BY FLOWNEXION — OBLIGATORIO ██ */}
      <div style={{ background: "#0d1424", borderTop: "1px solid rgba(148,163,184,.14)", padding: "7px 12px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        <span style={{ fontSize: "10.5px", color: "#5c6c87" }}>Powered by</span>
        <a href={FLOWNEXION.url} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", lineHeight: 0,
            background: "rgba(255,255,255,.92)", padding: "3px 7px", borderRadius: "6px" }}>
          <img src={FLOWNEXION.logo} alt="Flownexion" style={{ height: "13px", objectFit: "contain" }}
            onError={e => {
              e.currentTarget.style.display = "none";
              e.currentTarget.insertAdjacentHTML("afterend",
                `<strong style="font-size:11px;color:#1a56db;font-weight:800;letter-spacing:-.3px">flownexion</strong>`);
            }} />
        </a>
      </div>

      <style>{`
        @keyframes esgbob{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1.1);opacity:1}}
      `}</style>
    </div>
  );
}
