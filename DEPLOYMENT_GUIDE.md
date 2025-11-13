# 🚀 배포 가이드

하우파파 프로젝트 관리 시스템을 Supabase + Netlify 환경에 배포하는 완전한 가이드입니다.

## ⚠️ 중요 사항

이 프로젝트는 Manus 플랫폼에서 Supabase + Netlify로 마이그레이션되었습니다. 
**현재 상태는 기본 구조만 완성된 상태이며, 추가 작업이 필요합니다.**

### 완료된 작업
- ✅ Supabase 데이터베이스 스키마 생성
- ✅ Supabase Auth Hook 구현
- ✅ 프론트엔드 코드 복사
- ✅ Netlify 배포 설정
- ✅ GitHub 저장소 생성 및 푸시

### 미완료 작업 (수동 작업 필요)
- ⚠️ 모든 페이지 컴포넌트를 Supabase API로 변경
- ⚠️ tRPC 호출을 Supabase 쿼리로 교체
- ⚠️ 인증 시스템 완전 교체
- ⚠️ 파일 업로드를 Supabase Storage로 변경

---

## 1단계: Supabase 프로젝트 설정

### 1.1 Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `howpapa-operation`
   - Database Password: 안전한 비밀번호 생성 (저장 필수!)
   - Region: `Northeast Asia (Seoul)` 선택
4. "Create new project" 클릭 (약 2분 소요)

### 1.2 데이터베이스 스키마 적용

1. Supabase 대시보드에서 **SQL Editor** 메뉴 클릭
2. "New query" 클릭
3. `supabase/schema.sql` 파일의 내용을 전체 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 실행
5. 성공 메시지 확인

### 1.3 Authentication 설정

1. Supabase 대시보드에서 **Authentication** → **Settings** 클릭
2. **Email Auth** 섹션:
   - "Enable Email Signup" 활성화
   - "Confirm email" 활성화 (선택사항)
3. **Site URL** 설정:
   - Development: `http://localhost:5173`
   - Production: 나중에 Netlify URL로 업데이트
4. **Redirect URLs** 추가:
   - `http://localhost:5173/**`
   - `https://your-netlify-site.netlify.app/**` (배포 후)

### 1.4 API 키 확인

1. Supabase 대시보드에서 **Settings** → **API** 클릭
2. 다음 정보 복사 (나중에 사용):
   - `Project URL`: `https://xxxxx.supabase.co`
   - `anon public` key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 2단계: Netlify 배포 설정

### 2.1 Netlify 계정 연결

