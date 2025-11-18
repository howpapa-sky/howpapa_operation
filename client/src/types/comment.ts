// 댓글 관련 타입 정의

export type CommentEntityType = 'project' | 'task';

export interface Comment {
  id: string;
  entity_type: CommentEntityType;
  entity_id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  content: string;
  mentions: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface NewComment {
  entity_type: CommentEntityType;
  entity_id: string;
  content: string;
  mentions?: string[];
}

export interface UpdateComment {
  content: string;
}
