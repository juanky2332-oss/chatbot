import { useState, useRef, useEffect } from "react";

// ════════════════════════════════════════════════════
// CONFIG DEL CLIENTE
// ════════════════════════════════════════════════════
const CFG = {
  clientName:   "{{CLIENT_NAME}}",
  clientLogo:   "{{CLIENT_LOGO}}",
  primaryColor: "{{PRIMARY_COLOR}}",
  welcome:      "{{WELCOME_MESSAGE}}",
  suggestions:  {{SUGGESTED_QUESTIONS}},
  system:       `{{SYSTEM_PROMPT}}`,
  model:        "claude-sonnet-4-6",
  maxHistoryTurns: 12,
};
const FLOWNEXION = {
  url:  "https://flownexion.com/",
  logo: "https://flownexion.com/wp-content/uploads/2025/07/logotipo_flownexion_calidadBaja-1.png",
};

function mdToHtml(text) {
  const e = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let h = e(text);
  h = h.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,;:!?])/g, '$1<em>$2</em>');
  h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const lines = h.split('\n');
  let out = '', inUl = false;
  for (const ln of lines) {
    if (/^\s*[-•]\s+/.test(ln)) {
      if (!inUl) { out += '<ul>'; inUl = true; }
      out += '<li>' + ln.replace(/^\s*[-•]\s+/, '') + '</li>';
    } else {
      if (inUl) { out += '</ul>'; inUl = false; }
      out += ln + '<br>';
    }
  }
  if (inUl) out += '</ul>';
  return out.replace(/(<br>\s*){2,}/g, '<br><br>').replace(/<br>$/, '');
}

/**
 * ChatBot — componente listo para Next.js / React.
 * En producción: usar `apiProxy` apuntando a tu endpoint backend.
 * Nunca exponer la API key en frontend en producción.
 */