1. [Netlify](https://netlify.com)에 로그인
2. "Add new site" → "Import an existing project" 클릭
3. GitHub 연결 및 `howpapa-sky/howpapa_operation` 저장소 선택

### 2.2 빌드 설정

1. Build settings 확인:
   ```
   Build command: pnpm build
   Publish directory: client/dist
   ```
2. "Show advanced" 클릭

### 2.3 환경변수 설정

Environment variables 섹션에서 다음 변수 추가:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_TITLE=하우파파 프로젝트 관리 시스템
```

### 2.4 배포 시작

1. "Deploy site" 클릭
2. 배포 완료 대기 (약 3-5분)
3. 배포 성공 후 사이트 URL 확인: `https://xxxxx.netlify.app`

### 2.5 Supabase Redirect URL 업데이트

1. Netlify에서 받은 URL 복사
2. Supabase 대시보드 → Authentication → Settings로 이동
3. **Site URL**을 Netlify URL로 업데이트
4. **Redirect URLs**에 `https://xxxxx.netlify.app/**` 추가

---

## 3단계: 로컬 개발 환경 설정

### 3.1 저장소 클론

```bash
git clone https://github.com/howpapa-sky/howpapa_operation.git
cd howpapa_operation
```

### 3.2 의존성 설치

```bash
pnpm install
```

### 3.3 환경변수 설정

`.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 편집:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_TITLE=하우파파 프로젝트 관리 시스템
```

### 3.4 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 4단계: 코드 수정 (필수!)

### ⚠️ 중요: 현재 코드는 작동하지 않습니다

모든 페이지 컴포넌트가 tRPC를 사용하고 있어서, Supabase API로 교체해야 합니다.

### 4.1 인증 시스템 교체

**기존 코드 (Manus Auth):**
```tsx
import { useAuth } from "@/_core/hooks/useAuth";

const { user, loading, isAuthenticated } = useAuth();
```

**새 코드 (Supabase Auth):**
```tsx
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const { user, loading, isAuthenticated, signIn, signOut } = useSupabaseAuth();
```

### 4.2 데이터 조회 교체

**기존 코드 (tRPC):**
```tsx
const { data: projects } = trpc.projects.list.useQuery();
```

**새 코드 (Supabase):**
```tsx
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const { data: projects } = useQuery({
  queryKey: ['projects'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
});
```

### 4.3 데이터 생성/수정 교체

**기존 코드 (tRPC):**
```tsx
const createProject = trpc.projects.create.useMutation();
```

**새 코드 (Supabase):**
```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();
const createProject = useMutation({
  mutationFn: async (data) => {
    const { data: result, error } = await supabase
      .from('projects')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  }
});
```

### 4.4 수정이 필요한 파일 목록

다음 파일들을 모두 Supabase API로 교체해야 합니다:

- `client/src/pages/Projects.tsx`
- `client/src/pages/ProjectForm.tsx`
- `client/src/pages/ProjectDetail.tsx`
- `client/src/pages/Samples.tsx`
- `client/src/pages/SampleForm.tsx`
- `client/src/pages/SampleDetail.tsx`
- `client/src/pages/Evaluate.tsx`
- `client/src/pages/EvaluateForm.tsx`
- `client/src/pages/Vendors.tsx`
- `client/src/pages/Accounts.tsx`
- `client/src/pages/Dashboard.tsx`
- `client/src/pages/MyTasks.tsx`
- `client/src/pages/Home.tsx`

---

## 5단계: 첫 사용자 생성

### 5.1 회원가입

1. 배포된 사이트 접속
2. "Sign Up" 클릭
3. 이메일, 비밀번호, 이름 입력
4. 이메일 확인 (Supabase에서 발송)

### 5.2 관리자 권한 부여

1. Supabase 대시보드 → **Table Editor** → `users` 테이블
2. 방금 생성한 사용자 찾기
3. `role` 컬럼을 `admin`으로 변경
4. Save

---

## 6단계: 커스텀 도메인 연결 (선택사항)

### 6.1 Netlify에서 도메인 추가

1. Netlify 사이트 대시보드 → **Domain settings**
2. "Add custom domain" 클릭
3. 도메인 입력 (예: `howpapa.com`)
4. DNS 설정 안내 확인

### 6.2 DNS 설정

도메인 등록 업체에서 다음 레코드 추가:

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

### 6.3 SSL 인증서

Netlify가 자동으로 Let's Encrypt SSL 인증서를 발급합니다 (약 1시간 소요).

---

## 7단계: 데이터 마이그레이션 (선택사항)

기존 Manus 프로젝트에 데이터가 있다면:

1. Manus 대시보드 → Database → Export
2. CSV 파일 다운로드
3. Supabase 대시보드 → Table Editor → Import
4. CSV 파일 업로드

---

## 🐛 문제 해결

### 빌드 실패

```bash
# 로컬에서 빌드 테스트
pnpm build

# 의존성 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 인증 오류

1. Supabase Authentication Settings 확인
2. Redirect URLs가 올바른지 확인
3. 브라우저 캐시 삭제

### 데이터베이스 연결 오류

1. Supabase Project URL이 올바른지 확인
2. anon key가 올바른지 확인
3. RLS 정책이 활성화되어 있는지 확인

---

## 📞 지원

- GitHub Issues: https://github.com/howpapa-sky/howpapa_operation/issues
- Supabase Docs: https://supabase.com/docs
- Netlify Docs: https://docs.netlify.com

---

## ⚠️ 최종 경고

**이 프로젝트는 아직 완성되지 않았습니다!**

모든 페이지 컴포넌트를 Supabase API로 교체하는 작업이 필요합니다. 
이 작업은 수일이 걸릴 수 있으며, React Query와 Supabase에 대한 이해가 필요합니다.

더 빠른 배포를 원하신다면, Manus 플랫폼에서 "Publish" 버튼을 클릭하는 것을 권장드립니다.
