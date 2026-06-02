"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CONFIG } from "@/lib/constantes";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

interface Props {
  onCadastro: (nome: string, email: string, isAdmin: boolean) => void;
  onVoltar: () => void;
}

export default function TelaCadastro({ onCadastro, onVoltar }: Props) {
  const [cadNome, setCadNome]     = useState("");
  const [cadEmail, setCadEmail]   = useState("");
  const [cadSenha, setCadSenha]   = useState("");
  const [cadSenha2, setCadSenha2] = useState("");
  const [cadErro, setCadErro]     = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro() {
    const nome = cadNome.trim(); const email = cadEmail.trim();
    if (!nome) { setCadErro("Digite seu nome."); return; }
    if (!email || !email.includes("@")) { setCadErro("Digite um email válido."); return; }
    if (cadSenha.length < 6) { setCadErro("Mínimo 6 caracteres."); return; }
    if (cadSenha !== cadSenha2) { setCadErro("Senhas não conferem."); return; }
    setCarregando(true); setCadErro("");
    const { data, error } = await supabase.auth.signUp({ email, password: cadSenha });
    if (error) { setCarregando(false); setCadErro(error.message === "User already registered" ? "Email já cadastrado." : error.message); return; }
    const { error: err2 } = await supabase.from("usuarios").insert({ nome, email, pago: false, campeao_palpite: "" });
    setCarregando(false);
    if (err2) { setCadErro(err2.code === "23505" ? "Nome ou email já cadastrado." : "Erro ao criar conta."); return; }
    if (typeof window !== "undefined") localStorage.setItem(`ob_${nome}`, "1");
    setCadNome(""); setCadEmail(""); setCadSenha(""); setCadSenha2("");
    onCadastro(nome, email, email === ADMIN_EMAIL);
  }

  return (
    <div className="fade" style={{ maxWidth: 360, margin: "0 auto", paddingTop: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 12px" }}>👤</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Criar conta</h2>
        <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>Cota: <span style={{ color: "#16a34a", fontWeight: 700 }}>R$ {CONFIG.valorCota}</span></p>
      </div>
      <div className="card" style={{ marginBottom: 12, padding: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="inp" placeholder="Seu nome completo" value={cadNome} onChange={e => setCadNome(e.target.value)} />
          <input className="inp" type="email" placeholder="Seu email" value={cadEmail} onChange={e => setCadEmail(e.target.value)} />
          <input className="inp" type="password" placeholder="Criar senha (mín. 6 chars)" value={cadSenha} onChange={e => setCadSenha(e.target.value)} />
          <input className="inp" type="password" placeholder="Confirmar senha" value={cadSenha2} onChange={e => setCadSenha2(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCadastro()} />
          {cadErro && <div style={{ color: "#b91c1c", fontSize: 13, background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>{cadErro}</div>}
          <button className="btn-primary" onClick={handleCadastro} disabled={carregando}>{carregando ? "Criando..." : "Criar conta e entrar"}</button>
          <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", lineHeight: 1.6 }}>
            Ao criar sua conta você concorda com nossa{" "}
            <a href="/privacidade" target="_blank" style={{ color: "#16a34a", textDecoration: "underline" }}>Política de Privacidade</a>
          </p>
        </div>
      </div>
      <button className="btn-ghost" onClick={() => { setCadErro(""); onVoltar(); }}>← Voltar para login</button>
    </div>
  );
}