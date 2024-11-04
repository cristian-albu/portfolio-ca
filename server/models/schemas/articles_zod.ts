import z from 'zod';
export const articlesSchema = z.object({
id: z.string().uuid(),
title: z.string().max(255) || z.null(),
description: z.string().max(255) || z.null(),
createdAt: z.string().datetime() || z.null(),
updatedAt: z.string().datetime() || z.null()
});
export type Db_articles = z.infer<typeof articlesSchema>;
export type Db_articles_body = Omit<Db_articles, 'id'|'createdAt'|'updatedAt'>