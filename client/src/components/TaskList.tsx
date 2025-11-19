import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { TaskSchema, type TaskFormData } from '@/schemas/taskSchema';
import { Task, TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, User, Trash2, Edit, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TaskListProps {
  projectId: number;
}

export function TaskList({ projectId }: TaskListProps) {
  const { data: tasks = [], isLoading } = useTasks(projectId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      await createTask.mutateAsync({
        project_id: projectId,
        ...data,
      });
      
      reset();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('작업 생성 실패:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTask.mutateAsync({
      id: taskId,
      updates: {
        status: newStatus,
        completed_date: newStatus === 'done' ? new Date().toISOString() : null,
      },
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('이 작업을 삭제하시겠습니까?')) {
      await deleteTask.mutateAsync(taskId);
    }
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

  const groupedTasks = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done'),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#93C572] mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">작업 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">작업 목록</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#93C572] hover:bg-[#7FB05B]">
              <Plus className="w-4 h-4 mr-1" />
              작업 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 작업 추가</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">작업 제목</label>
                <Input
                  {...register('title')}
                  placeholder="작업 제목을 입력하세요"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">설명</label>
                <Textarea
                  {...register('description')}
                  placeholder="작업 설명 (선택사항)"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">우선순위</label>
                  <select
                    {...register('priority')}
                    className="w-full h-10 px-3 border rounded-md"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                    <option value="urgent">긴급</option>
                  </select>
                  {errors.priority && (
                    <p className="text-sm text-red-600 mt-1">{errors.priority.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">마감일</label>
                  <Input
                    type="datetime-local"
                    {...register('due_date')}
                  />
                  {errors.due_date && (
                    <p className="text-sm text-red-600 mt-1">{errors.due_date.message}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { reset(); setIsCreateDialogOpen(false); }}>
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#93C572] hover:bg-[#7FB05B]"
                >
                  {isSubmitting ? '생성 중...' : '생성'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 작업 통계 */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-3 text-center border-l-4 border-l-gray-400">
          <div className="text-xs text-gray-600">할 일</div>
          <div className="text-xl font-bold text-gray-900">{groupedTasks.todo.length}</div>
        </Card>
        <Card className="p-3 text-center border-l-4 border-l-blue-400">
          <div className="text-xs text-gray-600">진행 중</div>
          <div className="text-xl font-bold text-blue-600">{groupedTasks.in_progress.length}</div>
        </Card>
        <Card className="p-3 text-center border-l-4 border-l-yellow-400">
          <div className="text-xs text-gray-600">검토</div>
          <div className="text-xl font-bold text-yellow-600">{groupedTasks.review.length}</div>
        </Card>
        <Card className="p-3 text-center border-l-4 border-l-green-400">
          <div className="text-xs text-gray-600">완료</div>
          <div className="text-xl font-bold text-green-600">{groupedTasks.done.length}</div>
        </Card>
      </div>

      {/* 작업 목록 */}
      {tasks.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">아직 작업이 없습니다</p>
          <Button
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#93C572] hover:bg-[#7FB05B]"
          >
            <Plus className="w-4 h-4 mr-1" />
            첫 작업 추가하기
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const dday = getDdayText(task.due_date);
            return (
              <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  {/* 상태 아이콘 */}
                  <button
                    onClick={() => {
                      const statusOrder: Task['status'][] = ['todo', 'in_progress', 'review', 'done'];
                      const currentIndex = statusOrder.indexOf(task.status);
                      const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
                      handleStatusChange(task.id, nextStatus);
                    }}
                    className="mt-1"
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-[#93C572]" />
                    )}
                  </button>

                  {/* 작업 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={`text-xs ${TASK_STATUS_COLORS[task.status]}`}>
                        {TASK_STATUS_LABELS[task.status]}
                      </Badge>
                      <Badge className={`text-xs ${TASK_PRIORITY_COLORS[task.priority]}`}>
                        {TASK_PRIORITY_LABELS[task.priority]}
                      </Badge>
                      {task.due_date && (
                        <div className={`flex items-center gap-1 text-xs ${dday?.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.due_date), 'M/d', { locale: ko })}
                          {dday && (
                            <span className={dday.isOverdue ? 'text-red-600' : 'text-blue-600'}>
                              ({dday.text})
                            </span>
                          )}
                        </div>
                      )}
                      {task.assignee_name && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          {task.assignee_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
