import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  AlertTriangle, 
  Clock, 
  Briefcase, 
  Target,
  CheckCircle2,
  TrendingUp,
  Package,
  Users,
  FileText,
  Megaphone,
  ShoppingCart
} from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#93C572", "#589B6A", "#78A85E", "#5C8A4A", "#A8D48D"];

const PROJECT_STATUS_COLORS: Record<string, string> = {
  pending: "#94a3b8",
  in_progress: "#3b82f6",
  completed: "#10b981",
  on_hold: "#f59e0b",
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
  pending: "진행 전",
  in_progress: "진행 중",
  completed: "완료",
  on_hold: "보류",
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  sampling: "샘플링",
  detail_page: "상세페이지",
  new_product: "신제품",
  influencer: "인플루언서",
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "긴급",
  high: "높음",
  medium: "중간",
  low: "낮음",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-blue-100 text-blue-800 border-blue-300",
  low: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: projects = [] } = trpc.projects.list.useQuery();
  const { data: samples } = trpc.samples.list.useQuery();

  // 프로젝트 통계
  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const urgentProjects = projects.filter(p => p.priority === 'urgent' && p.status !== 'completed');
  
  // 목표일 기준 지연 프로젝트
  const overdueProjects = projects.filter(p => {
    if (!p.targetDate || p.status === 'completed') return false;
    return new Date(p.targetDate) < new Date();
  });

  // 목표일 임박 프로젝트 (7일 이내)
  const upcomingDeadlines = projects.filter(p => {
    if (!p.targetDate || p.status === 'completed') return false;
    const daysUntil = Math.ceil((new Date(p.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  }).sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime());

  // 우선순위별 프로젝트 필터링
  const projectsByPriority = (priority: string) => {
    return projects.filter(p => p.priority === priority && p.status !== 'completed');
  };

  // 프로젝트 유형별 통계
  const projectsByType = projects.reduce((acc, project) => {
    const type = project.type;
    if (!acc[type]) {
      acc[type] = { 
        name: PROJECT_TYPE_LABELS[type] || type, 
        total: 0,
        active: 0,
        completed: 0
      };
    }
    acc[type].total++;
    if (project.status === 'in_progress') acc[type].active++;
    if (project.status === 'completed') acc[type].completed++;
    return acc;
  }, {} as Record<string, { name: string; total: number; active: number; completed: number }>);

  // 프로젝트 상태별 분포
  const projectsByStatus = projects.reduce((acc, project) => {
    const status = project.status;
    if (!acc[status]) {
      acc[status] = { name: PROJECT_STATUS_LABELS[status] || status, value: 0, fill: PROJECT_STATUS_COLORS[status] };
    }
    acc[status].value++;
    return acc;
  }, {} as Record<string, { name: string; value: number; fill: string }>);

  // 샘플 확정 통계
  const sampleConfirmedCount = projects.filter(p => p.sampleConfirmed === 1).length;
  const samplePendingCount = projects.filter(p => p.type === 'sampling' && p.sampleConfirmed === 0).length;

  // D-day 계산 함수
  const calculateDday = (targetDate: string | null) => {
    if (!targetDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "D-Day";
    if (diff > 0) return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">로그인이 필요합니다</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">대시보드를 보려면 로그인해주세요.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
              <p className="text-sm text-gray-600 mt-1">통합 대시보드</p>
            </div>
            <div className="flex gap-3">
              <Link href="/projects/new">
                <Button className="bg-[#93C572] hover:bg-[#78A85E]">
                  + 새 프로젝트
                </Button>
              </Link>
              <Link href="/home">
                <Button variant="outline">
                  전체 메뉴
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* 긴급 알림 섹션 */}
        {(overdueProjects.length > 0 || urgentProjects.length > 0 || upcomingDeadlines.length > 0) && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                긴급 알림
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {overdueProjects.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-red-800">목표일 지연</span>
                      <Badge variant="destructive">{overdueProjects.length}</Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      {overdueProjects.slice(0, 3).map(project => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                          <div className="text-sm hover:bg-red-50 p-2 rounded cursor-pointer">
                            <div className="font-medium text-gray-900">{project.name}</div>
                            <div className="text-xs text-red-600">{calculateDday(project.targetDate)}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {urgentProjects.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-orange-800">긴급 프로젝트</span>
                      <Badge className="bg-orange-100 text-orange-800">{urgentProjects.length}</Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      {urgentProjects.slice(0, 3).map(project => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                          <div className="text-sm hover:bg-orange-50 p-2 rounded cursor-pointer">
                            <div className="font-medium text-gray-900">{project.name}</div>
                            <div className="text-xs text-orange-600">{PROJECT_STATUS_LABELS[project.status]}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {upcomingDeadlines.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">마감 임박 (7일 이내)</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{upcomingDeadlines.length}</Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      {upcomingDeadlines.slice(0, 3).map(project => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                          <div className="text-sm hover:bg-yellow-50 p-2 rounded cursor-pointer">
                            <div className="font-medium text-gray-900">{project.name}</div>
                            <div className="text-xs text-yellow-600">{calculateDday(project.targetDate)}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI 카드 */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">진행 중인 프로젝트</p>
                  <p className="text-3xl font-bold text-gray-900">{activeProjects.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">완료된 프로젝트</p>
                  <p className="text-3xl font-bold text-gray-900">{completedProjects.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">샘플 확정</p>
                  <p className="text-3xl font-bold text-gray-900">{sampleConfirmedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">대기 중: {samplePendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">완료율</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {projects.length > 0 ? Math.round((completedProjects.length / projects.length) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 업무별 통계 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>업무별 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {Object.values(projectsByType).map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {stat.name === '샘플링' && <Package className="w-5 h-5 text-[#93C572]" />}
                    {stat.name === '상세페이지' && <FileText className="w-5 h-5 text-[#93C572]" />}
                    {stat.name === '신제품' && <ShoppingCart className="w-5 h-5 text-[#93C572]" />}
                    {stat.name === '인플루언서' && <Megaphone className="w-5 h-5 text-[#93C572]" />}
                    <span className="font-semibold text-gray-900">{stat.name}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">전체</span>
                      <span className="font-semibold">{stat.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">진행 중</span>
                      <span className="font-semibold text-blue-600">{stat.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">완료</span>
                      <span className="font-semibold text-green-600">{stat.completed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 우선순위별 탭 */}
        <Card>
          <CardHeader>
            <CardTitle>우선순위별 프로젝트</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">
                  전체 ({projects.filter(p => p.status !== 'completed').length})
                </TabsTrigger>
                <TabsTrigger value="urgent">
                  긴급 ({projectsByPriority('urgent').length})
                </TabsTrigger>
                <TabsTrigger value="high">
                  높음 ({projectsByPriority('high').length})
                </TabsTrigger>
                <TabsTrigger value="medium">
                  중간 ({projectsByPriority('medium').length})
                </TabsTrigger>
                <TabsTrigger value="low">
                  낮음 ({projectsByPriority('low').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <ProjectList projects={projects.filter(p => p.status !== 'completed')} calculateDday={calculateDday} />
              </TabsContent>

              <TabsContent value="urgent" className="mt-6">
                <ProjectList projects={projectsByPriority('urgent')} calculateDday={calculateDday} />
              </TabsContent>

              <TabsContent value="high" className="mt-6">
                <ProjectList projects={projectsByPriority('high')} calculateDday={calculateDday} />
              </TabsContent>

              <TabsContent value="medium" className="mt-6">
                <ProjectList projects={projectsByPriority('medium')} calculateDday={calculateDday} />
              </TabsContent>

              <TabsContent value="low" className="mt-6">
                <ProjectList projects={projectsByPriority('low')} calculateDday={calculateDday} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 차트 섹션 */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 상태별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.values(projectsByStatus)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.values(projectsByStatus).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>업무 유형별 진행 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.values(projectsByType)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill="#3b82f6" name="진행 중" />
                  <Bar dataKey="completed" fill="#10b981" name="완료" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// 프로젝트 목록 컴포넌트
function ProjectList({ 
  projects, 
  calculateDday 
}: { 
  projects: any[]; 
  calculateDday: (targetDate: string | null) => string | null;
}) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        해당 우선순위의 프로젝트가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map(project => {
        const dday = calculateDday(project.targetDate);
        const isOverdue = project.targetDate && new Date(project.targetDate) < new Date();

        return (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <Badge className={PRIORITY_COLORS[project.priority as string]}>
                      {PRIORITY_LABELS[project.priority as string]}
                    </Badge>
                    <Badge variant="outline">
                      {PROJECT_TYPE_LABELS[project.type as string]}
                    </Badge>
                    {project.sampleConfirmed === 1 && (
                      <Badge className="bg-green-100 text-green-800">샘플 확정</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {project.brand && <div>브랜드: {project.brand}</div>}
                    {project.productName && <div>제품: {project.productName}</div>}
                    {project.manufacturer && <div>제조사: {project.manufacturer}</div>}
                    <div className="flex gap-4 mt-2">
                      {project.startDate && (
                        <span className="text-xs">시작일: {project.startDate}</span>
                      )}
                      {project.targetDate && (
                        <span className="text-xs">목표일: {project.targetDate}</span>
                      )}
                      {project.completedDate && (
                        <span className="text-xs text-green-600">완료일: {project.completedDate}</span>
                      )}
                    </div>
                  </div>
                </div>
                {dday && (
                  <div className={`text-sm font-semibold px-3 py-1 rounded ${
                    isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {dday}
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
