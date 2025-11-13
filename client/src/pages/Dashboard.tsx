import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Target,
  FolderKanban, 
  Users,
  Bot,
  TestTube,
  ClipboardCheck,
  CheckCircle2,
  Flame,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#93C572', '#3B82F6', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const { user } = useSupabaseAuth();

  // 프로젝트 데이터 조회
  const { data: projects = [] } = useQuery({
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

  // My Tasks 데이터 (프로젝트 기반)
  const allTasks = projects.length;
  const focusTasks = projects.filter((p: any) => p.priority === 'high').length;
  const urgentTasks = projects.filter((p: any) => p.priority === 'urgent').length;
  const overdueTasks = projects.filter((p: any) => {
    if (!p.end_date) return false;
    return new Date(p.end_date) < new Date() && p.status !== 'completed';
  }).length;

  // 프로젝트 통계
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  const inProgressProjects = projects.filter((p: any) => p.status === 'in_progress').length;
  const pendingProjects = projects.filter((p: any) => p.status === 'pending').length;

  // 프로젝트 유형별 통계
  const projectTypeData = [
    { name: '샘플링', value: projects.filter((p: any) => p.type === 'sampling').length },
    { name: '상세페이지', value: projects.filter((p: any) => p.type === 'detail_page').length },
    { name: '신제품', value: projects.filter((p: any) => p.type === 'new_product').length },
    { name: '인플루언서', value: projects.filter((p: any) => p.type === 'influencer').length },
  ];

  // 프로젝트 상태별 통계
  const projectStatusData = [
    { name: '완료', value: completedProjects, color: '#10B981' },
    { name: '진행중', value: inProgressProjects, color: '#3B82F6' },
    { name: '대기', value: pendingProjects, color: '#6B7280' },
  ];

  const categoryCards = [
    {
      title: 'My Tasks',
      description: '나에게 할당된 작업을 효율적으로 관리하세요',
      icon: Target,
      color: 'bg-[#93C572]',
      items: [
        '우선순위별 작업 분류',
        'Focus 모드 (몰입 중심)',
        '마감일 알림'
      ],
      link: '/my-tasks'
    },
    {
      title: '프로젝트 관리',
      description: '브랜드 업무 프로젝트를 체계적으로 관리합니다',
      icon: FolderKanban,
      color: 'bg-[#7B9D5E]',
      items: [
        '샘플링, 상세페이지, 신제품 출시',
        '진행 상황 및 마감일 관리',
        '중요도 및 우선순위 설정'
      ],
      link: '/projects'
    },
    {
      title: '거래처 관리',
      description: '협력 거래처 정보를 통합 관리합니다',
      icon: Users,
      color: 'bg-[#A8C686]',
      items: [
        '제조사, 디자이너, 인플루언서',
        '연락처 및 담당자 관리',
        '프로젝트별 협력 이력'
      ],
      link: '/vendors'
    },
    {
      title: 'AI 업무 도우미',
      description: '업무 가이드를 활용하고 AI에게 질문하세요',
      icon: Bot,
      color: 'bg-[#8B7AA8]',
      items: [
        '업무 프로세스 가이드',
        '체크리스트 자동 생성',
        '실시간 온보딩 지원'
      ],
      link: '/ai-assistant'
    },
    {
      title: '샘플 관리',
      description: '차수별 샘플 정보를 등록하고 관리합니다',
      icon: TestTube,
      color: 'bg-[#7B9D5E]',
      items: [
        '제조사 및 평판력 기록',
        '샘플 메모 관리',
        '히스토리 추적'
      ],
      link: '/samples'
    },
    {
      title: '평가 입력',
      description: '평가자별로 상세한 품질 결과를 입력합니다',
      icon: ClipboardCheck,
      color: 'bg-[#93C572]',
      items: [
        '항목별 점수 평가',
        '샘플 피드백 작성',
        '개선 요청 사항 기록'
      ],
      link: '/samples?tab=evaluators'
    },
  ];

  return (
    <PageLayout title="대시보드">
      <div className="space-y-8">
        {/* My Tasks 섹션 */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-[#93C572]" />
            <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
          </div>
          <p className="text-gray-600 mb-6">나에게 할당된 작업을 효율적으로 관리하세요</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/my-tasks">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-gray-400">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">전체 작업</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-700">{allTasks}건</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/my-tasks?filter=focus">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-[#93C572]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Focus 목록</CardTitle>
                  <Target className="h-4 w-4 text-[#93C572]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#93C572]">{focusTasks}건</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/my-tasks?filter=urgent">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">긴급/중요</CardTitle>
                  <Flame className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">{urgentTasks}건</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/my-tasks?filter=overdue">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">마감 임박</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-500">{overdueTasks}건</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* 현황 그래프 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#93C572]" />
                프로젝트 유형별 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#93C572" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#93C572]" />
                프로젝트 상태별 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 카테고리 카드 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryCards.map((card, index) => (
              <Link key={index} href={card.link}>
                <Card className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                  <CardHeader>
                    <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center mb-4`}>
                      <card.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">{card.title}</CardTitle>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {card.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-[#93C572] mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
