/**
 * 이메일 알림 유틸리티
 * Gmail MCP 서버를 통해 이메일 발송
 */

interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  projectName?: string;
  dueDate?: string;
}

/**
 * 마감일 리마인더 이메일 발송
 */
export async function sendDeadlineReminder(notification: EmailNotification): Promise<boolean> {
  try {
    // Gmail MCP 서버를 통한 이메일 발송 로직
    // 실제 구현은 서버 사이드에서 처리되어야 함
    console.log('Sending deadline reminder:', notification);
    
    // TODO: Gmail MCP 서버 연동
    // const response = await fetch('/api/email/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(notification)
    // });
    
    return true;
  } catch (error) {
    console.error('Failed to send deadline reminder:', error);
    return false;
  }
}

/**
 * 지연 프로젝트 알림 이메일 발송
 */
export async function sendOverdueAlert(notification: EmailNotification): Promise<boolean> {
  try {
    console.log('Sending overdue alert:', notification);
    
    // TODO: Gmail MCP 서버 연동
    return true;
  } catch (error) {
    console.error('Failed to send overdue alert:', error);
    return false;
  }
}

/**
 * 프로젝트 상태 변경 알림 이메일 발송
 */
export async function sendStatusChangeNotification(notification: EmailNotification): Promise<boolean> {
  try {
    console.log('Sending status change notification:', notification);
    
    // TODO: Gmail MCP 서버 연동
    return true;
  } catch (error) {
    console.error('Failed to send status change notification:', error);
    return false;
  }
}

/**
 * 일일 요약 이메일 발송
 */
export async function sendDailyDigest(notification: EmailNotification): Promise<boolean> {
  try {
    console.log('Sending daily digest:', notification);
    
    // TODO: Gmail MCP 서버 연동
    return true;
  } catch (error) {
    console.error('Failed to send daily digest:', error);
    return false;
  }
}

/**
 * 이메일 템플릿 생성
 */
export function createEmailTemplate(type: 'deadline' | 'overdue' | 'status' | 'digest', data: any): string {
  const templates = {
    deadline: `
      <h2>프로젝트 마감일 알림</h2>
      <p>안녕하세요,</p>
      <p><strong>${data.projectName}</strong> 프로젝트의 마감일이 3일 남았습니다.</p>
      <p>목표일: ${data.dueDate}</p>
      <p>프로젝트를 확인하고 필요한 조치를 취해주세요.</p>
    `,
    overdue: `
      <h2>프로젝트 지연 알림</h2>
      <p>안녕하세요,</p>
      <p><strong>${data.projectName}</strong> 프로젝트의 목표일이 지났습니다.</p>
      <p>목표일: ${data.dueDate}</p>
      <p>프로젝트 상태를 확인하고 업데이트해주세요.</p>
    `,
    status: `
      <h2>프로젝트 상태 변경 알림</h2>
      <p>안녕하세요,</p>
      <p><strong>${data.projectName}</strong> 프로젝트의 상태가 변경되었습니다.</p>
      <p>새로운 상태: ${data.newStatus}</p>
    `,
    digest: `
      <h2>일일 프로젝트 요약</h2>
      <p>안녕하세요,</p>
      <p>오늘의 프로젝트 현황을 알려드립니다.</p>
      <ul>
        <li>진행 중인 프로젝트: ${data.inProgress}건</li>
        <li>완료된 프로젝트: ${data.completed}건</li>
        <li>지연된 프로젝트: ${data.overdue}건</li>
      </ul>
    `,
  };

  return templates[type] || '';
}
