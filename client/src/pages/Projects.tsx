import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Link, useLocation } from "wouter";
import { Plus, Calendar, AlertCircle, CheckCircle, Clock, Pause, TrendingUp, Package, FileText, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const PROJECT_TYPES = {
  sampling: { label: "샘플링", icon: Package, color: "bg-purple-50 text-purple-700 border-purple-200" },
  detail_page: { label: "상세페이지 제작", icon: FileText, color: "bg-blue-50 text-blue-700 border-blue-200" },
  new_product: { label: "신제품 출시", icon: TrendingUp, color: "bg-green-50 text-green-700 border-green-200" },
  influencer: { label: "인플루언서 협업", icon: Users, color: "bg-pink-50 text-pink-700 border-pink-200" },
};

const PROJECT_STATUS = {
  pending: { label: "진행 전", icon: Clock, color: "text-gray-500", bgColor: "bg-gray-50" },
  in_progress: { label: "진행 중", icon: AlertCircle, color: "text-blue-500", bgColor: "bg-blue-50" },
  completed: { label: "완료", icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-50" },
  on_hold: { label: "보류", icon: Pause, color: "text-yellow-500", bgColor: "bg-yellow-50" },
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-700 border-gray-300",
  medium: "bg-blue-100 text-blue-700 border-blue-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  urgent: "bg-red-100 text-red-700 border-red-300",
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
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // URL 쿼리 파라미터에서 type 추출
  useState(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const typeParam = params.get('type');
    if (typeParam) setSelectedType(typeParam);
  });

  const { data: projects = [], isLoading, error } = useQuery({
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

  const canEdit = user && (user.role === 'admin' || user.role === 'manager' || user.role === 'super_admin');

  const filteredProjects = projects.filter((project: any) => {
    if (selectedType && project.type !== selectedType) return false;
    if (selectedStatus && project.status !== selectedStatus) return false;
    if (selectedBrand && project.brand !== selectedBrand) return false;
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getDdayText = (targetDate: string | null) => {
    if (!targetDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `D+${Math.abs(diffDays)}`, isOverdue: true };
    if (diffDays === 0) return { text: "D-Day", isOverdue: false };
    return { text: `D-${diffDays}`, isOverdue: false };
  };

  // 통계 계산
  const stats = {
    total: projects.length,
    inProgress: projects.filter((p: any) => p.status === 'in_progress').length,
    completed: projects.filter((p: any) => p.status === 'completed').length,
    overdue: projects.filter((p: any) => {
      const dday = getDdayText(p.target_date);
      return dday?.isOverdue;
    }).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto mb-4"></div>
          <p className="text-base sm:text-lg text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF] p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">데이터를 불러올 수 없습니다</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">잠시 후 다시 시도해주세요.</p>
            <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
              새로고침
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout title="프로젝트 관리">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 - 모바일 최적화 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-1 sm:mb-2">프로젝트 관리</h1>
            <p className="text-sm sm:text-base text-gray-600">하우파파 브랜드 업무 프로젝트를 통합 관리합니다</p>
          </div>
          {canEdit && (
            <Link href="/projects/new">
              <Button className="w-full sm:w-auto bg-[#93C572] hover:bg-[#7FB05B] shadow-md h-11">
                <Plus className="w-4 h-4 mr-2" />
                새 프로젝트
              </Button>
            </Link>
          )}
        </div>

        {/* 통계 카드 - 모바일 최적화 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-4 bg-white border-l-4 border-l-blue-500">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">전체 프로젝트</div>
            <div className="text-xl sm:text-2xl font-bold text-[#2C3E50]">{stats.total}</div>
          </Card>
          <Card className="p-3 sm:p-4 bg-white border-l-4 border-l-green-500">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">진행 중</div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.inProgress}</div>
          </Card>
          <Card className="p-3 sm:p-4 bg-white border-l-4 border-l-purple-500">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">완료</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.completed}</div>
          </Card>
          <Card className="p-3 sm:p-4 bg-white border-l-4 border-l-red-500">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">지연</div>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.overdue}</div>
          </Card>
        </div>

        {/* 검색 및 필터 - 모바일 최적화 */}
        <Card className="p-3 sm:p-4 mb-4 sm:mb-6 bg-white shadow-sm">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder="프로젝트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 text-base"
              />
            </div>

            {/* 브랜드 필터 */}
            <div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">브랜드</div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedBrand === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBrand(null)}
                  className={`text-xs sm:text-sm h-8 sm:h-9 ${selectedBrand === null ? "bg-[#93C572] hover:bg-[#7FB05B]" : ""}`}
                >
                  전체
                </Button>
                <Button
                  variant={selectedBrand === 'howpapa' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBrand('howpapa')}
                  className={`text-xs sm:text-sm h-8 sm:h-9 ${selectedBrand === 'howpapa' ? "bg-[#93C572] hover:bg-[#7FB05B]" : ""}`}
                >
                  하우파파
                </Button>
                <Button
                  variant={selectedBrand === 'nusio' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBrand('nusio')}
                  className={`text-xs sm:text-sm h-8 sm:h-9 ${selectedBrand === 'nusio' ? "bg-[#93C572] hover:bg-[#7FB05B]" : ""}`}
                >
                  누씨오
                </Button>
              </div>
            </div>

            {/* 프로젝트 유형 필터 */}
            <div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">프로젝트 유형</div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedType === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(null)}
                  className={`text-xs sm:text-sm h-8 sm:h-9 ${selectedType === null ? "bg-[#93C572] hover:bg-[#7FB05B]" : ""}`}
                >
                  전체
                </Button>
                {Object.entries(PROJECT_TYPES).map(([key, { label, icon: Icon }]) => (
                  <Button
                    key={key}
                    variant={selectedType === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(key)}
                    className={`text-xs sm:text-sm h-8 sm:h-9 ${selectedType === key ? "bg-[#93C572] hover:bg-[#7FB05B]" : ""}`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 상태 필터 */}
            <div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">프로젝트 상태</div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(PROJECT_STATUS).map(([key, { label, icon: Icon }]) => (
                  <Button
                    key={key}
                    variant={selectedStatus === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
                    className={`text-xs sm:text-sm h-8 sm:h-9 ${selectedStatus === key ? "bg-[#93C572] hover:bg-[#7FB05B]" : ""}`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 프로젝트 목록 - 모바일 최적화 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredProjects.map((project: any) => {
            const StatusIcon = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.icon || Clock;
            const statusColor = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.color || "text-gray-500";
            const statusBgColor = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.bgColor || "bg-gray-50";
            const dday = getDdayText(project.target_date);
            const TypeIcon = PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES]?.icon || Package;
            const typeColor = PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES]?.color || "bg-gray-50";

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="p-4 sm:p-5 hover:shadow-xl transition-all duration-200 cursor-pointer bg-white border-2 border-transparent hover:border-[#93C572] h-full">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${typeColor} border text-xs`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">{PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES]?.label}</span>
                          <span className="sm:hidden">{PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES]?.label.split(' ')[0]}</span>
                        </Badge>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg mb-1 text-[#2C3E50] line-clamp-2">{project.name}</h3>
                      {project.brand && (
                        <p className="text-xs sm:text-sm text-gray-500">브랜드: {project.brand}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-2 flex-shrink-0">
                      <Badge className={`${PRIORITY_COLORS[project.priority as keyof typeof PRIORITY_COLORS]} border font-semibold text-xs`}>
                        {PRIORITY_LABELS[project.priority as keyof typeof PRIORITY_LABELS]}
                      </Badge>
                      {dday && (
                        <span className={`text-xs sm:text-sm font-bold px-2 py-1 rounded ${dday.isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {dday.text}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 text-xs sm:text-sm px-3 py-2 rounded-lg ${statusBgColor} mb-3`}>
                    <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                    <span className={`font-medium ${statusColor}`}>
                      {PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.label}
                    </span>
                  </div>

                  {project.target_date && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>목표일: {new Date(project.target_date).toLocaleDateString('ko-KR')}</span>
                    </div>
                  )}

                  {project.description && (
                    <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 bg-gray-50 p-2 rounded">{project.description}</p>
                  )}

                  {project.manufacturer && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">제조사: {project.manufacturer}</p>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 빈 상태 */}
        {filteredProjects.length === 0 && (
          <Card className="p-8 sm:p-12 text-center bg-white">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-base sm:text-lg mb-2">프로젝트가 없습니다.</p>
            <p className="text-gray-400 text-sm mb-6">
              {searchQuery ? "검색 조건을 변경해보세요." : "새로운 프로젝트를 시작해보세요."}
            </p>
            {canEdit && !searchQuery && (
              <Link href="/projects/new">
                <Button className="w-full sm:w-auto bg-[#93C572] hover:bg-[#7FB05B] shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  첫 프로젝트 만들기
                </Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
