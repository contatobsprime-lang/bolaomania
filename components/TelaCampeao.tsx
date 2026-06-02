"use client";

import { CONFIG } from "@/lib/constantes";
import { campLock, tr } from "@/lib/utils";

interface Props {
  campAtual: string;
  setCamp: (c: string) => void;
  usuarios: Record<string, { pago: boolean; camp: string }>;
  TODOS_TIMES: string[];
  F: Record<string, string>;
}

export default function TelaCampeao({ campAtual, setCamp, usuarios, TODOS_TIMES, F }: Props) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16, color: "#111827" }}>🏆 Palpite de Campeão</div>
      <div className="card" style={{ marginBottom: 14, border: "1.5px solid #fde68a", background: "#fefce8" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#854d0e", marginBottom: 6 }}>Bônus +{CONFIG.bonusCampeao} pontos</div>
        <div style={{ fontSize: 13, color: "#92400e", marginBottom: 14 }}>{campLock() ? <span>🔒 Palpite encerrado</span> : <span>{tr(CONFIG.bloqueioCompetidor)} para fechar</span>}</div>
        <select value={campAtual} onChange={e => setCamp(e.target.value)} disabled={campLock()}>
          <option value="">— Selecione o campeão —</option>
          {TODOS_TIMES.map(t => <option key={t} value={t}>{F[t]} {t}</option>)}
        </select>
        {campAtual && <div style={{ marginTop: 12, padding: "10px 14px", background: "#fff", borderRadius: 10, fontSize: 14 }}>Seu palpite: <strong style={{ color: "#16a34a" }}>{F[campAtual]} {campAtual}</strong></div>}
      </div>
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12 }}>Palpites do grupo</div>
        {Object.entries(usuarios).map(([nome, u]: any) => (
          <div key={nome} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ flex: 1, fontSize: 14, color: "#374151", fontWeight: 500 }}>{nome}</span>
            <span style={{ fontSize: 14 }}>{u.camp ? `${F[u.camp] || ""} ${u.camp}` : <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>}</span>
          </div>
        ))}
      </div>
    </div>
  );
}