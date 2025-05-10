import { ReactionType } from 'src/messages/enums/reaction.enum';
import { z } from 'zod';

export const ReactionSchema = z.object({
  messageId: z.number().int().positive({
    message: 'Message ID must be a positive integer',
  }),
  reactionType: z.nativeEnum(ReactionType, {
    errorMap: () => ({
      message: `Reaction type must be one of: ${Object.values(ReactionType).join(', ')}`,
    }),
  }),
});

export type ReactionDto = z.infer<typeof ReactionSchema>;
