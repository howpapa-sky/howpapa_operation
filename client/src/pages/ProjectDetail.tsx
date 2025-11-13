import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useLocation, useRoute } from "wouter";
import { Edit, Trash2, Calendar, AlertCircle, Users } from "lucide-react";

const PROJECT_TYPES = {
  sampling: "샘플링",
  detail_page: "상세페이지 제작",
  new_product: "신제품 출시",
  influencer: "인플루언서 협업",
};

const PROJECT_STATUS = {
  pending: "진행 전",
  in_progress: "진행 중",
  completed: "완료",
  on_hold: "보류",
};

const PRIORITIES = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  urgent: "긴급",
};

export default function ProjectDetail() {
  const { user } = useSupabaseAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id;

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const handleDelete = async () => {
    if (confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) {
        alert("프로젝트 삭제에 실패했습니다");
      } else {
        alert("프로젝트가 삭제되었습니다");
        navigate("/projects");
      }
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="프로젝트 상세">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto"></div>
            <p className="mt-4 text-gray-600">프로젝트를 불러오는 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!project) {
    return (
      <PageLayout title="프로젝트 상세">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">프로젝트를 찾을 수 없습니다</h2>
            <Button onClick={() => navigate("/projects")} className="bg-[#93C572] hover:bg-[#7AB05C]">
              프로젝트 목록으로
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="프로젝트 상세">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-[#93C572]/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-[#93C572]/20 text-[#7AB05C] rounded-full text-sm font-semibold">
                      {PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES]}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]}
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                      {PRIORITIES[project.priority as keyof typeof PRIORITIES]}
                    </span>
                    {project.brand && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        {project.brand === 'howpapa' ? '하우파파' : '누씨오'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/projects/${projectId}/edit`)}
                    className="border-[#93C572] text-[#93C572] hover:bg-[#93C572] hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                </div>
              </div>

              {project.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">프로젝트 설명</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.target_date && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#93C572]" />
                    <div>
                      <p className="text-sm text-gray-600">목표일</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(project.target_date).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                )}
                {project.deadline && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-600">마감일</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(project.deadline).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-[#93C572]/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 정보</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">생성일</p>
                  <p className="font-medium text-gray-900">
                    {new Date(project.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">최종 수정일</p>
                  <p className="font-medium text-gray-900">
                    {new Date(project.updated_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
