import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

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

async function getPileCounts(userId: string) {
  const [newCount, studyingCount, learnedCount] = await Promise.all([
    prisma.userWordProgress.count({
      where: { userId, pile: "new" },
    }),
    prisma.userWordProgress.count({
      where: { userId, pile: "studying" },
    }),
    prisma.userWordProgress.count({
      where: { userId, pile: "learned" },
    }),
  ]);

  return { newCount, studyingCount, learnedCount };
}

export default async function Dashboard() {
  const user = await getUser();
  if (!user) redirect("/login");

  // Initialize user progress if none exists
  const existingProgress = await prisma.userWordProgress.findFirst({
    where: { userId: user.id },
  });

  if (!existingProgress) {
    // Get first 12 words (pack 1) and create progress entries
    const firstPackWords = await prisma.word.findMany({
      where: { packNumber: 1 },
      orderBy: { frequencyRank: "asc" },
    });

    for (const word of firstPackWords) {
      await prisma.userWordProgress.create({
        data: {
          userId: user.id,
          wordId: word.id,
          pile: "new",
        },
      });
    }
  }

  const counts = await getPileCounts(user.id);

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <h1 className="text-2xl font-bold text-gray-900">Ukrainium</h1>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </form>
        </div>

        {/* Piles */}
        <div className="space-y-4">
          {/* New Pile */}
          <Link
            href="/piles/new"
            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-600">New</h2>
                <p className="text-sm text-gray-500 mt-1">Words to learn</p>
              </div>
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                {counts.newCount}
              </div>
            </div>
          </Link>

          {/* Studying Pile */}
          <Link
            href="/piles/studying"
            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-amber-600">Studying</h2>
                <p className="text-sm text-gray-500 mt-1">In progress</p>
              </div>
              <div className="bg-amber-100 text-amber-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                {counts.studyingCount}
              </div>
            </div>
          </Link>

          {/* Learned Pile */}
          <Link
            href="/piles/learned"
            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-green-600">Learned</h2>
                <p className="text-sm text-gray-500 mt-1">Words you know</p>
              </div>
              <div className="bg-green-100 text-green-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                ★{counts.learnedCount}
              </div>
            </div>
          </Link>
        </div>

        {/* Next Pack Info */}
        {counts.newCount === 0 && counts.studyingCount === 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">Ready for the next pack?</p>
            <Link
              href="/next-pack"
              className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Load Next Pack
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
