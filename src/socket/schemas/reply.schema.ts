import { z } from 'zod';

export const ReplySchema = z.object({
  messageId: z.number().int().positive({
    message: 'Message ID must be a positive integer',
  }),
  content: z.string().min(1).max(1000, {
    message: 'Reply content must be between 1 and 1000 characters',
  }),
});

export type ReplyDto = z.infer<typeof ReplySchema>;
