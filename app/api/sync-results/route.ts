import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ID da Copa do Mundo 2026 na API-Football
const LEAGUE_ID = 1; // FIFA World Cup
const SEASON = 2026;

const NOMES: Record<string, string> = {
  "Mexico": "México", "South Korea": "Coreia do Sul", "Czech Republic": "República Tcheca",
  "Czechia": "República Tcheca", "South Africa": "África do Sul", "Canada": "Canadá",
  "Switzerland": "Suíça", "Qatar": "Catar", "Bosnia": "Bósnia",
  "Bosnia and Herzegovina": "Bósnia", "Brazil": "Brasil", "Morocco": "Marrocos",
  "Scotland": "Escócia", "Haiti": "Haiti", "United States": "Estados Unidos",
  "USA": "Estados Unidos", "Australia": "Austrália", "Paraguay": "Paraguai",
  "Turkey": "Turquia", "Germany": "Alemanha", "Ecuador": "Equador",
  "Ivory Coast": "Costa do Marfim", "Cote d'Ivoire": "Costa do Marfim", "Curacao": "Curaçao",
  "Netherlands": "Países Baixos", "Japan": "Japão", "Tunisia": "Tunísia",
  "Sweden": "Suécia", "Belgium": "Bélgica", "Iran": "Irã", "Egypt": "Egito",
  "New Zealand": "Nova Zelândia", "Spain": "Espanha", "Uruguay": "Uruguai",
  "Saudi Arabia": "Arábia Saudita", "Cape Verde": "Cabo Verde", "France": "França",
  "Senegal": "Senegal", "Norway": "Noruega", "Iraq": "Iraque", "Argentina": "Argentina",
  "Austria": "Áustria", "Algeria": "Argélia", "Jordan": "Jordânia", "Portugal": "Portugal",
  "Colombia": "Colômbia", "Uzbekistan": "Uzbequistão", "DR Congo": "RD Congo",
  "England": "Inglaterra", "Croatia": "Croácia", "Panama": "Panamá", "Ghana": "Gana",
};

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

function nomePT(nome: string): string {
  return NOMES[nome] || nome;
}

export async function GET() {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) return NextResponse.json({ error: "API_FOOTBALL_KEY não configurada" }, { status: 500 });

    // Busca todos os jogos finalizados da Copa 2026
    const resp = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${LEAGUE_ID}&season=${SEASON}&status=FT`,
      {
        headers: {
          "x-apisports-key": apiKey,
          "x-rapidapi-key": apiKey,
        },
        next: { revalidate: 0 },
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: `API error: ${err}` }, { status: 500 });
    }

    const data = await resp.json();
    const fixtures = data.response || [];

    if (fixtures.length === 0) {
      return NextResponse.json({ ok: true, sincronizados: 0, msg: "Nenhum jogo finalizado ainda" });
    }

    let sincronizados = 0;
    let erros: string[] = [];

    for (const fixture of fixtures) {
      const homeRaw = fixture.teams?.home?.name;
      const awayRaw = fixture.teams?.away?.name;
      const gols1 = fixture.goals?.home;
      const gols2 = fixture.goals?.away;
      const round: string = fixture.league?.round || "";

      if (gols1 === null || gols1 === undefined || gols2 === null || gols2 === undefined) continue;

      const home = nomePT(homeRaw);
      const away = nomePT(awayRaw);

      // Verifica pênaltis
      const penHome = fixture.score?.penalty?.home;
      const penAway = fixture.score?.penalty?.away;
      const penalti = penHome !== null && penHome !== undefined;

      // Fase grupos — busca pelo par de times
      const chave = `${home}-${away}`;
      const jogoId = JOGOS_BOLAO[chave];

      if (jogoId) {
        // Jogo de grupos
        const { error } = await supabase
          .from("resultados")
          .upsert({ jogo_id: jogoId, gols1, gols2, penalti: false }, { onConflict: "jogo_id" });
        if (!error) sincronizados++;
        else erros.push(`Grupo ${chave}: ${error.message}`);
      } else {
        // Fase eliminatória — busca na tabela eliminatorias pelo par de times
        const { data: elim } = await supabase
          .from("eliminatorias")
          .select("jogo_id")
          .eq("time1", home)
          .eq("time2", away)
          .single();

        if (elim) {
          const { error } = await supabase
            .from("eliminatorias")
            .update({ gols1, gols2, penalti })
            .eq("jogo_id", elim.jogo_id);
          if (!error) sincronizados++;
          else erros.push(`Elim ${chave}: ${error.message}`);
        } else {
          // Tenta inserir os times nas eliminatorias se ainda não estão lá
          // Detecta fase pelo round
          let fase = "oitavas";
          if (round.toLowerCase().includes("quarter")) fase = "quartas";
          else if (round.toLowerCase().includes("semi")) fase = "semi";
          else if (round.toLowerCase().includes("final") && !round.toLowerCase().includes("semi")) fase = "final";

          erros.push(`Time não encontrado em eliminatorias: ${home} × ${away} (${fase})`);
        }
      }
    }

    // Atualiza campeão automaticamente se a final terminou
    const finalFixture = fixtures.find((f: any) => {
      const round = f.league?.round?.toLowerCase() || "";
      return round.includes("final") && !round.includes("semi") && !round.includes("3rd");
    });

    if (finalFixture) {
      const gols1 = finalFixture.goals?.home;
      const gols2 = finalFixture.goals?.away;
      const penHome = finalFixture.score?.penalty?.home;
      const penAway = finalFixture.score?.penalty?.away;

      let campeao = "";
      if (penHome !== null && penHome !== undefined) {
        campeao = penHome > penAway ? nomePT(finalFixture.teams.home.name) : nomePT(finalFixture.teams.away.name);
      } else {
        campeao = gols1 > gols2 ? nomePT(finalFixture.teams.home.name) : nomePT(finalFixture.teams.away.name);
      }

      if (campeao) {
        await supabase.from("config").upsert({ chave: "campeao_real", valor: campeao }, { onConflict: "chave" });
      }
    }

    return NextResponse.json({ ok: true, sincronizados, total: fixtures.length, erros });

  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}