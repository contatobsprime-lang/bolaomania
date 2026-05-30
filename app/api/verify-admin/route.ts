import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { senha } = await req.json();

  const senhaCorreta = process.env.ADMIN_SENHA;

  if (!senhaCorreta) {
    return NextResponse.json({ error: "Admin não configurado" }, { status: 500 });
  }

  if (senha === senhaCorreta) {
    return NextResponse.json({ ok: true });
  } else {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}