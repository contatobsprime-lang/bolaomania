import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const { error } = await supabase
      .from("jogos_grupo")
      .insert(JOGOS_GRUPO);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inseridos: JOGOS_GRUPO.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}