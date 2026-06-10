import { CONFIG } from "@/lib/constantes";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";
import type { Jogo, RankingEntry, DetJogo } from "@/lib/types";

// ─── Pontos por fase ─────────────────────────────────────────────────────────

export function pts(fase: string) {
  return CONFIG.pontos[fase as keyof typeof CONFIG.pontos] ?? CONFIG.pontos.grupos;
}

// ─── Cálculo de um jogo ──────────────────────────────────────────────────────

export function calcJogo(
  pg1: number, pg2: number,
  rg1: number, rg2: number,
  fase: string,
  pen: boolean
): { pts: number; tipo: "placar" | "vencedor" | "erro" } {
  const vR = rg1 > rg2 ? 1 : rg1 < rg2 ? -1 : 0;
  const vP = pg1 > pg2 ? 1 : pg1 < pg2 ? -1 : 0;
  const p = pts(fase);

  if (fase === "grupos") {
    if (pg1 === rg1 && pg2 === rg2) return { pts: p.placar, tipo: "placar" };
    if (vR === vP) return { pts: p.vencedor, tipo: "vencedor" };
    return { pts: 0, tipo: "erro" };
  }

  // eliminatórias
  if (pen) {
    if (vP === vR && vR !== 0) return { pts: p.vencedor, tipo: "vencedor" };
    return { pts: 0, tipo: "erro" };
  }
  if (pg1 === rg1 && pg2 === rg2) return { pts: p.placar, tipo: "placar" };
  if (vR === vP) return { pts: p.vencedor, tipo: "vencedor" };
  return { pts: 0, tipo: "erro" };
}

// ─── Cálculo total de um participante ────────────────────────────────────────

export function calcTudo(
  pals: Record<number, { gols1: string; gols2: string }>,
  elim: Jogo[],
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>,
  resE: Record<number, { gols1: string; gols2: string; penalti?: boolean }>,
  camp: string,
  campR: string
) {
  let pontos = 0, acertos = 0, placares = 0;
  const det: DetJogo[] = [];

  [...JOGOS_GRUPO, ...elim].forEach(j => {
    const r = j.g ? res[j.id] : resE[j.id];
    const p = pals[j.id];

    if (!r || r.gols1 === "" || r.gols1 === undefined || r.gols2 === "" || r.gols2 === undefined) return;
    if (!p || p.gols1 === "" || p.gols1 === undefined || p.gols2 === "" || p.gols2 === undefined) {
      det.push({ ...j, res: r, pal: null, tipo: "sem_palpite", pts: 0 });
      return;
    }

    const rg1 = parseInt(r.gols1), rg2 = parseInt(r.gols2);
    const pg1 = parseInt(p.gols1), pg2 = parseInt(p.gols2);
    if (isNaN(rg1) || isNaN(rg2) || isNaN(pg1) || isNaN(pg2)) return;

    const { pts: pt, tipo } = calcJogo(pg1, pg2, rg1, rg2, j.fase ?? "grupos", r.penalti ?? false);
    pontos += pt;
    if (tipo === "placar" || tipo === "vencedor") acertos++;
    if (tipo === "placar") placares++;
    det.push({ ...j, res: r, pal: p, tipo, pts: pt });
  });

  const bonusCampeao = campR && camp && camp === campR ? CONFIG.bonusCampeao : 0;
  pontos += bonusCampeao;

  return { pontos, acertos, placares, bonusCampeao, det };
}

// ─── Premiação ───────────────────────────────────────────────────────────────

export function calcPremios(n: number) {
  const total = n * CONFIG.valorCota;
  const comissao = Math.floor(total * (CONFIG.comissao ?? 0));
  const totalPremios = total - comissao;
  return {
    total,
    comissao,
    totalPremios,
    dist: Object.entries(CONFIG.premios).map(([pos, pct]) => ({
      pos: parseInt(pos),
      pct,
      valor: Math.floor(total * pct),
    })),
  };
}

// ─── Desempate ───────────────────────────────────────────────────────────────

