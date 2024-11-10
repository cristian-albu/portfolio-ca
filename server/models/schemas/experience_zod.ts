import z from 'zod';
export const experienceSchema = z.object({
id: z.string().uuid(),
createdAt: z.string().datetime() || z.null(),
updatedAt: z.string().datetime() || z.null()
});
export type Db_experience = z.infer<typeof experienceSchema>;
export type Db_experience_body = Omit<Db_experience, 'id'|'createdAt'|'updatedAt'>