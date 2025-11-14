import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const NAVER_WORKS_CONFIG = {
  clientId: Deno.env.get('NAVER_WORKS_CLIENT_ID')!,
  clientSecret: Deno.env.get('NAVER_WORKS_CLIENT_SECRET')!,
  serviceAccount: Deno.env.get('NAVER_WORKS_SERVICE_ACCOUNT')!,
  privateKey: Deno.env.get('NAVER_WORKS_PRIVATE_KEY')!,
  botId: Deno.env.get('NAVER_WORKS_BOT_ID')!,
};

const NOTIFICATION_USERS = ['yong@howlab.co.kr', 'alsrud8382@howlab.co.kr'];

interface NotificationPayload {
  type: 'project_created' | 'project_completed' | 'project_status_changed' | 'sample_created' | 'urgent_project';
  data: any;
}

/**
 * JWT 생성
 */
async function createJWT(): Promise<string> {
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(NAVER_WORKS_CONFIG.privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const jwt = await create(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: NAVER_WORKS_CONFIG.clientId,
      sub: NAVER_WORKS_CONFIG.serviceAccount,
      iat: getNumericDate(0),
      exp: getNumericDate(3600),
    },
    privateKey
  );

  return jwt;
}

/**
 * Access Token 발급
 */
async function getAccessToken(): Promise<string> {
  const assertion = await createJWT();

  const response = await fetch('https://auth.worksmobile.com/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      assertion,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      client_id: NAVER_WORKS_CONFIG.clientId,
      client_secret: NAVER_WORKS_CONFIG.clientSecret,
      scope: 'bot',
    }),
  });

  const data = await response.json();
  return data.access_token;
}

/**
 * 사용자 ID 조회
 */
async function getUserId(accessToken: string, email: string): Promise<string> {
  const response = await fetch(
    `https://www.worksapis.com/v1.0/users/${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  return data.userId;
}

/**
 * 메시지 전송
 */
async function sendMessage(
  accessToken: string,
  userId: string,
  content: any
): Promise<void> {
  await fetch(
    `https://www.worksapis.com/v1.0/bots/${NAVER_WORKS_CONFIG.botId}/users/${userId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    }
  );
}

/**
 * 알림 메시지 생성
 */
function createNotificationContent(payload: NotificationPayload): any {
  const baseUrl = 'https://howpapaopration.netlify.app';

  switch (payload.type) {
    case 'project_created':
      return {
        type: 'button_template',
        contentText: `📋 새 프로젝트가 등록되었습니다\n\n프로젝트명: ${payload.data.name}\n담당자: ${payload.data.manager}${
          payload.data.dueDate ? `\n마감일: ${payload.data.dueDate}` : ''
        }${payload.data.priority ? `\n우선순위: ${payload.data.priority}` : ''}`,
        actions: [
          {
            type: 'uri',
            label: '프로젝트 보기',
            uri: `${baseUrl}/projects/${payload.data.id}`,
          },
        ],
      };

    case 'project_completed':
      return {
        type: 'button_template',
        contentText: `✅ 프로젝트가 완료되었습니다\n\n프로젝트명: ${payload.data.name}\n담당자: ${payload.data.manager}\n완료일: ${payload.data.completedDate}`,
        actions: [
          {
            type: 'uri',
            label: '프로젝트 보기',
            uri: `${baseUrl}/projects/${payload.data.id}`,
          },
        ],
      };

    case 'project_status_changed':
      return {
        type: 'button_template',
        contentText: `🔄 프로젝트 상태가 변경되었습니다\n\n프로젝트명: ${payload.data.name}\n이전 상태: ${payload.data.previousStatus}\n현재 상태: ${payload.data.currentStatus}\n변경자: ${payload.data.changedBy}`,
        actions: [
          {
            type: 'uri',
            label: '프로젝트 보기',
            uri: `${baseUrl}/projects/${payload.data.id}`,
          },
        ],
      };

    case 'sample_created':
      return {
        type: 'button_template',
        contentText: `🧪 새 샘플이 등록되었습니다\n\n샘플명: ${payload.data.name}\n프로젝트: ${payload.data.project}\n차수: ${payload.data.round}차`,
        actions: [
          {
            type: 'uri',
            label: '샘플 보기',
            uri: `${baseUrl}/samples/${payload.data.id}`,
          },
        ],
      };

    case 'urgent_project':
      return {
        type: 'button_template',
        contentText: `🚨 긴급 프로젝트 알림\n\n프로젝트명: ${payload.data.name}\n사유: ${payload.data.reason}${
          payload.data.dueDate ? `\n마감일: ${payload.data.dueDate}` : ''
        }`,
        actions: [
          {
            type: 'uri',
            label: '프로젝트 보기',
            uri: `${baseUrl}/projects/${payload.data.id}`,
          },
        ],
      };

    default:
      return {
        type: 'text',
        text: '알림이 도착했습니다.',
      };
  }
}

serve(async (req) => {
  try {
    // CORS 헤더 설정
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const payload: NotificationPayload = await req.json();

    // Access Token 발급
    const accessToken = await getAccessToken();

    // 알림 메시지 생성
    const content = createNotificationContent(payload);

    // 모든 사용자에게 메시지 전송
    const sendPromises = NOTIFICATION_USERS.map(async (email) => {
      try {
        const userId = await getUserId(accessToken, email);
        await sendMessage(accessToken, userId, content);
        console.log(`메시지 전송 성공: ${email}`);
      } catch (error) {
        console.error(`메시지 전송 실패 (${email}):`, error);
      }
    });

    await Promise.allSettled(sendPromises);

    return new Response(
      JSON.stringify({ success: true, message: '알림 전송 완료' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('알림 전송 오류:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
