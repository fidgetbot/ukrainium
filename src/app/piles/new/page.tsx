'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { transformForDisplay } from '@/lib/textTransform';

interface Word {
  id: string;
  ukrainian: string;
  english: string;
  transcription: string | null;
  frequencyRank: number;
}

interface Progress {
  id: string;
  word: Word;
}

export default function NewPilePage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function fetchNextCard() {
    try {
      const response = await fetch('/api/piles/new/next');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch');
      }
      
      const data = await response.json();
      console.log('API response:', data); // Debug logging
      
      if (data.progress) {
        setProgress(data.progress);
      } else {
        setProgress(null);
      }
    } catch (error) {
      console.error('Failed to fetch card:', error);
      setError('Failed to load card');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchNextCard();
  }, []);

  async function handleMove() {
    if (!progress) return;
    
    try {
      const response = await fetch('/api/piles/new/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId: progress.id }),
      });

      if (response.ok) {
        // Fetch next card instead of refreshing
        setIsLoading(true);
        await fetchNextCard();
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to move card:', error);
      setError('Failed to move card');
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => { setError(null); setIsLoading(true); fetchNextCard(); }}
            className="text-[var(--new-blue)] hover:underline"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!progress) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">No new words!</p>
          <p className="text-sm text-[var(--text-secondary)] opacity-60 mb-4">
            You&apos;ve reviewed all cards in this pack.
          </p>
          <Link href="/dashboard" className="text-[var(--new-blue)] hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/dashboard" 
            className="text-[var(--new-blue-text)] hover:text-[var(--new-blue)] transition-colors"
          >
            ← Back
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-medium text-[var(--text-secondary)]">New Words</h1>
            <DarkModeToggle />
          </div>
        </div>

        {/* Card */}
        <div className="card bg-[var(--bg-card)] rounded-3xl shadow-lg border border-[var(--border-color)] overflow-hidden mb-6">
          <div className="p-10 text-center">
            {/* Ukrainian */}
            <h2 className="text-5xl font-bold text-[var(--text-primary)] mb-2">
              {transformForDisplay(progress.word.ukrainian)}
            </h2>
            
            {/* Transcription */}
            {progress.word.transcription && (
              <p className="text-sm text-[var(--text-secondary)] opacity-60 mb-4">
                [{progress.word.transcription}]
              </p>
            )}
            
            {/* Divider */}
            <div className="w-16 h-1 bg-[var(--border-color)] rounded-full mx-auto mb-6"></div>
            
            {/* English */}
            <p className="text-2xl text-[var(--text-secondary)]">
              {transformForDisplay(progress.word.english)}
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleMove}
          className="w-full py-4 bg-[var(--new-blue)] text-white rounded-xl font-semibold hover:bg-[var(--new-blue-text)] transition-all shadow-md hover:shadow-lg"
        >
          Move to Studying
        </button>
      </div>
    </main>
  );
}
