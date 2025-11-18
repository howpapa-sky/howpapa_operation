import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
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
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    await createTask.mutateAsync({
      project_id: projectId,
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      priority: newTaskPriority,
      due_date: newTaskDueDate || undefined,
      status: 'todo',
    });
    
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setIsCreateDialogOpen(false);
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
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">작업 제목</label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="작업 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">설명</label>
                <Textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="작업 설명 (선택사항)"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">우선순위</label>
                  <Select value={newTaskPriority} onValueChange={(value: any) => setNewTaskPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">낮음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="urgent">긴급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">마감일</label>
                  <Input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  취소
                </Button>
                <Button
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle.trim()}
                  className="bg-[#93C572] hover:bg-[#7FB05B]"
                >
                  생성
                </Button>
              </div>
            </div>
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
