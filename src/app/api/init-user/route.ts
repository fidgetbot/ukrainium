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
    // Check existing progress
    const existingCount = await prisma.userWordProgress.count({
      where: { userId: session.userId },
    });

    if (existingCount > 0) {
      return NextResponse.json({ message: "User already initialized", count: existingCount });
    }

    // Get Pack 1 words
    const pack1Words = await prisma.word.findMany({
      where: { packNumber: 1 },
      orderBy: { frequencyRank: "asc" },
    });

    // Create progress entries for Pack 1
    for (const word of pack1Words) {
      await prisma.userWordProgress.create({
        data: {
          userId: session.userId,
          wordId: word.id,
          pile: "new",
        },
      });
    }

    return NextResponse.json({ 
      message: "User initialized with Pack 1", 
      count: pack1Words.length 
    });
  } catch (error) {
    console.error("Failed to initialize user:", error);
    return NextResponse.json({ error: "Failed to initialize" }, { status: 500 });
  }
}
