export async function signUpAction(fd: FormData) {
  const raw = {
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    password: String(fd.get("password") ?? ""),
    name: String(fd.get("name") ?? "").trim() || undefined,
    role: String(fd.get("role") ?? "TENANT") as "TENANT" | "OWNER",
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const { email, password, name, role } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, error: "E-mail já cadastrado." };

  const passwordHash = await bcrypt.hash(password, 10);

  // 🔥 trial de 3 dias APENAS para OWNER
  const trialEndsAt =
    role === "OWNER"
      ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      : null;

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      trialEndsAt,
    },
  });

  return { ok: true, redirectTo: `/auth/sign-in?role=${role}` };
}
