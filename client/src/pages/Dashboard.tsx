import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  FolderKanban, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from "lucide-react";

export default function Dashboard() {
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

  // 통계 계산
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p: any) => p.status === 'in_progress').length;
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  const overdueProjects = projects.filter((p: any) => {
    if (!p.target_date || p.status === 'completed') return false;
    return new Date(p.target_date) < new Date();
  }).length;

  // 프로젝트 유형별 통계
  const projectsByType = {
    sampling: projects.filter((p: any) => p.type === 'sampling').length,
    detail_page: projects.filter((p: any) => p.type === 'detail_page').length,
    new_product: projects.filter((p: any) => p.type === 'new_product').length,
    influencer: projects.filter((p: any) => p.type === 'influencer').length,
  };

  // 우선순위별 통계
  const urgentProjects = projects.filter((p: any) => p.priority === 'urgent').length;
  const highProjects = projects.filter((p: any) => p.priority === 'high').length;

  // 최근 프로젝트
  const recentProjects = projects.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50]">대시보드</h1>
          <Link href="/projects/new">
            <Button className="bg-[#93C572] hover:bg-[#7FB05B]">
              새 프로젝트
            </Button>
          </Link>
        </div>

        {/* KPI 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 프로젝트</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                진행 중 {inProgressProjects}건
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료된 프로젝트</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects}</div>
              <p className="text-xs text-muted-foreground">
                완료율 {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">긴급 프로젝트</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{urgentProjects}</div>
              <p className="text-xs text-muted-foreground">
                높음 {highProjects}건
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">지연 프로젝트</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{overdueProjects}</div>
              <p className="text-xs text-muted-foreground">
                목표일 초과
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 프로젝트 유형별 통계 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>프로젝트 유형별 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/projects?type=sampling">
                <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-blue-600">{projectsByType.sampling}</div>
                  <div className="text-sm text-blue-700">샘플링</div>
                </div>
              </Link>
              <Link href="/projects?type=detail_page">
                <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-green-600">{projectsByType.detail_page}</div>
                  <div className="text-sm text-green-700">상세페이지</div>
                </div>
              </Link>
              <Link href="/projects?type=new_product">
                <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-purple-600">{projectsByType.new_product}</div>
                  <div className="text-sm text-purple-700">신제품</div>
                </div>
              </Link>
              <Link href="/projects?type=influencer">
                <div className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-orange-600">{projectsByType.influencer}</div>
                  <div className="text-sm text-orange-700">인플루언서</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 최근 프로젝트 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>최근 프로젝트</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm">전체 보기</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project: any) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-gray-600">
                        {project.type === 'sampling' && '샘플링'}
                        {project.type === 'detail_page' && '상세페이지'}
                        {project.type === 'new_product' && '신제품'}
                        {project.type === 'influencer' && '인플루언서'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {project.target_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.target_date).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-700' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status === 'completed' && '완료'}
                        {project.status === 'in_progress' && '진행 중'}
                        {project.status === 'pending' && '진행 전'}
                        {project.status === 'on_hold' && '보류'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {recentProjects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  프로젝트가 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
