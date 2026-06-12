"use client";

import { useState, useEffect, useCallback } from "react";

const N8N_BANNER_URL = "https://flowwebhook.bsprime.com.br/webhook/shopee-banner";
const N8N_CLICK_URL = "https://flowwebhook.bsprime.com.br/webhook/shopee-click";

interface Produto {
  id: string;
  titulo: string;
  preco: string;
  imagem: string;
  link: string;
}

interface ShopeeAffiliateBannerProps {
  tela: "home" | "jogos" | "palpites" | "ranking" | "historico" | "mais";
}

function BannerSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid #fde2d8", borderRadius: 12, margin: "12px 0", background: "#fff" }}>
      <div style={{ width: 52, height: 52, borderRadius: 8, background: "#f5f5f5" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ width: "35%", height: 9, borderRadius: 4, background: "#f5f5f5" }} />
        <div style={{ width: "75%", height: 12, borderRadius: 4, background: "#f0f0f0" }} />
        <div style={{ width: "30%", height: 11, borderRadius: 4, background: "#fde2d8" }} />
      </div>
    </div>
  );
}

function ShopeeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#EE4D2D" />
      <text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">S</text>
    </svg>
  );
}

export function ShopeeAffiliateBanner({ tela }: ShopeeAffiliateBannerProps) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const buscarProduto = useCallback(async () => {
    setLoading(true);
    setErro(false);
    try {
      const res = await fetch(`${N8N_BANNER_URL}?tela=${tela}`, {
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      if (data.success && data.produto) {
        setProduto(data.produto);
      } else {
        setProduto(null);
      }
    } catch {
      setErro(true);
    } finally {
      setLoading(false);
    }
  }, [tela]);

  useEffect(() => { buscarProduto(); }, [buscarProduto]);

  const handleClick = async () => {
    if (!produto) return;
    try {
      await fetch(`${N8N_CLICK_URL}?id=${produto.id}&tela=${tela}`);
    } catch { }
    window.open(produto.link, "_blank");
  };

  if (loading) return <BannerSkeleton />;
  if (erro || !produto) return null;

  return (
    <div style={{ margin: "12px 0" }}>
      <a
      href={produto.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "block", textDecoration: "none" }}
      aria-label={`Ver oferta: ${produto.titulo} na Shopee`}
      onClick={handleClick}
      >
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#fff", border: "1px solid #fde2d8", borderRadius: 12, cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
        onMouseOver={e => (e.currentTarget.style.background = "#fff8f6")}
        onMouseOut={e => (e.currentTarget.style.background = "#fff")}
      >
        <div style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f0f0f0" }}>
          {produto.imagem
            ? <img src={produto.imagem} alt={produto.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <ShopeeIcon />}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 10, color: "#bbb", lineHeight: 1.3 }}>Patrocinado · Shopee</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
            {produto.titulo}
          </span>
          {produto.preco && (
            <span style={{ fontSize: 13, color: "#EE4D2D", fontWeight: 700, lineHeight: 1.3 }}>
              {produto.preco}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#EE4D2D", fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap", background: "#fff1ee", padding: "5px 10px", borderRadius: 8, border: "1px solid #fde2d8" }}>
          Ver oferta
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M7 3l3 3-3 3" stroke="#EE4D2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </a>
    </div >
  );
}