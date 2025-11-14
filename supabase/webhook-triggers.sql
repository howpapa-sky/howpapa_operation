-- Supabase Database Webhook을 사용하여 네이버 웍스 알림 전송
-- 이 파일은 Supabase Dashboard에서 직접 실행해야 합니다.

-- 1. 프로젝트 생성 시 알림
CREATE OR REPLACE FUNCTION notify_project_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'YOUR_WEBHOOK_SERVER_URL/webhook/naver-works',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'type', 'INSERT',
      'record', jsonb_build_object(
        'table', 'projects',
        'id', NEW.id,
        'name', NEW.name,
        'manager', NEW.created_by,
        'target_date', NEW.target_date,
        'priority', NEW.priority
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_project_created
AFTER INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION notify_project_created();

-- 2. 프로젝트 상태 변경 시 알림
CREATE OR REPLACE FUNCTION notify_project_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM net.http_post(
      url := 'YOUR_WEBHOOK_SERVER_URL/webhook/naver-works',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'type', 'UPDATE',
        'record', jsonb_build_object(
          'table', 'projects',
          'id', NEW.id,
          'name', NEW.name,
          'status', NEW.status,
          'completed_date', NEW.completed_date
        ),
        'old_record', jsonb_build_object(
          'status', OLD.status
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_project_updated
AFTER UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION notify_project_updated();

-- 3. 샘플 생성 시 알림
CREATE OR REPLACE FUNCTION notify_sample_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'YOUR_WEBHOOK_SERVER_URL/webhook/naver-works',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'type', 'INSERT',
      'record', jsonb_build_object(
        'table', 'samples',
        'id', NEW.id,
        'productName', NEW.productName,
        'labNumber', NEW.labNumber,
        'brand', NEW.brand,
        'round', NEW.round
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_sample_created
AFTER INSERT ON samples
FOR EACH ROW
EXECUTE FUNCTION notify_sample_created();

-- 트리거 삭제 명령어 (필요 시 사용)
-- DROP TRIGGER IF EXISTS trigger_notify_project_created ON projects;
-- DROP TRIGGER IF EXISTS trigger_notify_project_updated ON projects;
-- DROP TRIGGER IF EXISTS trigger_notify_sample_created ON samples;
-- DROP FUNCTION IF EXISTS notify_project_created();
-- DROP FUNCTION IF EXISTS notify_project_updated();
-- DROP FUNCTION IF EXISTS notify_sample_created();
