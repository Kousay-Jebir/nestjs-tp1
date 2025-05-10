import { z } from 'zod';

export const CreateMessageSchema = z.object({
  content: z
    .string({
      required_error: 'Content is required',
      invalid_type_error: 'Content must be a string',
    })
    .min(1, 'Content cannot be empty'),

  receiverId: z
    .number({
      invalid_type_error: 'reciever ID must be a number',
    })
    .optional(),
  roomId: z
    .number({
      invalid_type_error: 'room Id must be a number',
    })
    .optional(),
});

export type CreateMessageDto = z.infer<typeof CreateMessageSchema>;
