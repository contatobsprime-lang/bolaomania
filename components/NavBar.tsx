"use client";

interface Props {
  modo: string;
  isAdmin: boolean;
  setModo: (m: string) => void;
}

export default function NavBar({ modo, isAdmin, setModo }: Props) {
  const mainItems = [
    { id: "home", icon: "ti ti-home", label: "Início" },
    { id: "jogos", icon: "ti ti-calendar-event", label: "Jogos" },
    { id: "palpites", icon: "ti ti-target", label: "Palpites" },
    { id: "ranking", icon: "ti ti-trophy", label: "Ranking" }
  ];

  const moreItems = ["pix", "perfil", "campeao", "regras", "historico", "feed", ...(isAdmin ? ["admin"] : []), "mais"];

  return (
    <nav className="bottomnav">
      {mainItems.map(item => (
        <button
          key={item.id}
          className={`navbtn${modo === item.id ? " active" : ""}`}
          onClick={() => setModo(item.id)}
        >
          <span className={`ni ${item.icon}`}></span>
          <span className="nl">{item.label}</span>
        </button>
      ))}

      <button
        className={`navbtn${moreItems.includes(modo) ? " active" : ""}`}
        onClick={() => setModo("mais")}
      >
        <span className="ni ti ti-menu-2"></span>
        <span className="nl">Mais</span>
      </button>
    </nav>
  );
}