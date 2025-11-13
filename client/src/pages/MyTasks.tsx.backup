import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Flame, Star, Calendar, CheckCircle, Circle, Target, Focus } from "lucide-react";
import { toast } from "sonner";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  sampling: "샘플링",
  detail_page: "상세페이지",
  new_product: "신제품",
  influencer: "인플루언서",
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
  pending: "진행 전",
  in_progress: "진행 중",
  completed: "완료",
  on_hold: "보류",
};

export default function MyTasks() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [focusMode, setFocusMode] = useState(false);
  const [focusTaskIds, setFocusTaskIds] = useState<number[]>([]);

  const { data: projects = [], isLoading, refetch } = trpc.projects.list.useQuery();

  // 나에게 할당된 프로젝트만 필터링
  const myProjects = projects.filter(p => p.assignedTo === user?.id);

  // Master List: 나에게 할당된 모든 작업
  const masterList = myProjects.filter(p => p.status !== 'completed');

  // 우선순위별 분류
  const urgentImportant = masterList.filter(p => p.importance === 'high' && p.urgency === 'high');
  const importantNotUrgent = masterList.filter(p => p.importance === 'high' && p.urgency === 'low');
  const urgentNotImportant = masterList.filter(p => p.importance === 'low' && p.urgency === 'high');
  const notUrgentNotImportant = masterList.filter(p => p.importance === 'low' && p.urgency === 'low');

  // Focus List: 사용자가 선택한 오늘 할 일
  const focusList = masterList.filter(p => focusTaskIds.includes(p.id));

  // 마감일 임박 (3일 이내)
  const upcomingDeadlines = masterList.filter(p => {
    if (!p.deadline) return false;
    const daysUntil = Math.ceil((new Date(p.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 3;
  });

  const toggleFocusTask = (id: number) => {
    if (focusTaskIds.includes(id)) {
      setFocusTaskIds(focusTaskIds.filter(taskId => taskId !== id));
      toast.success("Focus 목록에서 제거되었습니다");
    } else {
      setFocusTaskIds([...focusTaskIds, id]);
      toast.success("Focus 목록에 추가되었습니다");
    }
  };

  const getPriorityBadge = (importance: string, urgency: string) => {
    if (importance === 'high' && urgency === 'high') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border-2 border-red-400">🔥 Q1: 즉시 실행</span>;
    } else if (importance === 'high' && urgency === 'low') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border-2 border-blue-400">📅 Q2: 계획</span>;
    } else if (importance === 'low' && urgency === 'high') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border-2 border-yellow-400">🤝 Q3: 위임</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border-2 border-gray-400">🗑️ Q4: 제거</span>;
    }
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const daysUntil = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return <span className="text-red-600 font-bold">마감일 지남</span>;
    if (daysUntil === 0) return <span className="text-red-600 font-bold">오늘 마감</span>;
    if (daysUntil <= 3) return <span className="text-orange-600 font-bold">D-{daysUntil}</span>;
    return <span className="text-gray-600">D-{daysUntil}</span>;
  };

  const ProjectCard = ({ project, showFocusButton = true }: { project: any; showFocusButton?: boolean }) => {
    const inFocus = focusTaskIds.includes(project.id);
    
    return (
      <Card className={`hover:shadow-lg transition-all ${inFocus ? 'border-2 border-[#93C572] bg-[#93C572]/5' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/projects/${project.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 hover:text-[#93C572] cursor-pointer">
                    {project.name}
                  </h3>
                </Link>
                {inFocus && <Target className="w-5 h-5 text-[#93C572]" />}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                  {PROJECT_TYPE_LABELS[project.type]}
                </span>
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
                {getPriorityBadge(project.importance, project.urgency)}
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {project.targetDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>목표: {project.targetDate}</span>
                  </div>
                )}
                {project.deadline && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>마감: {project.deadline} ({getDaysUntilDeadline(project.deadline)})</span>
                  </div>
                )}
              </div>
            </div>

            {showFocusButton && (
              <Button
                variant={inFocus ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFocusTask(project.id)}
                className={inFocus ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
              >
                {inFocus ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8F2] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto"></div>
          <p className="mt-4 text-gray-600">작업을 불러오는 중...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Target className="w-10 h-10 text-[#93C572]" />
              My Tasks
            </h1>
            <p className="text-gray-600">나에게 할당된 작업을 효율적으로 관리하세요</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={focusMode ? "default" : "outline"}
              onClick={() => setFocusMode(!focusMode)}
              className={focusMode ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
            >
              <Focus className="w-5 h-5 mr-2" />
              {focusMode ? "전체 보기" : "Focus 모드"}
            </Button>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-5 h-5 mr-2" />
                홈으로
              </Button>
            </Link>
          </div>
        </div>

        {/* Focus 모드 */}
        {focusMode ? (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-[#93C572]/20 to-[#589B6A]/20 border-2 border-[#93C572]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Focus className="w-6 h-6" />
                  Focus List - 오늘 할 일
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  오늘 집중할 작업만 선별하여 몰입하세요. 다른 작업은 의도적으로 숨겨집니다.
                </p>
                {focusList.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Focus 목록이 비어있습니다</p>
                    <p className="text-sm text-gray-500">아래 Master List에서 오늘 할 작업을 선택하세요</p>
                    <Button
                      variant="outline"
                      onClick={() => setFocusMode(false)}
                      className="mt-4"
                    >
                      Master List 보기
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {focusList.map(project => (
                      <ProjectCard key={project.id} project={project} showFocusButton={true} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Master List */
          <div className="space-y-8">
            {/* 통계 카드 */}
            <div className="grid md:grid-cols-4 gap-6">
              <a href="#master-list" className="block">
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">전체 작업</CardTitle>
                    <Circle className="w-4 h-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold hover:text-[#93C572] transition-colors">{masterList.length}건</div>
                  </CardContent>
                </Card>
              </a>

              <button onClick={() => setFocusMode(true)} className="block w-full text-left">
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Focus 목록</CardTitle>
                    <Target className="w-4 h-4 text-[#93C572]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#93C572] hover:text-[#78A85E] transition-colors">{focusList.length}건</div>
                  </CardContent>
                </Card>
              </button>

              <a href="#q1-urgent-important" className="block">
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">긴급/중요</CardTitle>
                    <Flame className="w-4 h-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors">{urgentImportant.length}건</div>
                  </CardContent>
                </Card>
              </a>

              <a href="#upcoming-deadlines" className="block">
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">마감 임박</CardTitle>
                    <Calendar className="w-4 h-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">{upcomingDeadlines.length}건</div>
                  </CardContent>
                </Card>
              </a>
            </div>

            {/* Q1: 긴급하고 중요한 작업 */}
            {urgentImportant.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-6 h-6 text-red-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Q1: 즉시 실행 (긴급 & 중요)</h2>
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-bold">
                    {urgentImportant.length}건
                  </span>
                </div>
                <div className="space-y-4">
                  {urgentImportant.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {/* Q2: 중요하지만 긴급하지 않은 작업 */}
            {importantNotUrgent.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Q2: 계획 (중요 & 비긴급)</h2>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                    {importantNotUrgent.length}건
                  </span>
                </div>
                <div className="space-y-4">
                  {importantNotUrgent.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {/* Q3: 긴급하지만 중요하지 않은 작업 */}
            {urgentNotImportant.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Q3: 위임 (긴급 & 비중요)</h2>
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">
                    {urgentNotImportant.length}건
                  </span>
                </div>
                <div className="space-y-4">
                  {urgentNotImportant.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {/* Q4: 긴급하지도 중요하지도 않은 작업 */}
            {notUrgentNotImportant.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Circle className="w-6 h-6 text-gray-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Q4: 제거 고려 (비긴급 & 비중요)</h2>
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-bold">
                    {notUrgentNotImportant.length}건
                  </span>
                </div>
                <div className="space-y-4">
                  {notUrgentNotImportant.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {masterList.length === 0 && (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">모든 작업을 완료했습니다!</h3>
                <p className="text-gray-600">새로운 프로젝트를 시작하거나 휴식을 취하세요</p>
              </Card>
            )}

            {/* 업무별 현황 그래프 */}
            <Card>
              <CardHeader>
                <CardTitle>업무별 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  {(() => {
                    const samplingProjects = myProjects.filter(p => p.type === 'sampling');
                    const detailPageProjects = myProjects.filter(p => p.type === 'detail_page');
                    const newProductProjects = myProjects.filter(p => p.type === 'new_product');
                    const influencerProjects = myProjects.filter(p => p.type === 'influencer');

                    const getStats = (projects: any[]) => ({
                      total: projects.length,
                      inProgress: projects.filter(p => p.status === 'in_progress').length,
                      completed: projects.filter(p => p.status === 'completed').length,
                      completionRate: projects.length > 0 ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100) : 0
                    });

                    const samplingStats = getStats(samplingProjects);
                    const detailPageStats = getStats(detailPageProjects);
                    const newProductStats = getStats(newProductProjects);
                    const influencerStats = getStats(influencerProjects);

                    return (
                      <>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">샘플링</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">전체</span>
                              <span className="font-semibold">{samplingStats.total}건</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">진행 중</span>
                              <span className="font-semibold text-blue-600">{samplingStats.inProgress}건</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">완료</span>
                              <span className="font-semibold text-green-600">{samplingStats.completed}건</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-blue-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">완료율</span>
                                <span className="text-2xl font-bold text-blue-600">{samplingStats.completionRate}%</span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${samplingStats.completionRate}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">상세페이지</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">전체</span>
                              <span className="font-semibold">{detailPageStats.total}건</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">진행 중</span>
                              <span className="font-semibold text-purple-600">{detailPageStats.inProgress}건</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">완료</span>
                              <span className="font-semibold text-green-600">{detailPageStats.completed}건</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-purple-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">완료율</span>
                                <span className="text-2xl font-bold text-purple-600">{detailPageStats.completionRate}%</span>
                              </div>
                              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${detailPageStats.completionRate}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">신제품</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">전체</span>
                              <span className="font-semibold">{newProductStats.total}건</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">진행 중</span>
                              <span className="font-semibold text-green-600">{newProductStats.inProgress}건</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">완료</span>
                              <span className="font-semibold text-green-600">{newProductStats.completed}건</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-green-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">완료율</span>
                                <span className="text-2xl font-bold text-green-600">{newProductStats.completionRate}%</span>
                              </div>
                              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${newProductStats.completionRate}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">인플루언서</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">전체</span>
                              <span className="font-semibold">{influencerStats.total}건</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">진행 중</span>
                              <span className="font-semibold text-orange-600">{influencerStats.inProgress}건</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">완료</span>
                              <span className="font-semibold text-green-600">{influencerStats.completed}건</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-orange-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">완료율</span>
                                <span className="text-2xl font-bold text-orange-600">{influencerStats.completionRate}%</span>
                              </div>
                              <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                                <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${influencerStats.completionRate}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
