"use client";

import { GRUPOS, TODOS_TIMES, F, FASE_L, CONFIG } from "@/lib/constantes";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";
import { lock, campLock, tr, fmtD, fmtH } from "@/lib/utils";
import { calcJogo } from "@/lib/calculos";

interface Props {
  pago: boolean;
  campAtual: string;
  faseAtiva: string;
  grupoAtivo: string;
  elim: any[];
  palR: any;
  palS: any;
  res: any;
  resE: any;
  salvando: boolean;
  temRasc: boolean;
  setModo: (m: string) => void;
  setFaseAtiva: (f: string) => void;
  setGrupoAtivo: (g: string) => void;
  setJogoSel: (j: any) => void;
  setCamp: (t: string) => void;
  setPalLocal: (id: number, campo: string, valor: string, dt: string) => void;
  salvarGrupo: () => void;
  salvarElim: () => void;
}

export default function TelaPalpites({
  pago, campAtual, faseAtiva, grupoAtivo, elim,
  palR, palS, res, salvando, temRasc,
  setModo, setFaseAtiva, setGrupoAtivo, setJogoSel,
  setCamp, setPalLocal, salvarGrupo, salvarElim,
}: Props) {
  return (
    <div>
      {!pago && (
        <div className="card" style={{ marginBottom: 14, background: "rgba(248,113,113,.06)", border: "1px solid rgba(248,113,113,.2)" }}>
          <div style={{ fontWeight: 700, color: "#b91c1c", marginBottom: 6 }}>🔒 Pagamento pendente</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>Faça o Pix para participar do bolão.</div>
          <button className="btn-primary" onClick={() => setModo("pix")}>Ver dados do Pix →</button>
        </div>
      )}
      <div className="card" style={{ marginBottom: 14, border: "1px solid rgba(247,201,72,.2)", background: "rgba(247,201,72,.03)" }}>
        <div style={{ fontWeight: 700, fontSize: 11, color: "#16a34a", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>🏆 Campeão da Copa</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          +{CONFIG.bonusCampeao} pts bônus ·{" "}
          {campLock()
            ? <span style={{ color: "#b91c1c" }}>🔒 Bloqueado — palpite encerrado</span>
            : <span style={{ color: "#16a34a", fontWeight: 700 }}>{tr(CONFIG.bloqueioCompetidor)} para fechar</span>}
        </div>
        <select value={campAtual} onChange={e => setCamp(e.target.value)} disabled={campLock()}>
          <option value="">— Selecione o campeão —</option>
          {TODOS_TIMES.map(t => <option key={t} value={t}>{F[t]} {t}</option>)}
        </select>
        {campAtual && <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>Seu palpite: <strong style={{ color: "#16a34a" }}>{F[campAtual]} {campAtual}</strong></div>}
      </div>

      <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
        {["grupos", "oitavas", "quartas", "semi", "final"].map(f => (
          <button key={f} className={`ftab ${faseAtiva === f ? "on" : "off"}`} onClick={() => setFaseAtiva(f)}>{FASE_L[f]}</button>
        ))}
      </div>

      {faseAtiva === "grupos" && (
        <>
          <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
            {Object.keys(GRUPOS).map(g => <button key={g} className={`gtab ${grupoAtivo === g ? "on" : "off"}`} onClick={() => setGrupoAtivo(g)}>{g}</button>)}
          </div>
          <div style={{ marginBottom: 10, padding: "6px 10px", background: "rgba(255,255,255,.03)", borderRadius: 7, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {GRUPOS[grupoAtivo].map(t => <span key={t} style={{ fontSize: 10, color: "#6b7280" }}>{F[t]} {t}</span>)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {JOGOS_GRUPO.filter(j => j.g === grupoAtivo).map(j => {
              const r = res[j.id] || {};
              const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
              const pL = palR[j.id] || {};
              const pSv = palS[j.id] || {};
              const lk = lock(j.dt);
              const tPL = pL.gols1 !== "" && pL.gols1 !== undefined && pL.gols2 !== "" && pL.gols2 !== undefined;
              const mod = !lk && (pL.gols1 !== pSv.gols1 || pL.gols2 !== pSv.gols2) && tPL;
              let aV = false, aP = false;
              if (tR && pSv.gols1 !== undefined && pSv.gols1 !== "") {
                const { tipo } = calcJogo(parseInt(pSv.gols1), parseInt(pSv.gols2), parseInt(r.gols1), parseInt(r.gols2), j.fase || "grupos", r.penalti || false);
                aV = tipo === "vencedor"; aP = tipo === "placar";
              }
              const bc = aP ? "#16a34a" : aV ? "#2563eb" : "transparent";
              return (
                <div key={j.id} className="card" style={{ position: "relative", overflow: "hidden", padding: "13px", border: `1px solid ${bc === "transparent" ? "#f3f4f6" : bc + "44"}` }}>
                  {bc !== "transparent" && <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: bc }} />}
                  <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
                    {lk && !tPL && <span className="badge br">🔒</span>}
                    {aP && <span className="badge bg">🎯 Exato!</span>}
                    {aV && <span className="badge bb">✅</span>}
                    {mod && <span className="badge" style={{ background: "rgba(251,191,36,.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,.3)" }}>✏️</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 9 }}>📍 {j.est} · {fmtH(j.dt)}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 22 }}>{F[j.time1]}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#374151", textAlign: "center" }}>{j.time1}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 8px", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <input type="number" min={0} max={30} disabled={lk} id={`g1_${j.id}`} className={`si${tPL ? " f" : ""}`} value={pL.gols1 ?? ""}
                          onChange={e => { setPalLocal(j.id, "gols1", e.target.value, j.dt); if (e.target.value !== "") { const nx = document.getElementById(`g2_${j.id}`); if (nx) nx.focus(); } }} placeholder="—" />
                        <span style={{ color: "#d1d5db", fontSize: 13 }}>×</span>
                        <input id={`g2_${j.id}`} type="number" min={0} max={30} disabled={lk} className={`si${tPL ? " f" : ""}`} value={pL.gols2 ?? ""}
                          onChange={e => {
                            setPalLocal(j.id, "gols2", e.target.value, j.dt);
                            if (e.target.value !== "") {
                              const prox = JOGOS_GRUPO.filter(jj => jj.g === grupoAtivo && jj.id > j.id && !lock(jj.dt))[0];
                              if (prox) { const nx = document.getElementById(`g1_${prox.id}`); if (nx) nx.focus(); } else { setJogoSel(j); }
                            }
                          }} placeholder="—" />
                      </div>
                      {tR && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Resultado: <strong>{r.gols1}×{r.gols2}</strong>{r.penalti ? " (pên.)" : ""}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 22 }}>{F[j.time2]}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#374151", textAlign: "center" }}>{j.time2}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={salvarGrupo} disabled={salvando} style={{ marginTop: 13, width: "100%", padding: "13px", borderRadius: 12, border: "none", cursor: salvando ? "not-allowed" : "pointer", background: temRasc ? "#16a34a" : "#f3f4f6", color: temRasc ? "#fff" : "#9ca3af", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, transition: "all .2s" }}>
            {salvando ? "Salvando..." : temRasc ? `Salvar palpites — Grupo ${grupoAtivo}` : "Palpites salvos ✓"}
          </button>
        </>
      )}

      {faseAtiva !== "grupos" && (
        <div>
          {elim.filter(j => j.fase === faseAtiva && j.time1).length === 0 && (
            <div className="card" style={{ textAlign: "center", color: "#d1d5db", padding: "28px" }}>Fase ainda não definida</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {elim.filter(j => j.fase === faseAtiva && j.time1).map(j => {
              const pL = palR[j.id] || {};
              const lk = lock(j.dt);
              const tPL = pL.gols1 !== "" && pL.gols1 !== undefined && pL.gols2 !== "" && pL.gols2 !== undefined;
              return (
                <div key={j.id} className="card" style={{ padding: "13px" }}>
                  <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 9 }}>{j.label} · {fmtD(j.dt)} {fmtH(j.dt)} · {j.est}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 22 }}>{F[j.time1] || "🏳️"}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#374151" }}>{j.time1}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 8px" }}>
                      <input type="number" min={0} max={30} disabled={lk} className={`si${tPL ? " f" : ""}`} value={pL.gols1 ?? ""} onChange={e => setPalLocal(j.id, "gols1", e.target.value, j.dt)} placeholder="—" />
                      <span style={{ color: "#d1d5db", fontSize: 13 }}>×</span>
                      <input type="number" min={0} max={30} disabled={lk} className={`si${tPL ? " f" : ""}`} value={pL.gols2 ?? ""} onChange={e => setPalLocal(j.id, "gols2", e.target.value, j.dt)} placeholder="—" />
                    </div>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 22 }}>{F[j.time2] || "🏳️"}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#374151" }}>{j.time2}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {elim.filter(j => j.fase === faseAtiva && j.time1).length > 0 && (
            <button onClick={salvarElim} disabled={salvando} style={{ marginTop: 13, width: "100%", padding: "13px", borderRadius: 12, border: "none", cursor: "pointer", background: temRasc ? "#16a34a" : "#f3f4f6", color: temRasc ? "#fff" : "#9ca3af", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14 }}>
              {salvando ? "Salvando..." : temRasc ? `Salvar palpites — ${FASE_L[faseAtiva]}` : "Palpites salvos ✓"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}