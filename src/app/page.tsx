import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const sessionToken = (await cookies()).get("session")?.value;

  if (sessionToken) {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });

    if (session && session.expiresAt >= new Date()) {
      redirect("/dashboard");
    }
  }

  redirect("/login");
}
