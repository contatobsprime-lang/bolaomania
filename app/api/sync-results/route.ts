import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NOMES: Record<string, string> = {
  "Mexico": "México",
  "South Korea": "Coreia do Sul",
  "Czechia": "República Tcheca",
  "South Africa": "África do Sul",
  "Canada": "Canadá",
  "Switzerland": "Suíça",
  "Qatar": "Catar",
  "Bosnia-Herzegovina": "Bósnia",
  "Brazil": "Brasil",
  "Morocco": "Marrocos",
  "Scotland": "Escócia",
  "Haiti": "Haiti",
  "United States": "Estados Unidos",
  "Australia": "Austrália",
  "Paraguay": "Paraguai",
  "Turkey": "Turquia",
  "Germany": "Alemanha",
  "Ecuador": "Equador",
  "Ivory Coast": "Costa do Marfim",
  "Curaçao": "Curaçao",
  "Netherlands": "Países Baixos",
  "Japan": "Japão",
  "Tunisia": "Tunísia",
  "Sweden": "Suécia",
  "Belgium": "Bélgica",
  "Iran": "Irã",
  "Egypt": "Egito",
  "New Zealand": "Nova Zelândia",
  "Spain": "Espanha",
  "Uruguay": "Uruguai",
  "Saudi Arabia": "Arábia Saudita",
  "Cape Verde Islands": "Cabo Verde",
  "France": "França",
  "Senegal": "Senegal",
  "Norway": "Noruega",
  "Iraq": "Iraque",
  "Argentina": "Argentina",
  "Austria": "Áustria",
  "Algeria": "Argélia",
  "Jordan": "Jordânia",
  "Portugal": "Portugal",
  "Colombia": "Colômbia",
  "Uzbekistan": "Uzbequistão",
  "Congo DR": "RD Congo",
  "England": "Inglaterra",
  "Croatia": "Croácia",
  "Panama": "Panamá",
  "Ghana": "Gana",
};

// Jogos do bolão: ID → [time1, time2]
const JOGOS_BOLAO: Record<number, [string, string]> = {
  1: ["México","África do Sul"],
  2: ["Coreia do Sul","República Tcheca"],
  3: ["Canadá","Bósnia"],
  4: ["Catar","Suíça"],
  5: ["Brasil","Marrocos"],
  6: ["Haiti","Escócia"],
  7: ["Estados Unidos","Paraguai"],
  8: ["Austrália","Turquia"],
  9: ["Alemanha","Curaçao"],
  10: ["Costa do Marfim","Equador"],
  11: ["Países Baixos","Japão"],
  12: ["Suécia","Tunísia"],
  13: ["Bélgica","Egito"],
  14: ["Irã","Nova Zelândia"],
  15: ["Espanha","Cabo Verde"],
  16: ["Arábia Saudita","Uruguai"],
  17: ["França","Senegal"],
  18: ["Iraque","Noruega"],
  19: ["Argentina","Argélia"],
  20: ["Áustria","Jordânia"],
  21: ["Portugal","RD Congo"],
  22: ["Uzbequistão","Colômbia"],
  23: ["Inglaterra","Croácia"],
  24: ["Gana","Panamá"],
  25: ["África do Sul","República Tcheca"],
  26: ["México","Coreia do Sul"],
  27: ["Suíça","Bósnia"],
  28: ["Canadá","Catar"],
  29: ["Escócia","Marrocos"],
  30: ["Brasil","Haiti"],
  31: ["Turquia","Paraguai"],
  32: ["Estados Unidos","Austrália"],
  33: ["Alemanha","Costa do Marfim"],
  34: ["Equador","Curaçao"],
  35: ["Países Baixos","Suécia"],
  36: ["Tunísia","Japão"],
  37: ["Bélgica","Irã"],
  38: ["Nova Zelândia","Egito"],
  39: ["Espanha","Arábia Saudita"],
  40: ["Uruguai","Cabo Verde"],
  41: ["França","Iraque"],
  42: ["Noruega","Senegal"],
  43: ["Argentina","Áustria"],
  44: ["Jordânia","Argélia"],
  45: ["Portugal","Uzbequistão"],
  46: ["Colômbia","RD Congo"],
  47: ["Inglaterra","Gana"],
  48: ["Panamá","Croácia"],
  49: ["República Tcheca","México"],
  50: ["África do Sul","Coreia do Sul"],
  51: ["Suíça","Canadá"],
  52: ["Bósnia","Catar"],
  53: ["Escócia","Brasil"],
  54: ["Marrocos","Haiti"],
  55: ["Turquia","Estados Unidos"],
  56: ["Paraguai","Austrália"],
  57: ["Equador","Alemanha"],
  58: ["Curaçao","Costa do Marfim"],
  59: ["Japão","Suécia"],
  60: ["Tunísia","Países Baixos"],
  61: ["Egito","Irã"],
  62: ["Nova Zelândia","Bélgica"],
  63: ["Cabo Verde","Arábia Saudita"],
  64: ["Uruguai","Espanha"],
  65: ["Noruega","França"],
  66: ["Senegal","Iraque"],
  67: ["Argélia","Áustria"],
  68: ["Jordânia","Argentina"],
  69: ["Colômbia","Portugal"],
  70: ["RD Congo","Uzbequistão"],
  71: ["Panamá","Inglaterra"],
  72: ["Croácia","Gana"],
};

export async function GET() {
  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      { headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY! },
        next: { revalidate: 0 } }
    );

    const data = await res.json();
    const matches = data.matches || [];

    const finalizados = matches.filter(
      (m: any) => m.status === "FINISHED" && m.score.fullTime.home !== null
    );

    if (finalizados.length === 0) {
      return NextResponse.json({ ok: true, sincronizados: 0, msg: "Nenhum jogo finalizado ainda" });
    }

    let sincronizados = 0;

    for (const match of finalizados) {
      const t1 = NOMES[match.homeTeam.name] || match.homeTeam.name;
      const t2 = NOMES[match.awayTeam.name] || match.awayTeam.name;
      const gols1 = match.score.fullTime.home;
      const gols2 = match.score.fullTime.away;

      // Encontra o ID do jogo no bolão pelo par de times
      const jogoId = Object.entries(JOGOS_BOLAO).find(
        ([, [a, b]]) => a === t1 && b === t2
      )?.[0];

      if (!jogoId) {
        console.warn(`Jogo não encontrado no bolão: ${t1} × ${t2}`);
        continue;
      }

      const { error } = await supabase
        .from("resultados")
        .upsert(
          { jogo_id: parseInt(jogoId), gols1, gols2, penalti: false },
          { onConflict: "jogo_id" }
        );

      if (!error) sincronizados++;
    }

    return NextResponse.json({ ok: true, sincronizados, total: finalizados.length });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ ok: false, error: "Erro ao sincronizar" }, { status: 500 });
  }
}