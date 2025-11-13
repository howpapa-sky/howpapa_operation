import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { BeakerIcon, ClipboardCheckIcon, BarChart3Icon, SparklesIcon, FolderKanban, Users, Bot, KeyRound, Target } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#F5F5F5]">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10" />}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#93C572] to-[#589B6A] bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:inline">{user?.name}</span>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">대시보드</Button>
                </Link>
              </div>
            ) : (
              <Button asChild className="bg-[#93C572] hover:bg-[#78A85E] text-white shadow-md">
                <a href={getLoginUrl()}>로그인</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#93C572]/10 rounded-full text-[#589B6A] text-sm font-medium mb-4">
            <SparklesIcon className="w-4 h-4" />
            <span>하우파파 프로젝트 관리 시스템</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            모든 프로젝트를<br />
            <span className="bg-gradient-to-r from-[#93C572] to-[#589B6A] bg-clip-text text-transparent">
              한 곳에서 관리하세요
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            샘플링, 프로젝트, 거래처 관리부터 AI 도우미까지<br className="hidden sm:block" />
            모든 브랜드 업무를 한 곳에서 효율적으로 관리하세요
          </p>
        </div>

        {/* Quick Access Buttons */}
        {isAuthenticated && (
          <div className="flex justify-center gap-4 mb-16">
            <Link href="/projects?type=sampling">
              <Button variant="outline" className="px-8 py-6 text-lg font-semibold border-2 border-[#93C572] hover:bg-[#93C572] hover:text-white transition-all">
                샘플
              </Button>
            </Link>
            <Link href="/projects?type=detail_page">
              <Button variant="outline" className="px-8 py-6 text-lg font-semibold border-2 border-[#93C572] hover:bg-[#93C572] hover:text-white transition-all">
                상세페이지
              </Button>
            </Link>
            <Link href="/projects?type=group_buying">
              <Button variant="outline" className="px-8 py-6 text-lg font-semibold border-2 border-[#93C572] hover:bg-[#93C572] hover:text-white transition-all">
                공구운영
              </Button>
            </Link>
            <Link href="/projects?type=influencer">
              <Button variant="outline" className="px-8 py-6 text-lg font-semibold border-2 border-[#93C572] hover:bg-[#93C572] hover:text-white transition-all">
                인플루언서
              </Button>
            </Link>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Link href="/my-tasks">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#93C572] to-[#589B6A] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">My Tasks</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  나에게 할당된 작업을 효율적으로 관리하세요
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                    우선순위별 작업 분류
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                    Focus 모드 (몰입 중심)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                    마감일 알림
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#6B8E23] to-[#556B2F] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <FolderKanban className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">프로젝트 관리</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  브랜드 업무 프로젝트를 체계적으로 관리합니다
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                    샘플링, 상세페이지, 신제품 출시
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                    진행 상황 및 마감일 관리
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                    중요도 및 우선순위 설정
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vendors">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#8FBC8F] to-[#6B8E23] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">거래처 관리</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  협력 거래처 정보를 통합 관리합니다
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                    제조사, 디자이너, 인플루언서
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                    연락처 및 담당자 관리
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                    프로젝트별 협력 이력
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ai-assistant">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#9370DB] to-[#8A2BE2] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI 업무 도우미</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  업무 가이드를 확인하고 AI에게 질문하세요
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#9370DB] rounded-full" />
                    업무 프로세스 가이드
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#9370DB] rounded-full" />
                    체크리스트 자동 생성
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#9370DB] rounded-full" />
                    신입 온보딩 지원
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>
          <Link href="/samples">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#93C572] to-[#78A85E] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <BeakerIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">샘플 관리</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                차수별 샘플 정보를 등록하고 관리합니다
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                  제조사 및 랩넘버 기록
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                  샘플 메모 관리
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#93C572] rounded-full" />
                  히스토리 추적
                </li>
              </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/samples">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#589B6A] to-[#478556] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <ClipboardCheckIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">평가 입력</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                평가자별로 상세한 품평 결과를 입력합니다
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#589B6A] rounded-full" />
                  항목별 점수 평가
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#589B6A] rounded-full" />
                  상세 피드백 작성
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#589B6A] rounded-full" />
                  개선 요청 사항 기록
                </li>
              </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#78A85E] to-[#5C8A4A] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <BarChart3Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">비교 분석</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                차수별 평가 결과를 비교하고 분석합니다
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#78A85E] rounded-full" />
                  차수별 점수 비교
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#78A85E] rounded-full" />
                  평가자별 피드백 확인
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#78A85E] rounded-full" />
                  개선 추이 파악
                </li>
              </ul>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/accounts">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#8B7AB8] to-[#6B5A98] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <KeyRound className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">계정 관리</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  모든 채널의 계정 정보를 안전하게 관리합니다
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#8B7AB8] rounded-full" />
                    마케팅 채널 계정
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#8B7AB8] rounded-full" />
                    판매채널 계정
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#8B7AB8] rounded-full" />
                    제품 관련 계정
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* CTA Section */}
        {isAuthenticated && (
          <div className="text-center">
            <div className="inline-flex gap-4">
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-2 border-[#93C572] text-[#589B6A] hover:bg-[#93C572]/10"
                >
                  대시보드 보기
                </Button>
              </Link>
              <Link href="/samples">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white shadow-lg"
                >
                  샘플 관리 시작하기
                </Button>
              </Link>
              <Link href="/projects?type=detail_page">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white shadow-lg"
                >
                  상세페이지 관리 시작하기
                </Button>
              </Link>
              <Link href="/projects?type=group_buying">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white shadow-lg"
                >
                  공구운영 관리 시작하기
                </Button>
              </Link>
              <Link href="/projects?type=influencer">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white shadow-lg"
                >
                  인플루언서 관리 시작하기
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8 py-6 border-2 border-[#93C572] text-[#589B6A] hover:bg-[#93C572]/10"
                  >
                    관리자 페이지
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 하우파파. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
