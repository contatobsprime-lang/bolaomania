// ─── Jogo ────────────────────────────────────────────────────────────────────

export interface Jogo {
  id: number;
  g?: string;       // grupo (A-L), ausente nas eliminatórias
  r?: number;       // rodada (1-3), ausente nas eliminatórias
  fase: string;     // "grupos" | "oitavas" | "quartas" | "semi" | "final"
  label?: string;   // ex: "Oitavas 1", presente nas eliminatórias
  time1: string;
  time2: string;
  dt: string;       // ISO 8601
  est: string;      // estádio
  cid: string;      // cidade
}

// ─── Palpite / Resultado ─────────────────────────────────────────────────────

export interface Palpite {
  gols1: string;
  gols2: string;
}

export interface Resultado extends Palpite {
  penalti?: boolean;
}

// ─── Usuário ─────────────────────────────────────────────────────────────────

export interface Usuario {
  pago: boolean;
  camp: string;
  email?: string;
}

// ─── Ranking ─────────────────────────────────────────────────────────────────

export interface DetJogo extends Jogo {
  res: Resultado | null;
  pal: Palpite | null;
  tipo: "placar" | "vencedor" | "erro" | "sem_palpite";
  pts: number;
}

export interface RankingEntry {
  nome: string;
  pontos: number;
  acertos: number;
  placares: number;
  bonusCampeao: number;
  det: DetJogo[];
  campeao: string;
  campR: string;
  pago: boolean;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export type ToastTipo = "ok" | "err";

export type Modo =
  | "home" | "jogos" | "palpites" | "ranking"
  | "historico" | "pix" | "perfil" | "campeao"
  | "regras" | "feed";

export type StatusFiltro = "proximos" | "aovivo" | "terminados";
export type HistRodada = number | "todas";