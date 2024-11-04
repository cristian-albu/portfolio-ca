import z from 'zod';
export const updatesSchema = z.object({
id: z.string().uuid(),
title: z.string().max(255) || z.null(),
createdAt: z.string().datetime() || z.null(),
updatedAt: z.string().datetime() || z.null()
});
export type Db_updates = z.infer<typeof updatesSchema>;
export type Db_updates_body = Omit<Db_updates, 'id'|'createdAt'|'updatedAt'>