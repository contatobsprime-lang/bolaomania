"use client";

import { useState } from "react";
import type { Jogo, HistRodada, DetJogo } from "@/lib/types";
import { calcTudo } from "@/lib/calculos";
import { ShopeeAffiliateBanner } from "@/components/ShopeeAffiliateBanner";

interface Props {
  jogosGrupo: any[];
  palS: Record<number, { gols1: string; gols2: string }>;
  elim: Jogo[];
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  resE: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  campAtual: string;
  campR: string;
  F: Record<string, string>;
}

export default function TelaHistorico({ palS, elim, res, resE, campAtual, campR, F, jogosGrupo }: Props) {
  const [histRodada, setHistRodada] = useState<HistRodada>("todas");

  const dados = calcTudo(palS, elim, res, resE, campAtual, campR, jogosGrupo);
  let comRes = dados.det.filter((d: DetJogo) => d.res);
  if (histRodada !== "todas") comRes = comRes.filter((d: DetJogo) => d.r === histRodada);

  if (comRes.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 10, color: "#111827" }}>📊 Meu Histórico</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["todas", 1, 2, 3] as const).map(r => <button key={r} className={`gtab ${histRodada === r ? "on" : "off"}`} onClick={() => setHistRodada(r)}>{r === "todas" ? "Todas" : `Rodada ${r}`}</button>)}
          </div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>Nenhum jogo encerrado nesta rodada</div>
      </div>
    );
  }

  const ac = comRes.filter((d: DetJogo) => d.tipo === "placar" || d.tipo === "vencedor").length;
  const pct = comRes.length > 0 ? Math.round(ac / comRes.length * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 10, color: "#111827" }}>📊 Meu Histórico</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["todas", 1, 2, 3] as const).map(r => <button key={r} className={`gtab ${histRodada === r ? "on" : "off"}`} onClick={() => setHistRodada(r)}>{r === "todas" ? "Todas" : `Rodada ${r}`}</button>)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[["🎯", comRes.filter((d: DetJogo) => d.tipo === "placar").length, "Exatos", "#16a34a"], ["✅", comRes.filter((d: DetJogo) => d.tipo === "vencedor").length, "Acertos", "#2563eb"], ["❌", comRes.filter((d: DetJogo) => d.tipo === "erro" || d.tipo === "sem_palpite").length, "Erros", "#b91c1c"], ["📊", `${pct}%`, "Taxa", "#16a34a"]].map(([ic, v, lb, cor]: any) => (
          <div key={lb} className="card" style={{ flex: "1 1 60px", textAlign: "center", padding: "12px 6px" }}>
            <div style={{ fontSize: 18 }}>{ic}</div><div style={{ fontWeight: 800, fontSize: 18, color: cor }}>{v}</div><div style={{ fontSize: 10, color: "#9ca3af" }}>{lb}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {comRes.map((d: DetJogo) => {
          const cor = d.tipo === "placar" ? "#16a34a" : d.tipo === "vencedor" ? "#2563eb" : "#b91c1c";
          const ic = d.tipo === "placar" ? "🎯" : d.tipo === "vencedor" ? "✅" : d.tipo === "sem_palpite" ? "—" : "❌";
          return (
            <div key={d.id} className="card" style={{ padding: "14px 16px", borderLeft: `4px solid ${cor}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 16, flexShrink: 0 }}>{ic}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{F[d.time1] || ""} {d.time1} × {d.time2} {F[d.time2] || ""}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>Resultado: <strong style={{ color: "#374151" }}>{d.res?.gols1}×{d.res?.gols2}</strong>{d.res?.penalti ? " (pên.)" : ""} · Palpite: <strong style={{ color: cor }}>{d.pal ? `${d.pal.gols1}×${d.pal.gols2}` : "—"}</strong></div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: cor, flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>{d.pts > 0 ? `+${d.pts}` : d.tipo === "sem_palpite" ? "—" : "0"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}