export function desempate(a: RankingEntry, b: RankingEntry): number {
  if (b.pontos !== a.pontos) return b.pontos - a.pontos;
  if (b.placares !== a.placares) return b.placares - a.placares;
  if (b.acertos !== a.acertos) return b.acertos - a.acertos;
  const bCamp = b.campeao && b.campeao === b.campR ? 1 : 0;
  const aCamp = a.campeao && a.campeao === a.campR ? 1 : 0;
  return bCamp - aCamp;
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export function calcBadges(
  nome: string,
  ranking: RankingEntry[],
  palpitesMap: Record<string, Record<number, { gols1: string; gols2: string }>>,
  elim: Jogo[],
  res: Record<number, { gols1: string; gols2: string; penalti?: boolean }>,
  resE: Record<number, { gols1: string; gols2: string; penalti?: boolean }>
): string[] {
  const badges: string[] = [];
  const pals = palpitesMap[nome] ?? {};

  const fases: { label: string; jogos: Jogo[]; isElim: boolean }[] = [
    { label: "R1",      jogos: JOGOS_GRUPO.filter(j => j.r === 1),    isElim: false },
    { label: "R2",      jogos: JOGOS_GRUPO.filter(j => j.r === 2),    isElim: false },
    { label: "R3",      jogos: JOGOS_GRUPO.filter(j => j.r === 3),    isElim: false },
    { label: "16avos",  jogos: elim.filter(j => j.fase === "16avos"), isElim: true  },
    { label: "Oitavas", jogos: elim.filter(j => j.fase === "oitavas"),isElim: true  },
    { label: "Quartas", jogos: elim.filter(j => j.fase === "quartas"),isElim: true  },
    { label: "Semi",    jogos: elim.filter(j => j.fase === "semi"),   isElim: true  },
    { label: "Final",   jogos: elim.filter(j => j.fase === "final"),  isElim: true  },
  ];

  fases.forEach(({ label, jogos, isElim }) => {
    if (jogos.length === 0) return;
    let maxPts = 0, craque = "";
    ranking.forEach(p => {
      const palpites = palpitesMap[p.nome] ?? {};
      let total = 0;
      jogos.forEach(j => {
        const r = isElim ? resE[j.id] : res[j.id];
        const pal = palpites[j.id];
        if (!r || !pal || r.gols1 === "" || pal.gols1 === "") return;
        const { pts: pt } = calcJogo(parseInt(pal.gols1), parseInt(pal.gols2), parseInt(r.gols1), parseInt(r.gols2), j.fase ?? "grupos", r.penalti ?? false);
        total += pt;
      });
      if (total > maxPts) { maxPts = total; craque = p.nome; }
    });
    if (craque === nome && maxPts > 0) badges.push(`🏆 Craque ${label}`);
  });

  // ─── Vidente — 3 placares exatos consecutivos ─────────────────────────────

  let seq = 0;
  [...JOGOS_GRUPO]
    .sort((a, b) => new Date(a.dt).getTime() - new Date(b.dt).getTime())
    .forEach(j => {
      const r = res[j.id];
      const pal = pals[j.id];
      if (!r || !pal || r.gols1 === "" || pal.gols1 === "") { seq = 0; return; }
      const { tipo } = calcJogo(parseInt(pal.gols1), parseInt(pal.gols2), parseInt(r.gols1), parseInt(r.gols2), "grupos", false);
      if (tipo === "placar") {
        seq++;
        if (seq >= 3 && !badges.includes("🔮 Vidente")) badges.push("🔮 Vidente");
      } else {
        seq = 0;
      }
    });

  // ─── Fiel — palpitou em todos os jogos de grupo ───────────────────────────

  const palpitados = JOGOS_GRUPO.filter(j => {
    const p = pals[j.id];
    return p && p.gols1 !== "" && p.gols2 !== "";
  }).length;
  if (palpitados === JOGOS_GRUPO.length) badges.push("⚽ Fiel");

  return badges;
}