import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#0057B7] via-[#3B82F6] to-[#FFDD00]">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="logo text-6xl font-bold mb-2">Ukrainium</h1>
          <p className="text-gray-600">Learn Ukrainian with flashcards</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#0057B7] hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
