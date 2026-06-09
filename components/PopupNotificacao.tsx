// components/PopupNotificacao.tsx

import { fmtD, fmtH } from "@/lib/utils";

interface Props {
  popupJogo: any;
  setPopupJogo: (jogo: any) => void;
  setJogoSel: (jogo: any) => void;
  F: Record<string, string>;
}

export default function PopupNotificacao({ popupJogo, setPopupJogo, setJogoSel, F }: Props) {
  if (!popupJogo) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn .3s ease-out",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 32,
          textAlign: "center",
          maxWidth: 380,
          boxShadow: "0 20px 60px rgba(0,0,0,.3)",
          animation: "slideUp .3s ease-out",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>

        <div
          style={{
            fontWeight: 800,
            fontSize: 18,
            marginBottom: 12,
            color: "#111827",
          }}
        >
          {F[popupJogo.time1] || "🏳️"} {popupJogo.time1}
          <span style={{ margin: "0 10px", color: "#d1d5db" }}>×</span>
          {popupJogo.time2} {F[popupJogo.time2] || "🏳️"}
        </div>

        <div
          style={{
            fontSize: 14,
            color: "#6b7280",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Começa em 30 minutos!
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#9ca3af",
            marginBottom: 24,
          }}
        >
          {popupJogo.est} · {fmtD(popupJogo.dt)} {fmtH(popupJogo.dt)}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexDirection: "column",
          }}
        >
          <button
            onClick={() => {
              setJogoSel(popupJogo);
              setPopupJogo(null);
            }}
            style={{
              padding: "14px",
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              transition: "all .2s",
              boxShadow: "0 4px 12px rgba(22,163,74,.3)",
              fontFamily: "'Inter',sans-serif",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(22,163,74,.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(22,163,74,.3)";
            }}
          >
            ✅ Fazer Palpite Agora
          </button>

          <button
            onClick={() => setPopupJogo(null)}
            style={{
              padding: "14px",
              background: "#f3f4f6",
              color: "#374151",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all .2s",
              fontFamily: "'Inter',sans-serif",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e5e7eb";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
            }}
          >
            Fechar
          </button>
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            marginTop: 16,
            fontStyle: "italic",
          }}
        >
          Fecha automaticamente em 15 segundos
        </div>
      </div>
    </div>
  );
}