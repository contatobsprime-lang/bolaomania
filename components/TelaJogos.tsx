"use client";

import { useEffect } from "react";
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

function SeparadorSecao({ icone, label, cor }: { icone: React.ReactNode; label: string; cor: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 0", marginBottom: 6,
    }}>
      <span style={{ color: cor, fontSize: 13, display: "flex", alignItems: "center", gap: 5, fontWeight: 700 }}>
        {icone} {label}
      </span>
      <div style={{ flex: 1, height: 1, background: `${cor}33` }} />
    </div>
  );
}

export default function TelaJogos({
  statusF, setStatusF, rodada, setRodada,
  faseAtiva, setFaseAtiva, jogosFiltrados, jogosRodada,
  elim, res, resE, palS, palpitesMap, F, setJogoSel,
}: Props) {

  const [proximosAberto, setProximosAberto] = useState(false);
  const [encerradosAberto, setEncerradosAberto] = useState(false);
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
        return statusJ(j.dt, tR) === "live" || statusJ(j.dt, tR) === "wait";
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

  // Classifica jogos da rodada em seções
  const jogosRodadaAtual = faseAtiva === "grupos"
    ? JOGOS_GRUPO.filter(j => j.r === rodada)
    : elim.filter(j => j.fase === faseAtiva && j.time1);

  function getResultado(j: any) {
    return faseAtiva === "grupos" ? (res[j.id] || {}) : (resE[j.id] || {});
  }

  const jogosAoVivo = jogosRodadaAtual.filter(j => {
    const r = getResultado(j);
    const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
    return statusJ(j.dt, tR) === "live" || statusJ(j.dt, tR) === "wait";
  });

  const hoje = new Date().toDateString();
  const jogosHoje = jogosRodadaAtual.filter(j => {
    const r = getResultado(j);
    const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
    const st = statusJ(j.dt, tR);
    return st === "prox" && new Date(j.dt).toDateString() === hoje;
  });

  const jogosProximos = jogosRodadaAtual.filter(j => {
    const r = getResultado(j);
    const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
    const st = statusJ(j.dt, tR);
    return st === "prox" && new Date(j.dt).toDateString() !== hoje;
  });

  // Ordena próximos por data/hora
  const jogosProximosOrdenados = [...jogosProximos].sort((a, b) => 
    new Date(a.dt).getTime() - new Date(b.dt).getTime()
  );

  const jogosEncerrados = faseAtiva === "grupos"
    ? JOGOS_GRUPO.filter(j => {
        const r = res[j.id] || {};
        const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
        return statusJ(j.dt, tR) === "enc";
      })
    : elim.filter(j => {
        const r = resE[j.id] || {};
        const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
        return j.time1 && statusJ(j.dt, tR) === "enc";
      });

  // Exibe 6 se fechado, todos se aberto
  const proximosExibidos = proximosAberto ? jogosProximosOrdenados : jogosProximosOrdenados.slice(0, 6);
  const encerradosExibidos = encerradosAberto ? jogosEncerrados : jogosEncerrados.slice(0, 6);

  function CardJogo({ j, isElim = false }: { j: any; isElim?: boolean }) {
    const r = isElim ? (resE[j.id] || {}) : (res[j.id] || {});
    const tR = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
    const pJ = palS[j.id];
    const tP = pJ && pJ.gols1 !== "" && pJ.gols2 !== "";
    const lk = lock(j.dt);
    const st = statusJ(j.dt, tR);
    const fase = isElim ? (j.fase || "oitavas") : (j.fase || "grupos");
    let mT = "";
    if (tR && tP) {
      const { tipo } = calcJogo(
        parseInt(pJ.gols1), parseInt(pJ.gols2),
        parseInt(r.gols1), parseInt(r.gols2),
        fase, r.penalti || false
      );
      mT = tipo;
    }
    const { nAc, nPal } = tR ? calcAcertos(j.id, palpitesMap, r, fase) : { nAc: 0, nPal: 0 };
    const isLive = st === "live" || st === "wait";

    return (
      <div
        className="card"
        onClick={() => { if (!lk && !tR) setJogoSel(j); }}
        style={{
          padding: "14px",
          cursor: !lk && !tR ? "pointer" : "default",
          border: `1px solid ${isLive ? "#fca5a5" : mT === "placar" ? "#86efac" : mT === "vencedor" ? "#bfdbfe" : "#e5e7eb"}`,
          boxShadow: isLive ? "0 0 0 2px rgba(239,68,68,.15)" : undefined,
          animation: isLive ? "pulse 2s infinite" : undefined,
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", background: "#f3f4f6", padding: "3px 8px", borderRadius: 6 }}>
              {isElim ? j.label : `Grupo ${j.g}`}
            </span>
            <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
              <i className="ti ti-map-pin" /> {j.est}
            </span>
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {!lk && !tR && tP && <span className="badge bgr" style={{ fontSize: 9 }}><i className="ti ti-check" /> {pJ.gols1}×{pJ.gols2}</span>}
            {!lk && !tR && !tP && <span className="badge bg" style={{ fontSize: 9 }}>Palpitar</span>}
            {lk && !tR && <span className="badge br" style={{ fontSize: 9 }}><i className="ti ti-lock" /></span>}
            {isLive && <span className="badge bred" style={{ fontSize: 9 }}><i className="ti ti-broadcast" /> AO VIVO</span>}
          </div>
        </div>

        {/* TIMES */}
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

        {/* FOOTER */}
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
  }

  const isElim = faseAtiva !== "grupos";

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

      {/* BANNER */}
      <ShopeeAffiliateBanner tela="jogos" />

      {/* RODADAS — só na fase grupos */}
      {faseAtiva === "grupos" && (
        <div style={{ display: "flex", gap: 6, margin: "12px 0" }}>
          {[1, 2, 3].map((r) => (
            <button
              key={r}
              onClick={() => setRodada(r)}
              style={{
                flex: 1, padding: "6px",
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

      {/* LISTA DE JOGOS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>

        {/* AO VIVO */}
        {jogosAoVivo.length > 0 && (
          <>
            <SeparadorSecao
              icone={<i className="ti ti-broadcast" />}
              label="Ao Vivo"
              cor="#dc2626"
            />
            {jogosAoVivo.map(j => <CardJogo key={j.id} j={j} isElim={isElim} />)}
          </>
        )}

        {/* HOJE */}
        {jogosHoje.length > 0 && (
          <>
            <SeparadorSecao
              icone={<i className="ti ti-clock" />}
              label="Hoje"
              cor="#16a34a"
            />
            {jogosHoje.map(j => <CardJogo key={j.id} j={j} isElim={isElim} />)}
          </>
        )}

        {/* PRÓXIMOS — expansível */}
        {jogosProximosOrdenados.length > 0 && (
          <>
            <div
              onClick={() => setProximosAberto(a => !a)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 0", cursor: "pointer",
              }}
            >
              <span style={{ color: "#6b7280", fontSize: 13, display: "flex", alignItems: "center", gap: 5, fontWeight: 700 }}>
                <i className="ti ti-calendar" /> Próximos ({jogosProximosOrdenados.length})
              </span>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              <i className={`ti ti-chevron-${proximosAberto ? "up" : "down"}`} style={{ color: "#6b7280", fontSize: 13 }} />
            </div>
            {proximosExibidos.map(j => <CardJogo key={j.id} j={j} isElim={isElim} />)}
          </>
        )}

        {/* ENCERRADOS — expansível */}
        {jogosEncerrados.length > 0 && (
          <>
            <div
              onClick={() => setEncerradosAberto(a => !a)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 0", cursor: "pointer",
              }}
            >
              <span style={{ color: "#9ca3af", fontSize: 13, display: "flex", alignItems: "center", gap: 5, fontWeight: 700 }}>
                <i className="ti ti-check" /> Encerrados ({jogosEncerrados.length})
              </span>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              <i className={`ti ti-chevron-${encerradosAberto ? "up" : "down"}`} style={{ color: "#9ca3af", fontSize: 13 }} />
            </div>
            {encerradosExibidos.map(j => <CardJogo key={j.id} j={j} isElim={isElim} />)}
          </>
        )}

        {/* VAZIO */}
        {jogosAoVivo.length === 0 && jogosHoje.length === 0 && jogosProximosOrdenados.length === 0 && jogosEncerrados.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
            <i className="ti ti-calendar" style={{ fontSize: 28, marginBottom: 8, display: "block" }} />
            Nenhum jogo encontrado
          </div>
        )}

        {/* ELIMINATÓRIAS SEM TIMES */}
        {isElim && elim.filter(j => j.fase === faseAtiva && j.time1).length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "32px", color: "#d1d5db" }}>
            Fase ainda não definida
          </div>
        )}
      </div>
    </div>
  );
}