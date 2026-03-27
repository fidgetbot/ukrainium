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

export default function NewPilePage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const router = useRouter();

  async function fetchNextCard() {
    try {
      const response = await fetch('/api/piles/new/next');
      if (response.ok) {
        const data = await response.json();
        if (data.progress) {
          setProgress(data.progress);
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

  async function handleMove() {
    if (!progress) return;
    setIsMoving(true);
    
    try {
      const response = await fetch('/api/piles/new/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId: progress.id }),
      });

      if (response.ok) {
        fetchNextCard();
      }
    } catch (error) {
      console.error('Failed to move card:', error);
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
          <p className="text-[var(--text-secondary)] mb-4">No new words!</p>
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
            <h2 className="text-5xl font-bold text-[var(--text-primary)] mb-6">
              {progress.word.ukrainian}
            </h2>
            
            {/* Divider */}
            <div className="w-16 h-1 bg-[var(--border-color)] rounded-full mx-auto mb-6"></div>
            
            {/* English */}
            <p className="text-2xl text-[var(--text-secondary)]">
              {progress.word.english}
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleMove}
          disabled={isMoving}
          className="w-full py-4 bg-[var(--new-blue)] text-white rounded-xl font-semibold hover:bg-[var(--new-blue-text)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {isMoving ? 'Moving...' : 'Move to Studying'}
        </button>
      </div>
    </main>
  );
}
