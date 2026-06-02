"use client";

import type { Jogo, RankingEntry } from "@/lib/types";
import { calcBadges } from "@/lib/calculos";

interface Props {
  usuarioAtual: string | null;
  emailAtual: string | null;
  pago: boolean;
  meusDados: any;
  minhaPos: number;
  ranking: RankingEntry[];
  palpitesMap: Record<string, Record<number, { gols1: string; gols2: string }>>;
  elim: Jogo[];
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  resE: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
}

export default function TelaPerfil({ usuarioAtual, emailAtual, pago, meusDados, minhaPos, ranking, palpitesMap, elim, res, resE }: Props) {
  const badges = calcBadges(usuarioAtual || "", ranking, palpitesMap, elim, res, resE);

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 20, color: "#111827" }}>👤 Meu Perfil</div>
      <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: 20, padding: "24px", marginBottom: 16, color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 64, background: "rgba(255,255,255,.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, letterSpacing: -1, flexShrink: 0 }}>
          {(usuarioAtual || "?").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{usuarioAtual}</div>
          <div style={{ fontSize: 12, opacity: .8 }}>{emailAtual}</div>
          <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{pago ? "✅ Pagamento confirmado" : "⚠️ Pagamento pendente"}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[["⭐", meusDados?.pontos ?? 0, "Pontos"], ["🎯", meusDados?.placares ?? 0, "Exatos"], ["✅", meusDados?.acertos ?? 0, "Acertos"], ["📊", `${minhaPos > 0 ? minhaPos + "º" : "—"}`, "Posição"]].map(([ic, v, lb]) => (
          <div key={lb as string} className="card" style={{ flex: 1, textAlign: "center", padding: "12px 6px" }}>
            <div style={{ fontSize: 18 }}>{ic}</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#16a34a" }}>{v}</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{lb}</div>
          </div>
        ))}
      </div>
      {badges.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 10 }}>🏅 Conquistas</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {badges.map(b => (
              <div key={b} style={{ padding: "8px 14px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#166534" }}>{b}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}