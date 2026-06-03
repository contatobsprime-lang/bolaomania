"use client";

interface Props {
  modo: string;
  isAdmin: boolean;
  setModo: (m: string) => void;
  setTela: (t: "login" | "cadastro" | "recuperar" | "admin" | "app") => void;
  handleLogout: () => void;
  mostrarToast: (msg: string, tipo?: "ok" | "err") => void;
}

export default function TelaMais({ modo, isAdmin, setModo, setTela, handleLogout, mostrarToast }: Props) {
  const opcoes = [
    { id: "pix", icon: "💳", label: "Pix" },
    { id: "perfil", icon: "👤", label: "Perfil" },
    { id: "campeao", icon: "🏆", label: "Campeão" },
    { id: "regras", icon: "📋", label: "Regras" },
    { id: "historico", icon: "📊", label: "Histórico" },
    { id: "feed", icon: "💬", label: "Feed" },
    ...(isAdmin ? [{ id: "admin", icon: "🔐", label: "Admin" }] : []),
    { id: "sair", icon: "↩️", label: "Sair" },
  ];

  const handleClick = (item: any) => {
    if (item.id === "sair") {
      handleLogout();
    } else if (item.id === "admin") {
      if (isAdmin) {
        setTela("admin");
      } else {
        mostrarToast("Acesso restrito", "err");
      }
    } else {
      setModo(item.id);
    }
  };

  return (
    <div style={{ padding: "20px 16px 36px" }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: "#111827", marginBottom: 20 }}>⋯ Mais opções</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {opcoes.map(item => (
          <button key={item.id} onClick={() => handleClick(item)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px 12px", background: modo === item.id ? "#f0fdf4" : "#f9fafb", border: `1.5px solid ${modo === item.id ? "#16a34a" : "#e5e7eb"}`, borderRadius: 16, cursor: "pointer", transition: "all .2s" }}>
            <span style={{ fontSize: 30 }}>{item.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: modo === item.id ? "#16a34a" : "#374151" }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}