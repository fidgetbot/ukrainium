import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DarkModeToggle } from "@/components/DarkModeToggle";

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
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="logo text-3xl">Ukrainium</h1>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <form action="/api/logout" method="post">
              <button
                type="submit"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Piles */}
        <div className="space-y-5">
          {/* New Pile */}
          <Link
            href="/piles/new"
            className="card block bg-[var(--new-blue-light)] rounded-2xl shadow-md border-0 p-6 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--new-blue-text)]">New</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1 opacity-80">Words to learn</p>
              </div>
              <div className="bg-[var(--new-blue)] text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl shadow-sm">
                {counts.newCount}
              </div>
            </div>
          </Link>

          {/* Studying Pile */}
          <Link
            href="/piles/studying"
            className="card block bg-[var(--studying-amber-light)] rounded-2xl shadow-md border-0 p-6 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--studying-amber-text)]">Studying</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1 opacity-80">In progress</p>
              </div>
              <div className="bg-[var(--studying-amber)] text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl shadow-sm">
                {counts.studyingCount}
              </div>
            </div>
          </Link>

          {/* Learned Pile */}
          <Link
            href="/piles/learned"
            className="card block bg-[var(--learned-green-light)] rounded-2xl shadow-md border-0 p-6 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--learned-green-text)]">Learned</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1 opacity-80">Words you know</p>
              </div>
              <div className="bg-[var(--learned-green)] text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl shadow-sm">
                ★{counts.learnedCount}
              </div>
            </div>
          </Link>
        </div>

        {/* Next Pack Info */}
        {counts.newCount === 0 && counts.studyingCount === 0 && (
          <div className="mt-10 text-center">
            <p className="text-[var(--text-secondary)]">Ready for the next pack?</p>
            <Link
              href="/next-pack"
              className="inline-block mt-3 px-5 py-3 bg-[var(--new-blue)] text-white rounded-xl font-medium hover:bg-[var(--new-blue-text)] transition-colors"
            >
              Load Next Pack
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
