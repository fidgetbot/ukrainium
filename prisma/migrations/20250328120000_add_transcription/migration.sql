-- Add transcription column to Word table
ALTER TABLE "Word" ADD COLUMN IF NOT EXISTS "transcription" TEXT;
