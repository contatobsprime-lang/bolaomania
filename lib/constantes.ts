export const CONFIG = {
  valorCota: 10,
  bonusCampeao: 20,
  minutesBloqueio: 30,
  bloqueioCompetidor: "2026-07-04T18:00:00",
  premios: { 1: 0.40, 2: 0.25, 3: 0.15, 4: 0.12, 5: 0.08 } as Record<number, number>,
  pontos: {
    grupos:  { vencedor: 2,  placar: 5  },
    oitavas: { vencedor: 3,  placar: 8  },
    quartas: { vencedor: 5,  placar: 12 },
    semi:    { vencedor: 7,  placar: 15 },
    final:   { vencedor: 10, placar: 20 },
  } as Record<string, { vencedor: number; placar: number }>,
};

export const ADMIN_EMAIL = "contatobsprime@gmail.com";

export const GRUPOS: Record<string, string[]> = {
  A: ["México", "Coreia do Sul", "República Tcheca", "África do Sul"],
  B: ["Canadá", "Suíça", "Catar", "Bósnia"],
  C: ["Brasil", "Marrocos", "Escócia", "Haiti"],
  D: ["Estados Unidos", "Austrália", "Paraguai", "Turquia"],
  E: ["Alemanha", "Equador", "Costa do Marfim", "Curaçao"],
  F: ["Países Baixos", "Japão", "Tunísia", "Suécia"],
  G: ["Bélgica", "Irã", "Egito", "Nova Zelândia"],
  H: ["Espanha", "Uruguai", "Arábia Saudita", "Cabo Verde"],
  I: ["França", "Senegal", "Noruega", "Iraque"],
  J: ["Argentina", "Áustria", "Argélia", "Jordânia"],
  K: ["Portugal", "Colômbia", "Uzbequistão", "RD Congo"],
  L: ["Inglaterra", "Croácia", "Panamá", "Gana"],
};

export const TODOS_TIMES = Object.values(GRUPOS).flat();

export const F: Record<string, string> = {
  México: "🇲🇽", "Coreia do Sul": "🇰🇷", "República Tcheca": "🇨🇿", "África do Sul": "🇿🇦",
  Canadá: "🇨🇦", Suíça: "🇨🇭", Catar: "🇶🇦", Bósnia: "🇧🇦",
  Brasil: "🇧🇷", Marrocos: "🇲🇦", Escócia: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", Haiti: "🇭🇹",
  "Estados Unidos": "🇺🇸", Austrália: "🇦🇺", Paraguai: "🇵🇾", Turquia: "🇹🇷",
  Alemanha: "🇩🇪", Equador: "🇪🇨", "Costa do Marfim": "🇨🇮", "Curaçao": "🇨🇼",
  "Países Baixos": "🇳🇱", Japão: "🇯🇵", Tunísia: "🇹🇳", Suécia: "🇸🇪",
  Bélgica: "🇧🇪", Irã: "🇮🇷", Egito: "🇪🇬", "Nova Zelândia": "🇳🇿",
  Espanha: "🇪🇸", Uruguai: "🇺🇾", "Arábia Saudita": "🇸🇦", "Cabo Verde": "🇨🇻",
  França: "🇫🇷", Senegal: "🇸🇳", Noruega: "🇳🇴", Iraque: "🇮🇶",
  Argentina: "🇦🇷", Áustria: "🇦🇹", Argélia: "🇩🇿", Jordânia: "🇯🇴",
  Portugal: "🇵🇹", Colômbia: "🇨🇴", Uzbequistão: "🇺🇿", "RD Congo": "🇨🇩",
  Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Croácia: "🇭🇷", Panamá: "🇵🇦", Gana: "🇬🇭",
};

export const MEDAL = ["🥇", "🥈", "🥉", "4º", "5º"];

export const FASE_L: Record<string, string> = {
  grupos:  "Grupos",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semi:    "Semifinal",
  final:   "Final",
};

export const ELIM_TMPL = [
  ...Array.from({ length: 16 }, (_, i) => ({ id: 100 + i, fase: "oitavas", label: `Oitavas ${i + 1}`,   time1: "", time2: "", dt: "2026-07-04T18:00:00", est: "A definir",          cid: "A definir" })),
  ...Array.from({ length: 8  }, (_, i) => ({ id: 200 + i, fase: "quartas", label: `Quartas ${i + 1}`,   time1: "", time2: "", dt: "2026-07-10T18:00:00", est: "A definir",          cid: "A definir" })),
  ...Array.from({ length: 4  }, (_, i) => ({ id: 300 + i, fase: "semi",    label: `Semifinal ${i + 1}`, time1: "", time2: "", dt: "2026-07-14T16:00:00", est: "A definir",          cid: "A definir" })),
  { id: 400, fase: "final", label: "Final",    time1: "", time2: "", dt: "2026-07-19T16:00:00", est: "MetLife Stadium",   cid: "Nova York/NJ" },
  { id: 401, fase: "final", label: "3º Lugar", time1: "", time2: "", dt: "2026-07-18T17:00:00", est: "Hard Rock Stadium", cid: "Miami"        },
];