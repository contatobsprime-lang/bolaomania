import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  return NextResponse.json({ ok: true, msg: "Push API ativa" });
}
export async function POST(request: NextRequest) {
  try {
    const { title, body, tag } = await request.json();

    // Busca todas as subscriptions
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("subscription");

    if (!subs || subs.length === 0) {
      return NextResponse.json({ ok: true, enviados: 0 });
    }

    // Envia para todos
    const payload = JSON.stringify({ title, body, tag });
    let enviados = 0;

    await Promise.allSettled(
      subs.map(async (row) => {
        try {
          await webpush.sendNotification(row.subscription, payload);
          enviados++;
        } catch (e) {
          console.error("Erro ao enviar push:", e);
        }
      })
    );

    return NextResponse.json({ ok: true, enviados });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}