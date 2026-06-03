"use client";

import type { Jogo } from "@/lib/types";
import { MEDAL } from "@/lib/constantes";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";
import { lock, fmtDLong, fmtH } from "@/lib/utils";

interface Props {
  usuarioAtual: string | null;
  pago: boolean;
  meusDados: any;
  minhaPos: number;
  nPart: number;
  totSalvos: number;
  totJogos: number;
  pctPal: number;
  countdown: string;
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  palS: Record<number, { gols1: string; gols2: string }>;
  palR: Record<number, { gols1: string; gols2: string }>;
  F: Record<string, string>;
  setModo: (m: string) => void;
  setJogoSel: (j: Jogo) => void;
  setPalLocal: (id: number, field: string, value: string, dt: string) => void;
  confirmarPalpite: (j: Jogo) => Promise<void>;
}

export default function TelaHome({
  usuarioAtual, pago, meusDados, minhaPos, nPart, totSalvos, totJogos, pctPal, countdown,
  res, palS, palR, F, setModo, setJogoSel, setPalLocal, confirmarPalpite
}: Props) {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: 20, padding: "20px", marginBottom: 16, color: "#fff", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, background: "rgba(255,255,255,.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, flexShrink: 0, letterSpacing: -1 }}>
          {(usuarioAtual || "?").slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, opacity: .8, marginBottom: 2 }}>Olá,</div>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 2 }}>{usuarioAtual}</div>
          <div style={{ fontSize: 12, opacity: .8 }}>{pago ? "✅ Você está no bolão!" : "⚠️ Pagamento pendente"}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {[["⭐", meusDados?.pontos ?? 0, "Pontos", "#16a34a"], ["🎯", totSalvos, "Palpites", "#2563eb"], ["🥇", meusDados?.placares ?? 0, "Exatos", "#16a34a"]].map(([ic, v, lb, cor]: any) => (
          <div key={lb} className="card" style={{ flex: 1, textAlign: "center", padding: "12px 8px" }}>
            <div style={{ fontSize: 20 }}>{ic}</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: cor }}>{v}</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>{lb}</div>
          </div>
        ))}
      </div>
      {minhaPos > 0 && (
        <div className="card" style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 26 }}>{MEDAL[minhaPos - 1] || `${minhaPos}º`}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Posição no ranking</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>de {nPart} participantes · {meusDados?.pontos || 0} pts</div>
          </div>
        </div>
      )}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Progresso dos palpites</span>
          <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>{totSalvos}/{totJogos} ({pctPal}%)</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "#f3f4f6", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#16a34a,#4ade80)", width: `${pctPal}%`, transition: "width .5s" }} />
        </div>
      </div>
      {countdown && (
        <div className="card" style={{ marginBottom: 14, border: "1.5px solid #86efac", background: "#f0fdf4" }}>
          <div style={{ fontSize: 12, color: "#166534", fontWeight: 600, marginBottom: 4 }}>⏱ Próximo palpite pendente</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#16a34a" }}>{countdown}</div>
        </div>
      )}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Próximos Jogos</span>
          <button onClick={() => setModo("jogos")} style={{ fontSize: 11, color: "#16a34a", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>Ver todos →</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {JOGOS_GRUPO.filter((j: Jogo) => {
            const r = res[j.id] || {};
            const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
            return !tR && new Date(j.dt).getTime() > Date.now();
          }).slice(0, 3).map((j: Jogo) => {
            const pJ = palS[j.id];
            const tP = pJ && pJ.gols1 !== "" && pJ.gols2 !== "";
            const lk = lock(j.dt);
            return (
              <div key={j.id} onClick={() => { if (!lk) setJogoSel(j); }} className="card"
                style={{ padding: "14px 16px", cursor: lk ? "default" : "pointer", border: `1.5px solid ${tP ? "#86efac" : "#e5e7eb"}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tP || lk ? 0 : 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <span style={{ fontSize: 24 }}>{F[j.time1] || "🏳️"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{j.time1} × {j.time2} <span style={{ fontSize: 20 }}>{F[j.time2] || "🏳️"}</span></div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{fmtDLong(j.dt)} · {fmtH(j.dt)}</div>
                    </div>
                  </div>
                  {lk ? <span className="badge br">🔒</span> : tP ? <span className="badge bgr">✓ {pJ?.gols1}×{pJ?.gols2}</span> : null}
                </div>
                {!lk && !tP && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="number" min={0} max={30} className={`si${(palR[j.id]?.gols1 !== undefined && palR[j.id]?.gols1 !== "") ? " f" : ""}`} style={{ width: 56, height: 56 }}
                      value={palR[j.id]?.gols1 ?? ""} onClick={e => e.stopPropagation()}
                      onChange={e => { setPalLocal(j.id, "gols1", e.target.value, j.dt); if (e.target.value !== "") { const nx = document.getElementById(`hg2_${j.id}`); if (nx) nx.focus(); } }} placeholder="0" />
                    <span style={{ color: "#d1d5db", fontWeight: 700 }}>×</span>
                    <input type="number" min={0} max={30} id={`hg2_${j.id}`} className={`si${(palR[j.id]?.gols2 !== undefined && palR[j.id]?.gols2 !== "") ? " f" : ""}`} style={{ width: 56, height: 56 }}
                      value={palR[j.id]?.gols2 ?? ""} onClick={e => e.stopPropagation()}
                      onChange={e => { setPalLocal(j.id, "gols2", e.target.value, j.dt); if (e.target.value !== "") { const btn = document.getElementById(`hbtn_${j.id}`); if (btn) btn.focus(); } }} placeholder="0" />
                    <button id={`hbtn_${j.id}`} className="btn-primary" style={{ flex: 1, padding: "14px 8px", fontSize: 14 }} onClick={async e => { e.stopPropagation(); await confirmarPalpite(j); }} onKeyDown={async e => { if (e.key === "Enter") await confirmarPalpite(j); }}>Confirmar</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}