# 하우파파 프로젝트 관리 시스템

Netlify + Supabase 기반 프로젝트 관리 시스템

## 🚀 배포 가이드

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 파일 실행
3. Authentication → Settings에서 이메일 인증 활성화
4. Settings → API에서 다음 값 복사:
   - Project URL
   - anon public key

### 2. Netlify 설정

1. [Netlify](https://netlify.com)에 가입
2. GitHub 저장소 `howpapa_operation` 연결
3. Build settings:
   - Build command: `pnpm build`
   - Publish directory: `client/dist`
4. Environment variables 설정:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. 로컬 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase 정보 입력

# 개발 서버 실행
pnpm dev
```

### 4. 환경변수 (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📁 프로젝트 구조

```
howpapa_operation/
├── client/               # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── components/  # 재사용 가능한 컴포넌트
│   │   ├── pages/       # 페이지 컴포넌트
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Supabase 클라이언트 등
│   │   └── App.tsx      # 메인 앱
│   └── dist/            # 빌드 결과물
├── supabase/            # Supabase 스키마 및 설정
│   └── schema.sql       # 데이터베이스 스키마
└── README.md
```

## 🔑 주요 기능

- ✅ 프로젝트 관리 (샘플링, 상세페이지, 신제품, 인플루언서)
- ✅ 샘플 관리 및 평가
- ✅ 거래처 관리
- ✅ 계정 관리
- ✅ 우선순위 기반 작업 관리
- ✅ 대시보드 및 통계

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Netlify
- **State Management**: React Query (TanStack Query)

## 📝 데이터베이스 스키마

주요 테이블:
- `users`: 사용자 정보
- `projects`: 프로젝트 관리
- `samples`: 샘플 정보
- `evaluations`: 샘플 평가
- `vendors`: 거래처 정보
- `accounts`: 계정 관리

자세한 스키마는 `supabase/schema.sql` 참조

## 🔒 보안

- Row Level Security (RLS) 활성화
- Supabase Auth를 통한 인증
- 역할 기반 접근 제어 (user, admin)

## 📞 문의

프로젝트 관련 문의: [GitHub Issues](https://github.com/howpapa-sky/howpapa_operation/issues)

## 📄 라이선스

© 2025 하우파파. All rights reserved.
