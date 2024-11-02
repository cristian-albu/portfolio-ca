import z from 'zod';
export const documentsSchema = z.object({
id: z.string().uuid() || z.null(),
createdAt: z.string().datetime().default(() => new Date().toISOString()) || z.null(),
updatedAt: z.string().datetime().default(() => new Date().toISOString()) || z.null()
});
export type Db_documents = z.infer<typeof documentsSchema>;