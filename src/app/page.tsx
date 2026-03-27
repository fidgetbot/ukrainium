import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Ukrainium</h1>
        <p className="text-gray-600">
          A Next.js 14 + PostgreSQL app deployed on Railway
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
