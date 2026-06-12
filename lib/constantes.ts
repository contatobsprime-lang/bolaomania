export const CONFIG = {
  valorCota: 10,
  bonusCampeao: 20,
  minutesBloqueio: 30,
  bloqueioCompetidor: "2026-07-04T18:00:00",
  comissao: 0.10,
  premios: { 1: 0.36, 2: 0.22, 3: 0.14, 4: 0.10, 5: 0.08 } as Record<number, number>,
  pontos: {
    grupos:   { vencedor: 2, placar: 5 },
    "16avos": { vencedor: 3, placar: 6 },
    oitavas:  { vencedor: 3, placar: 8 },
    quartas:  { vencedor: 5, placar: 12 },
    semi:     { vencedor: 7, placar: 15 },
    final:    { vencedor: 10, placar: 20 },
  } as Record<string, { vencedor: number; placar: number }>,
};

export const ADMIN_EMAIL = "contatobsprime@gmail.com";

export const GRUPOS: Record<string, string[]> = {
  A: ["México", "Coreia do Sul", "República Tcheca", "África do Sul"],
  B: ["Canadá", "Suíça", "Catar", "Bósnia"],
  C: ["Brasil", "Marrocos", "Escócia", "Haiti"],
  D: ["Estados Unidos", "Austrália", "Paraguai", "Turquia"],
  E: ["Alemanha", "Equador", "Costa do Marfim", "Curaçao"],
  F: ["Holanda", "Japão", "Tunísia", "Suécia"],
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
  "Holanda": "🇳🇱", Japão: "🇯🇵", Tunísia: "🇹🇳", Suécia: "🇸🇪",
  Bélgica: "🇧🇪", Irã: "🇮🇷", Egito: "🇪🇬", "Nova Zelândia": "🇳🇿",
  Espanha: "🇪🇸", Uruguai: "🇺🇾", "Arábia Saudita": "🇸🇦", "Cabo Verde": "🇨🇻",
  França: "🇫🇷", Senegal: "🇸🇳", Noruega: "🇳🇴", Iraque: "🇮🇶",
  Argentina: "🇦🇷", Áustria: "🇦🇹", Argélia: "🇩🇿", Jordânia: "🇯🇴",
  Portugal: "🇵🇹", Colômbia: "🇨🇴", Uzbequistão: "🇺🇿", "RD Congo": "🇨🇩",
  Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Croácia: "🇭🇷", Panamá: "🇵🇦", Gana: "🇬🇭",
};

export const MEDAL = ["🥇", "🥈", "🥉", "4º", "5º"];

export const FASE_L: Record<string, string> = {
  grupos: "Grupos",
  "16avos": "16avos",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semi: "Semifinal",
  final: "Final",
};

export const ELIM_TMPL: any[] = [];