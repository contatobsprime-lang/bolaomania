import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { nome } = await req.json();

    if (!nome) {
      return NextResponse.json(
        { error: "Nome obrigatório" },
        { status: 400 }
      );
    }

    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "MP_ACCESS_TOKEN não configurado" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              title: `Bolão Copa 2026 - ${nome}`,
              quantity: 1,
              currency_id: "BRL",
              unit_price: 10,
            },
          ],
          back_urls: {
            success: process.env.NEXT_PUBLIC_SITE_URL,
            pending: process.env.NEXT_PUBLIC_SITE_URL,
            failure: process.env.NEXT_PUBLIC_SITE_URL,
          },
          auto_return: "approved",
        }),
      }
    );

    const data = await response.json();

    console.log("Status MP:", response.status);
    console.log("Resposta MP:", JSON.stringify(data));

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Erro Mercado Pago",
          details: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.init_point,
    });
  } catch (error) {
    console.error("Erro create-payment:", error);

    return NextResponse.json(
      {
        error: "Erro interno",
      },
      { status: 500 }
    );
  }
}