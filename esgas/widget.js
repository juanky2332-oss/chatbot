/**
 * ESGAS Chatbot Widget — Embed de 1 línea
 * Uso: <script src="https://[dominio]/chatbots/esgas/widget.js"></script>
 *
 * Inyecta un botón flotante. Al pulsarlo abre el asistente técnico de ESGAS
 * en un iframe modal. Cierre con tecla ESC o botón ✕.
 */
(function () {
  if (window.__flownexion_widget_loaded) return;
  window.__flownexion_widget_loaded = true;

  // ════════════════════════════════════════════════════
  // CONFIG — ESGAS
  // ════════════════════════════════════════════════════
  const CFG = {
    chatbotUrl:   "https://esgas.es/chatbots/esgas/chatbot.html", // ajustar al dominio real de despliegue
    clientName:   "ESGAS",
    primaryColor: "#2563eb",
    position:     "br", // br | bl | tr | tl
    greeting:     "¿Buscas una equivalencia o medida de rodamiento? Pregúntame."
  };

  const POS = {
    br: { bottom: "20px", right: "20px" },
    bl: { bottom: "20px", left: "20px" },
    tr: { top: "20px", right: "20px" },
    tl: { top: "20px", left: "20px" },
  }[CFG.position || "br"];

  const css = `
    .fn-btn{position:fixed;width:62px;height:62px;border-radius:50%;
      background:linear-gradient(135deg,${CFG.primaryColor},#1e40af);
      border:none;cursor:pointer;box-shadow:0 8px 26px rgba(37,99,235,.45),0 2px 6px rgba(2,6,23,.3);
      display:flex;align-items:center;justify-content:center;color:#fff;z-index:2147483646;
      transition:transform .2s,box-shadow .2s}
    .fn-btn:hover{transform:scale(1.08)}
    .fn-btn svg{width:28px;height:28px}
    .fn-pulse{position:absolute;inset:0;border-radius:50%;background:${CFG.primaryColor};
      opacity:.4;animation:fnPulse 2s ease-out infinite;z-index:-1}
    @keyframes fnPulse{0%{transform:scale(1);opacity:.4}100%{transform:scale(1.55);opacity:0}}
    .fn-modal{position:fixed;width:430px;max-width:calc(100vw - 24px);height:660px;max-height:calc(100vh - 100px);
      border-radius:20px;overflow:hidden;box-shadow:0 24px 70px rgba(2,6,23,.55);
      z-index:2147483647;background:#0d1424;display:none;animation:fnIn .25s ease-out;border:none}
    @keyframes fnIn{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:none}}
    .fn-modal.open{display:block}
    .fn-greet{position:fixed;background:#172033;color:#e8eef7;padding:11px 14px;
      border-radius:14px 14px 4px 14px;box-shadow:0 8px 24px rgba(2,6,23,.45);font-size:13px;
      max-width:250px;line-height:1.45;z-index:2147483645;animation:fnIn .3s ease-out;
      border:1px solid rgba(148,163,184,.16);
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .fn-greet-x{position:absolute;top:-7px;right:-7px;width:19px;height:19px;border-radius:50%;
      background:#2563eb;color:#fff;border:none;cursor:pointer;font-size:11px;
      display:flex;align-items:center;justify-content:center}
    @media (max-width:480px){.fn-modal{width:100vw;height:100vh;height:100dvh;max-width:100vw;max-height:100vh;
      border-radius:0;bottom:0!important;right:0!important;top:0!important;left:0!important}}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.className = "fn-btn";
  btn.setAttribute("aria-label", `Abrir chat de ${CFG.clientName}`);
  Object.assign(btn.style, POS);
  btn.innerHTML = `
    <span class="fn-pulse"></span>
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.7"/>
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" stroke-width="1.7"/>
      <g fill="currentColor">
        <circle cx="12" cy="3.7" r="1.4"/><circle cx="12" cy="20.3" r="1.4"/>
        <circle cx="3.7" cy="12" r="1.4"/><circle cx="20.3" cy="12" r="1.4"/>
      </g>
    </svg>
  `;
  document.body.appendChild(btn);

  const iframe = document.createElement("iframe");
  iframe.className = "fn-modal";
  iframe.title = `Chat ${CFG.clientName}`;
  iframe.allow = "clipboard-write";
  iframe.src = "about:blank";
  const pos = POS.bottom ? { bottom: "96px" } : { top: "96px" };
  Object.assign(iframe.style, POS.right ? { right: "20px", ...pos } : { left: "20px", ...pos });
  document.body.appendChild(iframe);

  let opened = false;
  function open() {
    if (!opened) { iframe.src = CFG.chatbotUrl; opened = true; }
    iframe.classList.add("open");
    btn.style.display = "none";
    greetEl?.remove();
  }
  function close() {
    iframe.classList.remove("open");
    btn.style.display = "flex";
  }

  btn.addEventListener("click", open);
  window.addEventListener("message", e => { if (e.data === "flownexion:close") close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && iframe.classList.contains("open")) close(); });

  let greetEl = null;
  if (CFG.greeting && !sessionStorage.getItem("fnGreeted")) {
    setTimeout(() => {
      greetEl = document.createElement("div");
      greetEl.className = "fn-greet";
      const p2 = {};
      if (POS.bottom) p2.bottom = "96px"; else p2.top = "96px";
      if (POS.right) p2.right = "20px"; else p2.left = "20px";
      Object.assign(greetEl.style, p2);
      greetEl.innerHTML = `${CFG.greeting}<button class="fn-greet-x" aria-label="Cerrar">✕</button>`;
      greetEl.querySelector(".fn-greet-x").onclick = e => { e.stopPropagation(); greetEl.remove(); sessionStorage.setItem("fnGreeted", "1"); };
      greetEl.addEventListener("click", open);
      document.body.appendChild(greetEl);
      sessionStorage.setItem("fnGreeted", "1");
      setTimeout(() => greetEl?.remove(), 12000);
    }, 1500);
  }
})();
