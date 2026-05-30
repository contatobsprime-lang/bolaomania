import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { nome } = await req.json();
  if (!nome) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "Token MP não configurado" }, { status: 500 });

  try {
    const resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [{
          title: `Cota Bolão Copa 2026 — ${nome}`,
          quantity: 1,
          unit_price: 10,
          currency_id: "BRL",
        }],
        external_reference: nome,
        payment_methods: {
          excluded_payment_types: [
            { id: "credit_card" },
            { id: "debit_card" },
            { id: "ticket" },
            { id: "account_money" },
          ],
          default_payment_method_id: "pix",
        },
        back_urls: {
          success: process.env.NEXT_PUBLIC_SITE_URL || "https://bolao-copa-2026.vercel.app",
          pending: process.env.NEXT_PUBLIC_SITE_URL || "https://bolao-copa-2026.vercel.app",
          failure: process.env.NEXT_PUBLIC_SITE_URL || "https://bolao-copa-2026.vercel.app",
        },
        auto_return: "approved",
        statement_descriptor: "BOLAO COPA 2026",
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bolao-copa-2026.vercel.app"}/api/mp-webhook`,
      }),
    });

    const data = await resp.json();
    if (data.init_point) {
      return NextResponse.json({ url: data.init_point });
    }
    console.error("MP error:", JSON.stringify(data));
    return NextResponse.json({ error: data.message || "Erro ao gerar link" }, { status: 500 });
  } catch (err) {
    console.error("MP fetch error:", err);
    return NextResponse.json({ error: "Erro ao conectar MP" }, { status: 500 });
  }
}