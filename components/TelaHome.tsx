"use client";

import type { Jogo } from "@/lib/types";
import { MEDAL, CONFIG } from "@/lib/constantes";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";
import { lock, fmtDLong, fmtH, statusJ, tr } from "@/lib/utils";

// Prazo de pagamento: 28/06/2026 às 15h Brasília (UTC-3) = 18h UTC
const PRAZO_PAGAMENTO = new Date("2026-06-28T18:00:00Z");

// Data fim da Copa: 19/07/2026
const FIM_COPA = new Date("2026-07-19T00:00:00Z");

// Fases reais com base nas datas oficiais da Copa 2026
const FASES: { label: string; inicio: Date; fim: Date }[] = [
  { label: "Fase de Grupos",   inicio: new Date("2026-06-11"), fim: new Date("2026-07-02") },
  { label: "Oitavas de Final", inicio: new Date("2026-07-03"), fim: new Date("2026-07-06") },
  { label: "Quartas de Final", inicio: new Date("2026-07-08"), fim: new Date("2026-07-11") },
  { label: "Semifinais",       inicio: new Date("2026-07-14"), fim: new Date("2026-07-15") },
  { label: "Final",            inicio: new Date("2026-07-19"), fim: new Date("2026-07-19") },
];

function getFaseAtual(): string {
  const hoje = new Date();
  const fase = FASES.find(f => hoje >= f.inicio && hoje <= f.fim);
  if (fase) return fase.label;
  if (hoje < FASES[0].inicio) return "Pré-torneio";
  return "Encerrado";
}

// Gera cor de avatar baseada no nome (hash) — neutro, sem tendência de gênero
function avatarColor(nome: string): string {
  const cores = [
    "#2563eb", "#7c3aed", "#db2777", "#ea580c",
    "#16a34a", "#0891b2", "#d97706", "#dc2626",
  ];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return cores[Math.abs(hash) % cores.length];
}

interface Props {
  usuarioAtual: string | null;
  pago: boolean;
  meusDados: any;
  minhaPos: number;
  nPart: number;
  totSalvos: number;
  totJogos: number;
  pctPal: number;
  premios: any;
  nPagos: number;
  elim: Jogo[];
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  resE: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  palS: Record<number, { gols1: string; gols2: string }>;
  palR: Record<number, { gols1: string; gols2: string }>;
  F: Record<string, string>;
  // Palpite do campeão salvo (nome do time)
  palCampeao?: string;
  // Badges de novidade por aba
  novidades?: { jogos?: number };
  setModo: (m: string) => void;
  setJogoSel: (j: Jogo) => void;
  setPalLocal: (id: number, field: string, value: string, dt: string) => void;
  confirmarPalpite: (j: Jogo) => Promise<void>;
}

