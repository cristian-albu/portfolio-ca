import z from 'zod';
export const case_studiesSchema = z.object({
id: z.string().uuid() || z.null(),
createdAt: z.string().datetime().default(() => new Date().toISOString()) || z.null(),
updatedAt: z.string().datetime().default(() => new Date().toISOString()) || z.null()
});
export type Db_case_studies = z.infer<typeof case_studiesSchema>;