import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DropButton } from "./DropButton";

async function getUser() {
  const sessionToken = (await cookies()).get("session")?.value;
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

async function getNextNewWord(userId: string) {
  const progress = await prisma.userWordProgress.findFirst({
    where: { userId, pile: "new" },
    orderBy: { createdAt: "asc" },
    include: { word: true },
  });
  return progress;
}

export default async function NewPilePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const progress = await getNextNewWord(user.id);

  if (!progress) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-700">New Words</h1>
          <div className="w-8"></div>
        </div>

        {/* Flashcard */}
        <Flashcard word={progress.word} progressId={progress.id} />
      </div>
    </main>
  );
}

function Flashcard({ word, progressId }: { word: any; progressId: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Card content with flip */}
      <div className="p-8 text-center min-h-[300px] flex flex-col justify-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {word.ukrainian}
        </h2>
        <p className="text-gray-400 text-sm">Tap to flip</p>
        
        {/* Flip side - shows English */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-2xl text-gray-700">{word.english}</p>
        </div>
      </div>

      {/* Action button */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <DropButton progressId={progressId} />
      </div>
    </div>
  );
}
