import { z } from 'zod';

export const deckUpsertSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(100),
  memo: z.string().max(2000).default(''),
  isPublic: z.boolean().optional(),
  slots: z
    .array(
      z.object({
        slot: z.enum(['main', 'lrig', 'candidate']),
        cardId: z.string().min(1),
        count: z.number().int().min(1),
      })
    )
    .max(500),
});
