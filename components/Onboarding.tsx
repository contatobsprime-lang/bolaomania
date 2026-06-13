"use client";

import { CONFIG } from "@/lib/constantes";

interface Props {
  onClose: () => void;
}

export default function Onboarding({ onClose }: Props) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 9997, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card" style={{ maxWidth: 380, width: "100%", textAlign: "center", padding: "32px 24px" }}>
        <div style={{ width: 72, height: 72, background: "#16a34a", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, margin: "0 auto 16px" }}>
          <i className="ti ti-soccer" style={{ color: "#fff", fontSize: 40 }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: "#111827" }}>Bem-vindo ao <span style={{ color: "#16a34a" }}>Bolão 2026!</span></h2>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20, lineHeight: 1.7 }}>EUA · México · Canadá · 11 Jun – 19 Jul 2026</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, textAlign: "left" }}>
          {[
            ["ti ti-target", "Placar exato", `+5 pts (grupos)`],
            ["ti ti-ball-football", "Acertar vencedor", "+2 pts (grupos)"],
            ["ti ti-trophy", "Campeão da Copa", `+${CONFIG.bonusCampeao} pts bônus`],
            ["ti ti-lock", "Palpites fecham", `${CONFIG.minutesBloqueio}min antes do jogo`],
          ].map(([icon, txt, sub]) => (
            <div key={txt} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" }}>
              <i className={icon} style={{ fontSize: 20, color: "#16a34a", minWidth: 24, display: "flex", alignItems: "center", justifyContent: "center" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{txt}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={onClose}>Entendido, vamos lá! 🚀</button>
      </div>
    </div>
  );
}