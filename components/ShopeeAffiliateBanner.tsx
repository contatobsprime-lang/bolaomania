import { useState, useEffect, useCallback } from "react";

const N8N_BANNER_URL = "https://flowwebhook.bsprime.com.br/webhook/shopee-banner";
const N8N_CLICK_URL  = "https://flowwebhook.bsprime.com.br/webhook/shopee-click";

interface Produto {
  id: string;
  titulo: string;
  preco: string;
  imagem: string;
  link: string;
}

interface ShopeeAffiliateBannerProps {
  tela: "home" | "jogos" | "palpites" | "ranking" | "mais";
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

  useEffect(() => {
    buscarProduto();
  }, [buscarProduto]);

  const handleClick = async () => {
    if (!produto) return;
    try {
      await fetch(`${N8N_CLICK_URL}?id=${produto.id}&tela=${tela}`);
    } catch {
      // silencioso — não bloqueia o clique
    }
    window.open(produto.link, "_blank");
  };

  if (loading) return <BannerSkeleton />;
  if (erro || !produto) return null;

  return (
    <a
      onClick={handleClick}
      href={produto.link}
      target="_blank"
      rel="noopener noreferrer"
      className="shopee-banner"
      aria-label={`Ver oferta: ${produto.titulo} na Shopee`}
    >
      <div className="shopee-banner__inner">
        <div className="shopee-banner__img-wrap">
          {produto.imagem ? (
            <img
              src={produto.imagem}
              alt={produto.titulo}
              className="shopee-banner__img"
            />
          ) : (
            <div className="shopee-banner__img-fallback">
              <ShopeeIcon />
            </div>
          )}
        </div>

        <div className="shopee-banner__content">
          <span className="shopee-banner__label">Patrocinado · Shopee</span>
          <span className="shopee-banner__titulo">{produto.titulo}</span>
          {produto.preco && (
            <span className="shopee-banner__preco">{produto.preco}</span>
          )}
        </div>

        <div className="shopee-banner__cta">
          <span>Ver oferta</span>
          <ArrowIcon />
        </div>
      </div>

      <style>{`
        .shopee-banner {
          display: block;
          text-decoration: none;
          margin: 8px 0;
        }
        .shopee-banner__inner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #fff;
          border: 0.5px solid #e5e5e5;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .shopee-banner__inner:active {
          background: #fef5f2;
        }
        .shopee-banner__img-wrap {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .shopee-banner__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .shopee-banner__img-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .shopee-banner__content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .shopee-banner__label {
          font-size: 11px;
          color: #999;
          line-height: 1.3;
        }
        .shopee-banner__titulo {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.4;
        }
        .shopee-banner__preco {
          font-size: 12px;
          color: #EE4D2D;
          font-weight: 500;
          line-height: 1.3;
        }
        .shopee-banner__cta {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          color: #EE4D2D;
          font-weight: 500;
          flex-shrink: 0;
          white-space: nowrap;
        }
      `}</style>
    </a>
  );
}

function BannerSkeleton() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      border: "0.5px solid #e5e5e5",
      borderRadius: 10,
      margin: "8px 0",
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f0f0f0" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ width: "40%", height: 10, borderRadius: 4, background: "#f0f0f0" }} />
        <div style={{ width: "70%", height: 12, borderRadius: 4, background: "#f0f0f0" }} />
      </div>
    </div>
  );
}

function ShopeeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#EE4D2D" />
      <text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">S</text>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6h8M7 3l3 3-3 3" stroke="#EE4D2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}