import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task, NewTask, UpdateTask, TaskChecklist } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

// 프로젝트의 작업 목록 조회
export function useTasks(projectId: number | null) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, email, name)
        `)
        .eq('project_id', projectId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      // assignee 정보 매핑
      return (data || []).map((task: any) => ({
        ...task,
        assignee_name: task.assignee?.name,
        assignee_email: task.assignee?.email,
      })) as Task[];
    },
    enabled: !!projectId,
  });
}

// 내 작업 목록 조회 (담당자가 나인 작업)
export function useMyTasks() {
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:project_id(id, name, brand)
        `)
        .eq('assignee_id', user.id)
        .neq('status', 'done')
        .order('due_date', { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return data as (Task & { project: any })[];
    },
  });
}

// 단일 작업 조회
export function useTask(taskId: string | null) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, email, name),
          checklists:task_checklists(*)
        `)
        .eq('id', taskId)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        assignee_name: data.assignee?.name,
        assignee_email: data.assignee?.email,
      } as Task & { checklists: TaskChecklist[] };
    },
    enabled: !!taskId,
  });
}

// 작업 생성
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newTask: NewTask) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...newTask,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast({
        title: '작업이 생성되었습니다',
        description: data.title,
      });
    },
    onError: (error: any) => {
      toast({
        title: '작업 생성 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// 작업 수정
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTask }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast({
        title: '작업이 수정되었습니다',
      });
    },
    onError: (error: any) => {
      toast({
        title: '작업 수정 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// 작업 삭제
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast({
        title: '작업이 삭제되었습니다',
      });
    },
    onError: (error: any) => {
      toast({
        title: '작업 삭제 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// 체크리스트 항목 토글
export function useToggleChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('task_checklists')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
}

// 체크리스트 항목 추가
export function useAddChecklistItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ task_id, title }: { task_id: string; title: string }) => {
      const { data, error } = await supabase
        .from('task_checklists')
        .insert({ task_id, title })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
    onError: (error: any) => {
      toast({
        title: '체크리스트 추가 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
