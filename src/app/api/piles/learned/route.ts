import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const sessionToken = (await cookies()).get("session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const words = await prisma.userWordProgress.findMany({
      where: { userId: session.userId, pile: "learned" },
      orderBy: { movedToLearnedAt: "desc" },
      include: { word: true },
    });

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Failed to fetch learned words:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
