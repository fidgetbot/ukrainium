'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
          // No more cards in studying
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
    
    try {
      await fetch('/api/piles/studying/keep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId: progress.id }),
      });
      await fetchNextCard();
    } catch (error) {
      console.error('Failed to keep card:', error);
    }
  }

  async function handleLearn() {
    if (!progress) return;
    
    try {
      await fetch('/api/piles/studying/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId: progress.id }),
      });
      await fetchNextCard();
    } catch (error) {
      console.error('Failed to learn card:', error);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!progress) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto text-center pt-20">
          <p className="text-gray-600 mb-4">No cards in studying pile!</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <Link href="/dashboard" className="text-amber-600 hover:underline">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-700">Studying</h1>
          <div className="w-8"></div>
        </div>

        {/* Flashcard */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden cursor-pointer min-h-[300px] flex flex-col"
        >
          <div className="p-8 text-center flex-1 flex flex-col justify-center">
            {!isFlipped ? (
              <>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {progress.word.ukrainian}
                </h2>
                <p className="text-gray-400 text-sm">Tap to flip</p>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {progress.word.ukrainian}
                </h2>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-2xl text-gray-700">{progress.word.english}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleKeep}
            className="w-full py-4 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors"
          >
            Keep in Studying
          </button>
          <button
            onClick={handleLearn}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Move to Learned
          </button>
        </div>
      </div>
    </main>
  );
}
