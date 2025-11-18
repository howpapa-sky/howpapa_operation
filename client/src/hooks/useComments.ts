import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment, NewComment, UpdateComment, CommentEntityType } from '@/types/comment';
import { useToast } from '@/hooks/use-toast';

// 댓글 목록 조회
export function useComments(entityType: CommentEntityType, entityId: string | null) {
  return useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!entityId,
  });
}

// 댓글 생성
export function useCreateComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newComment: NewComment) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 사용자 정보 조회
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user?.id)
        .single();
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          ...newComment,
          user_id: user?.id,
          user_name: userData?.name || user?.email?.split('@')[0] || '익명',
          user_email: userData?.email || user?.email,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Comment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', data.entity_type, data.entity_id] 
      });
      toast({
        title: '댓글이 작성되었습니다',
      });
    },
    onError: (error: any) => {
      toast({
        title: '댓글 작성 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// 댓글 수정
export function useUpdateComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateComment }) => {
      const { data, error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Comment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', data.entity_type, data.entity_id] 
      });
      toast({
        title: '댓글이 수정되었습니다',
      });
    },
    onError: (error: any) => {
      toast({
        title: '댓글 수정 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// 댓글 삭제
export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, entityType, entityId }: { id: string; entityType: CommentEntityType; entityId: string }) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, entityType, entityId };
    },
    onSuccess: ({ entityType, entityId }) => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', entityType, entityId] 
      });
      toast({
        title: '댓글이 삭제되었습니다',
      });
    },
    onError: (error: any) => {
      toast({
        title: '댓글 삭제 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
