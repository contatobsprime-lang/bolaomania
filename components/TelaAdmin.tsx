"use client";

import { useState } from "react";
import type { Jogo, RankingEntry } from "@/lib/types";
import { CONFIG, GRUPOS, TODOS_TIMES, FASE_L, MEDAL } from "@/lib/constantes";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";
import { fmtD, fmtH } from "@/lib/utils";

interface Props {
  adminModo: string;
  setAdminModo: (m: string) => void;
  grupoAtivo: string;
  setGrupoAtivo: (g: string) => void;
  faseAtiva: string;
  setFaseAtiva: (f: string) => void;
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  resE: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  elim: Jogo[];
  updateElimT: (id: number, field: string, value: string) => void;
  campR: string;
  atualizarCampR: (c: string) => void;
  usuarios: Record<string, { pago: boolean; camp: string; email?: string }>;
  ranking: RankingEntry[];
  nPart: number;
  nPagos: number;
  togglePago: (nome: string) => void;
  resetarSenha: (nome: string, email: string) => void;
  mostrarToast: (msg: string) => void;
  F: Record<string, string>;
}

export default function TelaAdmin({
  adminModo, setAdminModo, grupoAtivo, setGrupoAtivo, faseAtiva, setFaseAtiva,
  res, resE, elim, updateElimT, campR, atualizarCampR, usuarios, ranking, nPart, nPagos,
  togglePago, resetarSenha, mostrarToast, F
}: Props) {
  const [resetNome, setResetNome] = useState<string | null>(null);

  return (
    <div className="fade">
      <div style={{ marginBottom: 14, padding: "10px 16px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#b91c1c" }}>🔐 Painel do Administrador</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[{ id: "resultados", label: "📋 Grupos" }, { id: "elim", label: "🏆 Eliminatórias" }, { id: "usuarios", label: "👥 Usuários" }].map(m => (
          <button key={m.id} onClick={() => setAdminModo(m.id)}
            style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${adminModo === m.id ? "#16a34a" : "#e5e7eb"}`, background: adminModo === m.id ? "#f0fdf4" : "#fff", color: adminModo === m.id ? "#16a34a" : "#374151", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
            {m.label}
          </button>
        ))}
      </div>

      {adminModo === "resultados" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {Object.keys(GRUPOS).map(g => <button key={g} className={`gtab ${grupoAtivo === g ? "on" : "off"}`} onClick={() => setGrupoAtivo(g)}>{g}</button>)}
          </div>
          <div style={{ marginBottom: 10, padding: "6px 10px", background: "rgba(255,255,255,.03)", borderRadius: 7, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {GRUPOS[grupoAtivo].map(t => <span key={t} style={{ fontSize: 10, color: "#6b7280" }}>{F[t]} {t}</span>)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {JOGOS_GRUPO.filter((j: Jogo) => j.g === grupoAtivo).map((j: Jogo) => {
              const r = res[j.id] || {};
              const temRes = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
              return (
                <div key={j.id} className="card" style={{ padding: "12px", border: `1.5px solid ${temRes ? "#86efac" : "#e5e7eb"}` }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>
                    📍 {j.est} · {fmtD(j.dt)} {fmtH(j.dt)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 26 }}>{F[j.time1] || "🏳️"}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{j.time1 || "A definir"}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 8px", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input type="number" min={0} max={30} className={`si r${temRes ? " f" : ""}`} value={r.gols1 ?? ""} onChange={e => {/* setResAdmin */ }} placeholder="—" />
                        <span style={{ color: "#d1d5db", fontSize: 14 }}>×</span>
                        <input type="number" min={0} max={30} className={`si r${temRes ? " f" : ""}`} value={r.gols2 ?? ""} onChange={e => {/* setResAdmin */ }} placeholder="—" />
                      </div>
                    </div>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 26 }}>{F[j.time2] || "🏳️"}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{j.time2 || "A definir"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, padding: "9px 13px", background: "rgba(74,222,128,.04)", border: "1px solid rgba(74,222,128,.12)", borderRadius: 9, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#6b7280" }}>{Object.entries(res).filter(([, r]) => r.gols1 !== "" && r.gols1 !== undefined).length}/{JOGOS_GRUPO.length} resultados</span>            <span className="badge bgr">☁ Supabase</span>
          </div>
        </div>
      )}

      {adminModo === "elim" && (
        <div>
          <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
            {["16avos", "oitavas", "quartas", "semi", "final"].map(f => <button key={f} className={`ftab ${faseAtiva === f ? "on" : "off"}`} onClick={() => setFaseAtiva(f)}>{FASE_L[f]}</button>)}          </div>
          {faseAtiva === "final" && (
            <div className="card" style={{ marginBottom: 10, border: "1px solid rgba(247,201,72,.2)" }}>
              <div style={{ fontWeight: 700, fontSize: 10, color: "#16a34a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🏆 Campeão Real da Copa</div>
              <select value={campR} onChange={e => atualizarCampR(e.target.value)}>
                <option value="">— Ainda não definido —</option>
                {TODOS_TIMES.map(t => <option key={t} value={t}>{F[t]} {t}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {elim.filter(j => j.fase === faseAtiva).map(j => (
              <div key={j.id}>
                <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>{j.label}</div>
                <div style={{ display: "flex", gap: 7, marginBottom: 6 }}>
                  <select style={{ flex: 1, fontSize: 12, padding: "7px 10px" }} value={j.time1} onChange={e => updateElimT(j.id, "time1", e.target.value)}>
                    <option value="">— Time 1 —</option>
                    {TODOS_TIMES.map(t => <option key={t} value={t}>{F[t]} {t}</option>)}
                  </select>
                  <select style={{ flex: 1, fontSize: 12, padding: "7px 10px" }} value={j.time2} onChange={e => updateElimT(j.id, "time2", e.target.value)}>
                    <option value="">— Time 2 —</option>
                    {TODOS_TIMES.map(t => <option key={t} value={t}>{F[t]} {t}</option>)}
                  </select>
                </div>
                {j.time1 && j.time2 && (
                  <div className="card" style={{ padding: "12px", border: `1.5px solid ${(resE[j.id]?.gols1 !== undefined && resE[j.id]?.gols1 !== "" && resE[j.id]?.gols2 !== undefined && resE[j.id]?.gols2 !== "") ? "#86efac" : "#e5e7eb"}` }}>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>
                      📍 {j.est || ""} · {fmtD(j.dt)} {fmtH(j.dt)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: 26 }}>{F[j.time1] || "🏳️"}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{j.time1}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 8px", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input type="number" min={0} max={30} className="si r" value={resE[j.id]?.gols1 ?? ""} onChange={e => {/* setResEAdmin */ }} placeholder="—" />
                          <span style={{ color: "#d1d5db", fontSize: 14 }}>×</span>
                          <input type="number" min={0} max={30} className="si r" value={resE[j.id]?.gols2 ?? ""} onChange={e => {/* setResEAdmin */ }} placeholder="—" />
                        </div>
                        {j.fase !== "grupos" && (
                          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280", cursor: "pointer" }}>
                            <input type="checkbox" checked={resE[j.id]?.penalti || false} onChange={e => {/* setResEAdmin */ }} style={{ width: 14, height: 14 }} /> Pênalti
                          </label>
                        )}
                      </div>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: 26 }}>{F[j.time2] || "🏳️"}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{j.time2}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {adminModo === "usuarios" && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{nPart} participantes</div>
              <button onClick={() => {
                const pagos = Object.entries(usuarios).filter(([, u]: any) => u.pago).map(([n]: any) => n);
                const pendentes = Object.entries(usuarios).filter(([, u]: any) => !u.pago).map(([n]: any) => n);
                const txt = "💰 BOLÃO COPA 2026 — Pagamentos\n\n✅ Pagos (" + pagos.length + "):\n" + (pagos.map((n: string) => "• " + n).join("\n") || "Nenhum") + "\n\n⚠️ Pendentes (" + pendentes.length + "):\n" + (pendentes.map((n: string) => "• " + n).join("\n") || "Nenhum");
                navigator.clipboard.writeText(txt);
                mostrarToast("✅ Lista copiada para o WhatsApp!");
              }} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #86efac", background: "#dcfce7", color: "#166534", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                📋 Copiar lista
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>
              Pagos: <span style={{ color: "#16a34a", fontWeight: 700 }}>R$ {nPagos * CONFIG.valorCota}</span> · Pendente: <span style={{ color: "#b91c1c", fontWeight: 700 }}>R$ {(nPart - nPagos) * CONFIG.valorCota}</span>
            </div>
            {nPart > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 6, borderRadius: 3, background: "#f3f4f6", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#16a34a,#4ade80)", width: `${Math.round(nPagos / nPart * 100)}%`, transition: "width .5s" }} />
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, textAlign: "right" }}>{nPagos}/{nPart} pagos ({nPart > 0 ? Math.round(nPagos / nPart * 100) : 0}%)</div>
              </div>
            )}
          </div>
          {nPart === 0 && <div className="card" style={{ textAlign: "center", color: "#9ca3af", padding: "36px" }}>Nenhum participante ainda</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(usuarios).map(([nome, u]: any) => {
              const pos = ranking.findIndex(r => r.nome === nome);
              const isReset = resetNome === nome;
              return (
                <div key={nome} className="card" style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 16, width: 26, textAlign: "center", flexShrink: 0 }}>{pos >= 0 ? MEDAL[pos] || `${pos + 1}º` : "—"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{nome}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                        {u.email || ""} · 🏆 {u.camp ? `${F[u.camp] || ""} ${u.camp}` : "Sem campeão"}
                        {pos >= 0 && ` · ${ranking[pos]?.pontos || 0}pts`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setResetNome(isReset ? null : nome)}
                        style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", cursor: "pointer", fontWeight: 700, fontSize: 12, background: "#f9fafb", color: "#374151" }}>🔑</button>
                      <button onClick={() => togglePago(nome)}
                        style={{
                          padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12,
                          background: u.pago ? "#dcfce7" : "#fee2e2", color: u.pago ? "#166534" : "#b91c1c",
                          border: u.pago ? "1.5px solid #86efac" : "1.5px solid #fecaca"
                        }}>
                        {u.pago ? "✅ Pago" : "⚠ Pendente"}
                      </button>
                    </div>
                  </div>
                  {isReset && (
                    <div style={{ marginTop: 10, padding: "10px 14px", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontSize: 12, color: "#92400e" }}>Enviar email de reset para <strong>{u.email || "—"}</strong>?</div>
                      <button onClick={() => resetarSenha(nome, u.email || "")} style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>Enviar</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}