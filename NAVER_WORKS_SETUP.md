# 네이버 웍스 알림 설정 가이드

## 🚀 빠른 시작

### 1. 웹훅 서버 실행

```bash
# 개발 환경
npm run webhook

# 또는 백그라운드 실행
nohup node webhook-server.js > webhook.log 2>&1 &
```

### 2. 테스트 메시지 전송

```bash
curl -X POST http://localhost:3001/webhook/test
```

네이버 웍스 "브랜드 운영관련" 대화방에서 테스트 메시지를 확인하세요!

## 📋 알림 종류

- **프로젝트 등록**: 새 프로젝트가 생성될 때
- **프로젝트 완료**: 프로젝트 상태가 "완료"로 변경될 때
- **프로젝트 상태 변경**: 프로젝트 상태가 변경될 때
- **샘플 등록**: 새 샘플이 생성될 때

## 🔧 프로덕션 배포

### 웹훅 서버 배포 필요

현재 웹훅 서버는 로컬에서만 실행됩니다. 프로덕션 환경에서 사용하려면:

1. **별도 서버에 배포** (권장)
   - AWS EC2, DigitalOcean, Heroku 등
   - PM2로 프로세스 관리
   - Nginx 리버스 프록시
   - HTTPS 인증서 설정

2. **환경 변수 설정**
   ```bash
   NAVER_WORKS_CLIENT_ID=...
   NAVER_WORKS_CLIENT_SECRET=...
   NAVER_WORKS_SERVICE_ACCOUNT=...
   NAVER_WORKS_BOT_ID=...
   NAVER_WORKS_PRIVATE_KEY=...
   ```

3. **클라이언트 코드 업데이트**
   `client/src/lib/naverWorksNotification.ts`에서 프로덕션 URL 설정

## 📱 알림 수신 설정

### 그룹 대화방 정보
- **대화방 이름**: 브랜드 운영관련
- **채널 ID**: `556d52cf-b97d-0496-ca54-ad035999ea4a`
- **멤버**: 박현용, 김민경, 하우파파프로젝트 봇

### 새 멤버 추가 방법
1. 네이버 웍스 앱에서 "브랜드 운영관련" 대화방 열기
2. 대화방 설정 > 멤버 추가
3. 새 멤버 초대

## 🐛 문제 해결

### 알림이 오지 않을 때
1. 웹훅 서버 실행 확인: `curl http://localhost:3001/health`
2. 로그 확인: `tail -f webhook.log`
3. 봇이 대화방에 있는지 확인

### 로그 확인
```bash
# 실시간 로그
tail -f webhook.log

# 최근 로그
tail -20 webhook.log
```

## 📚 상세 문서

전체 문서는 `naver_works_notification_guide.md`를 참고하세요.
