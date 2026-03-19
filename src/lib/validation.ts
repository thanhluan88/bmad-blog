import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(200, "Slug must be 200 characters or less")
  .transform((s) => s.toLowerCase())
  .pipe(z.string().regex(SLUG_REGEX, "Slug must contain only letters, numbers, and hyphens"));

export const draftPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required"),
  slug: slugSchema,
  contentMd: z.string(),
});

export const publishPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required"),
  slug: slugSchema,
  contentMd: z
    .string()
    .trim()
    .min(1, "Content is required to publish"),
});

export type DraftPostInput = z.infer<typeof draftPostSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;

export function slugToFormat(slug: string): string {
  return slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
