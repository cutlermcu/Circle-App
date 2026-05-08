-- Circle App v0.1.0 — Initial Schema

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agreements (teacher_id NULL = global/default)
CREATE TABLE IF NOT EXISTS agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions (teacher_id NULL = global/shared bank)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks which questions each teacher has used
CREATE TABLE IF NOT EXISTS used_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, question_id)
);

-- Prompts for grounding, check-in, appreciation (teacher_id NULL = global)
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('grounding', 'checkin', 'appreciation')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circle session history
CREATE TABLE IF NOT EXISTS circle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE used_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Agreements: global ones + own
CREATE POLICY "agreements_read" ON agreements FOR SELECT
  USING (teacher_id IS NULL OR teacher_id = auth.uid());
CREATE POLICY "agreements_write" ON agreements FOR INSERT
  WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "agreements_update" ON agreements FOR UPDATE
  USING (teacher_id = auth.uid());
CREATE POLICY "agreements_delete" ON agreements FOR DELETE
  USING (teacher_id = auth.uid());

-- Questions: global ones + own
CREATE POLICY "questions_read" ON questions FOR SELECT
  USING (teacher_id IS NULL OR teacher_id = auth.uid());
CREATE POLICY "questions_write" ON questions FOR INSERT
  WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "questions_update" ON questions FOR UPDATE
  USING (teacher_id = auth.uid());
CREATE POLICY "questions_delete" ON questions FOR DELETE
  USING (teacher_id = auth.uid());

-- Used questions: own only
CREATE POLICY "used_questions_own" ON used_questions FOR ALL
  USING (teacher_id = auth.uid());

-- Prompts: global ones + own
CREATE POLICY "prompts_read" ON prompts FOR SELECT
  USING (teacher_id IS NULL OR teacher_id = auth.uid());
CREATE POLICY "prompts_write" ON prompts FOR INSERT
  WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "prompts_update" ON prompts FOR UPDATE
  USING (teacher_id = auth.uid());
CREATE POLICY "prompts_delete" ON prompts FOR DELETE
  USING (teacher_id = auth.uid());

-- Circle sessions: own only
CREATE POLICY "sessions_own" ON circle_sessions FOR ALL
  USING (teacher_id = auth.uid());

-- ─── Auto-create profile on signup ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
