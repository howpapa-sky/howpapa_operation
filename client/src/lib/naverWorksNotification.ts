import axios from 'axios';

interface NotificationData {
  type: 'project_created' | 'project_completed' | 'project_status_changed' | 'sample_created';
  projectId?: string;
  sampleId?: string;
  name: string;
  manager?: string;
  dueDate?: string;
  priority?: string;
  completedDate?: string;
  previousStatus?: string;
  currentStatus?: string;
  changedBy?: string;
  project?: string;
  round?: number;
}

// 웹훅 서버 URL (개발 환경에서는 localhost, 프로덕션에서는 실제 서버 URL)
const WEBHOOK_URL = import.meta.env.PROD 
  ? 'https://your-webhook-server.com/webhook/naver-works'
  : 'http://localhost:3001/webhook/naver-works';

/**
 * 네이버 웍스 알림 전송
 */
export async function sendNaverWorksNotification(data: NotificationData): Promise<void> {
  try {
    // 개발 환경에서는 콘솔 로그만 출력
    if (import.meta.env.DEV) {
      console.log('🔔 네이버 웍스 알림 (개발 모드):', data);
      
      // 로컬 웹훅 서버로 전송 시도
      try {
        await axios.post('http://localhost:3001/webhook/naver-works', {
          type: 'INSERT',
          record: {
            table: data.type.includes('project') ? 'projects' : 'samples',
            ...data,
          },
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 3000,
        });
        console.log('✅ 로컬 웹훅 서버로 알림 전송 성공');
      } catch (error) {
        console.log('⚠️ 로컬 웹훅 서버 연결 실패 (정상 동작)');
      }
      return;
    }

    await axios.post(WEBHOOK_URL, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ 네이버 웍스 알림 전송 성공');
  } catch (error) {
    console.error('❌ 네이버 웍스 알림 전송 실패:', error);
    // 알림 실패는 사용자 경험에 영향을 주지 않도록 에러를 throw하지 않음
  }
}

/**
 * 프로젝트 등록 알림
 */
export function notifyProjectCreated(project: {
  id: string;
  name: string;
  manager: string;
  dueDate?: string;
  priority?: string;
}): void {
  sendNaverWorksNotification({
    type: 'project_created',
    projectId: project.id,
    name: project.name,
    manager: project.manager,
    dueDate: project.dueDate,
    priority: project.priority,
  });
}

/**
 * 프로젝트 완료 알림
 */
export function notifyProjectCompleted(project: {
  id: string;
  name: string;
  manager: string;
  completedDate: string;
}): void {
  sendNaverWorksNotification({
    type: 'project_completed',
    projectId: project.id,
    name: project.name,
    manager: project.manager,
    completedDate: project.completedDate,
  });
}

/**
 * 프로젝트 상태 변경 알림
 */
export function notifyProjectStatusChanged(project: {
  id: string;
  name: string;
  previousStatus: string;
  currentStatus: string;
  changedBy: string;
}): void {
  sendNaverWorksNotification({
    type: 'project_status_changed',
    projectId: project.id,
    name: project.name,
    previousStatus: project.previousStatus,
    currentStatus: project.currentStatus,
    changedBy: project.changedBy,
  });
}

/**
 * 샘플 등록 알림
 */
export function notifySampleCreated(sample: {
  id: string;
  name: string;
  project: string;
  round: number;
}): void {
  sendNaverWorksNotification({
    type: 'sample_created',
    sampleId: sample.id,
    name: sample.name,
    project: sample.project,
    round: sample.round,
  });
}
