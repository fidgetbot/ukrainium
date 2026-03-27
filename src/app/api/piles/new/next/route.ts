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
    // Get first word from new pile (oldest first)
    const progress = await prisma.userWordProgress.findFirst({
      where: { userId: session.userId, pile: "new" },
      orderBy: { createdAt: "asc" },
      include: { word: true },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Failed to fetch new card:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
