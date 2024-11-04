import z from 'zod';
export const servicesSchema = z.object({
id: z.string().uuid(),
createdAt: z.string().datetime() || z.null(),
updatedAt: z.string().datetime() || z.null()
});
export type Db_services = z.infer<typeof servicesSchema>;
export type Db_services_body = Omit<Db_services, 'id'|'createdAt'|'updatedAt'>