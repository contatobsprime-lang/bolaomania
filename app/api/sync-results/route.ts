import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FD_BASE = "https://api.football-data.org/v4";
const FD_KEY = process.env.API_FOOTBALL_KEY!;

// ─── Mapeamento de nomes para português ──────────────────────────────────────

const NOMES: Record<string, string> = {
  "Mexico": "México", "South Korea": "Coreia do Sul", "Czech Republic": "República Tcheca",
  "Czechia": "República Tcheca", "South Africa": "África do Sul", "Canada": "Canadá",
  "Switzerland": "Suíça", "Qatar": "Catar", "Bosnia-Herzegovina": "Bósnia",
  "Bosnia and Herzegovina": "Bósnia", "Brazil": "Brasil", "Morocco": "Marrocos",
  "Scotland": "Escócia", "Haiti": "Haiti", "United States": "Estados Unidos",
  "USA": "Estados Unidos", "Australia": "Austrália", "Paraguay": "Paraguai",
  "Turkey": "Turquia", "Germany": "Alemanha", "Ecuador": "Equador",
  "Ivory Coast": "Costa do Marfim", "Cote d'Ivoire": "Costa do Marfim", "Curaçao": "Curaçao",
  "Netherlands": "Países Baixos", "Japan": "Japão", "Tunisia": "Tunísia",
  "Sweden": "Suécia", "Belgium": "Bélgica", "Iran": "Irã", "Egypt": "Egito",
  "New Zealand": "Nova Zelândia", "Spain": "Espanha", "Uruguay": "Uruguai",
  "Saudi Arabia": "Arábia Saudita", "Cape Verde": "Cabo Verde", "France": "França",
  "Senegal": "Senegal", "Norway": "Noruega", "Iraq": "Iraque", "Argentina": "Argentina",
  "Austria": "Áustria", "Algeria": "Argélia", "Jordan": "Jordânia", "Portugal": "Portugal",
  "Colombia": "Colômbia", "Uzbekistan": "Uzbequistão", "DR Congo": "RD Congo",
  "England": "Inglaterra", "Croatia": "Croácia", "Panama": "Panamá", "Ghana": "Gana",
  "Korea Republic": "Coreia do Sul",
};

// ─── Mapeamento de stage para fase do bolão ───────────────────────────────────

const STAGE_FASE: Record<string, string> = {
  "LAST_32": "16avos",
  "LAST_16": "oitavas",
  "QUARTER_FINALS": "quartas",
  "SEMI_FINALS": "semi",
  "FINAL": "final",
};

const STAGE_LABEL: Record<string, string> = {
  "LAST_32": "16avos",
  "LAST_16": "Oitavas",
  "QUARTER_FINALS": "Quartas",
  "SEMI_FINALS": "Semi",
  "FINAL": "Final",
};

// ─── Mapeamento de jogos de grupo ─────────────────────────────────────────────

const JOGOS_BOLAO: Record<string, number> = {
  "México-África do Sul": 1, "Coreia do Sul-República Tcheca": 2,
  "Canadá-Bósnia": 3, "Catar-Suíça": 4, "Brasil-Marrocos": 5,
  "Haiti-Escócia": 6, "Estados Unidos-Paraguai": 7, "Austrália-Turquia": 8,
  "Alemanha-Curaçao": 9, "Costa do Marfim-Equador": 10, "Países Baixos-Japão": 11,
  "Suécia-Tunísia": 12, "Bélgica-Egito": 13, "Irã-Nova Zelândia": 14,
  "Espanha-Cabo Verde": 15, "Arábia Saudita-Uruguai": 16, "França-Senegal": 17,
  "Iraque-Noruega": 18, "Argentina-Argélia": 19, "Áustria-Jordânia": 20,
  "Portugal-RD Congo": 21, "Uzbequistão-Colômbia": 22, "Inglaterra-Croácia": 23,
  "Gana-Panamá": 24, "África do Sul-República Tcheca": 25, "México-Coreia do Sul": 26,
  "Suíça-Bósnia": 27, "Canadá-Catar": 28, "Escócia-Marrocos": 29,
  "Brasil-Haiti": 30, "Turquia-Paraguai": 31, "Estados Unidos-Austrália": 32,
  "Alemanha-Costa do Marfim": 33, "Equador-Curaçao": 34, "Países Baixos-Suécia": 35,
  "Tunísia-Japão": 36, "Bélgica-Irã": 37, "Nova Zelândia-Egito": 38,
  "Espanha-Arábia Saudita": 39, "Uruguai-Cabo Verde": 40, "França-Iraque": 41,
  "Noruega-Senegal": 42, "Argentina-Áustria": 43, "Jordânia-Argélia": 44,
  "Portugal-Uzbequistão": 45, "Colômbia-RD Congo": 46, "Inglaterra-Gana": 47,
  "Panamá-Croácia": 48, "República Tcheca-México": 49, "África do Sul-Coreia do Sul": 50,
  "Suíça-Canadá": 51, "Bósnia-Catar": 52, "Escócia-Brasil": 53,
  "Marrocos-Haiti": 54, "Turquia-Estados Unidos": 55, "Paraguai-Austrália": 56,
  "Equador-Alemanha": 57, "Curaçao-Costa do Marfim": 58, "Japão-Suécia": 59,
  "Tunísia-Países Baixos": 60, "Egito-Irã": 61, "Nova Zelândia-Bélgica": 62,
  "Cabo Verde-Arábia Saudita": 63, "Uruguai-Espanha": 64, "Noruega-França": 65,
  "Senegal-Iraque": 66, "Argélia-Áustria": 67, "Jordânia-Argentina": 68,
  "Colômbia-Portugal": 69, "RD Congo-Uzbequistão": 70, "Panamá-Inglaterra": 71,
  "Croácia-Gana": 72,
};

