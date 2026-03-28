"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password required" };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return { error: "Email already registered" };
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, password: hashed },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await verifyPassword(password, user.password))) {
    return { error: "Invalid credentials" };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: true, // Always secure for PWA
    sameSite: "lax",
    expires: expiresAt,
    maxAge: maxAge,
    path: "/",
  });
}

export async function logout() {
  const token = (await cookies()).get("session")?.value;
  
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  
  (await cookies()).delete("session");
  redirect("/");
}
