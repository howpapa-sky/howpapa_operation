-- 비밀번호 해싱 및 보안 강화 마이그레이션
-- 실행일: 2025-11-19

-- 1. pgcrypto 확장 활성화 (비밀번호 해싱용)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. 비밀번호 해싱 함수
CREATE OR REPLACE FUNCTION hash_password()
RETURNS TRIGGER AS $$
BEGIN
  -- 비밀번호가 변경되었고, 이미 해시되지 않은 경우에만 해시
  IF NEW.password IS NOT NULL AND 
     (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password != OLD.password)) AND
     NOT (NEW.password LIKE '$2%') THEN -- bcrypt 해시가 아닌 경우
    NEW.password = crypt(NEW.password, gen_salt('bf', 10));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. users 테이블에 비밀번호 해싱 트리거 적용
DROP TRIGGER IF EXISTS hash_user_password ON users;
CREATE TRIGGER hash_user_password
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.password IS NOT NULL)
  EXECUTE FUNCTION hash_password();

-- 4. 비밀번호 검증 함수
CREATE OR REPLACE FUNCTION verify_password(
  user_email TEXT,
  input_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  stored_password TEXT;
BEGIN
  SELECT password INTO stored_password
  FROM users
  WHERE email = user_email;
  
  IF stored_password IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN stored_password = crypt(input_password, stored_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 감사 로그 테이블 생성
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 감사 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 6. 감사 로그 트리거 함수
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 중요 테이블에 감사 로그 트리거 적용
DROP TRIGGER IF EXISTS audit_projects ON projects;
CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_tasks ON tasks;
CREATE TRIGGER audit_tasks
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- 8. 세션 관리 테이블 생성
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 세션 인덱스
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 9. 만료된 세션 자동 삭제 함수
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 10. RLS (Row Level Security) 정책 강화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- users 테이블 RLS 정책
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- projects 테이블 RLS 정책
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM project_members WHERE project_id = projects.id
    )
  );

-- tasks 테이블 RLS 정책
DROP POLICY IF EXISTS "Users can view tasks in their projects" ON tasks;
CREATE POLICY "Users can view tasks in their projects" ON tasks
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM project_members 
      WHERE project_id = tasks.project_id
    )
  );

DROP POLICY IF EXISTS "Users can create tasks in their projects" ON tasks;
CREATE POLICY "Users can create tasks in their projects" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM project_members 
      WHERE project_id = tasks.project_id
    )
  );

DROP POLICY IF EXISTS "Users can update tasks in their projects" ON tasks;
CREATE POLICY "Users can update tasks in their projects" ON tasks
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM project_members 
      WHERE project_id = tasks.project_id
    )
  );

-- 11. 인덱스 최적화
CREATE INDEX IF NOT EXISTS idx_tasks_composite ON tasks(project_id, status, assignee_id);
CREATE INDEX IF NOT EXISTS idx_comments_composite ON comments(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING gin(to_tsvector('simple', name || ' ' || COALESCE(description, '')));

-- 12. 데이터 무결성 제약
ALTER TABLE tasks 
  ADD CONSTRAINT IF NOT EXISTS check_dates CHECK (
    (start_date IS NULL OR due_date IS NULL) OR 
    start_date <= due_date
  );

ALTER TABLE projects
  ADD CONSTRAINT IF NOT EXISTS check_project_dates CHECK (
    (start_date IS NULL OR target_date IS NULL) OR 
    start_date <= target_date
  );

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 비밀번호 해싱 및 보안 강화 마이그레이션 완료';
  RAISE NOTICE '   - pgcrypto 확장 활성화';
  RAISE NOTICE '   - 비밀번호 자동 해싱 트리거 설정';
  RAISE NOTICE '   - 감사 로그 시스템 구축';
  RAISE NOTICE '   - 세션 관리 테이블 생성';
  RAISE NOTICE '   - RLS 정책 강화';
  RAISE NOTICE '   - 인덱스 최적화';
END $$;
