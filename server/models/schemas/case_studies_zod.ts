import z from 'zod';
export const case_studiesSchema = z.object({
id: z.string().uuid(),
createdAt: z.string().datetime() || z.null(),
updatedAt: z.string().datetime() || z.null()
});
export type Db_case_studies = z.infer<typeof case_studiesSchema>;
export type Db_case_studies_body = Omit<Db_case_studies, 'id'|'createdAt'|'updatedAt'>