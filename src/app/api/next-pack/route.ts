import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
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
    // Find the highest pack number the user already has
    const userProgress = await prisma.userWordProgress.findMany({
      where: { userId: session.userId },
      include: { word: { select: { packNumber: true } } },
    });

    const maxPack = userProgress.length > 0 
      ? Math.max(...userProgress.map(p => p.word.packNumber))
      : 0;

    const nextPackNumber = maxPack + 1;

    // Get words from the next pack
    const nextPackWords = await prisma.word.findMany({
      where: { packNumber: nextPackNumber },
      orderBy: { frequencyRank: "asc" },
    });

    if (nextPackWords.length === 0) {
      return NextResponse.json({ error: "No more packs available" }, { status: 404 });
    }

    // Create progress entries for the new pack
    for (const word of nextPackWords) {
      await prisma.userWordProgress.create({
        data: {
          userId: session.userId,
          wordId: word.id,
          pile: "new",
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      loaded: nextPackWords.length,
      packNumber: nextPackNumber
    });
  } catch (error) {
    console.error("Failed to load next pack:", error);
    return NextResponse.json({ error: "Failed to load pack" }, { status: 500 });
  }
}