function nomePT(nome: string | null): string {
  if (!nome) return "";
  return NOMES[nome] || nome;
}

async function fetchFD(path: string) {
  const resp = await fetch(`${FD_BASE}${path}`, {
    headers: { "X-Auth-Token": FD_KEY },
    next: { revalidate: 0 },
  });
  if (!resp.ok) throw new Error(`football-data error: ${resp.status} ${await resp.text()}`);
  return resp.json();
}

export async function GET() {
  try {
    if (!FD_KEY) return NextResponse.json({ error: "API_FOOTBALL_KEY não configurada" }, { status: 500 });

    let sincronizados = 0;
    const erros: string[] = [];

    // ─── 1. Jogos de grupo finalizados ───────────────────────────────────────

    const grupoData = await fetchFD("/competitions/WC/matches?season=2026&stage=GROUP_STAGE&status=FINISHED");
    const grupoMatches = grupoData.matches || [];

    for (const m of grupoMatches) {
      const home = nomePT(m.homeTeam?.name);
      const away = nomePT(m.awayTeam?.name);
      const gols1 = m.score?.fullTime?.home;
      const gols2 = m.score?.fullTime?.away;

      if (gols1 === null || gols1 === undefined || gols2 === null || gols2 === undefined) continue;

      const chave = `${home}-${away}`;
      const jogoId = JOGOS_BOLAO[chave];

      if (!jogoId) {
        erros.push(`Jogo de grupo não encontrado: ${chave}`);
        continue;
      }

      const { error } = await supabase
        .from("resultados")
        .upsert({ jogo_id: jogoId, gols1, gols2, penalti: false }, { onConflict: "jogo_id" });

      if (!error) sincronizados++;
      else erros.push(`Grupo ${chave}: ${error.message}`);
    }

    // ─── 2. Jogos eliminatórios ───────────────────────────────────────────────

    const stages = ["LAST_32", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "FINAL"];

    for (const stage of stages) {
      const elimData = await fetchFD(`/competitions/WC/matches?season=2026&stage=${stage}`);
      const matches = elimData.matches || [];

      for (const m of matches) {
        const home = nomePT(m.homeTeam?.name);
        const away = nomePT(m.awayTeam?.name);
        const fase = STAGE_FASE[stage];
        const label = STAGE_LABEL[stage];
        const dataHora = m.utcDate;
        const apiId = m.id;

        // Upsert do jogo (times podem ainda ser null antes da fase de grupos acabar)
        const { error: upsertErr } = await supabase
          .from("eliminatorias")
          .upsert(
            {
              id: apiId,
              fase,
              label,
              time1: home || null,
              time2: away || null,
              data_hora: dataHora,
              gols1: null,
              gols2: null,
              penalti: false,
            },
            { onConflict: "id", ignoreDuplicates: false }
          );

        if (upsertErr) {
          erros.push(`Upsert elim ${home}×${away} (${fase}): ${upsertErr.message}`);
          continue;
        }

        // Atualiza resultado se jogo finalizado
        if (m.status === "FINISHED") {
          const gols1 = m.score?.fullTime?.home;
          const gols2 = m.score?.fullTime?.away;
          const penHome = m.score?.penalties?.home;
          const penAway = m.score?.penalties?.away;
          const penalti = penHome !== null && penHome !== undefined;

          if (gols1 !== null && gols1 !== undefined && gols2 !== null && gols2 !== undefined) {
            const { error: resErr } = await supabase
              .from("eliminatorias")
              .update({ gols1, gols2, penalti, time1: home, time2: away })
              .eq("id", apiId);

            if (!resErr) sincronizados++;
            else erros.push(`Resultado elim ${home}×${away}: ${resErr.message}`);
          }
        }
      }
    }

    // ─── 3. Campeão ──────────────────────────────────────────────────────────

    const finalData = await fetchFD("/competitions/WC/matches?season=2026&stage=FINAL&status=FINISHED");
    const finalMatch = finalData.matches?.[0];

    if (finalMatch) {
      const gols1 = finalMatch.score?.fullTime?.home;
      const gols2 = finalMatch.score?.fullTime?.away;
      const penHome = finalMatch.score?.penalties?.home;
      const penAway = finalMatch.score?.penalties?.away;

      let campeao = "";
      if (penHome !== null && penHome !== undefined) {
        campeao = penHome > penAway
          ? nomePT(finalMatch.homeTeam?.name)
          : nomePT(finalMatch.awayTeam?.name);
      } else if (gols1 !== null && gols2 !== null) {
        campeao = gols1 > gols2
          ? nomePT(finalMatch.homeTeam?.name)
          : nomePT(finalMatch.awayTeam?.name);
      }

      if (campeao) {
        await supabase
          .from("config")
          .upsert({ chave: "campeao_real", valor: campeao }, { onConflict: "chave" });
      }
    }

    return NextResponse.json({ ok: true, sincronizados, erros });

  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}