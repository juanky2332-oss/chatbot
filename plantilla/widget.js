/**
 * Flownexion Chatbot Widget — Embed de 1 línea
 * Uso: <script src="https://[dominio]/chatbots/[slug]/widget.js"></script>
 *
 * Inyecta un botón flotante en la esquina inferior derecha. Al hacer clic
 * abre el chatbot en un iframe modal. Cierre con tecla ESC o botón ✕.
 */
(function() {
  if (window.__flownexion_widget_loaded) return;
  window.__flownexion_widget_loaded = true;

  // ════════════════════════════════════════════════════
  // CONFIG — Claude Code sustituye los placeholders
  // ════════════════════════════════════════════════════
  const CFG = {
    chatbotUrl:   "{{CHATBOT_URL}}",        // ej: https://tudominio.com/chatbots/clinica-perez/chatbot.html
    clientName:   "{{CLIENT_NAME}}",
    primaryColor: "{{PRIMARY_COLOR}}",
    position:     "{{POSITION}}",           // "br" (default), "bl", "tr", "tl"
    greeting:     "{{GREETING_BUBBLE}}"     // mensaje opcional sobre el botón al cargar (1 vez)
  };

  const POS = {
    br: { bottom:"20px", right:"20px" },
    bl: { bottom:"20px", left:"20px" },
    tr: { top:"20px",    right:"20px" },
    tl: { top:"20px",    left:"20px" },
  }[CFG.position || "br"];

  // Estilos
  const css = `
    .fn-btn{position:fixed;width:60px;height:60px;border-radius:50%;background:${CFG.primaryColor};
      border:none;cursor:pointer;box-shadow:0 4px 20px rgba(15,23,42,.25),0 2px 6px rgba(15,23,42,.15);
      display:flex;align-items:center;justify-content:center;color:#fff;z-index:2147483646;
      transition:transform .2s,box-shadow .2s;font-family:inherit}
    .fn-btn:hover{transform:scale(1.08);box-shadow:0 6px 24px rgba(15,23,42,.3),0 3px 8px rgba(15,23,42,.18)}
    .fn-btn svg{width:28px;height:28px}
    .fn-pulse{position:absolute;inset:0;border-radius:50%;background:${CFG.primaryColor};
      opacity:.4;animation:fnPulse 2s ease-out infinite;z-index:-1}
    @keyframes fnPulse{0%{transform:scale(1);opacity:.4}100%{transform:scale(1.5);opacity:0}}
    .fn-modal{position:fixed;width:420px;max-width:calc(100vw - 24px);height:640px;max-height:calc(100vh - 100px);
      border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,.3),0 8px 20px rgba(15,23,42,.15);
      z-index:2147483647;background:#fff;display:none;animation:fnIn .25s ease-out;border:none}
    @keyframes fnIn{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:none}}
    .fn-modal.open{display:block}
    .fn-greet{position:fixed;background:#fff;color:#1a1d2e;padding:10px 14px;border-radius:14px 14px 4px 14px;
      box-shadow:0 4px 16px rgba(15,23,42,.15);font-size:13px;max-width:240px;line-height:1.4;
      z-index:2147483645;animation:fnIn .3s ease-out;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .fn-greet-x{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#1a1d2e;
      color:#fff;border:none;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center}
    @media (max-width:480px){.fn-modal{width:100vw;height:100vh;max-width:100vw;max-height:100vh;
      border-radius:0;bottom:0!important;right:0!important;top:0!important;left:0!important}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Botón flotante
  const btn = document.createElement('button');
  btn.className = 'fn-btn';
  btn.setAttribute('aria-label', `Abrir chat de ${CFG.clientName}`);
  Object.assign(btn.style, POS);
  btn.innerHTML = `
    <span class="fn-pulse"></span>
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5C21 16.75 16.97 21 12 21C10.66 21 9.39 20.7 8.27 20.17L3 21L4.5 16.5C3.55 14.85 3 12.97 3 11.5C3 6.25 7.03 2 12 2C16.97 2 21 6.25 21 11.5Z"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  document.body.appendChild(btn);

  // Modal con iframe
  const iframe = document.createElement('iframe');
  iframe.className = 'fn-modal';
  iframe.title = `Chat ${CFG.clientName}`;
  iframe.allow = 'clipboard-write';
  iframe.src = 'about:blank';
  const pos = POS.bottom ? { bottom: '94px' } : { top: '94px' };
  Object.assign(iframe.style, POS.right ? { right: '20px', ...pos } : { left: '20px', ...pos });
  document.body.appendChild(iframe);

  let opened = false;
  function open() {
    if (!opened) { iframe.src = CFG.chatbotUrl; opened = true; }
    iframe.classList.add('open');
    btn.style.display = 'none';
    greetEl?.remove();
  }
  function close() {
    iframe.classList.remove('open');
    btn.style.display = 'flex';
  }

  btn.addEventListener('click', open);
  window.addEventListener('message', e => { if (e.data === 'flownexion:close') close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && iframe.classList.contains('open')) close(); });

  // Burbuja de saludo (una vez por sesión)
  let greetEl = null;
  if (CFG.greeting && !sessionStorage.getItem('fnGreeted')) {
    setTimeout(() => {
      greetEl = document.createElement('div');
      greetEl.className = 'fn-greet';
      const pos2 = {};
      if (POS.bottom) pos2.bottom = '94px'; else pos2.top = '94px';
      if (POS.right) pos2.right = '20px'; else pos2.left = '20px';
      Object.assign(greetEl.style, pos2);
      greetEl.innerHTML = `${CFG.greeting}<button class="fn-greet-x" aria-label="Cerrar">✕</button>`;
      greetEl.querySelector('.fn-greet-x').onclick = e => { e.stopPropagation(); greetEl.remove(); sessionStorage.setItem('fnGreeted','1'); };
      greetEl.addEventListener('click', open);
      document.body.appendChild(greetEl);
      sessionStorage.setItem('fnGreeted','1');
      setTimeout(() => greetEl?.remove(), 12000);
    }, 1500);
  }
})();
