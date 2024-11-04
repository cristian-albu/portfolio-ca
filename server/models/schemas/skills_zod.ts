import z from 'zod';
export const skillsSchema = z.object({
id: z.string().uuid(),
createdAt: z.string().datetime() || z.null(),
updatedAt: z.string().datetime() || z.null()
});
export type Db_skills = z.infer<typeof skillsSchema>;
export type Db_skills_body = Omit<Db_skills, 'id'|'createdAt'|'updatedAt'>