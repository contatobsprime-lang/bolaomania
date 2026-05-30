"use client";
import { useState, useEffect, useRef } from "react";

interface Props {
  usuarioNome: string;
  emailAtual: string | null;
  onPago: () => void;
}

export default function PixQRCode({ usuarioNome, emailAtual, onPago }: Props) {
  const [status, setStatus] = useState<"idle"|"loading"|"aguardando"|"erro">("idle");
  const [qrBase64, setQrBase64] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState("");
  const pollingRef = useRef<any>(null);

  useEffect(() => {
    return () => clearInterval(pollingRef.current);
  }, []);

  async function gerarPix() {
    setStatus("loading");
    setErro("");
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: usuarioNome, email: emailAtual }),
      });
      const data = await res.json();
      if (!res.ok || !data.qrCode) throw new Error(data.error || "Erro ao gerar QR Code");
      setQrBase64(data.qrCodeBase64);
      setQrCode(data.qrCode);
      setStatus("aguardando");
      iniciarPolling();
    } catch (err: any) {
      setErro(err.message || "Erro inesperado");
      setStatus("erro");
    }
  }

  function iniciarPolling() {
    let tentativas = 0;
    pollingRef.current = setInterval(async () => {
      tentativas++;
      try {
        const res = await fetch(`/api/check-payment?nome=${encodeURIComponent(usuarioNome)}`);
        const data = await res.json();
        if (data.pago) { clearInterval(pollingRef.current); onPago(); }
      } catch {}
      if (tentativas >= 72) clearInterval(pollingRef.current);
    }, 5000);
  }

  function copiar() {
    navigator.clipboard.writeText(qrCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  if (status === "idle") return (
    <div style={{textAlign:"center",padding:"32px 24px",background:"#f0fdf4",borderRadius:16,border:"1.5px solid #86efac"}}>
      <div style={{fontSize:52,marginBottom:12}}>📱</div>
      <div style={{fontWeight:800,fontSize:18,color:"#166534",marginBottom:8}}>Pagar via Pix</div>
      <div style={{fontSize:13,color:"#6b7280",marginBottom:24,lineHeight:1.6}}>
        QR Code gerado aqui mesmo.<br/>
        Pague e seja liberado <strong>automaticamente</strong>!
      </div>
      <button onClick={gerarPix} style={{background:"#16a34a",color:"#fff",border:"none",borderRadius:12,padding:"15px 32px",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:16,cursor:"pointer",width:"100%"}}>
        Gerar QR Code Pix — R$ 10
      </button>
    </div>
  );

  if (status === "loading") return (
    <div style={{textAlign:"center",padding:"48px"}}>
      <div style={{width:40,height:40,border:"3px solid #e5e7eb",borderTopColor:"#16a34a",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 16px"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontWeight:600,color:"#6b7280"}}>Gerando QR Code...</div>
    </div>
  );

  if (status === "erro") return (
    <div style={{textAlign:"center",padding:"24px",background:"#fef2f2",borderRadius:16,border:"1.5px solid #fecaca"}}>
      <div style={{fontSize:32,marginBottom:8}}>❌</div>
      <div style={{fontWeight:700,color:"#b91c1c",marginBottom:12}}>{erro}</div>
      <button onClick={()=>setStatus("idle")} style={{background:"#fff",color:"#b91c1c",border:"1.5px solid #fecaca",borderRadius:10,padding:"10px 20px",fontWeight:600,cursor:"pointer"}}>
        Tentar novamente
      </button>
    </div>
  );

  return (
    <div>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontWeight:800,fontSize:18,color:"#111827",marginBottom:4}}>Escaneie o QR Code</div>
        <div style={{fontSize:13,color:"#6b7280"}}>Abra o app do seu banco e pague R$ 10</div>
      </div>

      {/* QR Code clicável */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
        <div
          onClick={copiar}
          title="Clique para copiar o código Pix"
          style={{padding:16,background:"#fff",borderRadius:16,border:`1.5px solid ${copiado?"#86efac":"#e5e7eb"}`,boxShadow:"0 2px 8px rgba(0,0,0,.06)",cursor:"pointer",transition:"all .2s",position:"relative"}}
        >
          <img src={`data:image/png;base64,${qrBase64}`} alt="QR Code Pix" style={{width:220,height:220,display:"block"}}/>
          <div style={{position:"absolute",inset:0,borderRadius:14,background:"rgba(0,0,0,.0)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .2s"}}
            onMouseEnter={e=>(e.currentTarget.style.opacity="1")}
            onMouseLeave={e=>(e.currentTarget.style.opacity="0")}
          >
            <div style={{background:"rgba(0,0,0,.6)",color:"#fff",padding:"8px 16px",borderRadius:20,fontSize:13,fontWeight:700}}>
              📋 Copiar código
            </div>
          </div>
        </div>
      </div>

      {/* Feedback de copiado */}
      {copiado&&(
        <div style={{textAlign:"center",marginBottom:12}}>
          <span style={{background:"#dcfce7",color:"#166534",padding:"6px 16px",borderRadius:20,fontSize:13,fontWeight:700}}>
            ✅ Código copiado!
          </span>
        </div>
      )}

      {/* Botão copiar grande */}
      <button
        onClick={copiar}
        style={{width:"100%",padding:"14px",borderRadius:12,border:`1.5px solid ${copiado?"#86efac":"#e5e7eb"}`,background:copiado?"#f0fdf4":"#fff",color:copiado?"#16a34a":"#374151",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:15,cursor:"pointer",marginBottom:12,transition:"all .2s"}}
      >
        {copiado?"✅ Código copiado!":"📋 Copiar código Pix (Copia e Cola)"}
      </button>

      {/* Código pequeno */}
      <div style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px",fontSize:11,color:"#9ca3af",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:16}}>
        {qrCode}
      </div>

      {/* Status aguardando */}
      <div style={{textAlign:"center",padding:"16px",background:"#fefce8",borderRadius:12,border:"1.5px solid #fde68a"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:4}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#fbbf24",animation:"pulse 1.5s ease infinite"}}/>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
          <span style={{fontWeight:700,fontSize:14,color:"#854d0e"}}>Aguardando pagamento...</span>
        </div>
        <div style={{fontSize:12,color:"#92400e"}}>Você será liberado automaticamente após confirmar</div>
      </div>
    </div>
  );
}