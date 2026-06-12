"use client";
import { ShopeeAffiliateBanner } from "@/components/ShopeeAffiliateBanner";

interface Feed {
  id: string;
  msg: string;
  ts: string;
}

interface Props {
  feed: Feed[];
}

export default function TelaFeed({ feed }: Props) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16, color: "#111827" }}>💬 Feed de Atividade</div>
      {feed.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
          <div>Nenhuma atividade ainda</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>As ações do grupo aparecerão aqui</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {feed.map(f => (
            <div key={f.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "#f0fdf4", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚽</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "#374151" }}>{f.msg}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{f.ts}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
