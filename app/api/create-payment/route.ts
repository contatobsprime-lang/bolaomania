import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { nome } = await req.json();

  if (!nome) {
    return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Token MP não configurado" }, { status: 500 });
  }

  try {
    const resp = await fetch("https://api.mercadopago.com/v1/payment_links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: `Bolão Copa 2026 — ${nome}`,
        items: [{
          title: `Cota Bolão Copa 2026 — ${nome}`,
          quantity: 1,
          unit_price: 10,
          currency_id: "BRL",
        }],
        back_urls: {
          success: process.env.NEXT_PUBLIC_SITE_URL || "https://seu-site.vercel.app",
          pending: process.env.NEXT_PUBLIC_SITE_URL || "https://seu-site.vercel.app",
        },
        auto_return: "approved",
      }),
    });

    const data = await resp.json();

    if (data.init_point) {
      return NextResponse.json({ url: data.init_point });
    } else {
      console.error("MP error:", data);
      return NextResponse.json({ error: "Erro ao gerar link" }, { status: 500 });
    }
  } catch (err) {
    console.error("MP fetch error:", err);
    return NextResponse.json({ error: "Erro ao conectar MP" }, { status: 500 });
  }
}