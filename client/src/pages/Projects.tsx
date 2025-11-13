import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Link, useLocation } from "wouter";
import { Plus, Calendar, AlertCircle, CheckCircle, Clock, Pause } from "lucide-react";

const PROJECT_TYPES = {
  sampling: "샘플링",
  detail_page: "상세페이지 제작",
  new_product: "신제품 출시",
  influencer: "인플루언서 협업",
};

const PROJECT_STATUS = {
  pending: { label: "진행 전", icon: Clock, color: "text-gray-500" },
  in_progress: { label: "진행 중", icon: AlertCircle, color: "text-blue-500" },
  completed: { label: "완료", icon: CheckCircle, color: "text-green-500" },
  on_hold: { label: "보류", icon: Pause, color: "text-yellow-500" },
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const PRIORITY_LABELS = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  urgent: "긴급",
};

export default function Projects() {
  const [location] = useLocation();
  const { user } = useSupabaseAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // URL 쿼리 파라미터에서 type 추출
  useState(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const typeParam = params.get('type');
    if (typeParam) setSelectedType(typeParam);
  });

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

  const canEdit = user && (user.role === 'admin' || user.role === 'manager');

  const filteredProjects = projects.filter((project: any) => {
    if (selectedType && project.type !== selectedType) return false;
    if (selectedStatus && project.status !== selectedStatus) return false;
    return true;
  });

  const getDdayText = (targetDate: string | null) => {
    if (!targetDate) return null;
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    if (diffDays === 0) return "D-Day";
    return `D-${diffDays}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50]">프로젝트 관리</h1>
          {canEdit && (
            <Link href="/projects/new">
              <Button className="bg-[#93C572] hover:bg-[#7FB05B]">
                <Plus className="w-4 h-4 mr-2" />
                새 프로젝트
              </Button>
            </Link>
          )}
        </div>

        {/* 필터 */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex gap-2">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              onClick={() => setSelectedType(null)}
            >
              전체
            </Button>
            {Object.entries(PROJECT_TYPES).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedType === key ? "default" : "outline"}
                onClick={() => setSelectedType(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
              <Button
                key={key}
                variant={selectedStatus === key ? "default" : "outline"}
                onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* 프로젝트 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project: any) => {
            const StatusIcon = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.icon || Clock;
            const statusColor = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.color || "text-gray-500";
            const ddayText = getDdayText(project.target_date);

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-600">
                        {PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES]}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[project.priority as keyof typeof PRIORITY_COLORS]}`}>
                        {PRIORITY_LABELS[project.priority as keyof typeof PRIORITY_LABELS]}
                      </span>
                      {ddayText && (
                        <span className={`text-sm font-semibold ${ddayText.startsWith('D+') ? 'text-red-500' : 'text-blue-500'}`}>
                          {ddayText}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                    <span>{PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.label}</span>
                  </div>

                  {project.target_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>목표일: {new Date(project.target_date).toLocaleDateString('ko-KR')}</span>
                    </div>
                  )}

                  {project.description && (
                    <p className="mt-3 text-sm text-gray-700 line-clamp-2">{project.description}</p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">프로젝트가 없습니다.</p>
            {canEdit && (
              <Link href="/projects/new">
                <Button className="mt-4 bg-[#93C572] hover:bg-[#7FB05B]">
                  첫 프로젝트 만들기
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
