"use client";

import { useState } from "react";
import type { Jogo, StatusFiltro } from "@/lib/types";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";
import { FASE_L } from "@/lib/constantes";
import { lock, fmtD, fmtH, statusJ } from "@/lib/utils";
import { calcJogo } from "@/lib/calculos";
import { ShopeeAffiliateBanner } from "@/components/ShopeeAffiliateBanner";


interface Props {
  statusF: StatusFiltro;
  setStatusF: (s: StatusFiltro) => void;
  rodada: number;
  setRodada: (r: number) => void;
  faseAtiva: string;
  setFaseAtiva: (f: string) => void;
  jogosFiltrados: Jogo[];
  jogosRodada: Jogo[];
  elim: any[];
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  resE: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  palS: Record<number, { gols1: string; gols2: string }>;
  palpitesMap: Record<string, Record<number, { gols1: string; gols2: string }>>;
  F: Record<string, string>;
  setJogoSel: (j: Jogo) => void;
}

export default function TelaJogos({
  statusF,
  setStatusF,
  rodada,
  setRodada,
  faseAtiva,
  setFaseAtiva,
  jogosFiltrados,
  jogosRodada,
  elim,
  res,
  resE,
  palS,
  palpitesMap,
  F,
  setJogoSel,
}: Props) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14 }}>📅 Agenda de Jogos</div>

      {/* ✅ ABAS DE FASES */}
      <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap", overflowX: "auto" }}>
        {["grupos", "16avos", "oitavas", "quartas", "semi", "final"].map((f) => (
          <button
            key={f}
            className={`ftab ${faseAtiva === f ? "on" : "off"}`}
            onClick={() => setFaseAtiva(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: faseAtiva === f ? "#16a34a" : "#f9fafb",
              color: faseAtiva === f ? "#fff" : "#6b7280",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              transition: "all .2s",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => {
              if (faseAtiva !== f) e.currentTarget.style.background = "#f3f4f6";
            }}
            onMouseOut={(e) => {
              if (faseAtiva !== f) e.currentTarget.style.background = "#f9fafb";
            }}
          >
            {FASE_L[f] || f}
          </button>
        ))}
      </div>

      {/* ✅ FASE GRUPOS - Com rodadas e filtros */}
      {faseAtiva === "grupos" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {(["proximos", "aovivo", "terminados"] as const).map((s) => (
              <button
                key={s}
                className={`stab ${statusF === s ? "on" : "off"}`}
                onClick={() => setStatusF(s)}
              >
                {s === "proximos" ? "⏰ Próximos" : s === "aovivo" ? "🔴 Ao Vivo" : "✅ Terminados"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <button className="nbtn" onClick={() => setRodada(Math.max(1, rodada - 1))} disabled={rodada === 1}>
              ←
            </button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#16a34a" }}>Rodada {rodada}</div>
              <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
                {[...new Set(jogosRodada.map((j) => fmtD(j.dt)))].join(" · ")}
              </div>
            </div>
            <button className="nbtn" onClick={() => setRodada(Math.min(3, rodada + 1))} disabled={rodada === 3}>
              →
            </button>
          </div>

          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14 }}>
            {[1, 2, 3].map((r) => (
              <button
                key={r}
                onClick={() => setRodada(r)}
                style={{
                  width: 22,
                  height: 5,
                  borderRadius: 3,
                  border: "none",
                  cursor: "pointer",
                  background: r === rodada ? "#16a34a" : "#e5e7eb",
                  transition: "all .2s",
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* ✅ JOGOS DA FASE ATIVA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {faseAtiva === "grupos" ? (
          // Grupos
          <>
            {jogosFiltrados.length === 0 && (
              <div className="card" style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {statusF === "proximos" ? "⏰" : statusF === "aovivo" ? "🔴" : "✅"}
                </div>
                Nenhum jogo {statusF === "proximos" ? "próximo" : statusF === "aovivo" ? "ao vivo" : "encerrado"}{" "}
                nesta rodada
              </div>
            )}
            {jogosFiltrados.map((j) => {
              const r = res[j.id] || {};
              const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
              const pJ = palS[j.id];
              const tP = pJ && pJ.gols1 !== "" && pJ.gols2 !== "";
              const lk = lock(j.dt);
              const st = statusJ(j.dt, tR);
              let mT = "";
              if (tR && tP) {
                const { tipo } = calcJogo(
                  parseInt(pJ.gols1),
                  parseInt(pJ.gols2),
                  parseInt(r.gols1),
                  parseInt(r.gols2),
                  j.fase || "grupos",
                  r.penalti || false
                );
                mT = tipo;
              }
              let nAc = 0,
                nPal = 0;
              if (tR) {
                Object.values(palpitesMap).forEach((ps: any) => {
                  const p = ps[j.id];
                  if (!p || p.gols1 === "" || p.gols2 === "") return;
                  nPal++;
                  const { tipo } = calcJogo(
                    parseInt(p.gols1),
                    parseInt(p.gols2),
                    parseInt(r.gols1),
                    parseInt(r.gols2),
                    j.fase || "grupos",
                    r.penalti || false
                  );
                  if (tipo === "placar" || tipo === "vencedor") nAc++;
                });
              }
              return (
                <div
                  key={j.id}
                  className="card"
                  onClick={() => {
                    if (!lk && !tR) setJogoSel(j);
                  }}
                  style={{
                    padding: "14px",
                    cursor: !lk && !tR ? "pointer" : "default",
                    border: `1px solid ${
                      st === "live" ? "#fecaca" : mT === "placar" ? "#86efac" : mT === "vencedor" ? "#bfdbfe" : "#e5e7eb"
                    }`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", background: "#f3f4f6", padding: "3px 8px", borderRadius: 6 }}>
                        Grupo {j.g}
                      </span>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>{j.est}</span>
                    </div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      {!lk && !tR && tP && (
                        <span className="badge bgr" style={{ fontSize: 9 }}>
                          ✓ {pJ.gols1}×{pJ.gols2}
                        </span>
                      )}
                      {!lk && !tR && !tP && (
                        <span className="badge bg" style={{ fontSize: 9 }}>
                          Palpitar
                        </span>
                      )}
                      {lk && !tR && (
                        <span className="badge br" style={{ fontSize: 9 }}>
                          🔒
                        </span>
                      )}
                      {st === "live" && (
                        <span className="badge bred" style={{ fontSize: 9 }}>
                          🔴 AO VIVO
                        </span>
                      )}
                      {st === "wait" && (
                        <span className="badge byellow" style={{ fontSize: 9 }}>
                          ⏳ Aguardando
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                      <span style={{ fontSize: 26 }}>{F[j.time1] || "🏳️"}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center" }}>{j.time1}</span>
                    </div>
                    <div style={{ textAlign: "center", padding: "0 12px", minWidth: 80 }}>
                      {tR ? (
                        <div style={{ fontWeight: 800, fontSize: 24, fontFamily: "'JetBrains Mono',monospace", color: "#111827", letterSpacing: 2 }}>
                          {r.gols1} × {r.gols2}
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>
                          {fmtD(j.dt)}
                          <br />
                          {fmtH(j.dt)}
                        </div>
                      )}
                      {r.penalti && (
                        <div style={{ fontSize: 9, color: "#fbbf24", marginTop: 2 }}>Pênaltis</div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                      <span style={{ fontSize: 26 }}>{F[j.time2] || "🏳️"}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center" }}>{j.time2}</span>
                    </div>
                  </div>
                  {tR && (
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>
                        Meu palpite:{" "}
                        {tP ? (
                          <strong
                            style={{
                              color:
                                mT === "placar" ? "#16a34a" : mT === "vencedor" ? "#2563eb" : "#b91c1c",
                            }}
                          >
                            {pJ.gols1}×{pJ.gols2} {mT === "placar" ? "🎯" : mT === "vencedor" ? "✅" : "❌"}
                          </strong>
                        ) : (
                          <span style={{ color: "#d1d5db" }}>—</span>
                        )}
                      </div>
                      {nPal > 0 && (
                        <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700 }}>
                          {nAc}/{nPal} acertaram
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          // Eliminatórias
          <>
            {elim.filter((j) => j.fase === faseAtiva && j.time1).length === 0 && (
              <div className="card" style={{ textAlign: "center", padding: "32px", color: "#d1d5db" }}>
                Fase ainda não definida
              </div>
            )}
            {elim
              .filter((j) => j.fase === faseAtiva && j.time1)
              .map((j) => {
                const rE = resE[j.id] || {};
                const tR = rE.gols1 !== undefined && rE.gols1 !== "" && rE.gols2 !== undefined && rE.gols2 !== "";
                const pJ = palS[j.id];
                const tP = pJ && pJ.gols1 !== "" && pJ.gols2 !== "";
                const lk = lock(j.dt);
                const st = statusJ(j.dt, tR);
                let mT = "";
                if (tR && tP) {
                  const { tipo } = calcJogo(
                    parseInt(pJ.gols1),
                    parseInt(pJ.gols2),
                    parseInt(rE.gols1),
                    parseInt(rE.gols2),
                    j.fase || "oitavas",
                    rE.penalti || false
                  );
                  mT = tipo;
                }
                let nAc = 0,
                  nPal = 0;
                if (tR) {
                  Object.values(palpitesMap).forEach((ps: any) => {
                    const p = ps[j.id];
                    if (!p || p.gols1 === "" || p.gols2 === "") return;
                    nPal++;
                    const { tipo } = calcJogo(
                      parseInt(p.gols1),
                      parseInt(p.gols2),
                      parseInt(rE.gols1),
                      parseInt(rE.gols2),
                      j.fase || "oitavas",
                      rE.penalti || false
                    );
                    if (tipo === "placar" || tipo === "vencedor") nAc++;
                  });
                }
                return (
                  <div
                    key={j.id}
                    className="card"
                    onClick={() => {
                      if (!lk && !tR) setJogoSel(j);
                    }}
                    style={{
                      padding: "14px",
                      cursor: !lk && !tR ? "pointer" : "default",
                      border: `1px solid ${
                        st === "live" ? "#fecaca" : mT === "placar" ? "#86efac" : mT === "vencedor" ? "#bfdbfe" : "#e5e7eb"
                      }`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", background: "#f3f4f6", padding: "3px 8px", borderRadius: 6 }}>
                          {j.label}
                        </span>
                        <span style={{ fontSize: 11, color: "#6b7280" }}>{j.est}</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        {!lk && !tR && tP && (
                          <span className="badge bgr" style={{ fontSize: 9 }}>
                            ✓ {pJ.gols1}×{pJ.gols2}
                          </span>
                        )}
                        {!lk && !tR && !tP && (
                          <span className="badge bg" style={{ fontSize: 9 }}>
                            Palpitar
                          </span>
                        )}
                        {lk && !tR && (
                          <span className="badge br" style={{ fontSize: 9 }}>
                            🔒
                          </span>
                        )}
                        {st === "live" && (
                          <span className="badge bred" style={{ fontSize: 9 }}>
                            🔴 AO VIVO
                          </span>
                        )}
                        {st === "wait" && (
                          <span className="badge byellow" style={{ fontSize: 9 }}>
                            ⏳ Aguardando
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                        <span style={{ fontSize: 26 }}>{F[j.time1] || "🏳️"}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center" }}>{j.time1}</span>
                      </div>
                      <div style={{ textAlign: "center", padding: "0 12px", minWidth: 80 }}>
                        {tR ? (
                          <div style={{ fontWeight: 800, fontSize: 24, fontFamily: "'JetBrains Mono',monospace", color: "#111827", letterSpacing: 2 }}>
                            {rE.gols1} × {rE.gols2}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>
                            {fmtD(j.dt)}
                            <br />
                            {fmtH(j.dt)}
                          </div>
                        )}
                        {rE.penalti && (
                          <div style={{ fontSize: 9, color: "#fbbf24", marginTop: 2 }}>Pênaltis</div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                        <span style={{ fontSize: 26 }}>{F[j.time2] || "🏳️"}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center" }}>{j.time2}</span>
                      </div>
                    </div>
                    {tR && (
                      <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          Meu palpite:{" "}
                          {tP ? (
                            <strong
                              style={{
                                color:
                                  mT === "placar" ? "#16a34a" : mT === "vencedor" ? "#2563eb" : "#b91c1c",
                              }}
                            >
                              {pJ.gols1}×{pJ.gols2} {mT === "placar" ? "🎯" : mT === "vencedor" ? "✅" : "❌"}
                            </strong>
                          ) : (
                            <span style={{ color: "#d1d5db" }}>—</span>
                          )}
                        </div>
                        {nPal > 0 && (
                          <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700 }}>
                            {nAc}/{nPal} acertaram
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
}