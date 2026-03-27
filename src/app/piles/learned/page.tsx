'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function LearnedPilePage() {
  const [words, setWords] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWords();
  }, []);

  async function fetchWords() {
    try {
      const response = await fetch('/api/piles/learned');
      if (response.ok) {
        const data = await response.json();
        setWords(data.words || []);
      }
    } catch (error) {
      console.error('Failed to fetch words:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDemote(progressId: string) {
    try {
      await fetch('/api/piles/learned/demote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId }),
      });
      // Refresh the list
      fetchWords();
    } catch (error) {
      console.error('Failed to demote:', error);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <Link href="/dashboard" className="text-green-600 hover:underline">
            ← Back
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-700">Learned</h1>
            <p className="text-2xl font-bold text-green-600">★{words.length}★</p>
          </div>
          <div className="w-8"></div>
        </div>

        {/* Gallery */}
        {words.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No words learned yet!</p>
            <p className="text-sm text-gray-400 mt-2">
              Study some words to fill this gallery
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {words.map((item) => (
              <WordCard 
                key={item.id} 
                item={item} 
                onDemote={() => handleDemote(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function WordCard({ item, onDemote }: { item: Progress; onDemote: () => void }) {
  const [showEnglish, setShowEnglish] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div 
        onClick={() => setShowEnglish(!showEnglish)}
        className="p-4 text-center cursor-pointer min-h-[100px] flex flex-col justify-center"
      >
        <p className="text-lg font-medium text-gray-900">
          {showEnglish ? item.word.english : item.word.ukrainian}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {showEnglish ? 'Tap for Ukrainian' : 'Tap for English'}
        </p>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDemote();
        }}
        className="w-full py-2 text-xs text-amber-600 hover:bg-amber-50 border-t border-gray-100"
      >
        Move to Studying
      </button>
    </div>
  );
}
