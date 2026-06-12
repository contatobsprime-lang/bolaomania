"use client";

import type { Jogo } from "@/lib/types";
import { MEDAL, CONFIG } from "@/lib/constantes";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";
import { lock, fmtDLong, fmtH } from "@/lib/utils";

// Prazo de pagamento: 28/06/2026 às 15h Brasília (UTC-3) = 18h UTC
const PRAZO_PAGAMENTO = new Date("2026-06-28T18:00:00Z");

// Data fim da Copa: 19/07/2026
const FIM_COPA = new Date("2026-07-19T00:00:00Z");

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
  premios: any;
  nPagos: number;
  elim: Jogo[];
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  resE: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
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
  premios, nPagos, elim,
  res, resE, palS, palR, F, setModo, setJogoSel, setPalLocal, confirmarPalpite
}: Props) {

  const prazoEncerrado = new Date() > PRAZO_PAGAMENTO;
  const diasRestantes = Math.max(0, Math.ceil((FIM_COPA.getTime() - Date.now()) / 86400000));

  const faseAtual =
    diasRestantes > 20 ? "Fase de Grupos" :
    diasRestantes > 10 ? "Oitavas de Final" :
    diasRestantes > 5  ? "Quartas de Final" :
    diasRestantes > 2  ? "Semifinais" : "Final";

  // premios.totalPremios = valor real distribuído (já descontou comissão)
  const premioExibido = premios?.totalPremios != null
    ? `R$ ${premios.totalPremios}`
    : `R$ ${Math.floor(nPagos * CONFIG.valorCota * (1 - (CONFIG.comissao ?? 0)))}`;

  // ── Próximo jogo pendente de palpite (grupos + elim), sem resultado, sem lock
  const todosJogos: Jogo[] = [
    ...JOGOS_GRUPO,
    ...elim.filter(j => j.time1 && j.time2),
  ];

  const proximoJogo = todosJogos.find(j => {
    const r = j.g ? res[j.id] : resE[j.id] || {};
    const temRes = r && r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
    const temPalpite = palS[j.id]?.gols1 !== undefined && palS[j.id]?.gols1 !== "";
    return !temRes && !temPalpite && new Date(j.dt).getTime() > Date.now() && !lock(j.dt);
  }) ?? null;

  // ── Próximo jogo com palpite já feito (fallback se tudo palpitado)
  const proximoComPalpite = !proximoJogo ? todosJogos.find(j => {
    const r = j.g ? res[j.id] : resE[j.id] || {};
    const temRes = r && r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
    return !temRes && new Date(j.dt).getTime() > Date.now();
  }) ?? null : null;

  const jogoDestaque = proximoJogo || proximoComPalpite;
  const isElimDestaque = jogoDestaque ? !jogoDestaque.g : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ── BLOCO 1: HERO ──────────────────────────────────────────────────── */}
      <div style={{
        background: pago
          ? "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)"
          : "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
        borderRadius: 20, padding: "20px", color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decoração de fundo */}
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -20, right: 40, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        {/* Avatar + nome + fase */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 800, flexShrink: 0, letterSpacing: -1,
            border: "2px solid rgba(255,255,255,0.3)",
          }}>
            {(usuarioAtual || "?").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 1 }}>Olá,</div>
            <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>{usuarioAtual}</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {faseAtual}
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>
              {diasRestantes > 0 ? `${diasRestantes}d restantes` : "Torneio encerrado"}
            </div>
          </div>
        </div>

        {/* Posição + pontos + prêmio */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Sua posição</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
                {minhaPos > 0
                  ? (pago ? (MEDAL[minhaPos - 1] || `${minhaPos}º`) : `${minhaPos}º`)
                  : "—"}
              </span>
              {minhaPos > 0 && (
                <span style={{ fontSize: 12, opacity: 0.75 }}>de {nPart}</span>
              )}
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }} />
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Pontuação</div>
            <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, fontFamily: "'JetBrains Mono',monospace" }}>
              {meusDados?.pontos ?? 0}
              <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>pts</span>
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Prêmio em jogo</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: pago ? "#fef08a" : "rgba(255,255,255,0.5)" }}>
              {premioExibido}
            </div>
          </div>
        </div>

        {/* Rodapé do hero: stats (pagante) ou CTA (não-pagante) */}
        {pago ? (
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { v: meusDados?.acertos ?? 0, l: "acertos" },
              { v: meusDados?.placares ?? 0, l: "exatos" },
              { v: totSalvos, l: "palpites" },
            ].map(s => (
              <div key={s.l} style={{ flex: 1, textAlign: "center", padding: "8px", background: "rgba(255,255,255,0.12)", borderRadius: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{s.v}</div>
                <div style={{ fontSize: 10, opacity: 0.75 }}>{s.l}</div>
              </div>
            ))}
          </div>
        ) : !prazoEncerrado ? (
          <button
            onClick={() => setModo("pix")}
            style={{
              width: "100%", padding: "10px", borderRadius: 10,
              border: "1.5px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.15)",
              color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            💳 Pagar R${CONFIG.valorCota} e concorrer ao prêmio
            <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 400 }}>· prazo 28/06</span>
          </button>
        ) : (
          <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.2)", fontSize: 12, opacity: 0.8, textAlign: "center" }}>
            ⏰ Prazo encerrado — você participa como observador
          </div>
        )}
      </div>

      {/* ── BLOCO 2: PULSO DO BOLÃO ───────────────────────────────────────── */}
      <div style={{ display: "flex", background: "#fff", borderRadius: 14, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
        {[
          { icon: "👥", value: nPart, label: "participantes" },
          { icon: "🏆", value: nPagos, label: "no prêmio" },
          { icon: "📅", value: diasRestantes, label: "dias p/ fim" },
        ].map((item, idx) => (
          <div key={item.label} style={{
            flex: 1, textAlign: "center", padding: "12px 6px",
            borderRight: idx < 2 ? "1px solid #f3f4f6" : "none",
          }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{item.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#111827" }}>{item.value}</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* ── BLOCO 3: PRÓXIMO JOGO ─────────────────────────────────────────── */}
      {jogoDestaque && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>
              {proximoJogo ? "⚡ Palpite pendente" : "📅 Próximo jogo"}
            </div>
            <button
              onClick={() => setModo("jogos")}
              style={{ fontSize: 12, color: "#16a34a", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}
            >
              Ver todos →
            </button>
          </div>

          <div
            className="card"
            style={{
              padding: "16px",
              border: `1.5px solid ${proximoJogo ? "#fde68a" : "#86efac"}`,
              background: proximoJogo ? "#fffbeb" : "#f0fdf4",
              cursor: proximoJogo ? "default" : "pointer",
            }}
            onClick={() => !proximoJogo && jogoDestaque && setJogoSel(jogoDestaque)}
          >
            {/* Info do jogo */}
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
              <span>
                {isElimDestaque
                  ? (jogoDestaque as any).label || "Eliminatória"
                  : `Grupo ${jogoDestaque.g}`}
                {" · "}{fmtDLong(jogoDestaque.dt)}
              </span>
              <span style={{ fontWeight: 600, color: proximoJogo ? "#92400e" : "#16a34a" }}>
                {fmtH(jogoDestaque.dt)}
              </span>
            </div>

            {/* Times */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: proximoJogo ? 14 : 0 }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 32, marginBottom: 4 }}>{F[jogoDestaque.time1] || "🏳️"}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{jogoDestaque.time1}</div>
              </div>
              <div style={{ textAlign: "center", padding: "0 12px" }}>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>VS</div>
                {countdown && proximoJogo && (
                  <div style={{ fontSize: 10, color: "#92400e", fontWeight: 700, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>
                    {countdown}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 32, marginBottom: 4 }}>{F[jogoDestaque.time2] || "🏳️"}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{jogoDestaque.time2}</div>
              </div>
            </div>

            {/* Input palpite — só se pendente */}
            {proximoJogo && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number" min={0} max={30}
                  className={`si${(palR[jogoDestaque.id]?.gols1 !== undefined && palR[jogoDestaque.id]?.gols1 !== "") ? " f" : ""}`}
                  style={{ width: 60, height: 60, fontSize: 22 }}
                  value={palR[jogoDestaque.id]?.gols1 ?? ""}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    setPalLocal(jogoDestaque.id, "gols1", e.target.value, jogoDestaque.dt);
                    if (e.target.value !== "") {
                      const nx = document.getElementById(`home_g2_${jogoDestaque.id}`);
                      if (nx) nx.focus();
                    }
                  }}
                  placeholder="0"
                />
                <span style={{ color: "#d1d5db", fontWeight: 700, fontSize: 18 }}>×</span>
                <input
                  type="number" min={0} max={30}
                  id={`home_g2_${jogoDestaque.id}`}
                  className={`si${(palR[jogoDestaque.id]?.gols2 !== undefined && palR[jogoDestaque.id]?.gols2 !== "") ? " f" : ""}`}
                  style={{ width: 60, height: 60, fontSize: 22 }}
                  value={palR[jogoDestaque.id]?.gols2 ?? ""}
                  onClick={e => e.stopPropagation()}
                  onChange={e => setPalLocal(jogoDestaque.id, "gols2", e.target.value, jogoDestaque.dt)}
                  placeholder="0"
                />
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: "16px 8px", fontSize: 14 }}
                  onClick={async e => { e.stopPropagation(); await confirmarPalpite(jogoDestaque); }}
                >
                  Confirmar ✅
                </button>
              </div>
            )}

            {/* Palpite já feito */}
            {!proximoJogo && palS[jogoDestaque.id] && (
              <div style={{ marginTop: 10, textAlign: "center", fontSize: 13, color: "#16a34a", fontWeight: 700 }}>
                ✓ Seu palpite: {palS[jogoDestaque.id].gols1} × {palS[jogoDestaque.id].gols2}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BLOCO 4: PROGRESSO DOS PALPITES ──────────────────────────────── */}
      <div className="card" style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>Progresso dos palpites</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
              {totJogos - totSalvos > 0
                ? `${totJogos - totSalvos} jogo${totJogos - totSalvos > 1 ? "s" : ""} sem palpite`
                : "Todos os palpites feitos 🎉"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontWeight: 800, fontSize: 22,
              color: pctPal === 100 ? "#16a34a" : "#111827",
              fontFamily: "'JetBrains Mono',monospace",
            }}>
              {pctPal}%
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{totSalvos}/{totJogos}</div>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "#f3f4f6", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4,
            background: pctPal === 100
              ? "linear-gradient(90deg,#16a34a,#4ade80)"
              : pctPal > 60
                ? "linear-gradient(90deg,#2563eb,#60a5fa)"
                : "linear-gradient(90deg,#f59e0b,#fbbf24)",
            width: `${pctPal}%`,
            transition: "width .5s ease",
          }} />
        </div>
        {pctPal < 100 && (
          <button
            onClick={() => setModo("palpites")}
            style={{
              marginTop: 10, width: "100%", padding: "8px",
              borderRadius: 8, border: "1.5px solid #e5e7eb",
              background: "#f9fafb", color: "#374151",
              fontWeight: 600, fontSize: 12, cursor: "pointer",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            Preencher palpites →
          </button>
        )}
      </div>

      {/* ── BLOCO 5: ATALHOS ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { icon: "📊", label: "Ranking", sub: `${nPagos} concorrendo`, modo: "ranking" },
          { icon: "⚽", label: "Jogos",   sub: "Resultados ao vivo",    modo: "jogos"   },
          { icon: "🏆", label: "Campeão", sub: "Seu palpite",           modo: "campeao" },
          { icon: "📜", label: "Regras",  sub: "Como pontuar",          modo: "regras"  },
        ].map(item => (
          <button
            key={item.modo}
            onClick={() => setModo(item.modo)}
            style={{
              background: "#fff", border: "1.5px solid #f3f4f6",
              borderRadius: 14, padding: "14px", textAlign: "left",
              cursor: "pointer", fontFamily: "'Inter',sans-serif",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.sub}</div>
          </button>
        ))}
      </div>

    </div>
  );
}