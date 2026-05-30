import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) return NextResponse.json({ ok: true });

    const token = process.env.MP_ACCESS_TOKEN!;

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const payment = await mpRes.json();

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    const usuarioNome = payment.external_reference;
    if (!usuarioNome) return NextResponse.json({ ok: true });

    await supabase
      .from("usuarios")
      .update({ pago: true })
      .eq("nome", usuarioNome);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook erro:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}