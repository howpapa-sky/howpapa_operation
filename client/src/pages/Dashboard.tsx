import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  FolderKanban, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Package,
  FileText,
  Users,
  ArrowRight,
  Plus
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = {
  sampling: '#8B5CF6',
  detail_page: '#3B82F6',
  new_product: '#10B981',
  influencer: '#F59E0B',
};

const STATUS_COLORS = {
  pending: '#6B7280',
  in_progress: '#3B82F6',
  completed: '#10B981',
  on_hold: '#F59E0B',
};

export default function Dashboard() {
  const { data: projects = [], isLoading } = useQuery({
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

  // 통계 계산
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p: any) => p.status === 'in_progress').length;
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  const overdueProjects = projects.filter((p: any) => {
    if (!p.target_date || p.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(p.target_date);
    target.setHours(0, 0, 0, 0);
    return target < today;
  }).length;

  // 프로젝트 유형별 통계
  const projectsByType = {
    sampling: projects.filter((p: any) => p.type === 'sampling').length,
    detail_page: projects.filter((p: any) => p.type === 'detail_page').length,
    new_product: projects.filter((p: any) => p.type === 'new_product').length,
    influencer: projects.filter((p: any) => p.type === 'influencer').length,
  };

  // 상태별 통계
  const projectsByStatus = {
    pending: projects.filter((p: any) => p.status === 'pending').length,
    in_progress: inProgressProjects,
    completed: completedProjects,
    on_hold: projects.filter((p: any) => p.status === 'on_hold').length,
  };

  // 우선순위별 통계
  const urgentProjects = projects.filter((p: any) => p.priority === 'urgent').length;
  const highProjects = projects.filter((p: any) => p.priority === 'high').length;

  // 최근 프로젝트
  const recentProjects = projects.slice(0, 5);

  // 차트 데이터
  const typeChartData = [
    { name: '샘플링', value: projectsByType.sampling, color: COLORS.sampling },
    { name: '상세페이지', value: projectsByType.detail_page, color: COLORS.detail_page },
    { name: '신제품', value: projectsByType.new_product, color: COLORS.new_product },
    { name: '인플루언서', value: projectsByType.influencer, color: COLORS.influencer },
  ];

  const statusChartData = [
    { name: '진행 전', value: projectsByStatus.pending },
    { name: '진행 중', value: projectsByStatus.in_progress },
    { name: '완료', value: projectsByStatus.completed },
    { name: '보류', value: projectsByStatus.on_hold },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">대시보드</h1>
            <p className="text-gray-600">프로젝트 현황을 한눈에 확인하세요</p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-[#93C572] hover:bg-[#7FB05B] shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              새 프로젝트
            </Button>
          </Link>
        </div>

        {/* KPI 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">전체 프로젝트</CardTitle>
              <FolderKanban className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C3E50]">{totalProjects}</div>
              <p className="text-xs text-gray-500 mt-1">
                진행 중 <span className="font-semibold text-blue-600">{inProgressProjects}건</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">완료된 프로젝트</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedProjects}</div>
              <p className="text-xs text-gray-500 mt-1">
                완료율 <span className="font-semibold text-green-600">{totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">긴급 프로젝트</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{urgentProjects}</div>
              <p className="text-xs text-gray-500 mt-1">
                높음 <span className="font-semibold text-orange-600">{highProjects}건</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">지연 프로젝트</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{overdueProjects}</div>
              <p className="text-xs text-gray-500 mt-1">
                목표일 초과
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 프로젝트 유형별 통계 차트 */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#93C572]" />
                프로젝트 유형별 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalProjects > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 프로젝트 상태별 통계 차트 */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#93C572]" />
                프로젝트 상태별 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalProjects > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#93C572" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 프로젝트 유형별 빠른 접근 */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle>프로젝트 유형별 빠른 접근</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/projects?type=sampling">
                <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all cursor-pointer border-2 border-transparent hover:border-purple-300 shadow-sm">
                  <Package className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{projectsByType.sampling}</div>
                  <div className="text-sm text-purple-700 font-medium">샘플링</div>
                </div>
              </Link>
              <Link href="/projects?type=detail_page">
                <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all cursor-pointer border-2 border-transparent hover:border-blue-300 shadow-sm">
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{projectsByType.detail_page}</div>
                  <div className="text-sm text-blue-700 font-medium">상세페이지</div>
                </div>
              </Link>
              <Link href="/projects?type=new_product">
                <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all cursor-pointer border-2 border-transparent hover:border-green-300 shadow-sm">
                  <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{projectsByType.new_product}</div>
                  <div className="text-sm text-green-700 font-medium">신제품</div>
                </div>
              </Link>
              <Link href="/projects?type=influencer">
                <div className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all cursor-pointer border-2 border-transparent hover:border-orange-300 shadow-sm">
                  <Users className="w-8 h-8 text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{projectsByType.influencer}</div>
                  <div className="text-sm text-orange-700 font-medium">인플루언서</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 최근 프로젝트 */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>최근 프로젝트</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="text-[#93C572] hover:text-[#7FB05B]">
                  전체 보기
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProjects.map((project: any) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer border-2 border-transparent hover:border-[#93C572]">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#2C3E50] mb-1">{project.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {project.type === 'sampling' && '샘플링'}
                          {project.type === 'detail_page' && '상세페이지'}
                          {project.type === 'new_product' && '신제품'}
                          {project.type === 'influencer' && '인플루언서'}
                        </Badge>
                        {project.brand && (
                          <span className="text-xs text-gray-500">• {project.brand}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {project.target_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.target_date).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                      <Badge className={
                        project.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                        project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                        'bg-gray-100 text-gray-700 border-gray-300'
                      }>
                        {project.status === 'completed' && '완료'}
                        {project.status === 'in_progress' && '진행 중'}
                        {project.status === 'pending' && '진행 전'}
                        {project.status === 'on_hold' && '보류'}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
              {recentProjects.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>프로젝트가 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
