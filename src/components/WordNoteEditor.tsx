'use client';

import { useState } from 'react';

const MAX_NOTE_LENGTH = 140;

interface WordNoteEditorProps {
  progressId: string;
  note: string | null;
  className?: string;
  onSaved?: (note: string | null) => void;
}

export function WordNoteEditor({ progressId, note, className = '', onSaved }: WordNoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextNote: string | null) {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/progress/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId, note: nextNote }),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      onSaved?.(nextNote);
      setDraft(nextNote ?? '');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save note:', err);
      setError('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing() {
    setDraft(note ?? '');
    setError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(note ?? '');
    setError(null);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className={className}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_NOTE_LENGTH))}
          rows={3}
          maxLength={MAX_NOTE_LENGTH}
          placeholder="Add a note"
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--new-blue)]"
        />
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)] opacity-70">
          <span>{draft.length}/{MAX_NOTE_LENGTH}</span>
          {error && <span className="text-red-500 opacity-100">{error}</span>}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => save(draft.trim() ? draft.trim() : null)}
            disabled={isSaving}
            className="rounded-lg bg-[var(--new-blue)] px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={cancelEditing}
            disabled={isSaving}
            className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-secondary)] disabled:opacity-50"
          >
            Cancel
          </button>
          {note && (
            <button
              onClick={() => save(null)}
              disabled={isSaving}
              className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--studying-amber-text)] disabled:opacity-50"
            >
              Delete note
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {note ? (
        <>
          <p className="text-sm text-[var(--text-secondary)] italic">{note}</p>
          <button
            onClick={startEditing}
            className="mt-2 text-xs text-[var(--new-blue)] hover:underline"
          >
            Edit note
          </button>
        </>
      ) : (
        <button
          onClick={startEditing}
          className="text-xs text-[var(--new-blue)] hover:underline"
        >
          Add note
        </button>
      )}
    </div>
  );
}
