import z from 'zod';
export const projectsSchema = z.object({
id: z.string().uuid(),
createdAt: z.string().datetime() || z.null(),
updatedAt: z.string().datetime() || z.null()
});
export type Db_projects = z.infer<typeof projectsSchema>;
export type Db_projects_body = Omit<Db_projects, 'id'|'createdAt'|'updatedAt'>