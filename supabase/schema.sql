-- Supabase 데이터베이스 스키마
-- 하우파파 프로젝트 관리 시스템

-- Users 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_signed_in TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects 테이블
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sampling', 'detail_page', 'new_product', 'influencer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold')),
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high')),
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  target_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  brand TEXT,
  product_name TEXT,
  manufacturer TEXT,
  sample_company TEXT,
  partner TEXT,
  development_type TEXT,
  progress_status TEXT,
  notes TEXT,
  sample_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Samples 테이블
CREATE TABLE IF NOT EXISTS samples (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  manufacturer TEXT,
  lab_number TEXT,
  brand TEXT,
  product_name TEXT,
  category TEXT,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations 테이블
CREATE TABLE IF NOT EXISTS evaluations (
  id SERIAL PRIMARY KEY,
  sample_id INTEGER REFERENCES samples(id) ON DELETE CASCADE,
  evaluator_name TEXT NOT NULL,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  score INTEGER CHECK (score IN (1, 3, 5)),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors 테이블
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('manufacturer', 'designer', 'influencer', 'other')),
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts 테이블
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  account_id TEXT NOT NULL,
  password TEXT,
  category TEXT NOT NULL CHECK (category IN ('marketing', 'sales', 'product', 'other')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Templates 테이블
CREATE TABLE IF NOT EXISTS workflow_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Stages 테이블
CREATE TABLE IF NOT EXISTS workflow_stages (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES workflow_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  checklist JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Stages 테이블
CREATE TABLE IF NOT EXISTS project_stages (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  stage_id INTEGER REFERENCES workflow_stages(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Dependencies 테이블
CREATE TABLE IF NOT EXISTS task_dependencies (
  id SERIAL PRIMARY KEY,
  predecessor_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  successor_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Users 테이블 RLS 정책
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Projects 테이블 RLS 정책
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their assigned projects" ON projects
  FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Admins can delete projects" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Samples 테이블 RLS 정책
CREATE POLICY "Users can view all samples" ON samples
  FOR SELECT USING (true);

CREATE POLICY "Users can create samples" ON samples
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update samples" ON samples
  FOR UPDATE USING (true);

-- Evaluations 테이블 RLS 정책
CREATE POLICY "Users can view all evaluations" ON evaluations
  FOR SELECT USING (true);

CREATE POLICY "Users can create evaluations" ON evaluations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own evaluations" ON evaluations
  FOR UPDATE USING (true);

-- Vendors 테이블 RLS 정책
CREATE POLICY "Users can view all vendors" ON vendors
  FOR SELECT USING (true);

CREATE POLICY "Users can create vendors" ON vendors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update vendors" ON vendors
  FOR UPDATE USING (true);

-- Accounts 테이블 RLS 정책 (관리자만 접근)
CREATE POLICY "Only admins can view accounts" ON accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage accounts" ON accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 인덱스 생성
CREATE INDEX idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_samples_project_id ON samples(project_id);
CREATE INDEX idx_evaluations_sample_id ON evaluations(sample_id);

-- Updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_samples_updated_at BEFORE UPDATE ON samples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
