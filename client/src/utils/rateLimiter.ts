/**
 * 클라이언트 사이드 Rate Limiter
 * API 요청 빈도를 제한하여 DDoS 공격 및 과도한 요청 방지
 */

interface RateLimitConfig {
  maxRequests: number; // 최대 요청 수
  windowMs: number; // 시간 창 (밀리초)
}

interface RequestLog {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private config: RateLimitConfig;
  private requests: Map<string, RequestLog>;

  constructor(config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }) {
    this.config = config;
    this.requests = new Map();
  }

  /**
   * 요청 가능 여부 확인
   */
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requestLog = this.requests.get(key);

    // 첫 요청이거나 시간 창이 지난 경우
    if (!requestLog || now > requestLog.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    // 요청 제한 초과
    if (requestLog.count >= this.config.maxRequests) {
      return false;
    }

    // 요청 카운트 증가
    requestLog.count++;
    return true;
  }

  /**
   * 남은 요청 수 확인
   */
  getRemainingRequests(key: string): number {
    const requestLog = this.requests.get(key);
    if (!requestLog || Date.now() > requestLog.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - requestLog.count);
  }

  /**
   * 다음 리셋까지 남은 시간 (밀리초)
   */
  getTimeUntilReset(key: string): number {
    const requestLog = this.requests.get(key);
    if (!requestLog) {
      return 0;
    }
    return Math.max(0, requestLog.resetTime - Date.now());
  }

  /**
   * 특정 키의 요청 기록 초기화
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * 모든 요청 기록 초기화
   */
  resetAll(): void {
    this.requests.clear();
  }
}

// 전역 Rate Limiter 인스턴스
export const globalRateLimiter = new RateLimiter({
  maxRequests: 100, // 1분당 100개 요청
  windowMs: 60000, // 1분
});

// API 엔드포인트별 Rate Limiter
export const apiRateLimiter = new RateLimiter({
  maxRequests: 50, // 1분당 50개 요청
  windowMs: 60000, // 1분
});

// 로그인 시도 Rate Limiter (더 엄격)
export const loginRateLimiter = new RateLimiter({
  maxRequests: 5, // 5분당 5회 시도
  windowMs: 300000, // 5분
});

export default RateLimiter;
