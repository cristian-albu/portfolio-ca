import z from 'zod';
export const documentsSchema = z.object({
id: z.string().uuid(),
createdAt: z.string().datetime() || z.null(),
updatedAt: z.string().datetime() || z.null()
});
export type Db_documents = z.infer<typeof documentsSchema>;
export type Db_documents_body = Omit<Db_documents, 'id'|'createdAt'|'updatedAt'>