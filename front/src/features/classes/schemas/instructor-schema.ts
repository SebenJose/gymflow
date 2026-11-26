import { z } from 'zod';

export const instructorSchema = z.object({ id: z.string(), name: z.string() });

export type Instructor = z.infer<typeof instructorSchema>;
