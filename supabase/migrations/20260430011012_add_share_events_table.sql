/*
  # Add share_events table for share stats

  1. New Tables
    - `share_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, references auth.users) - null for anonymous shares
      - `chapter_id` (uuid, nullable, references chapters) - null for non-chapter shares
      - `title` (text) - shared content title
      - `category` (text) - e.g. 反击铁律 / AI问答
      - `platform` (text) - copy / image / native
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Authenticated users may insert their own events
    - Anonymous users may insert rows with null user_id
    - Authenticated users may read only their own events

  3. Notes
    - Used to track share counts and content heat ranking
*/

CREATE TABLE IF NOT EXISTS share_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  category text DEFAULT '',
  platform text DEFAULT 'copy',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own share events"
  ON share_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert anonymous share events"
  ON share_events FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can view own share events"
  ON share_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_share_events_chapter ON share_events(chapter_id);
CREATE INDEX IF NOT EXISTS idx_share_events_user ON share_events(user_id);
