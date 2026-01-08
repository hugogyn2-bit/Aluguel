import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function parseBirthDateBR(value: string): Date | null {
  const v = value.trim();
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (d.getUTCFullYear() !== yyyy || d.getUTCMonth() !== mm - 1 || d.getUTCDate() !== dd) return null;
  return d;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as any;
    if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim() || null;
    const birthDateStr = String(body.birthDate ?? "").trim();

    if (!email || !password || password.length < 6 || !birthDateStr) {
      return NextResponse.json({ error: "Preencha os campos corretamente." }, { status: 400 });
    }

    const birth = parseBirthDateBR(birthDateStr);
    if (!birth) return NextResponse.json({ error: "Data inválida (DD/MM/AAAA)." }, { status: 400 });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    await prisma.user.create({
      data: {
        email,
        name: name ?? undefined,
        passwordHash,
        role: "OWNER",
        birthDate: birth,
        trialEndsAt,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