export default function TelaHome({
  usuarioAtual, pago, meusDados, minhaPos, nPart, totSalvos, totJogos, pctPal,
  premios, nPagos, elim,
  res, resE, palS, palR, F,
  palCampeao,
  novidades,
  setModo, setJogoSel, setPalLocal, confirmarPalpite,
}: Props) {

  const prazoEncerrado = new Date() > PRAZO_PAGAMENTO;
  const diasRestantes = Math.max(0, Math.ceil((FIM_COPA.getTime() - Date.now()) / 86400000));
  const faseAtual = getFaseAtual();

  const premioExibido = premios?.totalPremios != null
    ? `R$ ${premios.totalPremios}`
    : `R$ ${Math.floor(nPagos * CONFIG.valorCota * (1 - (CONFIG.comissao ?? 0)))}`;

  // ── Próximo jogo pendente de palpite
  const todosJogos: Jogo[] = [
    ...JOGOS_GRUPO,
    ...elim.filter(j => j.time1 && j.time2),
  ];

  const proximoJogo = todosJogos.find(j => {
    const r = j.g ? res[j.id] : resE[j.id] || {};
    const temRes = r && r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
    const temPalpite = palS[j.id]?.gols1 !== undefined && palS[j.id]?.gols1 !== "";
    const st = statusJ(j.dt, temRes);
    return st === "prox" && !temPalpite && !lock(j.dt);
  }) ?? null;

  const proximoComPalpite = !proximoJogo ? todosJogos.find(j => {
    const r = j.g ? res[j.id] : resE[j.id] || {};
    const temRes = r && r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
    const st = statusJ(j.dt, temRes);
    return st === "prox" || st === "live" || st === "wait";
  }) ?? null : null;

  const jogoDestaque = proximoJogo || proximoComPalpite;
  const isElimDestaque = jogoDestaque ? !jogoDestaque.g : false;

  // Status e countdown do jogo em destaque
  const jogoDestaqueRes: { gols1?: string; gols2?: string } = jogoDestaque
    ? (jogoDestaque.g ? res[jogoDestaque.id] : resE[jogoDestaque.id]) ?? {}
    : {};
  const jogoDestaqueTemRes = !!(
    jogoDestaqueRes.gols1 !== undefined && jogoDestaqueRes.gols1 !== "" &&
    jogoDestaqueRes.gols2 !== undefined && jogoDestaqueRes.gols2 !== ""
  );
  const jogoStatus = jogoDestaque ? statusJ(jogoDestaque.dt, jogoDestaqueTemRes) : null;
  const countdown = jogoDestaque ? (tr(jogoDestaque.dt) ?? "") : "";

  // Validação de gols (aviso visual se valor suspeito)
  function golsSuspeito(v: string): boolean {
    const n = parseInt(v, 10);
    return !isNaN(n) && n >= 10;
  }

  const cor = avatarColor(usuarioAtual || "?");

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
            background: cor,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 700, flexShrink: 0, letterSpacing: -0.5,
            border: "2px solid rgba(255,255,255,0.35)",
            color: "#fff",
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
              {diasRestantes > 0 ? `${diasRestantes}d p/ final` : "Torneio encerrado"}
            </div>
          </div>
        </div>

        {/* Posição + pontos + prêmio */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Posição</div>
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
            <div style={{ fontSize: 20, fontWeight: 800, color: pago ? "#ffffff" : "rgba(255,255,255,0.4)" }}>
              {premioExibido}
            </div>
          </div>
        </div>

        {/* Rodapé: CTA pagamento ou aviso observador */}
        {!pago && (
          <div style={{ marginTop: 16 }}>
            {!prazoEncerrado ? (
              <button
                onClick={() => setModo("pix")}
                style={{
                  width: "100%", padding: "10px", borderRadius: 10,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff", fontWeight: 700, fontSize: 13,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                <i className="ti ti-credit-card" style={{ fontSize: 16 }} aria-hidden="true" />
                Pagar R${CONFIG.valorCota} e concorrer ao prêmio
                <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 400 }}>· prazo 28/06</span>
              </button>
            ) : (
              <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.2)", fontSize: 12, opacity: 0.8, textAlign: "center" }}>
                <i className="ti ti-clock" style={{ fontSize: 14, marginRight: 4 }} aria-hidden="true" />
                Prazo encerrado — você participa como observador
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BLOCO 2: PRÓXIMO JOGO ─────────────────────────────────────────── */}
      {jogoDestaque && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", display: "flex", alignItems: "center", gap: 6 }}>
              {proximoJogo
                ? <><i className="ti ti-check" style={{ fontSize: 15, color: "#f59e0b" }} aria-hidden="true" /> Palpite pendente</>
                : jogoStatus === "live"
                  ? <><i className="ti ti-live-photo" style={{ fontSize: 15, color: "#ef4444" }} aria-hidden="true" /> Ao vivo</>
                  : jogoStatus === "wait"
                    ? <><i className="ti ti-clock-pause" style={{ fontSize: 15, color: "#6b7280" }} aria-hidden="true" /> Aguardando resultado</>
                    : <><i className="ti ti-clock" style={{ fontSize: 15, color: "#6b7280" }} aria-hidden="true" /> Próximo jogo</>
              }
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
              border: `1.5px solid ${
                proximoJogo      ? "#fde68a" :
                jogoStatus === "live" ? "#fca5a5" :
                jogoStatus === "wait" ? "#d1d5db" :
                "#86efac"
              }`,
              background: proximoJogo      ? "#fffbeb" :
                          jogoStatus === "live" ? "#fef2f2" :
                          jogoStatus === "wait" ? "#f9fafb" :
                          "#f0fdf4",
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
              <span style={{ fontWeight: 600, color:
                proximoJogo           ? "#92400e" :
                jogoStatus === "live" ? "#ef4444" :
                jogoStatus === "wait" ? "#6b7280" :
                "#16a34a"
              }}>
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
                {jogoStatus === "live" ? (
                  <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 800, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                    AO VIVO
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>VS</div>
                )}
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
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <input
                    type="number" min={0} max={30}
                    className={`si${(palR[jogoDestaque.id]?.gols1 !== undefined && palR[jogoDestaque.id]?.gols1 !== "") ? " f" : ""}`}
                    style={{
                      width: 60, height: 60, fontSize: 22,
                      border: golsSuspeito(palR[jogoDestaque.id]?.gols1 ?? "") ? "2px solid #f59e0b" : undefined,
                    }}
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
                  {golsSuspeito(palR[jogoDestaque.id]?.gols1 ?? "") && (
                    <span style={{ fontSize: 9, color: "#92400e" }}>valor alto</span>
                  )}
                </div>
                <span style={{ color: "#d1d5db", fontWeight: 700, fontSize: 18 }}>×</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <input
                    type="number" min={0} max={30}
                    id={`home_g2_${jogoDestaque.id}`}
                    className={`si${(palR[jogoDestaque.id]?.gols2 !== undefined && palR[jogoDestaque.id]?.gols2 !== "") ? " f" : ""}`}
                    style={{
                      width: 60, height: 60, fontSize: 22,
                      border: golsSuspeito(palR[jogoDestaque.id]?.gols2 ?? "") ? "2px solid #f59e0b" : undefined,
                    }}
                    value={palR[jogoDestaque.id]?.gols2 ?? ""}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setPalLocal(jogoDestaque.id, "gols2", e.target.value, jogoDestaque.dt)}
                    placeholder="0"
                  />
                  {golsSuspeito(palR[jogoDestaque.id]?.gols2 ?? "") && (
                    <span style={{ fontSize: 9, color: "#92400e" }}>valor alto</span>
                  )}
                </div>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: "16px 8px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={async e => { e.stopPropagation(); await confirmarPalpite(jogoDestaque); }}
                >
                  <i className="ti ti-circle-check" style={{ fontSize: 16 }} aria-hidden="true" />
                  Confirmar
                </button>
              </div>
            )}

            {/* Palpite já feito */}
            {!proximoJogo && palS[jogoDestaque.id] && (
              <div style={{ marginTop: 10, textAlign: "center", fontSize: 13, color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <i className="ti ti-check" style={{ fontSize: 15 }} aria-hidden="true" />
                Seu palpite: {palS[jogoDestaque.id].gols1} × {palS[jogoDestaque.id].gols2}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BLOCO 3: PROGRESSO DOS PALPITES ──────────────────────────────── */}
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
        <button
          onClick={() => setModo("palpites")}
          style={{
            marginTop: 10, width: "100%", padding: "8px",
            borderRadius: 8, border: "1.5px solid #e5e7eb",
            background: "#f9fafb", color: "#374151",
            fontWeight: 600, fontSize: 12, cursor: "pointer",
            fontFamily: "'Inter',sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          }}
        >
          {pctPal === 100 ? "Revisar meus palpites →" : "Preencher palpites →"}
        </button>
      </div>

      {/* ── BLOCO 4: ATALHOS ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          {
            icon: "ti-trophy",
            label: "Ranking",
            sub: `${nPagos} concorrendo`,
            modo: "ranking",
            badge: 0,
          },
          {
            icon: "ti-ball-football",
            label: "Jogos",
            sub: "Resultados ao vivo",
            modo: "jogos",
            badge: novidades?.jogos ?? 0,
          },
          {
            icon: "ti-medal",
            label: "Campeão",
            sub: palCampeao
              ? `${F[palCampeao] || ""} ${palCampeao}`
              : "Seu palpite",
            modo: "campeao",
            badge: 0,
          },
          {
            icon: "ti-info-circle",
            label: "Regras",
            sub: "Como pontuar",
            modo: "regras",
            badge: 0,
          },
        ].map(item => (
          <button
            key={item.modo}
            onClick={() => setModo(item.modo)}
            style={{
              background: "#fff", border: "1.5px solid #f3f4f6",
              borderRadius: 14, padding: "14px", textAlign: "left",
              cursor: "pointer", fontFamily: "'Inter',sans-serif",
              position: "relative",
            }}
          >
            {/* Badge de novidade */}
            {item.badge > 0 && (
              <div style={{
                position: "absolute", top: 10, right: 10,
                background: "#ef4444", color: "#fff",
                fontSize: 9, fontWeight: 700,
                width: 16, height: 16, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.badge > 9 ? "9+" : item.badge}
              </div>
            )}
            <i
              className={`ti ${item.icon}`}
              style={{ fontSize: 22, marginBottom: 8, display: "block", color: "#374151" }}
              aria-hidden="true"
            />
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.sub}</div>
          </button>
        ))}
      </div>

    </div>
  );
}