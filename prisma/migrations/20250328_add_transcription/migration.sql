-- Add transcription column to words table
ALTER TABLE words ADD COLUMN IF NOT EXISTS transcription TEXT;

-- Create index for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_words_transcription ON words(transcription);
