-- Create Word table
CREATE TABLE words (
  id TEXT PRIMARY KEY,
  ukrainian TEXT NOT NULL,
  english TEXT NOT NULL,
  stress_position INTEGER,
  frequency_rank INTEGER NOT NULL UNIQUE,
  pack_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Word table
CREATE INDEX idx_words_pack ON words(pack_number);
CREATE INDEX idx_words_frequency ON words(frequency_rank);

-- Create UserWordProgress table
CREATE TABLE user_word_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  pile TEXT NOT NULL CHECK (pile IN ('new', 'studying', 'learned')),
  last_reviewed_at TIMESTAMP,
  moved_to_learned_at TIMESTAMP,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  UNIQUE(user_id, word_id)
);

-- Indexes for UserWordProgress table
CREATE INDEX idx_progress_user_pile ON user_word_progress(user_id, pile);
CREATE INDEX idx_progress_last_reviewed ON user_word_progress(user_id, pile, last_reviewed_at);
