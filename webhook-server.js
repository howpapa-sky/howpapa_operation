import express from 'express';
import axios from 'axios';
import * as jose from 'jose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const NAVER_WORKS_CONFIG = {
  clientId: process.env.NAVER_WORKS_CLIENT_ID,
  clientSecret: process.env.NAVER_WORKS_CLIENT_SECRET,
  serviceAccount: process.env.NAVER_WORKS_SERVICE_ACCOUNT,
  privateKey: process.env.NAVER_WORKS_PRIVATE_KEY,
  botId: process.env.NAVER_WORKS_BOT_ID,
};

const CHANNEL_ID = '556d52cf-b97d-0496-ca54-ad035999ea4a';
const BASE_URL = 'https://howpapaopration.netlify.app';

let accessToken = null;
let tokenExpiry = 0;

/**
 * JWT 생성
 */
async function createJWT() {
  const privateKey = await jose.importPKCS8(NAVER_WORKS_CONFIG.privateKey, 'RS256');
  
  const jwt = await new jose.SignJWT({
    iss: NAVER_WORKS_CONFIG.clientId,
    sub: NAVER_WORKS_CONFIG.serviceAccount,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(privateKey);

  return jwt;
}

/**
 * Access Token 발급
 */
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const assertion = await createJWT();

    const response = await axios.post(
      'https://auth.worksmobile.com/oauth2/v2.0/token',
      new URLSearchParams({
        assertion,
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        client_id: NAVER_WORKS_CONFIG.clientId,
        client_secret: NAVER_WORKS_CONFIG.clientSecret,
          scope: 'bot user.read',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    console.log('✅ Access Token 발급 성공');
    return accessToken;
  } catch (error) {
    console.error('❌ Access Token 발급 실패:', error.response?.data || error.message);
    throw new Error('네이버 웍스 인증 실패');
  }
}

/**
 * 채널에 메시지 전송
 */
async function sendChannelMessage(token, channelId, content) {
  try {
    await axios.post(
      `https://www.worksapis.com/v1.0/bots/${NAVER_WORKS_CONFIG.botId}/channels/${channelId}/messages`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ 채널 메시지 전송 성공: ${channelId}`);
  } catch (error) {
    console.error(`❌ 채널 메시지 전송 실패 (${channelId}):`, error.response?.data || error.message);
    throw error;
  }
}



/**
 * 알림 메시지 생성
 */
function createNotificationContent(type, data) {
  switch (type) {
    case 'project_created':
      return {
        type: 'button_template',
        contentText: `📋 새 프로젝트가 등록되었습니다\n\n프로젝트명: ${data.name}\n담당자: ${data.manager || '미지정'}${
          data.target_date ? `\n마감일: ${data.target_date}` : ''
        }${data.priority ? `\n우선순위: ${data.priority}` : ''}`,
        actions: [
          {
            type: 'uri',
            label: '프로젝트 보기',
            uri: `${BASE_URL}/projects/${data.id}`,
          },
        ],
      };

    case 'project_completed':
      return {
        type: 'button_template',
        contentText: `✅ 프로젝트가 완료되었습니다\n\n프로젝트명: ${data.name}\n담당자: ${data.manager || '미지정'}\n완료일: ${data.completed_date}`,
        actions: [
          {
            type: 'uri',
            label: '프로젝트 보기',
            uri: `${BASE_URL}/projects/${data.id}`,
          },
        ],
      };

    case 'project_status_changed':
      return {
        type: 'button_template',
        contentText: `🔄 프로젝트 상태가 변경되었습니다\n\n프로젝트명: ${data.name}\n이전 상태: ${data.old_status}\n현재 상태: ${data.new_status}`,
        actions: [
          {
            type: 'uri',
            label: '프로젝트 보기',
            uri: `${BASE_URL}/projects/${data.id}`,
          },
        ],
      };

    case 'sample_created':
      return {
        type: 'button_template',
        contentText: `🧪 새 샘플이 등록되었습니다\n\n샘플명: ${data.productName || data.labNumber}\n브랜드: ${data.brand || '미지정'}\n차수: ${data.round}차`,
        actions: [
          {
            type: 'uri',
            label: '샘플 보기',
            uri: `${BASE_URL}/samples/${data.id}`,
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

/**
 * 웹훅 엔드포인트
 */
app.post('/webhook/naver-works', async (req, res) => {
  try {
    const { type, record, old_record } = req.body;

    console.log('📨 웹훅 수신:', { type, record: record?.id });

    // 알림 타입 결정
    let notificationType = null;
    let notificationData = null;

    if (type === 'INSERT' && record.table === 'projects') {
      notificationType = 'project_created';
      notificationData = record;
    } else if (type === 'UPDATE' && record.table === 'projects') {
      if (record.status === 'completed' && old_record.status !== 'completed') {
        notificationType = 'project_completed';
        notificationData = record;
      } else if (record.status !== old_record.status) {
        notificationType = 'project_status_changed';
        notificationData = {
          ...record,
          old_status: old_record.status,
          new_status: record.status,
        };
      }
    } else if (type === 'INSERT' && record.table === 'samples') {
      notificationType = 'sample_created';
      notificationData = record;
    }

    if (!notificationType) {
      return res.json({ success: true, message: '알림 대상 아님' });
    }

    // Access Token 발급
    const token = await getAccessToken();

    // 알림 메시지 생성
    const content = createNotificationContent(notificationType, notificationData);

    // 채널에 메시지 전송
    await sendChannelMessage(token, CHANNEL_ID, content);

    res.json({ success: true, message: '알림 전송 완료' });
  } catch (error) {
    console.error('❌ 웹훅 처리 오류:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 테스트 엔드포인트
 */
app.post('/webhook/test', async (req, res) => {
  try {
    const token = await getAccessToken();

    const content = {
      type: 'text',
      text: '🎉 네이버 웍스 알림 테스트 메시지입니다!',
    };

    await sendChannelMessage(token, CHANNEL_ID, content);

    res.json({ success: true, message: '테스트 메시지 전송 완료' });
  } catch (error) {
    console.error('❌ 테스트 메시지 전송 오류:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 헬스 체크
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 네이버 웍스 웹훅 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📝 웹훅 URL: http://localhost:${PORT}/webhook/naver-works`);
  console.log(`🧪 테스트 URL: http://localhost:${PORT}/webhook/test`);
});
