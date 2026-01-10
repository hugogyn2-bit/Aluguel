import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const runtime = "nodejs";

function parseBRDate(input: string): Date | null {
  const m = /^([0-3]\d)\/([01]\d)\/(\d{4})$/.exec(input.trim());
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (
    d.getUTCFullYear() !== yyyy ||
    d.getUTCMonth() !== mm - 1 ||
    d.getUTCDate() !== dd
  ) {
    return null;
  }
  return d;
}

const schema = z.object({
  email: z.string().email(),
  birthDate: z.string().min(8), // dd/mm/aaaa
  newPassword: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const raw = {
      email: String(fd.get("email") ?? "").trim().toLowerCase(),
      birthDate: String(fd.get("birthDate") ?? "").trim(),
      newPassword: String(fd.get("newPassword") ?? ""),
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const { email, birthDate, newPassword } = parsed.data;

    const birthDateParsed = parseBRDate(birthDate);
    if (!birthDateParsed) {
      return NextResponse.json({ error: "Data de nascimento inválida (dd/mm/aaaa)." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Conta de OWNER não encontrada." }, { status: 404 });
    }

    if (!user.birthDate) {
      return NextResponse.json({ error: "Essa conta ainda não tem data de nascimento cadastrada." }, { status: 400 });
    }

    const sameDay =
      user.birthDate.toISOString().slice(0, 10) ===
      birthDateParsed.toISOString().slice(0, 10);
    if (!sameDay) {
      return NextResponse.json({ error: "Data de nascimento não confere." }, { status: 403 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
