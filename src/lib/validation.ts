import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z
  .string()
  .trim()
  .min(1, "スラッグは必須です")
  .max(200, "スラッグは200文字以内にしてください")
  .transform((s) => s.toLowerCase())
  .pipe(z.string().regex(SLUG_REGEX, "スラッグは英数字とハイフンのみ使用できます"));

export const draftPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "タイトルは必須です"),
  slug: slugSchema,
  contentMd: z.string(),
});

export const publishPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "タイトルは必須です"),
  slug: slugSchema,
  contentMd: z
    .string()
    .trim()
    .min(1, "公開するには本文が必要です"),
});

export type DraftPostInput = z.infer<typeof draftPostSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;

export function slugToFormat(slug: string): string {
  return slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
