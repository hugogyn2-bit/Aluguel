import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function nowPlusDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function ensureTrial(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return { kind: "redirect" as const, to: new URL("/auth/sign-in?role=OWNER", req.url) };
  }
  if (token.role !== "OWNER") {
    return { kind: "redirect" as const, to: new URL("/tenant", req.url) };
  }

  const userId = String((token as any).id || "");
  if (!userId) {
    return { kind: "json" as const, status: 400, body: { error: "Token sem id" } };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "OWNER") {
    return { kind: "json" as const, status: 403, body: { error: "Somente OWNER" } };
  }

  // Se já pagou, não precisa trial
  if (user.ownerPaid) {
    return { kind: "json" as const, status: 200, body: { ok: true, trialEndsAt: user.trialEndsAt?.toISOString() ?? null } };
  }

  // Se já existe trial, apenas retorna
  if (user.trialEndsAt && Date.now() < user.trialEndsAt.getTime()) {
    return { kind: "json" as const, status: 200, body: { ok: true, trialEndsAt: user.trialEndsAt.toISOString() } };
  }

  const trialEndsAt = nowPlusDays(3);
  await prisma.user.update({
    where: { id: user.id },
    data: { trialEndsAt },
  });

  return { kind: "json" as const, status: 200, body: { ok: true, trialEndsAt: trialEndsAt.toISOString() } };
}

export async function POST(req: Request) {
  try {
    const r = await ensureTrial(req);
    if (r.kind === "redirect") return NextResponse.redirect(r.to);
    return NextResponse.json(r.body, { status: r.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// ✅ GET para botões/links (evita HTTP 405)
export async function GET(req: Request) {
  try {
    const r = await ensureTrial(req);
    if (r.kind === "redirect") return NextResponse.redirect(r.to);

    // Após ativar, manda direto pro dashboard
    return NextResponse.redirect(new URL("/owner", req.url));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/paywall", req.url));
  }
}
