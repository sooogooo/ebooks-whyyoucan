/*
  # P0 互动功能数据库

  1. 新表
    - `quotes` 金句库（公开读取）
      - id, chapter_id, text, author_note
    - `quote_collects` 用户金句打卡收藏
      - user_id, quote_id, collected_at
    - `scenarios` 情景沙盘（公开读取）
      - id, chapter_id, title, setup, options (jsonb: [{text, score, feedback}]), difficulty
    - `scenario_attempts` 读者作答记录
      - user_id, scenario_id, choice_index, score
    - `reflections` 章节反思问答
      - user_id, chapter_id, question, answer, ai_feedback
    - `roleplay_sessions` AI 角色扮演会话
      - user_id, role, transcript (jsonb), report

  2. 安全
    - 所有表启用 RLS
    - chapters/quotes/scenarios 对所有人（包括未登录）公开读取
    - 其余用户数据仅本人可读写
*/

-- quotes (公开)
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  text text NOT NULL,
  author_note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quotes are viewable by everyone"
  ON quotes FOR SELECT TO anon, authenticated USING (true);

-- quote_collects
CREATE TABLE IF NOT EXISTS quote_collects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quote_id)
);
ALTER TABLE quote_collects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own collects" ON quote_collects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own collects" ON quote_collects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own collects" ON quote_collects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- scenarios (公开)
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  title text NOT NULL,
  setup text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  difficulty text DEFAULT 'easy',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scenarios are viewable by everyone"
  ON scenarios FOR SELECT TO anon, authenticated USING (true);

-- scenario_attempts
CREATE TABLE IF NOT EXISTS scenario_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  choice_index integer NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE scenario_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own attempts" ON scenario_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attempts" ON scenario_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- reflections
CREATE TABLE IF NOT EXISTS reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  question text NOT NULL,
  answer text DEFAULT '',
  ai_feedback text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own reflections" ON reflections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reflections" ON reflections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reflections" ON reflections FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reflections" ON reflections FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- roleplay_sessions
CREATE TABLE IF NOT EXISTS roleplay_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  transcript jsonb DEFAULT '[]'::jsonb,
  report text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE roleplay_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sessions" ON roleplay_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON roleplay_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON roleplay_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON roleplay_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quotes_chapter ON quotes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_quote_collects_user ON quote_collects(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenarios_chapter ON scenarios(chapter_id, display_order);
CREATE INDEX IF NOT EXISTS idx_scenario_attempts_user ON scenario_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reflections_user_chapter ON reflections(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_roleplay_user ON roleplay_sessions(user_id, updated_at DESC);
