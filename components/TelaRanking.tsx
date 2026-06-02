"use client";

import { useState } from "react";
import type { RankingEntry, Jogo } from "@/lib/types";
import { calcBadges } from "@/lib/calculos";

interface Props {
  minhaPos: number;
  meusDados: any;
  usuarioAtual: string | null;
  ranking: RankingEntry[];
  premios: any;
  palpitesMap: Record<string, Record<number, { gols1: string; gols2: string }>>;
  elim: Jogo[];
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  resE: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  MEDAL: string[];
  F: Record<string, string>;
  exportarRanking: () => void;
  copRank: boolean;
}

export default function TelaRanking({ minhaPos, meusDados, usuarioAtual, ranking, premios, palpitesMap, elim, res, resE, MEDAL, F, exportarRanking, copRank }: Props) {
  const [detUser, setDetUser] = useState<string | null>(null);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>AO VIVO</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Classificação Geral</div>
        </div>
        <button onClick={exportarRanking} className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }}>{copRank ? "✅ Copiado!" : "📤 WhatsApp"}</button>
      </div>
      {minhaPos > 0 && (
        <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: 16, padding: "16px", marginBottom: 14, color: "#fff", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 28 }}>{MEDAL[minhaPos - 1] || `${minhaPos}º`}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{usuarioAtual} <span style={{ fontSize: 12, opacity: .8 }}>(você)</span></div>
            <div style={{ fontSize: 13, opacity: .8 }}>{meusDados?.pontos || 0} pts · {meusDados?.acertos || 0} acertos · {meusDados?.placares || 0} exatos</div>
          </div>
        </div>
      )}
      <div className="card" style={{ marginBottom: 14, border: "1.5px solid #fde68a", background: "#fefce8" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#854d0e", marginBottom: 10 }}>💰 Premiação</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {premios.dist.map((d: any) => (
            <div key={d.pos} style={{ flex: "1 1 60px", textAlign: "center", padding: "10px 8px", background: "#fff", borderRadius: 10, border: "1px solid #fde68a" }}>
              <div style={{ fontSize: 18 }}>{MEDAL[d.pos - 1]}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#16a34a" }}>R$ {d.valor}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ranking.map((p, i) => {
          const isMe = p.nome === usuarioAtual;
          const premio = premios.dist.find((d: any) => d.pos === i + 1);
          const badges = calcBadges(p.nome, ranking, palpitesMap, elim, res, resE);
          return (
            <div key={p.nome} className="card" style={{ border: `1.5px solid ${isMe ? "#86efac" : "#e5e7eb"}`, background: isMe ? "#f0fdf4" : "#fff", cursor: "pointer", position: "relative", overflow: "hidden", padding: "14px 16px" }}
              onClick={() => setDetUser(detUser === p.nome ? null : p.nome)}>
              {isMe && <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#16a34a", borderRadius: "2px 0 0 2px" }} />}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0, fontWeight: 700 }}>{MEDAL[i] || `${i + 1}º`}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4 }}>{p.nome} {isMe && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>(você)</span>}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                    <span className="badge bb">✅ {p.acertos}</span>
                    <span className="badge bp">🎯 {p.placares}</span>
                    {p.campeao && <span className="badge bg">{F[p.campeao]}</span>}
                    {!p.pago && <span className="badge br">Pendente</span>}
                    {badges.map(b => <span key={b} className="badge bgr">{b}</span>)}
                  </div>
                  {detUser === p.nome && (
                    <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280", lineHeight: 1.8, background: "#f9fafb", borderRadius: 8, padding: "8px 10px" }}>
                      {p.bonusCampeao > 0 && <div>🏆 Bônus campeão: +{p.bonusCampeao}pts</div>}
                      <div>Desempate: {p.placares} placares → {p.acertos} acertos</div>
                      {premio && <div style={{ color: "#16a34a", fontWeight: 700 }}>💰 Prêmio: R$ {premio.valor}</div>}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#16a34a", fontFamily: "'JetBrains Mono',monospace" }}>{p.pontos}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>pts</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}