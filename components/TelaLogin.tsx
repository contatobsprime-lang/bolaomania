"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

interface Props {
  onLogin: (nome: string, email: string, isAdmin: boolean, usuario: any) => void;
  onCadastro: () => void;
}

export default function TelaLogin({ onLogin, onCadastro }: Props) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginErro, setLoginErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [telaEsqueceu, setTelaEsqueceu] = useState(false);
  const [esqueceuEmail, setEsqueceuEmail] = useState("");
  const [esqueceuSent, setEsqueceuSent] = useState(false);
  const [esqueceuErro, setEsqueceuErro] = useState("");

  async function handleLogin() {
    setCarregando(true); setLoginErro("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginSenha });
    if (error || !data.user) { setCarregando(false); setLoginErro("Email ou senha incorretos."); return; }
    const email = data.user.email || "";
    const { data: u } = await supabase.from("usuarios").select("*").eq("email", email).single();
    setCarregando(false);
    if (!u) { setLoginErro("Usuário não encontrado na tabela."); return; }
    const jaViu = typeof window !== "undefined" && localStorage.getItem(`ob_${u.nome}`);
    if (!jaViu && typeof window !== "undefined") localStorage.setItem(`ob_${u.nome}`, "1");
    onLogin(u.nome, email, email === ADMIN_EMAIL, u);
  }

  async function handleEsqueceuSenha() {
    if (!esqueceuEmail.trim() || !esqueceuEmail.includes("@")) {
      setEsqueceuErro("Digite um email válido.");
      return;
    }
    setCarregando(true); setEsqueceuErro("");
    await supabase.auth.resetPasswordForEmail(esqueceuEmail.trim());
    setCarregando(false);
    setEsqueceuSent(true);
  }

  if (telaEsqueceu) return (
    <div className="fade" style={{ maxWidth: 360, margin: "0 auto", paddingTop: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ width: 80, height: 80, background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 12px 28px rgba(22,163,74,.18)" }}>
          <i className="ti ti-lock-question" style={{ fontSize: 38, color: "#fff" }} aria-hidden="true" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: "#111827", letterSpacing: "-0.5px" }}>Recuperar senha</h1>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Enviaremos um link para seu email</p>
      </div>

      {!esqueceuSent ? (
        <div className="card" style={{ marginBottom: 12, padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="inp" type="email" placeholder="Digite seu email" value={esqueceuEmail} onChange={e => setEsqueceuEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEsqueceuSenha()} />
            {esqueceuErro && <div style={{ color: "#b91c1c", fontSize: 13, background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>{esqueceuErro}</div>}
            <button className="btn-primary" onClick={handleEsqueceuSenha} disabled={carregando}>{carregando ? "Enviando..." : "Enviar link"}</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "32px", border: "1.5px solid #86efac", background: "#f0fdf4" }}>
          <div style={{ marginBottom: 12 }}><i className="ti ti-mail-check" style={{ fontSize: 44, color: "#16a34a" }} aria-hidden="true" /></div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#16a34a", marginBottom: 8 }}>Email enviado!</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Verifique sua caixa de entrada para redefinir sua senha.</div>
        </div>
      )}

      <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => { setTelaEsqueceu(false); setEsqueceuSent(false); }}>Voltar ao login</button>
    </div>
  );

  return (
    <div className="fade" style={{ maxWidth: 360, margin: "0 auto", paddingTop: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ margin: "0 auto 16px", width: 96, height: 96 }}>
          <img src="/icon-512x512.png" alt="Bolão Copa 2026" style={{ width: "100%", height: "100%", borderRadius: 24, objectFit: "cover" }} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-1px", marginBottom: 6, color: "#111827" }}>Bolão Copa 2026</h1>
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Entre e acompanhe o bolão</p>
      </div>
      <div className="card" style={{ marginBottom: 12, padding: "24px" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#16a34a", letterSpacing: .5, textTransform: "uppercase", marginBottom: 16 }}>Entrar</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="inp" type="email" placeholder="Seu email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          <input className="inp" type="password" placeholder="Senha" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          {loginErro && <div style={{ color: "#b91c1c", fontSize: 13, background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>{loginErro}</div>}
          <button className="btn-primary" onClick={handleLogin} disabled={carregando}>{carregando ? "Entrando..." : "Acesse sua conta"}</button>
          <button onClick={() => { setTelaEsqueceu(true); setEsqueceuEmail(loginEmail); }} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", textAlign: "center" }}>Esqueci minha senha</button>
        </div>
      </div>
      <button className="btn-ghost" onClick={() => { setLoginErro(""); onCadastro(); }}>Criar conta</button>
    </div>
  );
}