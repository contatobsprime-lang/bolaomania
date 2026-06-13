"use client";

import { CONFIG, MEDAL } from "@/lib/constantes";
import { ShopeeAffiliateBanner } from "@/components/ShopeeAffiliateBanner";


interface Props {
  premios: any;
}

export default function TelaRegras({ premios }: Props) {
  const sections = [
    { 
      title: "Pontuação por fase", 
      rows: [
        ["⚽", "Grupos — vencedor/empate", "+2 pts"], 
        ["🎯", "Grupos — placar exato", "+5 pts"], 
        ["⚽", "Oitavas — vencedor", "+3 pts"], 
        ["🎯", "Oitavas — placar exato", "+8 pts"], 
        ["⚽", "Quartas — vencedor", "+5 pts"], 
        ["🎯", "Quartas — placar exato", "+12 pts"], 
        ["⚽", "Semifinal — vencedor", "+7 pts"], 
        ["🎯", "Semifinal — placar exato", "+15 pts"], 
        ["⚽", "Final — vencedor", "+10 pts"], 
        ["🎯", "Final — placar exato", "+20 pts"]
      ] 
    },
    { 
      title: "Bônus e regras", 
      rows: [
        ["🏆", `Campeão da Copa (fecha 04/07)`, `+${CONFIG.bonusCampeao} pts`], 
        ["🥅", "Pênalti: vale o vencedor final", "sem placar exato"], 
        ["🔒", `Palpites fecham ${CONFIG.minutesBloqueio}min antes do jogo começar`, "automático"]
      ] 
    },
    { 
      title: "Desempate", 
      rows: [
        ["1️⃣", "Mais placares exatos", ""], 
        ["2️⃣", "Mais acertos", ""], 
        ["3️⃣", "Acertou o campeão", ""], 
        ["4️⃣", "Decisão do admin", ""]
      ] 
    },
    { 
      title: "Premiação — apenas pagos", 
      rows: premios.dist.map((d: any) => [MEDAL[d.pos - 1], `${d.pos}º lugar`, `R$ ${d.valor}`]) 
    },
  ];

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16, color: "#111827" }}>📋 Regras do Bolão</div>
      {sections.map((sec, si) => (
        <div key={si} className="card" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#16a34a", letterSpacing: .5, textTransform: "uppercase", marginBottom: 12 }}>{sec.title}</div>
          {sec.rows.map((r: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < sec.rows.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <span style={{ fontSize: 16 }}>{r[0]}</span><span style={{ flex: 1, fontSize: 14, color: "#374151" }}>{r[1]}</span>{r[2] && <span className="badge bgr">{r[2]}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}