import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface ProjectProgressProps {
  tasks?: Task[];
  status?: string;
}

export function ProjectProgress({ tasks = [], status }: ProjectProgressProps) {
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">프로젝트 진행률</h3>
        <span className="text-sm font-semibold text-[#93C572]">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>
          {completedTasks} / {totalTasks} 작업 완료
        </span>
      </div>

      {tasks.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-3">작업 목록</h4>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {task.completed ? (
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 shrink-0" />
              )}
              <span
                className={`text-sm ${
                  task.completed
                    ? "text-gray-500 line-through"
                    : "text-gray-700"
                }`}
              >
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>등록된 작업이 없습니다</p>
        </div>
      )}
    </div>
  );
}
