import Link from "next/link";
import { logout } from "../actions";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Welcome to your Ukrainium dashboard! You're logged in.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
