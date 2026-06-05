-- cards 테이블
CREATE TABLE cards (
  id          TEXT PRIMARY KEY,
  category    TEXT NOT NULL CHECK (category IN ('target','technology','trend','revenue','feature','industry')),
  title       TEXT NOT NULL,
  description TEXT,
  tags        TEXT[] DEFAULT '{}',
  popularity  INT DEFAULT 0,
  synced_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_cards_category ON cards(category);
CREATE INDEX idx_cards_fts ON cards USING GIN (to_tsvector('simple', title || ' ' || COALESCE(description, '')));

-- projects 테이블
CREATE TABLE projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name           TEXT NOT NULL DEFAULT '새 프로젝트',
  stage          INT DEFAULT 1 CHECK (stage BETWEEN 1 AND 4),
  selected_cards JSONB DEFAULT '[]',
  idea           JSONB,
  templates      JSONB DEFAULT '{}',
  document_html  TEXT,
  pitch_config   JSONB DEFAULT '{"theme": "dark_navy", "slides": []}',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- shared_links 테이블
CREATE TABLE shared_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  token       TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'base64url'),
  expires_at  TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "users_own_projects" ON projects
  USING (auth.uid() = user_id);
CREATE POLICY "users_manage_own_projects" ON projects
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public_read_shared_links" ON shared_links
  FOR SELECT USING (expires_at > now());
CREATE POLICY "users_manage_own_links" ON shared_links
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
