'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { WordNoteEditor } from '@/components/WordNoteEditor';
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
  note: string | null;
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
      fetchWords();
    } catch (error) {
      console.error('Failed to demote:', error);
    }
  }

  function handleNoteSaved(progressId: string, note: string | null) {
    setWords((current) => current.map((item) => item.id === progressId ? { ...item, note } : item));
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/dashboard" 
            className="text-[var(--learned-green-text)] hover:text-[var(--learned-green)] transition-colors"
          >
            ← Back
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-medium text-[var(--text-secondary)]">Learned</h1>
            <DarkModeToggle />
          </div>
        </div>

        <div className="text-center mb-8">
          <span className="text-4xl font-bold text-[var(--learned-green)]">★{words.length}★</span>
        </div>

        {words.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)]">No words learned yet!</p>
            <p className="text-sm text-[var(--text-secondary)] opacity-60 mt-2">
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
                onNoteSaved={(note) => handleNoteSaved(item.id, note)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function WordCard({ item, onDemote, onNoteSaved }: { item: Progress; onDemote: () => void; onNoteSaved: (note: string | null) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card bg-[var(--bg-card)] rounded-2xl shadow-md border border-[var(--border-color)] overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 text-center min-h-[160px] flex flex-col justify-center cursor-pointer"
      >
        {!isExpanded ? (
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {transformForDisplay(item.word.english)}
          </p>
        ) : (
          <>
            <p className="text-sm text-[var(--text-secondary)] opacity-60 mt-2">
              {transformForDisplay(item.word.english)}
            </p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
              {transformForDisplay(item.word.ukrainian)}
            </p>
            {item.word.transcription && (
              <p className="text-sm text-[var(--text-secondary)] opacity-60 mt-2">
                [{item.word.transcription}]
              </p>
            )}
            <WordNoteEditor
              progressId={item.id}
              note={item.note}
              className="mt-3"
              onSaved={onNoteSaved}
            />
          </>
        )}
      </div>
      
      <button
        onClick={onDemote}
        className="w-full py-2 text-xs text-[var(--studying-amber-text)] hover:bg-[var(--studying-amber-light)] border-t border-[var(--border-color)] transition-colors"
      >
        Move to Studying
      </button>
    </div>
  );
}
