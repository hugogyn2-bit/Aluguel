import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const raw = {
      email: String(fd.get("email") ?? "").trim().toLowerCase(),
      newPassword: String(fd.get("newPassword") ?? ""),
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const { email, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Conta de OWNER não encontrada." }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
