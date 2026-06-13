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

// Calcula acertos de todos os participantes num jogo
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

      // Prioridade 1: tem jogo ao vivo
      const temLive = jogosR.some(j => {
        const tR = res[j.id]?.gols1 !== undefined && res[j.id]?.gols1 !== "";
        const st = statusJ(j.dt, tR);
        return st === "live" || st === "wait";
      });
      if (temLive) { setRodada(r); return; }

      // Prioridade 2: tem jogo próximo
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
      const st = statusJ(j.dt, tR);
      return st === "live" || st === "wait";
    });
    if (temLive) { setStatusF("aovivo"); return; }

    const temProx = jogosR.some(j => {
      const tR = res[j.id]?.gols1 !== undefined && res[j.id]?.gols1 !== "";
      return statusJ(j.dt, tR) === "prox";
    });
    if (temProx) { setStatusF("proximos"); return; }

    setStatusF("terminados");
  }, [res, rodada, faseAtiva]);

  return (
    <div>
      {/* TÍTULO */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <i className="ti ti-calendar" style={{ fontSize: 20, color: "#16a34a" }} />
        <div style={{ fontWeight: 800, fontSize: 18 }}>Agenda de Jogos</div>
      </div>

      {/* NÍVEL 1 — FASES */}
      <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap", overflowX: "auto" }}>
        {ordemFases.map((f) => (
          <button
            key={f}
            className={`ftab ${faseAtiva === f ? "on" : "off"}`}
            onClick={() => setFaseAtiva(f)}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "1px solid #e5e7eb",
              background: faseAtiva === f ? "#16a34a" : "#f9fafb",
              color: faseAtiva === f ? "#fff" : "#6b7280",
              fontWeight: 600, fontSize: 12, cursor: "pointer",
              transition: "all .2s", whiteSpace: "nowrap",
            }}
          >
            {FASE_L[f] || f}
          </button>
        ))}
      </div>

      {faseAtiva === "grupos" && (
        <>
          {/* NÍVEL 2 — STATUS */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {(["proximos", "aovivo", "terminados"] as const).map((s) => (
              <button
                key={s}
                className={`stab ${statusF === s ? "on" : "off"}`}
                onClick={() => setStatusF(s)}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                {s === "proximos" && <><i className="ti ti-clock" /> Próximos</>}
                {s === "aovivo" && <><i className="ti ti-broadcast" /> Ao Vivo</>}
                {s === "terminados" && <><i className="ti ti-check" /> Terminados</>}
              </button>
            ))}
          </div>

          {/* NÍVEL 3 — RODADAS */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {[1, 2, 3].map((r) => (
              <button
                key={r}
                onClick={() => setRodada(r)}
                style={{
                  flex: 1, padding: "8px", borderRadius: 8,
                  border: `1.5px solid ${rodada === r ? "#16a34a" : "#e5e7eb"}`,
                  background: rodada === r ? "#16a34a" : "#f9fafb",
                  color: rodada === r ? "#fff" : "#6b7280",
                  fontWeight: 600, fontSize: 12, cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                Rodada {r}
              </button>
            ))}
          </div>
        </>
      )}

      {/* BANNER SHOPEE */}
      <ShopeeAffiliateBanner tela="jogos" />

      {/* JOGOS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {faseAtiva === "grupos" ? (
          <>
            {jogosFiltrados.length === 0 && (
              <div className="card" style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {statusF === "proximos"
                    ? <i className="ti ti-clock" style={{ fontSize: 28 }} />
                    : statusF === "aovivo"
                    ? <i className="ti ti-broadcast" style={{ fontSize: 28 }} />
                    : <i className="ti ti-check" style={{ fontSize: 28 }} />}
                </div>
                Nenhum jogo {statusF === "proximos" ? "próximo" : statusF === "aovivo" ? "ao vivo" : "encerrado"} nesta rodada
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
                    padding: "14px",
                    cursor: !lk && !tR ? "pointer" : "default",
                    border: `1px solid ${st === "live" ? "#fecaca" : mT === "placar" ? "#86efac" : mT === "vencedor" ? "#bfdbfe" : "#e5e7eb"}`,
                  }}
                >
                  {/* HEADER DO CARD */}
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
                      {!lk && !tR && tP && (
                        <span className="badge bgr" style={{ fontSize: 9 }}>
                          <i className="ti ti-check" /> {pJ.gols1}×{pJ.gols2}
                        </span>
                      )}
                      {!lk && !tR && !tP && (
                        <span className="badge bg" style={{ fontSize: 9 }}>Palpitar</span>
                      )}
                      {lk && !tR && (
                        <span className="badge br" style={{ fontSize: 9 }}>
                          <i className="ti ti-lock" />
                        </span>
                      )}
                      {st === "live" && (
                        <span className="badge bred" style={{ fontSize: 9 }}>
                          <i className="ti ti-broadcast" /> AO VIVO
                        </span>
                      )}
                      {st === "wait" && (
                        <span className="badge byellow" style={{ fontSize: 9 }}>
                          <i className="ti ti-hourglass" /> Aguardando
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TIMES E PLACAR */}
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

                  {/* FOOTER — resultado e acertos */}
                  {tR && (
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>
                        Meu palpite:{" "}
                        {tP ? (
                          <strong style={{ color: mT === "placar" ? "#16a34a" : mT === "vencedor" ? "#2563eb" : "#b91c1c" }}>
                            {pJ.gols1}×{pJ.gols2}{" "}
                            {mT === "placar"
                              ? <i className="ti ti-target" />
                              : mT === "vencedor"
                              ? <i className="ti ti-check" />
                              : <i className="ti ti-x" />}
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
          // ELIMINATÓRIAS
          <>
            {elim.filter(j => j.fase === faseAtiva).length === 0 && (
              <div className="card" style={{ textAlign: "center", padding: "32px", color: "#d1d5db" }}>
                Fase ainda não definida
              </div>
            )}

            {elim
              .filter(j => j.fase === faseAtiva)
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
                    parseInt(pJ.gols1), parseInt(pJ.gols2),
                    parseInt(rE.gols1), parseInt(rE.gols2),
                    j.fase || "oitavas", rE.penalti || false
                  );
                  mT = tipo;
                }
                const { nAc, nPal } = tR ? calcAcertos(j.id, palpitesMap, rE, j.fase || "oitavas") : { nAc: 0, nPal: 0 };
                const time1 = j.time1 || j.home_team_label || "A definir";
                const time2 = j.time2 || j.away_team_label || "A definir";
                const indefinido = !j.time1;

                return (
                  <div
                    key={j.id}
                    className="card"
                    onClick={() => { if (!lk && !tR && !indefinido) setJogoSel(j); }}
                    style={{
                      padding: "14px",
                      cursor: !lk && !tR && !indefinido ? "pointer" : "default",
                      opacity: indefinido ? 0.6 : 1,
                      border: `1px solid ${st === "live" ? "#fecaca" : mT === "placar" ? "#86efac" : mT === "vencedor" ? "#bfdbfe" : "#e5e7eb"}`,
                    }}
                  >
                    {/* HEADER */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", background: "#f3f4f6", padding: "3px 8px", borderRadius: 6 }}>
                          {j.label}
                        </span>
                        {j.est && (
                          <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                            <i className="ti ti-map-pin" /> {j.est}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        {!indefinido && !lk && !tR && tP && (
                          <span className="badge bgr" style={{ fontSize: 9 }}>
                            <i className="ti ti-check" /> {pJ.gols1}×{pJ.gols2}
                          </span>
                        )}
                        {!indefinido && !lk && !tR && !tP && (
                          <span className="badge bg" style={{ fontSize: 9 }}>Palpitar</span>
                        )}
                        {!indefinido && lk && !tR && (
                          <span className="badge br" style={{ fontSize: 9 }}>
                            <i className="ti ti-lock" />
                          </span>
                        )}
                        {st === "live" && (
                          <span className="badge bred" style={{ fontSize: 9 }}>
                            <i className="ti ti-broadcast" /> AO VIVO
                          </span>
                        )}
                        {st === "wait" && (
                          <span className="badge byellow" style={{ fontSize: 9 }}>
                            <i className="ti ti-hourglass" /> Aguardando
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TIMES E PLACAR */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                        <span style={{ fontSize: 26 }}>{F[time1] || "🏳️"}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center", color: indefinido ? "#9ca3af" : "#374151" }}>{time1}</span>
                      </div>
                      <div style={{ textAlign: "center", padding: "0 12px", minWidth: 80 }}>
                        {tR ? (
                          <div style={{ fontWeight: 800, fontSize: 24, fontFamily: "'JetBrains Mono',monospace", color: "#111827", letterSpacing: 2 }}>
                            {rE.gols1} × {rE.gols2}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: indefinido ? "#d1d5db" : "#374151", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>
                            {fmtD(j.dt)}<br />{fmtH(j.dt)}
                          </div>
                        )}
                        {rE.penalti && <div style={{ fontSize: 9, color: "#fbbf24", marginTop: 2 }}>Pênaltis</div>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                        <span style={{ fontSize: 26 }}>{F[time2] || "🏳️"}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center", color: indefinido ? "#9ca3af" : "#374151" }}>{time2}</span>
                      </div>
                    </div>

                    {/* FOOTER */}
                    {tR && (
                      <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          Meu palpite:{" "}
                          {tP ? (
                            <strong style={{ color: mT === "placar" ? "#16a34a" : mT === "vencedor" ? "#2563eb" : "#b91c1c" }}>
                              {pJ.gols1}×{pJ.gols2}{" "}
                              {mT === "placar"
                                ? <i className="ti ti-target" />
                                : mT === "vencedor"
                                ? <i className="ti ti-check" />
                                : <i className="ti ti-x" />}
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