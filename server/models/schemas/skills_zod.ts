import z from 'zod';
export const skillsSchema = z.object({
id: z.string().uuid() || z.null(),
createdAt: z.string().datetime().default(() => new Date().toISOString()) || z.null(),
updatedAt: z.string().datetime().default(() => new Date().toISOString()) || z.null()
});
export type Db_skills = z.infer<typeof skillsSchema>;