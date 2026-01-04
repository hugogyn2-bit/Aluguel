import SignUpForm from "./SignUpForm";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = sp?.role === "OWNER" ? "OWNER" : "TENANT";

  return <SignUpForm role={role} />;
}
