/*
  # Add full-text search to chapters

  1. Changes
    - Add `search_tsv` tsvector column to chapters
    - Backfill existing rows
    - Add GIN index on search_tsv
    - Add trigger to keep search_tsv in sync with title/subtitle/content

  2. Security
    - No RLS changes; chapters read access already public

  3. Notes
    - Uses `simple` config (Chinese/CJK safe; exact token matches)
    - Supports search via `websearch_to_tsquery` or `to_tsquery`
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'search_tsv'
  ) THEN
    ALTER TABLE chapters ADD COLUMN search_tsv tsvector;
  END IF;
END $$;

UPDATE chapters
SET search_tsv = to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(content, ''))
WHERE search_tsv IS NULL;

CREATE INDEX IF NOT EXISTS idx_chapters_search_tsv ON chapters USING GIN (search_tsv);

CREATE OR REPLACE FUNCTION chapters_search_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv := to_tsvector('simple', coalesce(NEW.title, '') || ' ' || coalesce(NEW.subtitle, '') || ' ' || coalesce(NEW.content, ''));
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chapters_search_tsv_trigger ON chapters;
CREATE TRIGGER chapters_search_tsv_trigger
  BEFORE INSERT OR UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION chapters_search_tsv_update();
