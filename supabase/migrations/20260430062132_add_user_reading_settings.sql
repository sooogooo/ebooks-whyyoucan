/*
  # 用户阅读偏好

  1. 新表
    - `user_reading_settings`
      - user_id (pk, fk -> auth.users)
      - theme ('warm' | 'night' | 'minimal')
      - ambient ('off' | 'rain' | 'cafe' | 'forest')
      - font_scale (0.85 ~ 1.4)
      - updated_at
  2. 安全
    - 启用 RLS
    - 用户仅可读写自己的设置
*/

CREATE TABLE IF NOT EXISTS user_reading_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'warm',
  ambient text NOT NULL DEFAULT 'off',
  font_scale numeric NOT NULL DEFAULT 1.0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_reading_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own settings" ON user_reading_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own settings" ON user_reading_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own settings" ON user_reading_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
