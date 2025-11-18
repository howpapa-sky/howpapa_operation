import { useState } from "react";
import { useMyTasks, useUpdateTask } from "@/hooks/useTasks";
import { Task, TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/types/task";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  CheckCircle2,
  Circle,
  Calendar,
  Flame,
  Clock,
  ArrowRight,
  ListTodo,
  AlertCircle
} from "lucide-react";
import { format, isToday, isThisWeek, isPast } from "date-fns";
import { ko } from "date-fns/locale";

export default function MyTasks() {
  const { data: tasks = [], isLoading } = useMyTasks();
  const updateTask = useUpdateTask();
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'overdue'>('all');

  // 작업 분류
  const todayTasks = tasks.filter(task => task.due_date && isToday(new Date(task.due_date)));
  const weekTasks = tasks.filter(task => task.due_date && isThisWeek(new Date(task.due_date), { weekStartsOn: 1 }));
  const overdueTasks = tasks.filter(task => task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)));
  
  // 필터링된 작업
  const filteredTasks = filter === 'today' ? todayTasks 
    : filter === 'week' ? weekTasks 
    : filter === 'overdue' ? overdueTasks 
    : tasks;

  // 상태별 그룹화
  const groupedTasks = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
  };

  const handleStatusChange = async (taskId: string, projectId: number, newStatus: Task['status']) => {
    await updateTask.mutateAsync({
      id: taskId,
      updates: {
        status: newStatus,
        completed_date: newStatus === 'done' ? new Date().toISOString() : null,
      },
    });
  };

  const getDdayText = (dueDate: string | null) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `D+${Math.abs(diffDays)}`, isOverdue: true };
    if (diffDays === 0) return { text: 'D-Day', isOverdue: false };
    return { text: `D-${diffDays}`, isOverdue: false };
  };

  if (isLoading) {
    return (
      <PageLayout title="내 작업">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto mb-4"></div>
            <p className="text-gray-600">작업을 불러오는 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="내 작업">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="w-7 h-7 text-[#93C572]" />
            <h1 className="text-3xl font-bold text-gray-900">내 작업</h1>
          </div>
          <p className="text-gray-600">나에게 할당된 작업을 효율적으로 관리하세요</p>
        </div>

        {/* 작업 현황 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className={`p-4 cursor-pointer hover:shadow-md transition-all ${filter === 'all' ? 'ring-2 ring-[#93C572] bg-[#93C572]/5' : ''}`}
            onClick={() => setFilter('all')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">전체 작업</span>
              <Circle className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer hover:shadow-md transition-all ${filter === 'today' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            onClick={() => setFilter('today')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">오늘</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{todayTasks.length}</div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer hover:shadow-md transition-all ${filter === 'week' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
            onClick={() => setFilter('week')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">이번 주</span>
              <Calendar className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{weekTasks.length}</div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer hover:shadow-md transition-all ${filter === 'overdue' ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">지연</span>
              <Flame className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">{overdueTasks.length}</div>
          </Card>
        </div>

        {/* 작업 목록 */}
        {filteredTasks.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-[#93C572] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {filter === 'all' ? '할당된 작업이 없습니다' : '해당하는 작업이 없습니다'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' ? '새로운 작업이 할당되면 여기에 표시됩니다' : '다른 필터를 선택해보세요'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 할 일 */}
            {groupedTasks.todo.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Circle className="w-5 h-5 text-gray-400" />
                  할 일 ({groupedTasks.todo.length})
                </h2>
                <div className="space-y-2">
                  {groupedTasks.todo.map((task) => {
                    const dday = getDdayText(task.due_date);
                    return (
                      <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleStatusChange(task.id, task.project_id, 'in_progress')}
                            className="mt-1"
                          >
                            <Circle className="w-5 h-5 text-gray-400 hover:text-[#93C572]" />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <Link href={`/projects/${task.project_id}`}>
                              <div className="flex items-start justify-between gap-2 cursor-pointer group">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 group-hover:text-[#93C572]">{task.title}</h4>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <Badge className="text-xs bg-purple-100 text-purple-700">
                                      {(task as any).project?.name}
                                    </Badge>
                                    <Badge className={`text-xs ${TASK_PRIORITY_COLORS[task.priority]}`}>
                                      {TASK_PRIORITY_LABELS[task.priority]}
                                    </Badge>
                                    {task.due_date && (
                                      <div className={`flex items-center gap-1 text-xs ${dday?.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(task.due_date), 'M/d (E)', { locale: ko })}
                                        {dday && (
                                          <span className={dday.isOverdue ? 'text-red-600' : 'text-blue-600'}>
                                            {dday.text}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#93C572] flex-shrink-0" />
                              </div>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 진행 중 */}
            {groupedTasks.in_progress.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  진행 중 ({groupedTasks.in_progress.length})
                </h2>
                <div className="space-y-2">
                  {groupedTasks.in_progress.map((task) => {
                    const dday = getDdayText(task.due_date);
                    return (
                      <Card key={task.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleStatusChange(task.id, task.project_id, 'review')}
                            className="mt-1"
                          >
                            <Circle className="w-5 h-5 text-blue-500 hover:text-yellow-500" />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <Link href={`/projects/${task.project_id}`}>
                              <div className="flex items-start justify-between gap-2 cursor-pointer group">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 group-hover:text-[#93C572]">{task.title}</h4>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <Badge className="text-xs bg-purple-100 text-purple-700">
                                      {(task as any).project?.name}
                                    </Badge>
                                    <Badge className={`text-xs ${TASK_PRIORITY_COLORS[task.priority]}`}>
                                      {TASK_PRIORITY_LABELS[task.priority]}
                                    </Badge>
                                    {task.due_date && (
                                      <div className={`flex items-center gap-1 text-xs ${dday?.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(task.due_date), 'M/d (E)', { locale: ko })}
                                        {dday && (
                                          <span className={dday.isOverdue ? 'text-red-600' : 'text-blue-600'}>
                                            {dday.text}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#93C572] flex-shrink-0" />
                              </div>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 검토 */}
            {groupedTasks.review.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  검토 ({groupedTasks.review.length})
                </h2>
                <div className="space-y-2">
                  {groupedTasks.review.map((task) => {
                    const dday = getDdayText(task.due_date);
                    return (
                      <Card key={task.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleStatusChange(task.id, task.project_id, 'done')}
                            className="mt-1"
                          >
                            <Circle className="w-5 h-5 text-yellow-500 hover:text-green-500" />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <Link href={`/projects/${task.project_id}`}>
                              <div className="flex items-start justify-between gap-2 cursor-pointer group">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 group-hover:text-[#93C572]">{task.title}</h4>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <Badge className="text-xs bg-purple-100 text-purple-700">
                                      {(task as any).project?.name}
                                    </Badge>
                                    <Badge className={`text-xs ${TASK_PRIORITY_COLORS[task.priority]}`}>
                                      {TASK_PRIORITY_LABELS[task.priority]}
                                    </Badge>
                                    {task.due_date && (
                                      <div className={`flex items-center gap-1 text-xs ${dday?.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(task.due_date), 'M/d (E)', { locale: ko })}
                                        {dday && (
                                          <span className={dday.isOverdue ? 'text-red-600' : 'text-blue-600'}>
                                            {dday.text}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#93C572] flex-shrink-0" />
                              </div>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
