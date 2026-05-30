import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { nome, email } = await req.json();
  if (!nome) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "Token MP não configurado" }, { status: 500 });

  try {
    const resp = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Idempotency-Key": `bolao-${nome}-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: 10,
        description: `Cota Bolão Copa 2026 — ${nome}`,
        payment_method_id: "pix",
        external_reference: nome,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mp-webhook`,
        payer: {
          email: email || "pagador@bolaomania.com",
          first_name: nome,
        },
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("MP error:", JSON.stringify(data));
      return NextResponse.json({ error: data.message || "Erro ao gerar Pix" }, { status: 500 });
    }

    const qr = data.point_of_interaction?.transaction_data;

    return NextResponse.json({
      qrCode: qr?.qr_code,
      qrCodeBase64: qr?.qr_code_base64,
      ticketUrl: qr?.ticket_url,
      paymentId: data.id,
    });
  } catch (err) {
    console.error("MP fetch error:", err);
    return NextResponse.json({ error: "Erro ao conectar MP" }, { status: 500 });
  }
}