export default function ChatBot({ apiKey = "FLOWNEXION_API_KEY", apiProxy = "" }) {
  const pc = CFG.primaryColor;
  const initial = (CFG.clientName.trim()[0] || "•").toUpperCase();
  const [msgs, setMsgs]       = useState([{ role: "assistant", text: CFG.welcome, id: 0 }]);
  const [history, setHistory] = useState([]);
  const [input, setInput]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState(null);
  const [showChips, setShowChips] = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (override) => {
    const text = (override ?? input).trim();
    if (!text || busy) return;
    if (!override) setInput("");
    setShowChips(false);
    setError(null);

    const userMsg = { role: "user", text, id: Date.now() };
    const newApi  = [...history, { role: "user", content: text }].slice(-CFG.maxHistoryTurns * 2);
    setMsgs(p => [...p, userMsg]);
    setHistory(newApi);
    setBusy(true);

    try {
      const url = apiProxy || "https://api.anthropic.com/v1/messages";
      const headers = { "Content-Type": "application/json" };
      if (!apiProxy) {
        headers["x-api-key"] = apiKey;
        headers["anthropic-version"] = "2023-06-01";
        headers["anthropic-dangerous-direct-browser-access"] = "true";
      }
      const res = await fetch(url, {
        method: "POST", headers,
        body: JSON.stringify({
          model: CFG.model, max_tokens: 1024,
          system: CFG.system, messages: newApi
        })
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Disculpa, no pude generar una respuesta.";
      setHistory(p => [...p, { role: "assistant", content: reply }]);
      setMsgs(p => [...p, { role: "assistant", text: reply, id: Date.now() + 1 }]);
    } catch (e) {
      setError("No puedo conectar en este momento. Vuelve a intentarlo en unos segundos.");
      setHistory(p => p.slice(0, -1));
    }
    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const onKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const wrapStyle = { fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    display:"flex",flexDirection:"column",width:"100%",maxWidth:"420px",height:"min(640px,92vh)",
    background:"#fff",borderRadius:"18px",overflow:"hidden",
    boxShadow:"0 10px 50px rgba(15,23,42,.15),0 2px 8px rgba(15,23,42,.06)",
    border:"1px solid rgba(15,23,42,.05)",color:"#1a1d2e" };

  return (
    <div style={wrapStyle} role="region" aria-label={`Asistente virtual de ${CFG.clientName}`}>
      {/* Header */}
      <header style={{background:pc,padding:"14px 16px",display:"flex",alignItems:"center",gap:"11px",color:"#fff"}}>
        <div style={{width:"38px",height:"38px",borderRadius:"50%",background:"rgba(255,255,255,.18)",
          display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"15px",
          overflow:"hidden",flexShrink:0,border:"1px solid rgba(255,255,255,.15)"}}>
          {CFG.clientLogo
            ? <img src={CFG.clientLogo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}
                onError={e=>{e.currentTarget.style.display="none";e.currentTarget.parentElement.textContent=initial}}/>
            : initial}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:"15px",lineHeight:1.2,letterSpacing:"-.01em"}}>{CFG.clientName}</div>
          <div style={{fontSize:"11.5px",opacity:.85,display:"flex",alignItems:"center",gap:"5px",marginTop:"2px"}}>
            <span style={{width:"7px",height:"7px",borderRadius:"50%",background:"#4ade80",
              boxShadow:"0 0 0 2px rgba(74,222,128,.25)"}}/>
            En línea · Responde al momento
          </div>
        </div>
      </header>

      {/* Mensajes */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 14px",display:"flex",flexDirection:"column",
        gap:"10px",background:"linear-gradient(180deg,#fafbfc 0%,#f4f5f8 100%)"}}>
        {msgs.map(m => (
          <div key={m.id} style={{display:"flex",gap:"8px",alignItems:"flex-end",
            justifyContent:m.role==="user"?"flex-end":"flex-start",animation:"in .22s ease-out"}}>
            {m.role==="assistant" && (
              <div style={{width:"28px",height:"28px",borderRadius:"50%",background:pc,color:"#fff",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,flexShrink:0}}>{initial}</div>
            )}
            <div style={{
              maxWidth:"79%",padding:"10px 14px",fontSize:"13.5px",lineHeight:1.55,wordWrap:"break-word",
              borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
              background:m.role==="user"?pc:"#fff",
              color:m.role==="user"?"#fff":"#1a1d2e",
              boxShadow:m.role==="assistant"?"0 1px 3px rgba(15,23,42,.08),0 0 0 1px rgba(15,23,42,.03)":"none"
            }} dangerouslySetInnerHTML={{__html:mdToHtml(m.text)}}/>
          </div>
        ))}

        {busy && (
          <div style={{display:"flex",gap:"8px",alignItems:"flex-end"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"50%",background:pc,color:"#fff",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,flexShrink:0}}>{initial}</div>
            <div style={{background:"#fff",padding:"13px 16px",borderRadius:"18px 18px 18px 4px",
              boxShadow:"0 1px 3px rgba(15,23,42,.08)",display:"flex",gap:"4px",alignItems:"center"}}>
              {[0,1,2].map(i=>(
                <span key={i} style={{width:"7px",height:"7px",borderRadius:"50%",background:pc,
                  animation:`bob 1.4s ease-in-out ${i*.18}s infinite`}}/>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{padding:"10px 14px",background:"#fef2f2",color:"#991b1b",borderRadius:"10px",
            fontSize:"12.5px",borderLeft:"3px solid #ef4444",margin:"0 4px"}}>{error}</div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Chips de sugerencias */}
      {showChips && CFG.suggestions?.length > 0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px",padding:"0 14px 8px 50px"}}>
          {CFG.suggestions.slice(0,4).map((q,i) => (
            <button key={i} onClick={()=>send(q)} style={{
              background:"#fff",border:"1px solid #e2e6ef",color:"#3f4961",
              padding:"6px 12px",borderRadius:"14px",fontSize:"12px",cursor:"pointer",
              fontFamily:"inherit",lineHeight:1.3,transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=pc;e.currentTarget.style.color=pc}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e6ef";e.currentTarget.style.color="#3f4961"}}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{padding:"11px 12px 10px",background:"#fff",borderTop:"1px solid #eef0f5",
        display:"flex",gap:"8px",alignItems:"flex-end"}}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
          placeholder="Escribe tu mensaje..." disabled={busy} rows={1}
          style={{flex:1,padding:"9px 14px",border:`1.5px solid ${input?pc:"#e5e7eb"}`,
            borderRadius:"20px",fontSize:"13.5px",outline:"none",background:input?"#fff":"#f9fafb",
            fontFamily:"inherit",lineHeight:1.4,resize:"none",maxHeight:"96px",minHeight:"38px",
            transition:"border-color .15s",color:"#1a1d2e"}}/>
        <button onClick={()=>send()} disabled={busy||!input.trim()} aria-label="Enviar"
          style={{width:"38px",height:"38px",borderRadius:"50%",
            background:busy||!input.trim()?"#d1d5db":pc,border:"none",
            cursor:busy||!input.trim()?"default":"pointer",display:"flex",alignItems:"center",
            justifyContent:"center",color:"#fff",flexShrink:0,transition:"all .15s"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ██ POWERED BY FLOWNEXION — OBLIGATORIO ██ */}
      <div style={{background:"#fff",borderTop:"1px solid #f0f2f5",padding:"6px 12px",
        display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>
        <span style={{fontSize:"10.5px",color:"#9ca3af"}}>Powered by</span>
        <a href={FLOWNEXION.url} target="_blank" rel="noopener noreferrer"
           style={{display:"inline-flex",alignItems:"center",textDecoration:"none",lineHeight:0}}>
          <img src={FLOWNEXION.logo} alt="Flownexion" style={{height:"14px",objectFit:"contain"}}
            onError={e=>{
              e.currentTarget.style.display="none";
              e.currentTarget.insertAdjacentHTML("afterend",
                `<strong style="font-size:11.5px;color:#1a56db;font-weight:700;letter-spacing:-.3px">flownexion</strong>`);
            }}/>
        </a>
      </div>

      <style>{`
        @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bob{0%,80%,100%{transform:scale(.65);opacity:.35}40%{transform:scale(1.15);opacity:1}}
      `}</style>
    </div>
  );
}
