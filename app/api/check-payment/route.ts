import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const nome = req.nextUrl.searchParams.get("nome");
  if (!nome) return NextResponse.json({ pago: false });

  const { data } = await supabase
    .from("usuarios")
    .select("pago")
    .eq("nome", nome)
    .single();

  return NextResponse.json({ pago: data?.pago ?? false });
}