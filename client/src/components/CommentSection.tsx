import { useState } from 'react';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';
import { CommentEntityType } from '@/types/comment';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface CommentSectionProps {
  entityType: CommentEntityType;
  entityId: string;
}

export function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const { user } = useSupabaseAuth();
  const { data: comments = [], isLoading } = useComments(entityType, entityId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  
  const [newCommentContent, setNewCommentContent] = useState('');

  const handleSubmitComment = async () => {
    if (!newCommentContent.trim()) return;
    
    await createComment.mutateAsync({
      entity_type: entityType,
      entity_id: entityId,
      content: newCommentContent,
    });
    
    setNewCommentContent('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('이 댓글을 삭제하시겠습니까?')) {
      await deleteComment.mutateAsync({
        id: commentId,
        entityType,
        entityId,
      });
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-sm text-gray-600">댓글 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          댓글 {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* 댓글 목록 */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-[#93C572] text-white text-sm">
                    {getInitials(comment.user_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {comment.user_name || '익명'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </div>
                    </div>
                    
                    {user?.id === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 댓글 작성 */}
      <Card className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-gray-300 text-gray-700 text-sm">
              {getInitials(user?.email?.split('@')[0] || null)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <Textarea
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              placeholder="댓글을 입력하세요..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newCommentContent.trim() || createComment.isPending}
                size="sm"
                className="bg-[#93C572] hover:bg-[#7FB05B]"
              >
                <Send className="w-4 h-4 mr-1" />
                {createComment.isPending ? '작성 중...' : '댓글 작성'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
