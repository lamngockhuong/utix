import { defineCollection, z } from 'astro:content';

const scriptsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    version: z.string(),
    tags: z.array(z.string()).default([]),
    requires: z.array(z.string()).default([]),
    author: z.string(),
  }),
});

export const collections = {
  scripts: scriptsCollection,
};
