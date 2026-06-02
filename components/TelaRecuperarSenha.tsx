"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  onSucesso: () => void;
}

export default function TelaRecuperarSenha({ onSucesso }: Props) {
  const [senha, setSenha]       = useState("");
  const [senha2, setSenha2]     = useState("");
  const [erro, setErro]         = useState("");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso]   = useState(false);

  async function handleSalvar() {
    if (senha.length < 6) { setErro("Mínimo 6 caracteres."); return; }
    if (senha !== senha2) { setErro("Senhas não conferem."); return; }
    setCarregando(true); setErro("");
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) { setErro("Erro ao redefinir senha. Tente novamente."); return; }
    setSucesso(true);
    setTimeout(() => onSucesso(), 2000);
  }

  return (
    <div className="fade" style={{ maxWidth: 360, margin: "0 auto", paddingTop: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, margin: "0 auto 16px" }}>🔐</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: "#111827" }}>Nova senha</h1>
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Digite sua nova senha abaixo</p>
      </div>

      {sucesso ? (
        <div className="card" style={{ textAlign: "center", padding: "32px", border: "1.5px solid #86efac", background: "#f0fdf4" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#16a34a", marginBottom: 8 }}>Senha redefinida!</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Redirecionando para o login...</div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 12, padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="inp" type="password" placeholder="Nova senha (mín. 6 chars)" value={senha} onChange={e => setSenha(e.target.value)} />
            <input className="inp" type="password" placeholder="Confirmar nova senha" value={senha2} onChange={e => setSenha2(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSalvar()} />
            {erro && <div style={{ color: "#b91c1c", fontSize: 13, background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>{erro}</div>}
            <button className="btn-primary" onClick={handleSalvar} disabled={carregando}>{carregando ? "Salvando..." : "Salvar nova senha"}</button>
          </div>
        </div>
      )}
    </div>
  );
}