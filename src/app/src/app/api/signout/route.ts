import { NextResponse } from "next/server";

export async function POST() {
  // NextAuth expects client-side signOut usually; for server form, redirect to built-in route
  // We'll just redirect to /api/auth/signout
  return NextResponse.redirect(new URL("/api/auth/signout", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
}
