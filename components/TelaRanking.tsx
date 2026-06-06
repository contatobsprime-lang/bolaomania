"use client";

import { useState, useEffect } from "react";
import type { RankingEntry, Jogo } from "@/lib/types";
import { calcBadges } from "@/lib/calculos";
import BotoesShareRanking from "@/components/BotoesShareRanking";

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
  mostrarToast: (msg: string, tipo: "ok" | "err") => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function TelaRanking({ 
  minhaPos, 
  meusDados, 
  usuarioAtual, 
  ranking, 
  premios, 
  palpitesMap, 
  elim, 
  res, 
  resE, 
  MEDAL, 
  F, 
  mostrarToast,
  isLoading = false,
  error = null
}: Props) {
  const [detUser, setDetUser] = useState<string | null>(null);
  const [prevRanking, setPrevRanking] = useState<any[]>(ranking);
  const [animatingUser, setAnimatingUser] = useState<string | null>(null);

  // Detectar mudanças de posição
  useEffect(() => {
    ranking.forEach((user, newIdx) => {
      const oldIdx = prevRanking.findIndex(u => u.nome === user.nome);
      if (oldIdx !== -1 && oldIdx !== newIdx) {
        setAnimatingUser(user.nome);
        setTimeout(() => setAnimatingUser(null), 600);
      }
    });
    setPrevRanking(ranking);
  }, [ranking, prevRanking]);

  // ✅ EMPTY STATE
  if (ranking.length === 0 && !isLoading) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "60px 20px",
        animation: "fadeIn 0.6s ease"
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
          Ranking vazio
        </div>
        <div style={{ fontSize: 14, color: "#9ca3af" }}>
          Ninguém começou a jogar ainda. Faça seu palpite para aparecer aqui!
        </div>
      </div>
    );
  }

  // ❌ ERROR STATE
  if (error) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "60px 20px",
        background: "#fef2f2",
        borderRadius: 16,
        border: "1.5px solid #fecaca",
        animation: "fadeIn 0.6s ease"
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#b91c1c", marginBottom: 8 }}>
          Erro ao carregar ranking
        </div>
        <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            background: "#b91c1c",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#991b1b")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#b91c1c")}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // ⏳ LOADING STATE
  if (isLoading) {
    return (
      <div>
        <div style={{ marginBottom: 14, animation: "fadeIn 0.6s ease" }}>
          <div style={{ height: 24, background: "#e5e7eb", borderRadius: 8, marginBottom: 8, animation: "pulse 2s infinite" }} />
          <div style={{ height: 16, background: "#e5e7eb", borderRadius: 8, width: "60%", animation: "pulse 2s infinite 0.1s" }} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i}
            className="card"
            style={{ 
              marginBottom: 8, 
              padding: "14px 16px",
              animation: "fadeIn 0.6s ease"
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 28, height: 24, background: "#e5e7eb", borderRadius: 6, animation: "pulse 2s infinite" }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 16, background: "#e5e7eb", borderRadius: 6, marginBottom: 8, animation: "pulse 2s infinite 0.1s" }} />
                <div style={{ height: 12, background: "#e5e7eb", borderRadius: 6, width: "70%", animation: "pulse 2s infinite 0.2s" }} />
              </div>
              <div style={{ width: 40, height: 24, background: "#e5e7eb", borderRadius: 6, animation: "pulse 2s infinite 0.15s" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes moveUp {
          0% { transform: translateY(10px); background: #fef08a; }
          100% { transform: translateY(0); background: transparent; }
        }
        @keyframes scaleCard {
          from { transform: scale(0.98); }
          to { transform: scale(1); }
        }
        .ranking-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ranking-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        .ranking-card:active {
          transform: translateY(0);
        }
        .header-sticky {
          position: sticky;
          top: -16px;
          background: #f5f7fa;
          padding: 16px 0;
          margin-bottom: 14px;
          z-index: 10;
          animation: slideUp 0.6s ease;
        }
      `}</style>

      {/* ✅ HEADER STICKY COM BOTÕES */}
      <div className="header-sticky">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>AO VIVO</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Classificação Geral</div>
          </div>
          {/* ✅ BOTÕES NO HEADER */}
          <div style={{ animation: "slideUp 0.6s ease", flexShrink: 0 }}>
            <BotoesShareRanking
              ranking={ranking}
              premios={premios}
              usuarioAtual={usuarioAtual}
              MEDAL={MEDAL}
              mostrarToast={mostrarToast}
            />
          </div>
        </div>
      </div>

      {/* ✅ MEU CARD COM ANIMAÇÃO */}
      {minhaPos > 0 && (
        <div 
          style={{ 
            background: "linear-gradient(135deg,#16a34a,#15803d)", 
            borderRadius: 16, 
            padding: "16px", 
            marginBottom: 14, 
            color: "#fff", 
            display: "flex", 
            alignItems: "center", 
            gap: 14,
            animation: animatingUser === usuarioAtual 
              ? "moveUp 0.6s ease, scaleCard 0.4s ease"
              : "slideUp 0.6s ease"
          }}
        >
          <div style={{ fontSize: 28 }}>{MEDAL[minhaPos - 1] || `${minhaPos}º`}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{usuarioAtual} <span style={{ fontSize: 12, opacity: .8 }}>(você)</span></div>
            <div style={{ fontSize: 13, opacity: .8 }}>{meusDados?.pontos || 0} pts · {meusDados?.acertos || 0} acertos · {meusDados?.placares || 0} exatos</div>
          </div>
        </div>
      )}

      {/* ✅ PREMIAÇÃO COM ANIMAÇÃO */}
      <div 
        className="card" 
        style={{ 
          marginBottom: 14, 
          border: "1.5px solid #fde68a", 
          background: "#fefce8",
          animation: "slideUp 0.6s ease 0.1s both"
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 13, color: "#854d0e", marginBottom: 10 }}>💰 Premiação</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {premios.dist.map((d: any, idx: number) => (
            <div 
              key={d.pos} 
              style={{ 
                flex: "1 1 60px", 
                textAlign: "center", 
                padding: "10px 8px", 
                background: "#fff", 
                borderRadius: 10, 
                border: "1px solid #fde68a",
                transition: "all 0.3s",
                animation: `slideUp 0.6s ease ${0.15 + idx * 0.05}s both`,
                cursor: "pointer"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 18 }}>{MEDAL[d.pos - 1]}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#16a34a" }}>R$ {d.valor}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ RANKING COM ANIMAÇÕES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {ranking.map((p, i) => {
          const isMe = p.nome === usuarioAtual;
          const premio = premios.dist.find((d: any) => d.pos === i + 1);
          const badges = calcBadges(p.nome, ranking, palpitesMap, elim, res, resE);
          const isAnimating = animatingUser === p.nome;

          return (
            <div 
              key={p.nome} 
              className="ranking-card"
              style={{ 
                border: `1.5px solid ${isMe ? "#86efac" : "#e5e7eb"}`, 
                background: isMe ? "#f0fdf4" : "#fff", 
                cursor: "pointer", 
                position: "relative", 
                overflow: "hidden", 
                padding: "14px 16px",
                borderRadius: 12,
                animation: isAnimating 
                  ? "moveUp 0.6s ease, scaleCard 0.4s ease"
                  : `slideUp 0.6s ease ${0.2 + i * 0.05}s both`,
                backgroundColor: isAnimating ? "#fef08a" : (isMe ? "#f0fdf4" : "#fff")
              }}
              onClick={() => setDetUser(detUser === p.nome ? null : p.nome)}
            >
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
                    <div 
                      style={{ 
                        marginTop: 10, 
                        fontSize: 13, 
                        lineHeight: 1.6, 
                        background: "#f9fafb", 
                        borderRadius: 8, 
                        padding: "10px 12px",
                        animation: "slideUp 0.3s ease",
                        borderLeft: "3px solid #16a34a"
                      }}
                    >
                      <div style={{ color: "#6b7280", marginBottom: 6 }}>
                        {p.acertos} acertos · {p.placares} exatos
                      </div>
                      {p.bonusCampeao > 0 && (
                        <div style={{ color: "#854d0e", marginBottom: 6 }}>🏆 +{p.bonusCampeao}pts bônus</div>
                      )}
                      {premio && (
                        <div style={{ color: "#16a34a", fontWeight: 700 }}>💰 R$ {premio.valor}</div>
                      )}
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