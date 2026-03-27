import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
    const { progressId } = await request.json();

    await prisma.userWordProgress.update({
      where: { id: progressId, userId: session.userId },
      data: { pile: "studying", lastReviewedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to drop card:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
