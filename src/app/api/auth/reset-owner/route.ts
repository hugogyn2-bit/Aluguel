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
    const birthDateStr = String(body.birthDate ?? "").trim();
    const newPassword = String(body.newPassword ?? "");

    if (!email || !birthDateStr || newPassword.length < 6) {
      return NextResponse.json({ error: "Preencha os campos corretamente." }, { status: 400 });
    }

    const birth = parseBirthDateBR(birthDateStr);
    if (!birth) return NextResponse.json({ error: "Data inválida (DD/MM/AAAA)." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "OWNER" || !user.birthDate) {
      return NextResponse.json({ error: "Não foi possível validar os dados." }, { status: 400 });
    }

    const same =
      user.birthDate.getUTCFullYear() === birth.getUTCFullYear() &&
      user.birthDate.getUTCMonth() === birth.getUTCMonth() &&
      user.birthDate.getUTCDate() === birth.getUTCDate();

    if (!same) return NextResponse.json({ error: "Data de nascimento não confere." }, { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
