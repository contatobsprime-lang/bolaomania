"use client";

import PixQRCode from "./PixQRCode";
import { CONFIG } from "@/lib/constantes";

interface Props {
  pago: boolean;
  usuarioAtual: string | null;
  emailAtual: string | null;
  onPago: () => void;
}

export default function TelaPix({ pago, usuarioAtual, emailAtual, onPago }: Props) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>PAGAMENTO</div>
        <div style={{ fontWeight: 800, fontSize: 20, color: "#111827" }}>Cota de Entrada</div>
      </div>
      {pago ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", border: "1.5px solid #86efac", background: "#f0fdf4" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#16a34a", marginBottom: 6 }}>Pagamento confirmado!</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Você está dentro do bolão. Boa sorte! 🍀</div>
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 40, color: "#16a34a" }}>R$ {CONFIG.valorCota},00</div>
            <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 4 }}>Valor da cota</div>
          </div>
          <PixQRCode
            usuarioNome={usuarioAtual || ""}
            emailAtual={emailAtual}
            onPago={onPago}
          />
        </>
      )}
    </div>
  );
}