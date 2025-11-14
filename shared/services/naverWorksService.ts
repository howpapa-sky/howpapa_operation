import * as jose from 'jose';
import axios from 'axios';

interface NaverWorksConfig {
  clientId: string;
  clientSecret: string;
  serviceAccount: string;
  privateKey: string;
  botId: string;
}

interface MessageContent {
  type: 'text' | 'button_template';
  text?: string;
  contentText?: string;
  actions?: Array<{
    type: 'uri' | 'message';
    label: string;
    uri?: string;
    text?: string;
  }>;
}

export class NaverWorksService {
  private config: NaverWorksConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: NaverWorksConfig) {
    this.config = config;
  }

  /**
   * JWT 생성
   */
  private async createJWT(): Promise<string> {
    const privateKey = await jose.importPKCS8(this.config.privateKey, 'RS256');
    
    const jwt = await new jose.SignJWT({
      iss: this.config.clientId,
      sub: this.config.serviceAccount,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1시간
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .sign(privateKey);

    return jwt;
  }

  /**
   * Access Token 발급
   */
  private async getAccessToken(): Promise<string> {
    // 토큰이 유효하면 재사용
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const assertion = await this.createJWT();

      const response = await axios.post(
        'https://auth.worksmobile.com/oauth2/v2.0/token',
        new URLSearchParams({
          assertion,
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: 'bot',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // 토큰 만료 시간 설정 (현재 시간 + 유효 기간 - 5분 버퍼)
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Access Token 발급 실패:', error);
      throw new Error('네이버 웍스 인증 실패');
    }
  }

  /**
   * 사용자 ID 조회 (이메일로)
   */
  private async getUserId(email: string): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `https://www.worksapis.com/v1.0/users/${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.userId;
    } catch (error) {
      console.error(`사용자 ID 조회 실패 (${email}):`, error);
      throw new Error(`사용자 ID 조회 실패: ${email}`);
    }
  }

  /**
   * 메시지 전송
   */
  async sendMessage(userEmail: string, content: MessageContent): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      const userId = await this.getUserId(userEmail);

      await axios.post(
        `https://www.worksapis.com/v1.0/bots/${this.config.botId}/users/${userId}/messages`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`메시지 전송 성공: ${userEmail}`);
    } catch (error) {
      console.error(`메시지 전송 실패 (${userEmail}):`, error);
      throw error;
    }
  }

  /**
   * 여러 사용자에게 메시지 전송
   */
  async sendMessageToMultiple(userEmails: string[], content: MessageContent): Promise<void> {
    const promises = userEmails.map((email) => this.sendMessage(email, content));
    await Promise.allSettled(promises);
  }

  /**
   * 프로젝트 등록 알림
   */
  async notifyProjectCreated(projectData: {
    name: string;
    manager: string;
    dueDate?: string;
    priority?: string;
    projectUrl: string;
  }): Promise<void> {
    const content: MessageContent = {
      type: 'button_template',
      contentText: `📋 새 프로젝트가 등록되었습니다\n\n프로젝트명: ${projectData.name}\n담당자: ${projectData.manager}${
        projectData.dueDate ? `\n마감일: ${projectData.dueDate}` : ''
      }${projectData.priority ? `\n우선순위: ${projectData.priority}` : ''}`,
      actions: [
        {
          type: 'uri',
          label: '프로젝트 보기',
          uri: projectData.projectUrl,
        },
      ],
    };

    await this.sendMessageToMultiple(
      ['yong@howlab.co.kr', 'alsrud8382@howlab.co.kr'],
      content
    );
  }

  /**
   * 프로젝트 완료 알림
   */
  async notifyProjectCompleted(projectData: {
    name: string;
    manager: string;
    completedDate: string;
    projectUrl: string;
  }): Promise<void> {
    const content: MessageContent = {
      type: 'button_template',
      contentText: `✅ 프로젝트가 완료되었습니다\n\n프로젝트명: ${projectData.name}\n담당자: ${projectData.manager}\n완료일: ${projectData.completedDate}`,
      actions: [
        {
          type: 'uri',
          label: '프로젝트 보기',
          uri: projectData.projectUrl,
        },
      ],
    };

    await this.sendMessageToMultiple(
      ['yong@howlab.co.kr', 'alsrud8382@howlab.co.kr'],
      content
    );
  }

  /**
   * 프로젝트 상태 변경 알림
   */
  async notifyProjectStatusChanged(projectData: {
    name: string;
    previousStatus: string;
    currentStatus: string;
    changedBy: string;
    projectUrl: string;
  }): Promise<void> {
    const content: MessageContent = {
      type: 'button_template',
      contentText: `🔄 프로젝트 상태가 변경되었습니다\n\n프로젝트명: ${projectData.name}\n이전 상태: ${projectData.previousStatus}\n현재 상태: ${projectData.currentStatus}\n변경자: ${projectData.changedBy}`,
      actions: [
        {
          type: 'uri',
          label: '프로젝트 보기',
          uri: projectData.projectUrl,
        },
      ],
    };

    await this.sendMessageToMultiple(
      ['yong@howlab.co.kr', 'alsrud8382@howlab.co.kr'],
      content
    );
  }

  /**
   * 샘플 등록 알림
   */
  async notifySampleCreated(sampleData: {
    name: string;
    project: string;
    round: number;
    sampleUrl: string;
  }): Promise<void> {
    const content: MessageContent = {
      type: 'button_template',
      contentText: `🧪 새 샘플이 등록되었습니다\n\n샘플명: ${sampleData.name}\n프로젝트: ${sampleData.project}\n차수: ${sampleData.round}차`,
      actions: [
        {
          type: 'uri',
          label: '샘플 보기',
          uri: sampleData.sampleUrl,
        },
      ],
    };

    await this.sendMessageToMultiple(
      ['yong@howlab.co.kr', 'alsrud8382@howlab.co.kr'],
      content
    );
  }

  /**
   * 긴급 프로젝트 알림
   */
  async notifyUrgentProject(projectData: {
    name: string;
    reason: string;
    dueDate?: string;
    projectUrl: string;
  }): Promise<void> {
    const content: MessageContent = {
      type: 'button_template',
      contentText: `🚨 긴급 프로젝트 알림\n\n프로젝트명: ${projectData.name}\n사유: ${projectData.reason}${
        projectData.dueDate ? `\n마감일: ${projectData.dueDate}` : ''
      }`,
      actions: [
        {
          type: 'uri',
          label: '프로젝트 보기',
          uri: projectData.projectUrl,
        },
      ],
    };

    await this.sendMessageToMultiple(
      ['yong@howlab.co.kr', 'alsrud8382@howlab.co.kr'],
      content
    );
  }
}

// 싱글톤 인스턴스 생성
let naverWorksServiceInstance: NaverWorksService | null = null;

export function getNaverWorksService(): NaverWorksService {
  if (!naverWorksServiceInstance) {
    const config: NaverWorksConfig = {
      clientId: process.env.NAVER_WORKS_CLIENT_ID || '',
      clientSecret: process.env.NAVER_WORKS_CLIENT_SECRET || '',
      serviceAccount: process.env.NAVER_WORKS_SERVICE_ACCOUNT || '',
      privateKey: process.env.NAVER_WORKS_PRIVATE_KEY || '',
      botId: process.env.NAVER_WORKS_BOT_ID || '',
    };

    naverWorksServiceInstance = new NaverWorksService(config);
  }

  return naverWorksServiceInstance;
}
