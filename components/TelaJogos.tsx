"use client";

import { useEffect } from "react";
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

function calcAcertos(
  jogoId: number,
  palpitesMap: Record<string, any>,
  resultado: { gols1: string; gols2: string; penalti?: boolean },
  fase: string
) {
  let nAc = 0, nPal = 0;
  Object.values(palpitesMap).forEach((ps: any) => {
    const p = ps[jogoId];
    if (!p || p.gols1 === "" || p.gols2 === "") return;
    nPal++;
    const { tipo } = calcJogo(
      parseInt(p.gols1), parseInt(p.gols2),
      parseInt(resultado.gols1), parseInt(resultado.gols2),
      fase, resultado.penalti || false
    );
    if (tipo === "placar" || tipo === "vencedor") nAc++;
  });
  return { nAc, nPal };
}

export default function TelaJogos({
  statusF, setStatusF, rodada, setRodada,
  faseAtiva, setFaseAtiva, jogosFiltrados, jogosRodada,
  elim, res, resE, palS, palpitesMap, F, setJogoSel,
}: Props) {

  const ordemFases = ["grupos", "16avos", "oitavas", "quartas", "semi", "final"];

  // Auto-detecta fase ativa
  useEffect(() => {
    let faseDetectada = "grupos";
    for (const fase of ordemFases) {
      if (fase === "grupos") continue;
      const temJogos = elim.some(j => j.fase === fase && j.time1);
      if (temJogos) faseDetectada = fase;
    }
    setFaseAtiva(faseDetectada);
  }, [elim]);

  // Auto-detecta rodada ativa
  useEffect(() => {
    for (const r of [1, 2, 3]) {
      const jogosR = JOGOS_GRUPO.filter(j => j.r === r);
      const temLive = jogosR.some(j => {
        const tR = res[j.id]?.gols1 !== undefined && res[j.id]?.gols1 !== "";
        const st = statusJ(j.dt, tR);
        return st === "live" || st === "wait";
      });
      if (temLive) { setRodada(r); return; }
      const temProx = jogosR.some(j => {
        const tR = res[j.id]?.gols1 !== undefined && res[j.id]?.gols1 !== "";
        return statusJ(j.dt, tR) === "prox";
      });
      if (temProx) { setRodada(r); return; }
    }
    setRodada(3);
  }, [res]);

  // Auto-detecta status ativo
  useEffect(() => {
    if (faseAtiva !== "grupos") return;
    const jogosR = JOGOS_GRUPO.filter(j => j.r === rodada);
    const temLive = jogosR.some(j => {
      const tR = res[j.id]?.gols1 !== undefined && res[j.id]?.gols1 !== "";
      return statusJ(j.dt, tR) === "live" || statusJ(j.dt, tR) === "wait";
    });
    if (temLive) { setStatusF("aovivo"); return; }
    const temProx = jogosR.some(j => {
      const tR = res[j.id]?.gols1 !== undefined && res[j.id]?.gols1 !== "";
      return statusJ(j.dt, tR) === "prox";
    });
    if (temProx) { setStatusF("proximos"); return; }
    setStatusF("terminados");
  }, [res, rodada, faseAtiva]);

  // Jogos filtrados considerando "Todos" quando status = terminados
  const jogosDaRodada = statusF === "terminados"
    ? JOGOS_GRUPO.filter(j => {
        const r = res[j.id] || {};
        const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
        return statusJ(j.dt, tR) === "enc";
      })
    : jogosFiltrados;

  return (
    <div>
      {/* TÍTULO */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <i className="ti ti-calendar" style={{ fontSize: 20, color: "#16a34a" }} />
        <div style={{ fontWeight: 800, fontSize: 18 }}>Agenda de Jogos</div>
      </div>

      {/* NÍVEL 1 — FASES */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
        {ordemFases.map((f) => (
          <button
            key={f}
            onClick={() => setFaseAtiva(f)}
            style={{
              padding: "7px 16px", borderRadius: 20,
              border: `1.5px solid ${faseAtiva === f ? "#16a34a" : "#e5e7eb"}`,
              background: faseAtiva === f ? "#16a34a" : "#fff",
              color: faseAtiva === f ? "#fff" : "#6b7280",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              transition: "all .2s", whiteSpace: "nowrap",
            }}
          >
            {FASE_L[f] || f}
          </button>
        ))}
      </div>

      {faseAtiva === "grupos" && (
        <>
          {/* NÍVEL 2 — STATUS (sutil, texto com underline) */}
          <div style={{ display: "flex", gap: 20, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #f3f4f6" }}>
            {(["proximos", "aovivo", "terminados"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusF(s)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: statusF === s ? 700 : 500,
                  color: statusF === s ? "#16a34a" : "#9ca3af",
                  borderBottom: `2px solid ${statusF === s ? "#16a34a" : "transparent"}`,
                  paddingBottom: 4, display: "flex", alignItems: "center", gap: 5,
                  transition: "all .2s",
                }}
              >
                {s === "proximos" && <><i className="ti ti-clock" /> Próximos</>}
                {s === "aovivo" && <><i className="ti ti-broadcast" /> Ao Vivo</>}
                {s === "terminados" && <><i className="ti ti-check" /> Terminados</>}
              </button>
            ))}
          </div>

          {/* BANNER SHOPEE */}
          <ShopeeAffiliateBanner tela="jogos" />

          {/* NÍVEL 3 — RODADAS (discreto, só quando não é terminados) */}
          {statusF !== "terminados" && (
            <div style={{ display: "flex", gap: 6, marginBottom: 14, marginTop: 10 }}>
              {[1, 2, 3].map((r) => (
                <button
                  key={r}
                  onClick={() => setRodada(r)}
                  style={{
                    flex: 1, padding: "6px",
                    borderRadius: 8,
                    border: "none",
                    borderBottom: `2px solid ${rodada === r ? "#16a34a" : "#e5e7eb"}`,
                    background: "transparent",
                    color: rodada === r ? "#16a34a" : "#9ca3af",
                    fontWeight: rodada === r ? 700 : 500,
                    fontSize: 12, cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  Rodada {r}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* JOGOS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: faseAtiva !== "grupos" ? 12 : 0 }}>
        {faseAtiva === "grupos" ? (
          <>
            {jogosDaRodada.length === 0 && (
              <div className="card" style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {statusF === "proximos"
                    ? <i className="ti ti-clock" style={{ fontSize: 28 }} />
                    : statusF === "aovivo"
                    ? <i className="ti ti-broadcast" style={{ fontSize: 28 }} />
                    : <i className="ti ti-check" style={{ fontSize: 28 }} />}
                </div>
                Nenhum jogo {statusF === "proximos" ? "próximo" : statusF === "aovivo" ? "ao vivo" : "encerrado"}
              </div>
            )}

            {jogosDaRodada.map((j) => {
              const r = res[j.id] || {};
              const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
              const pJ = palS[j.id];
              const tP = pJ && pJ.gols1 !== "" && pJ.gols2 !== "";
              const lk = lock(j.dt);
              const st = statusJ(j.dt, tR);
              let mT = "";
              if (tR && tP) {
                const { tipo } = calcJogo(
                  parseInt(pJ.gols1), parseInt(pJ.gols2),
                  parseInt(r.gols1), parseInt(r.gols2),
                  j.fase || "grupos", r.penalti || false
                );
                mT = tipo;
              }
              const { nAc, nPal } = tR ? calcAcertos(j.id, palpitesMap, r, j.fase || "grupos") : { nAc: 0, nPal: 0 };

              return (
                <div
                  key={j.id}
                  className="card"
                  onClick={() => { if (!lk && !tR) setJogoSel(j); }}
                  style={{
                    padding: "14px", cursor: !lk && !tR ? "pointer" : "default",
                    border: `1px solid ${st === "live" ? "#fecaca" : mT === "placar" ? "#86efac" : mT === "vencedor" ? "#bfdbfe" : "#e5e7eb"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", background: "#f3f4f6", padding: "3px 8px", borderRadius: 6 }}>
                        Grupo {j.g}
                      </span>
                      <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                        <i className="ti ti-map-pin" /> {j.est}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      {!lk && !tR && tP && <span className="badge bgr" style={{ fontSize: 9 }}><i className="ti ti-check" /> {pJ.gols1}×{pJ.gols2}</span>}
                      {!lk && !tR && !tP && <span className="badge bg" style={{ fontSize: 9 }}>Palpitar</span>}
                      {lk && !tR && <span className="badge br" style={{ fontSize: 9 }}><i className="ti ti-lock" /></span>}
                      {st === "live" && <span className="badge bred" style={{ fontSize: 9 }}><i className="ti ti-broadcast" /> AO VIVO</span>}
                      {st === "wait" && <span className="badge byellow" style={{ fontSize: 9 }}><i className="ti ti-hourglass" /> Aguardando</span>}
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
                          {fmtD(j.dt)}<br />{fmtH(j.dt)}
                        </div>
                      )}
                      {r.penalti && <div style={{ fontSize: 9, color: "#fbbf24", marginTop: 2 }}>Pênaltis</div>}
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
                          <strong style={{ color: mT === "placar" ? "#16a34a" : mT === "vencedor" ? "#2563eb" : "#b91c1c" }}>
                            {pJ.gols1}×{pJ.gols2}{" "}
                            {mT === "placar" ? <i className="ti ti-target" /> : mT === "vencedor" ? <i className="ti ti-check" /> : <i className="ti ti-x" />}
                          </strong>
                        ) : <span style={{ color: "#d1d5db" }}>—</span>}
                      </div>
                      {nPal > 0 && <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700 }}>{nAc}/{nPal} acertaram</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <>
            {/* BANNER NAS ELIMINATÓRIAS */}
            <ShopeeAffiliateBanner tela="jogos" />

            {elim.filter(j => j.fase === faseAtiva && j.time1).length === 0 && (
              <div className="card" style={{ textAlign: "center", padding: "32px", color: "#d1d5db", marginTop: 12 }}>
                Fase ainda não definida
              </div>
            )}

            {elim.filter(j => j.fase === faseAtiva && j.time1).map((j) => {
              const rE = resE[j.id] || {};
              const tR = rE.gols1 !== undefined && rE.gols1 !== "" && rE.gols2 !== undefined && rE.gols2 !== "";
              const pJ = palS[j.id];
              const tP = pJ && pJ.gols1 !== "" && pJ.gols2 !== "";
              const lk = lock(j.dt);
              const st = statusJ(j.dt, tR);
              let mT = "";
              if (tR && tP) {
                const { tipo } = calcJogo(
                  parseInt(pJ.gols1), parseInt(pJ.gols2),
                  parseInt(rE.gols1), parseInt(rE.gols2),
                  j.fase || "oitavas", rE.penalti || false
                );
                mT = tipo;
              }
              const { nAc, nPal } = tR ? calcAcertos(j.id, palpitesMap, rE, j.fase || "oitavas") : { nAc: 0, nPal: 0 };

              return (
                <div
                  key={j.id}
                  className="card"
                  onClick={() => { if (!lk && !tR) setJogoSel(j); }}
                  style={{
                    padding: "14px", cursor: !lk && !tR ? "pointer" : "default",
                    border: `1px solid ${st === "live" ? "#fecaca" : mT === "placar" ? "#86efac" : mT === "vencedor" ? "#bfdbfe" : "#e5e7eb"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", background: "#f3f4f6", padding: "3px 8px", borderRadius: 6 }}>
                        {j.label}
                      </span>
                      {j.est && <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}><i className="ti ti-map-pin" /> {j.est}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      {!lk && !tR && tP && <span className="badge bgr" style={{ fontSize: 9 }}><i className="ti ti-check" /> {pJ.gols1}×{pJ.gols2}</span>}
                      {!lk && !tR && !tP && <span className="badge bg" style={{ fontSize: 9 }}>Palpitar</span>}
                      {lk && !tR && <span className="badge br" style={{ fontSize: 9 }}><i className="ti ti-lock" /></span>}
                      {st === "live" && <span className="badge bred" style={{ fontSize: 9 }}><i className="ti ti-broadcast" /> AO VIVO</span>}
                      {st === "wait" && <span className="badge byellow" style={{ fontSize: 9 }}><i className="ti ti-hourglass" /> Aguardando</span>}
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
                          {fmtD(j.dt)}<br />{fmtH(j.dt)}
                        </div>
                      )}
                      {rE.penalti && <div style={{ fontSize: 9, color: "#fbbf24", marginTop: 2 }}>Pênaltis</div>}
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
                          <strong style={{ color: mT === "placar" ? "#16a34a" : mT === "vencedor" ? "#2563eb" : "#b91c1c" }}>
                            {pJ.gols1}×{pJ.gols2}{" "}
                            {mT === "placar" ? <i className="ti ti-target" /> : mT === "vencedor" ? <i className="ti ti-check" /> : <i className="ti ti-x" />}
                          </strong>
                        ) : <span style={{ color: "#d1d5db" }}>—</span>}
                      </div>
                      {nPal > 0 && <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700 }}>{nAc}/{nPal} acertaram</div>}
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