'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DarkModeToggle } from '@/components/DarkModeToggle';

interface Word {
  id: string;
  ukrainian: string;
  english: string;
  frequencyRank: number;
}

interface Progress {
  id: string;
  word: Word;
}

export default function StudyingPilePage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const router = useRouter();

  async function fetchNextCard() {
    try {
      const response = await fetch('/api/piles/studying/next');
      if (response.ok) {
        const data = await response.json();
        if (data.progress) {
          setProgress(data.progress);
          setIsFlipped(false);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Failed to fetch card:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchNextCard();
  }, []);

  async function handleKeep() {
    if (!progress) return;
    setIsMoving(true);
    
    try {
      await fetch('/api/piles/studying/keep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId: progress.id }),
      });
      fetchNextCard();
    } catch (error) {
      console.error('Failed to keep card:', error);
    } finally {
      setIsMoving(false);
    }
  }

  async function handleLearn() {
    if (!progress) return;
    setIsMoving(true);
    
    try {
      await fetch('/api/piles/studying/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId: progress.id }),
      });
      fetchNextCard();
    } catch (error) {
      console.error('Failed to learn card:', error);
    } finally {
      setIsMoving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </main>
    );
  }

  if (!progress) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">No cards in studying pile!</p>
          <Link href="/dashboard" className="text-[var(--studying-amber-text)] hover:underline">
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
            className="text-[var(--studying-amber-text)] hover:text-[var(--studying-amber)] transition-colors"
          >
            ← Back
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-medium text-[var(--text-secondary)]">Studying</h1>
            <DarkModeToggle />
          </div>
        </div>

        {/* Flashcard with flip */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="card bg-[var(--bg-card)] rounded-3xl shadow-lg border border-[var(--border-color)] overflow-hidden mb-6 cursor-pointer"
        >
          <div className="p-10 text-center min-h-[240px] flex flex-col justify-center">
            {!isFlipped ? (
              <>
                <h2 className="text-5xl font-bold text-[var(--text-primary)] mb-4">
                  {progress.word.english}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] opacity-60 mt-4">Tap for Ukrainian</p>
              </>
            ) : (
              <>
                <h2 className="text-5xl font-bold text-[var(--text-primary)] mb-4">
                  {progress.word.english}
                </h2>
                <div className="w-16 h-1 bg-[var(--border-color)] rounded-full mx-auto my-4"></div>
                <p className="text-2xl text-[var(--text-secondary)]">{progress.word.ukrainian}</p>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleKeep}
            disabled={isMoving}
            className="w-full py-4 bg-[var(--studying-amber)] text-white rounded-xl font-semibold hover:bg-[var(--studying-amber-text)] disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
          >
            Keep in Studying
          </button>
          <button
            onClick={handleLearn}
            disabled={isMoving}
            className="w-full py-4 bg-[var(--learned-green)] text-white rounded-xl font-semibold hover:bg-[var(--learned-green-text)] disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
          >
            Move to Learned
          </button>
        </div>
      </div>
    </main>
  );
}
