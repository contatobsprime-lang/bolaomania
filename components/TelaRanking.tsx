"use client";

import { useState } from "react";
import type { RankingEntry, Jogo } from "@/lib/types";
import { calcBadges } from "@/lib/calculos";
import { ShopeeAffiliateBanner } from "@/components/ShopeeAffiliateBanner";

// ─── PRAZO DE PAGAMENTO ───────────────────────────────────────────────────────
// 28/06/2026 às 15h00 horário de Brasília (UTC-3) = 18h00 UTC
const PRAZO_PAGAMENTO = new Date("2026-06-28T18:00:00Z");
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  jogosGrupo: any[];
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
  mostrarToast: (msg: string, tipo: "ok" | "err") => void;
  setModo: (m: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function TelaRanking({
  minhaPos, meusDados, usuarioAtual, ranking, premios,
  palpitesMap, elim, res, resE, MEDAL, F,
  mostrarToast, setModo,
  isLoading = false, error = null,
  jogosGrupo,
}: Props) {
  const [detUser, setDetUser] = useState<string | null>(null);

  const prazoEncerrado = new Date() > PRAZO_PAGAMENTO;

  // Ranking unificado — pagantes primeiro (ordenados por pontos), depois não-pagantes (também por pontos)
  const rankingPagantes = ranking.filter(p => p.pago);
  const rankingNaoPagantes = ranking.filter(p => !p.pago);
  const rankingUnificado = [...rankingPagantes, ...rankingNaoPagantes];

  // Mapa de posição global (1-based) para exibir ao lado de não-pagantes
  const posGlobalMap: Record<string, number> = {};
  rankingUnificado.forEach((p, i) => { posGlobalMap[p.nome] = i + 1; });

  // ── Texto para compartilhar ──────────────────────────────────────────────
  const gerarTexto = () => {
    const meusPts = ranking.find((r: any) => r.nome === usuarioAtual)?.pontos || 0;
    return (
      `🏆 *BOLÃO COPA 2026* 🏆\n\n` +
      (usuarioAtual ? `Estou em *${minhaPos}º lugar* com *${meusPts} pontos*! 🎯\n\n` : "") +
      `📊 *TOP 5:*\n` +
      rankingPagantes.slice(0, 5).map((p: any, i: number) =>
        `${MEDAL[i] || `${i + 1}º`} *${p.nome}* — ${p.pontos}pts`
      ).join("\n") +
      `\n\n💰 *PRÊMIOS:*\n` +
      premios.dist.map((d: any) => `${d.pos}º lugar: R$ ${d.valor}`).join("\n") +
      `\n\n🎮 Participa também! ⚽\n🔗 https://bolaomania.vercel.app/`
    );
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(gerarTexto());
    mostrarToast("✅ Copiado! Cole no WhatsApp", "ok");
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(gerarTexto())}`, "_blank");
  };

  // ── Estados de carregamento / erro ───────────────────────────────────────
  if (isLoading) {
    return (
      <div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card" style={{ marginBottom: 8, padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 28, height: 24, background: "#e5e7eb", borderRadius: 6 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 16, background: "#e5e7eb", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 12, background: "#e5e7eb", borderRadius: 6, width: "70%" }} />
              </div>
              <div style={{ width: 40, height: 24, background: "#e5e7eb", borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", background: "#fef2f2", borderRadius: 16, border: "1.5px solid #fecaca" }}>
        <i className="ti ti-alert-circle" aria-hidden="true" style={{ fontSize: 48, marginBottom: 16, display: "block", color: "#b91c1c" }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: "#b91c1c", marginBottom: 8 }}>Erro ao carregar ranking</div>
        <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>{error}</div>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", background: "#b91c1c", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <i className="ti ti-chart-bar" aria-hidden="true" style={{ fontSize: 48, marginBottom: 16, display: "block", color: "#9ca3af" }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Ranking vazio</div>
        <div style={{ fontSize: 14, color: "#9ca3af" }}>Ninguém começou a jogar ainda.</div>
      </div>
    );
  }

  // ── Card individual ──────────────────────────────────────────────────────
  function CardRanking({ p }: { p: any }) {
    const isMe = p.nome === usuarioAtual;
    const isPagante = !!p.pago;
    const posPagante = isPagante ? rankingPagantes.findIndex(r => r.nome === p.nome) : -1;
    const premio = isPagante ? premios.dist.find((d: any) => d.pos === posPagante + 1) : null;
    const badges = calcBadges(p.nome, ranking, palpitesMap, elim, res, resE, jogosGrupo);
    const posExibida = isPagante ? (MEDAL[posPagante] || `${posPagante + 1}º`) : `${posGlobalMap[p.nome]}º`;

    // Badge de status para não-pagantes
    const badgeNaoPagante = !isPagante
      ? prazoEncerrado
        ? { texto: "NÃO CONCORRE", cor: "#6b7280", bg: "#f3f4f6", borda: "#e5e7eb" }
        : { texto: "FORA DO PRÊMIO", cor: "#92400e", bg: "#fef3c7", borda: "#fde68a" }
      : null;

    return (
      <div
        style={{
          border: `1.5px solid ${isMe ? "#86efac" : isPagante ? "#e5e7eb" : "#f3f4f6"}`,
          background: isMe ? "#f0fdf4" : isPagante ? "#fff" : "#fafafa",
          opacity: isPagante ? 1 : 0.6,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          padding: "14px 16px",
          borderRadius: 12,
          transition: "opacity 0.2s",
        }}
        onClick={() => setDetUser(detUser === p.nome ? null : p.nome)}
      >
        {/* barra lateral verde para "eu" */}
        {isMe && (
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#16a34a", borderRadius: "2px 0 0 2px" }} />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

          {/* Posição */}
          <div style={{
            fontSize: isPagante && posPagante < 3 ? 22 : 16,
            width: 32, textAlign: "center", flexShrink: 0,
            fontWeight: 700,
            color: isPagante ? "#111827" : "#d1d5db",
          }}>
            {posExibida}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Nome + badges de status */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: isPagante ? "#111827" : "#9ca3af" }}>
                {p.nome}
              </span>
              {isMe && (
                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>(você)</span>
              )}
              {badgeNaoPagante && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: badgeNaoPagante.cor,
                  background: badgeNaoPagante.bg,
                  border: `1px solid ${badgeNaoPagante.borda}`,
                  borderRadius: 4, padding: "1px 5px", letterSpacing: 0.3,
                }}>
                  {badgeNaoPagante.texto}
                </span>
              )}
            </div>

            {/* Badges de desempenho */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
              <span className="badge bb"><i className="ti ti-check" aria-hidden="true" /> {p.acertos}</span>
              <span className="badge bp"><i className="ti ti-target" aria-hidden="true" /> {p.placares}</span>
              {p.campeao && <span className="badge bg">{F[p.campeao]}</span>}
              {badges.map((b: string) => <span key={b} className="badge bgr">{b}</span>)}
            </div>

            {/* Detalhe expandido ao clicar */}
            {detUser === p.nome && (
              <div style={{
                marginTop: 10, fontSize: 13, lineHeight: 1.6,
                background: "#f9fafb", borderRadius: 8,
                padding: "10px 12px", borderLeft: "3px solid #16a34a",
              }}>
                <div style={{ color: "#6b7280", marginBottom: 6 }}>
                  {p.acertos} acertos · {p.placares} exatos
                </div>
                {p.bonusCampeao > 0 && (
                  <div style={{ color: "#854d0e", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="ti ti-trophy" aria-hidden="true" /> +{p.bonusCampeao}pts bônus campeão
                  </div>
                )}
                {premio && (
                  <div style={{ color: "#16a34a", fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="ti ti-coin" aria-hidden="true" /> R$ {premio.valor}
                  </div>
                )}
                {!isPagante && isMe && (
                  <div style={{ marginTop: 4 }}>
                    {prazoEncerrado ? (
                      <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                        <i className="ti ti-lock" aria-hidden="true" /> Prazo encerrado em 28/06 — não é mais possível concorrer ao prêmio.
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                          <i className="ti ti-alert-triangle" aria-hidden="true" /> Seus pontos não contam para o prêmio
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setModo("pix"); }}
                          style={{
                            width: "100%", padding: "8px", borderRadius: 8,
                            border: "none", background: "#16a34a", color: "#fff",
                            fontWeight: 700, fontSize: 12, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          }}
                        >
                          <i className="ti ti-credit-card" aria-hidden="true" /> Pagar e concorrer →
                        </button>
                      </>
                    )}
                  </div>
                )}
                {!isPagante && !isMe && !prazoEncerrado && (
                  <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="ti ti-alert-triangle" aria-hidden="true" /> Não concorre ao prêmio
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pontuação */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{
              fontSize: 26, fontWeight: 800,
              color: isPagante ? "#16a34a" : "#d1d5db",
              fontFamily: "'JetBrains Mono',monospace",
            }}>
              {p.pontos}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>pts</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render principal ─────────────────────────────────────────────────────
  return (
    <div>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>AO VIVO</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Classificação</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleCopiar}
            style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Copiar ranking"
          ><i className="ti ti-clipboard" aria-hidden="true" /></button>
          <button
            onClick={handleWhatsApp}
            style={{ width: 40, height: 40, borderRadius: 10, border: "none", background: "#25d366", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Compartilhar no WhatsApp"
          ><i className="ti ti-brand-whatsapp" aria-hidden="true" /></button>
        </div>
      </div>

      {/* AVISO DE PRAZO — só para quem ainda não pagou e o prazo não encerrou */}
      {!prazoEncerrado && usuarioAtual && !meusDados?.pago && (
        <div style={{
          marginBottom: 14, padding: "10px 14px", borderRadius: 10,
          background: "#fffbeb", border: "1.5px solid #fde68a",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <i className="ti ti-hourglass" aria-hidden="true" style={{ fontSize: 18, color: "#92400e" }} />
          <div style={{ fontSize: 12, color: "#92400e" }}>
            <strong>Prazo para entrar no prêmio:</strong> até 28/06 às 15h (horário de Brasília), antes do início das oitavas.
          </div>
        </div>
      )}

      {/* MEU CARD de destaque */}
      {minhaPos > 0 && meusDados && usuarioAtual && (
        <div style={{
          background: meusDados.pago
            ? "linear-gradient(135deg,#16a34a,#15803d)"
            : "linear-gradient(135deg,#6b7280,#4b5563)",
          borderRadius: 16, padding: "16px", marginBottom: 14, color: "#fff",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ fontSize: 28 }}>
            {meusDados.pago
              ? (MEDAL[minhaPos - 1] || `${minhaPos}º`)
              : `${posGlobalMap[usuarioAtual]}º`}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {usuarioAtual} <span style={{ fontSize: 12, opacity: 0.8 }}>(você)</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              {meusDados?.pontos || 0} pts · {meusDados?.acertos || 0} acertos · {meusDados?.placares || 0} exatos
            </div>
            {!meusDados.pago && (
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.9, display: "flex", alignItems: "center", gap: 4 }}>
                {prazoEncerrado
                  ? (<><i className="ti ti-lock" aria-hidden="true" /> Prazo encerrado — não concorre ao prêmio</>)
                  : (<><i className="ti ti-alert-triangle" aria-hidden="true" /><span>Fora do prêmio — </span><span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => setModo("pix")}>pagar agora</span></>)
                }
              </div>
            )}
          </div>
        </div>
      )}

      {/* PREMIAÇÃO */}
      <div className="card" style={{ marginBottom: 14, border: "1.5px solid #fde68a", background: "#fefce8" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#854d0e", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
          <i className="ti ti-coin" aria-hidden="true" /> Premiação
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {premios.dist.map((d: any) => (
            <div key={d.pos} style={{ flex: "1 1 60px", textAlign: "center", padding: "10px 8px", background: "#fff", borderRadius: 10, border: "1px solid #fde68a" }}>
              <div style={{ fontSize: 18 }}>{MEDAL[d.pos - 1]}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#16a34a" }}>R$ {d.valor}</div>
            </div>
          ))}
        </div>
      </div>
      <ShopeeAffiliateBanner tela="ranking" />
      {/* RANKING UNIFICADO */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {rankingUnificado.map((p) => (
          <CardRanking key={p.nome} p={p} />
        ))}
      </div>

    </div>
  );
}