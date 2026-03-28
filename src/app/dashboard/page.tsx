'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DarkModeToggle } from '@/components/DarkModeToggle';

interface PileCounts {
  newCount: number;
  studyingCount: number;
  learnedCount: number;
}

export default function Dashboard() {
  const [counts, setCounts] = useState<PileCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for session token (cookie or localStorage)
    const checkSession = async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          // Try localStorage fallback
          const localToken = localStorage.getItem('ukrainium-session');
          if (localToken) {
            // Try to restore session
            const restoreRes = await fetch('/api/restore-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: localToken }),
            });
            if (!restoreRes.ok) {
              localStorage.removeItem('ukrainium-session');
              router.push('/login');
              return;
            }
          } else {
            router.push('/login');
            return;
          }
        }
        
        const data = await response.json();
        if (data.counts) {
          setCounts(data.counts);
        }
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem('ukrainium-session');
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </main>
    );
  }

  if (!counts) {
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <h1 className="logo text-5xl">Ukrainium</h1>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <button
              onClick={handleLogout}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Logout
            </button>
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
                <h2 className="pile-label text-2xl text-[var(--new-blue-text)]">New</h2>
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
                <h2 className="pile-label text-2xl text-[var(--studying-amber-text)]">Studying</h2>
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
                <h2 className="pile-label text-2xl text-[var(--learned-green-text)]">Learned</h2>
              </div>
              <div className="bg-[var(--learned-green)] text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl shadow-sm">
                ★{counts.learnedCount}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
