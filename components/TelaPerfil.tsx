"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Jogo, RankingEntry } from "@/lib/types";
import { calcBadges } from "@/lib/calculos";
import { ShopeeAffiliateBanner } from "@/components/ShopeeAffiliateBanner";


// Paleta de cores disponíveis para o avatar — sem rosa
export const AVATAR_CORES = [
  { hex: "#2563eb", label: "Azul" },
  { hex: "#7c3aed", label: "Roxo" },
  { hex: "#0891b2", label: "Ciano" },
  { hex: "#16a34a", label: "Verde" },
  { hex: "#15803d", label: "Verde escuro" },
  { hex: "#d97706", label: "Âmbar" },
  { hex: "#ea580c", label: "Laranja" },
  { hex: "#dc2626", label: "Vermelho" },
  { hex: "#374151", label: "Grafite" },
  { hex: "#111827", label: "Preto" },
];

// Mesma lógica do TelaHome — cor padrão por hash do nome
export function avatarColorPadrao(nome: string): string {
  const cores = AVATAR_CORES.map(c => c.hex);
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return cores[Math.abs(hash) % cores.length];
}

interface Props {
  usuarioAtual: string | null;
  emailAtual: string | null;
  pago: boolean;
  meusDados: any;
  minhaPos: number;
  ranking: RankingEntry[];
  palpitesMap: Record<string, Record<number, { gols1: string; gols2: string }>>;
  elim: Jogo[];
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  resE: Record<number, { gols1: string; gols2: string; penalti?: boolean }>;
  // Cor salva do avatar (vem do App.tsx via usuarios[nome].avatarCor)
  avatarCor?: string;
  onAvatarCorChange?: (cor: string) => void;
}

export default function TelaPerfil({
  usuarioAtual, emailAtual, pago, meusDados, minhaPos,
  ranking, palpitesMap, elim, res, resE,
  avatarCor, onAvatarCorChange,
}: Props) {
  const badges = calcBadges(usuarioAtual || "", ranking, palpitesMap, elim, res, resE);
  const [salvandoCor, setSalvandoCor] = useState(false);
  const [editandoCor, setEditandoCor] = useState(false);

  const corAtual = avatarCor || avatarColorPadrao(usuarioAtual || "?");

  async function handleEscolherCor(hex: string) {
    if (!usuarioAtual || salvandoCor) return;
    setSalvandoCor(true);
    await supabase.from("usuarios").update({ avatar_cor: hex }).eq("nome", usuarioAtual);
    onAvatarCorChange?.(hex);
    setSalvandoCor(false);
    setEditandoCor(false);
  }

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 20, color: "#111827" }}>
        <i className="ti ti-user" style={{ fontSize: 20, marginRight: 8 }} aria-hidden="true" />
        Meu Perfil
      </div>

      {/* Hero do perfil */}
      <div style={{
        background: `linear-gradient(135deg, ${corAtual}, ${corAtual}cc)`,
        borderRadius: 20, padding: "24px", marginBottom: 16,
        color: "#fff", display: "flex", alignItems: "center", gap: 16,
        position: "relative",
      }}>
        {/* Avatar clicável */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 64, height: 64, background: "rgba(255,255,255,.2)",
            borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 24, fontWeight: 800,
            letterSpacing: -1, border: "2px solid rgba(255,255,255,0.4)",
            cursor: "pointer",
          }}
            onClick={() => setEditandoCor(v => !v)}
          >
            {(usuarioAtual || "?").slice(0, 2).toUpperCase()}
          </div>
          {/* Botão editar cor */}
          <div
            onClick={() => setEditandoCor(v => !v)}
            style={{
              position: "absolute", bottom: -2, right: -2,
              width: 20, height: 20, borderRadius: "50%",
              background: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            <i className="ti ti-pencil" style={{ fontSize: 11, color: "#374151" }} aria-hidden="true" />
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{usuarioAtual}</div>
          <div style={{ fontSize: 12, opacity: .8 }}>{emailAtual}</div>
          <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>
            {pago
              ? <><i className="ti ti-circle-check" style={{ fontSize: 13, marginRight: 4 }} />Pagamento confirmado</>
              : <><i className="ti ti-alert-circle" style={{ fontSize: 13, marginRight: 4 }} />Pagamento pendente</>
            }
          </div>
        </div>
      </div>

      {/* Paleta de cores — expande ao clicar no avatar */}
      {editandoCor && (
        <div className="card" style={{ padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 10 }}>
            Escolha a cor do seu avatar
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {AVATAR_CORES.map(c => (
              <button
                key={c.hex}
                title={c.label}
                onClick={() => handleEscolherCor(c.hex)}
                disabled={salvandoCor}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: c.hex, border: "none", cursor: "pointer",
                  outline: corAtual === c.hex ? `3px solid ${c.hex}` : "none",
                  outlineOffset: 2,
                  boxShadow: corAtual === c.hex ? "0 0 0 2px #fff, 0 0 0 4px " + c.hex : "none",
                  transform: corAtual === c.hex ? "scale(1.15)" : "scale(1)",
                  transition: "transform .15s, box-shadow .15s",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
            Toque no avatar para fechar
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          { icon: "ti-star", v: meusDados?.pontos ?? 0,   lb: "Pontos"  },
          { icon: "ti-target", v: meusDados?.placares ?? 0, lb: "Exatos"  },
          { icon: "ti-check", v: meusDados?.acertos ?? 0,  lb: "Acertos" },
          { icon: "ti-chart-bar", v: minhaPos > 0 ? `${minhaPos}º` : "—", lb: "Posição" },
        ].map(s => (
          <div key={s.lb} className="card" style={{ flex: 1, textAlign: "center", padding: "12px 6px" }}>
            <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: "#16a34a" }} aria-hidden="true" />
            <div style={{ fontWeight: 800, fontSize: 18, color: "#16a34a", marginTop: 4 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{s.lb}</div>
          </div>
        ))}
      </div>

      {/* Conquistas */}
      {badges.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 10 }}>
            <i className="ti ti-medal" style={{ fontSize: 15, marginRight: 6 }} aria-hidden="true" />
            Conquistas
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {badges.map(b => (
              <div key={b} style={{
                padding: "8px 14px", background: "#f0fdf4",
                border: "1.5px solid #86efac", borderRadius: 12,
                fontSize: 13, fontWeight: 700, color: "#166534",
              }}>
                {b}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}