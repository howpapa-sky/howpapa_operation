import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  CheckCircle2,
  Target,
  Flame,
  Calendar,
  Circle,
  ArrowRight
} from "lucide-react";

export default function MyTasks() {
  const { user } = useSupabaseAuth();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const filter = searchParams.get('filter') || 'all';

  // 프로젝트 데이터 조회
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false});
      if (error) throw error;
      return data;
    }
  });

  // 필터링
  const filteredProjects = projects.filter((project: any) => {
    if (filter === 'focus') return project.priority === 'high';
    if (filter === 'urgent') return project.priority === 'urgent';
    if (filter === 'overdue') {
      if (!project.end_date) return false;
      return new Date(project.end_date) < new Date() && project.status !== 'completed';
    }
    return true;
  });

  const allTasks = projects.length;
  const focusTasks = projects.filter((p: any) => p.priority === 'high').length;
  const urgentTasks = projects.filter((p: any) => p.priority === 'urgent').length;
  const overdueTasks = projects.filter((p: any) => {
    if (!p.end_date) return false;
    return new Date(p.end_date) < new Date() && p.status !== 'completed';
  }).length;

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '대기',
      in_progress: '진행중',
      completed: '완료',
      on_hold: '보류',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      on_hold: 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: '낮음',
      medium: '보통',
      high: '높음',
      urgent: '긴급',
    };
    return labels[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <PageLayout title="My Tasks">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-[#93C572]" />
            <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          </div>
          <p className="text-gray-600">나에게 할당된 작업을 효율적으로 관리하세요</p>
        </div>

        {/* 작업 현황 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/my-tasks">
            <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${filter === 'all' ? 'ring-2 ring-[#93C572]' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 작업</CardTitle>
                <Circle className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-700">{allTasks}건</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/my-tasks?filter=focus">
            <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${filter === 'focus' ? 'ring-2 ring-[#93C572]' : ''}`}>
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
            <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${filter === 'urgent' ? 'ring-2 ring-red-500' : ''}`}>
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
            <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${filter === 'overdue' ? 'ring-2 ring-orange-500' : ''}`}>
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

        {/* 작업 목록 */}
        {filteredProjects.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-[#93C572] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">모든 작업을 완료했습니다!</h3>
              <p className="text-gray-600">새로운 프로젝트를 시작하거나 휴식을 취하세요</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project: any) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                          <Badge className={getPriorityColor(project.priority)}>
                            {getPriorityLabel(project.priority)}
                          </Badge>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {project.start_date && (
                            <span>시작: {new Date(project.start_date).toLocaleDateString('ko-KR')}</span>
                          )}
                          {project.end_date && (
                            <span className={new Date(project.end_date) < new Date() && project.status !== 'completed' ? 'text-red-500 font-semibold' : ''}>
                              마감: {new Date(project.end_date).toLocaleDateString('ko-KR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
