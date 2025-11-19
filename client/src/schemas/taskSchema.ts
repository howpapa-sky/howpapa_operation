import { z } from 'zod';
import { sanitizeInput } from '@/utils/sanitize';

/**
 * Task 생성/수정 입력 검증 스키마
 */
export const TaskSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요')
    .transform(sanitizeInput),
  
  description: z.string()
    .max(1000, '설명은 1000자 이내로 입력해주세요')
    .transform(sanitizeInput)
    .optional()
    .nullable(),
  
  status: z.enum(['todo', 'in_progress', 'review', 'done'], {
    errorMap: () => ({ message: '올바른 상태를 선택해주세요' }),
  }),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: '올바른 우선순위를 선택해주세요' }),
  }),
  
  due_date: z.string()
    .datetime('올바른 날짜 형식이 아닙니다')
    .optional()
    .nullable(),
  
  assignee_id: z.string()
    .uuid('올바른 사용자 ID가 아닙니다')
    .optional()
    .nullable(),
  
  estimated_hours: z.number()
    .min(0, '예상 시간은 0 이상이어야 합니다')
    .max(1000, '예상 시간은 1000시간 이하여야 합니다')
    .optional()
    .nullable(),
  
  actual_hours: z.number()
    .min(0, '실제 시간은 0 이상이어야 합니다')
    .max(1000, '실제 시간은 1000시간 이하여야 합니다')
    .optional()
    .nullable(),
});

export type TaskFormData = z.infer<typeof TaskSchema>;

/**
 * Comment 생성 입력 검증 스키마
 */
export const CommentSchema = z.object({
  content: z.string()
    .min(1, '댓글 내용을 입력해주세요')
    .max(1000, '댓글은 1000자 이내로 입력해주세요')
    .transform(sanitizeInput),
  
  entity_type: z.enum(['project', 'task'], {
    errorMap: () => ({ message: '올바른 엔티티 타입이 아닙니다' }),
  }),
  
  entity_id: z.string()
    .min(1, '엔티티 ID가 필요합니다'),
  
  mentions: z.array(z.string().uuid())
    .optional()
    .nullable(),
});

export type CommentFormData = z.infer<typeof CommentSchema>;

/**
 * Project 생성/수정 입력 검증 스키마
 */
export const ProjectSchema = z.object({
  name: z.string()
    .min(1, '프로젝트 이름을 입력해주세요')
    .max(200, '프로젝트 이름은 200자 이내로 입력해주세요')
    .transform(sanitizeInput),
  
  description: z.string()
    .max(2000, '설명은 2000자 이내로 입력해주세요')
    .transform(sanitizeInput)
    .optional()
    .nullable(),
  
  type: z.enum(['sampling', 'detail_page', 'new_product', 'influencer'], {
    errorMap: () => ({ message: '올바른 프로젝트 타입을 선택해주세요' }),
  }),
  
  status: z.enum(['pending', 'in_progress', 'completed', 'on_hold'], {
    errorMap: () => ({ message: '올바른 상태를 선택해주세요' }),
  }),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: '올바른 우선순위를 선택해주세요' }),
  }),
  
  brand: z.enum(['howpapa', 'nussio'], {
    errorMap: () => ({ message: '올바른 브랜드를 선택해주세요' }),
  }).optional().nullable(),
  
  target_date: z.string()
    .datetime('올바른 날짜 형식이 아닙니다')
    .optional()
    .nullable(),
  
  deadline: z.string()
    .datetime('올바른 날짜 형식이 아닙니다')
    .optional()
    .nullable(),
});

export type ProjectFormData = z.infer<typeof ProjectSchema>;
