import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Plus, Calendar, AlertCircle, CheckCircle, Clock, Pause } from "lucide-react";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data: projects = [], isLoading, refetch } = trpc.projects.list.useQuery();

  const canEdit = user && (user.role === "admin" || user.role === "manager");

  const filteredProjects = projects.filter((project) => {
    if (selectedType && project.type !== selectedType) return false;
    if (selectedStatus && project.status !== selectedStatus) return false;
    return true;
  });

  const groupedProjects = filteredProjects.reduce((acc, project) => {
    if (!acc[project.type]) acc[project.type] = [];
    acc[project.type].push(project);
    return acc;
  }, {} as Record<string, typeof projects>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8F2] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto"></div>
          <p className="mt-4 text-gray-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8F2] to-white">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">프로젝트 관리</h1>
            <p className="text-gray-600">브랜드 업무 프로젝트를 효율적으로 관리하세요</p>
          </div>
          {canEdit && (
            <Link href="/projects/new">
              <Button className="bg-[#93C572] hover:bg-[#7AB05C] text-white">
                <Plus className="w-5 h-5 mr-2" />
                새 프로젝트
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 유형</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(null)}
                className={selectedType === null ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
              >
                전체
              </Button>
              {Object.entries(PROJECT_TYPES).map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedType === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(key)}
                  className={selectedType === key ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">진행 상태</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedStatus === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(null)}
                className={selectedStatus === null ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
              >
                전체
              </Button>
              {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
                <Button
                  key={key}
                  variant={selectedStatus === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(key)}
                  className={selectedStatus === key ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects */}
        {Object.keys(groupedProjects).length === 0 ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-2 border-[#93C572]/20">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">프로젝트가 없습니다</h3>
            <p className="text-gray-500 mb-6">새로운 프로젝트를 등록하여 업무를 시작하세요</p>
            {canEdit && (
              <Link href="/projects/new">
                <Button className="bg-[#93C572] hover:bg-[#7AB05C] text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  첫 프로젝트 만들기
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedProjects).map(([type, typeProjects]) => (
              <div key={type}>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-8 bg-[#93C572] rounded-full"></span>
                  {PROJECT_TYPES[type as keyof typeof PROJECT_TYPES]}
                  <span className="text-lg font-normal text-gray-500">({typeProjects.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {typeProjects.map((project) => {
                    const StatusIcon = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS].icon;
                    const statusColor = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS].color;
                    const statusLabel = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS].label;

                    return (
                      <Link key={project.id} href={`/projects/${project.id}`}>
                        <Card className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-[#93C572]/30 group">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#93C572] transition-colors line-clamp-2">
                              {project.name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[project.priority as keyof typeof PRIORITY_COLORS]}`}>
                              {PRIORITY_LABELS[project.priority as keyof typeof PRIORITY_LABELS]}
                            </span>
                          </div>

                          <div className={`flex items-center gap-2 mb-4 ${statusColor}`}>
                            <StatusIcon className="w-5 h-5" />
                            <span className="font-medium">{statusLabel}</span>
                          </div>

                          {project.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                          )}

                          <div className="space-y-2 text-sm text-gray-600">
                            {project.targetDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#93C572]" />
                                <span>목표일: {project.targetDate}</span>
                              </div>
                            )}
                            {project.deadline && (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span>마감일: {project.deadline}</span>
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
