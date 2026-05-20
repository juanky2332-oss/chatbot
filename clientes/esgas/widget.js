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
    primaryColor: "#00D1FF", // cyan para robot Flownexion
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
      background:linear-gradient(135deg,${CFG.primaryColor},#0070FF);
      border:none;cursor:pointer;box-shadow:0 8px 26px rgba(0,209,255,.45),0 2px 6px rgba(2,6,23,.3);
      display:flex;align-items:center;justify-content:center;color:#fff;z-index:2147483646;
      transition:transform .2s,box-shadow .2s}
    .fn-btn:hover{transform:scale(1.08)}
    .fn-btn svg{width:32px;height:32px;overflow:visible}
    .fn-pulse{position:absolute;inset:0;border-radius:50%;background:${CFG.primaryColor};
      opacity:.4;animation:fnPulse 2s ease-out infinite;z-index:-1}
    @keyframes fnPulse{0%{transform:scale(1);opacity:.4}100%{transform:scale(1.55);opacity:0}}
    @keyframes fnBlink{0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(.1)}}
    @keyframes fnPulseLight{0%,100%{opacity:1;r:5}50%{opacity:.5;r:6}}`
    .fn-modal{position:fixed;width:430px;max-width:calc(100vw - 24px);height:660px;max-height:calc(100vh - 100px);
      border-radius:20px;overflow:hidden;box-shadow:0 24px 70px rgba(2,6,23,.55);
      z-index:2147483647;background:#0d1424;display:none;animation:fnIn .25s ease-out;border:none}
    @keyframes fnIn{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:none}}
    .fn-modal.open{display:block}
    .fn-greet{position:fixed;background:#172033;color:#e8eef7;padding:11px 14px;
      border-radius:14px 14px 4px 14px;box-shadow:0 8px 24px rgba(0,209,255,.25);font-size:13px;
      max-width:250px;line-height:1.45;z-index:2147483645;animation:fnIn .3s ease-out;
      border:1px solid rgba(0,209,255,.24);
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .fn-greet-x{position:absolute;top:-7px;right:-7px;width:19px;height:19px;border-radius:50%;
      background:linear-gradient(135deg,#00D1FF,#0070FF);color:#fff;border:none;cursor:pointer;font-size:11px;
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
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="robotGradWidget" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#CBD5E1"/>
        </linearGradient>
      </defs>
      <!-- Body -->
      <rect x="75" y="80" width="50" height="30" rx="10" fill="#CBD5E1"/>
      <!-- Arms -->
      <path d="M50 70 Q30 70 35 110" stroke="url(#robotGradWidget)" stroke-width="18" stroke-linecap="round" fill="none"/>
      <path d="M150 70 Q170 70 165 110" stroke="url(#robotGradWidget)" stroke-width="18" stroke-linecap="round" fill="none"/>
      <!-- Head -->
      <rect x="45" y="5" width="110" height="90" rx="45" fill="url(#robotGradWidget)"/>
      <rect x="55" y="20" width="90" height="50" rx="22" fill="#0F172A"/>
      <!-- Eyes (animated) -->
      <g style="animation: fnBlink 4s infinite; transform-origin: center;">
        <circle cx="82" cy="45" r="9" fill="#00D1FF"/>
        <circle cx="118" cy="45" r="9" fill="#00D1FF"/>
        <circle cx="85" cy="42" r="3" fill="white" fill-opacity="0.8"/>
        <circle cx="121" cy="42" r="3" fill="white" fill-opacity="0.8"/>
      </g>
      <!-- Mouth -->
      <path d="M90 60 Q100 66 110 60" fill="none" stroke="#00D1FF" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <!-- Antenna -->
      <line x1="100" y1="5" x2="100" y2="-8" stroke="#94A3B8" stroke-width="4"/>
      <circle cx="100" cy="-8" r="5" fill="#00D1FF" style="animation: fnPulseLight 1.5s infinite;"/>
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
