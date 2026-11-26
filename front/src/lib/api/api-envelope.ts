import { z } from 'zod';

/** Formato de erro da API: `{ success: false, error: { statusCode, message, details? } }`. */
export const errorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: z.object({
    statusCode: z.number(),
    message: z.string(),
    details: z.array(z.string()).optional(),
  }),
});

/** Formato de sucesso da API: `{ success: true, data }`; `data` é validado à parte, pelo schema da chamada. */
export const successEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});
