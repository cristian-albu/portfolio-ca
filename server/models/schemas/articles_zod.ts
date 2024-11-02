import z from 'zod';
export const articlesSchema = z.object({
id: z.string().uuid() || z.null(),
title: z.string().max(255) || z.null(),
description: z.string().max(255) || z.null(),
createdAt: z.string().datetime().default(() => new Date().toISOString()) || z.null(),
updatedAt: z.string().datetime().default(() => new Date().toISOString()) || z.null()
});
export type Db_articles = z.infer<typeof articlesSchema>;