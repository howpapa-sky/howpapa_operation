-- 하우파파 프로젝트 관리 시스템 핵심 기능 추가
-- 작업(Tasks), 댓글(Comments) 시스템
-- 작성일: 2025-11-18

-- ============================================
-- 1. TASKS 테이블 (작업 관리)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  due_date DATE,
  completed_date TIMESTAMP,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  position INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Tasks 테이블 업데이트 트리거
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- ============================================
-- 2. TASK_CHECKLISTS 테이블 (체크리스트)
-- ============================================
CREATE TABLE IF NOT EXISTS task_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_checklists_task ON task_checklists(task_id);

-- ============================================
-- 3. COMMENTS 테이블 (댓글 시스템)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task')),
  entity_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  user_email TEXT,
  content TEXT NOT NULL,
  mentions UUID[], -- @멘션된 사용자 ID 배열
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comments 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- Comments 테이블 업데이트 트리거
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_updated_at_trigger
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();

-- ============================================
-- 4. ATTACHMENTS 테이블 (첨부 파일)
-- ============================================
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task', 'comment')),
  entity_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);

-- ============================================
-- 5. ACTIVITY_LOGS 테이블 (활동 로그)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task')),
  entity_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================
-- 6. RLS (Row Level Security) 정책
-- ============================================

-- Tasks RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 작업을 볼 수 있음
CREATE POLICY "Anyone can view tasks" ON tasks
  FOR SELECT USING (true);

-- 인증된 사용자가 작업을 생성할 수 있음
CREATE POLICY "Authenticated users can create tasks" ON tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 작업 생성자 또는 담당자가 작업을 수정할 수 있음
CREATE POLICY "Users can update their tasks" ON tasks
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = assignee_id
  );

-- 작업 생성자가 작업을 삭제할 수 있음
CREATE POLICY "Users can delete their tasks" ON tasks
  FOR DELETE USING (auth.uid() = created_by);

-- Task Checklists RLS
ALTER TABLE task_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view checklists" ON task_checklists
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage checklists" ON task_checklists
  FOR ALL USING (auth.role() = 'authenticated');

-- Comments RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Attachments RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attachments" ON attachments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload attachments" ON attachments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their attachments" ON attachments
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Activity Logs RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activity logs" ON activity_logs
  FOR SELECT USING (true);

CREATE POLICY "System can create activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. 헬퍼 함수
-- ============================================

-- 작업 진행률 계산 함수
CREATE OR REPLACE FUNCTION calculate_task_progress(task_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_items
  FROM task_checklists
  WHERE task_id = task_id_param;
  
  IF total_items = 0 THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO completed_items
  FROM task_checklists
  WHERE task_id = task_id_param AND completed = true;
  
  RETURN ROUND((completed_items::DECIMAL / total_items::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql;

-- 프로젝트의 작업 통계 조회 함수
CREATE OR REPLACE FUNCTION get_project_task_stats(project_id_param INTEGER)
RETURNS TABLE (
  total_tasks INTEGER,
  todo_tasks INTEGER,
  in_progress_tasks INTEGER,
  review_tasks INTEGER,
  done_tasks INTEGER,
  overdue_tasks INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_tasks,
    COUNT(*) FILTER (WHERE status = 'todo')::INTEGER AS todo_tasks,
    COUNT(*) FILTER (WHERE status = 'in_progress')::INTEGER AS in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'review')::INTEGER AS review_tasks,
    COUNT(*) FILTER (WHERE status = 'done')::INTEGER AS done_tasks,
    COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'done')::INTEGER AS overdue_tasks
  FROM tasks
  WHERE project_id = project_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. 샘플 데이터 (테스트용, 선택사항)
-- ============================================

-- 주석 처리: 실제 배포 시 필요하면 주석 해제
/*
-- 샘플 작업 데이터
INSERT INTO tasks (project_id, title, description, status, priority, due_date)
VALUES 
  (1, '디자인 시안 작성', '제품 패키지 디자인 초안 작성', 'in_progress', 'high', CURRENT_DATE + INTERVAL '7 days'),
  (1, '샘플 제작 의뢰', '제조사에 샘플 제작 의뢰', 'todo', 'medium', CURRENT_DATE + INTERVAL '10 days'),
  (1, '라벨 디자인 검토', '제품 라벨 디자인 최종 검토', 'review', 'high', CURRENT_DATE + INTERVAL '3 days');
*/

-- ============================================
-- 마이그레이션 완료
-- ============================================
-- 실행 확인
DO $$
BEGIN
  RAISE NOTICE '✅ 핵심 기능 마이그레이션이 완료되었습니다!';
  RAISE NOTICE '   - Tasks 테이블 생성';
  RAISE NOTICE '   - Task Checklists 테이블 생성';
  RAISE NOTICE '   - Comments 테이블 생성';
  RAISE NOTICE '   - Attachments 테이블 생성';
  RAISE NOTICE '   - Activity Logs 테이블 생성';
  RAISE NOTICE '   - RLS 정책 설정';
  RAISE NOTICE '   - 헬퍼 함수 생성';
END $$;
