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

const ALLOWED_COVER_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const POST_ID_SAFE_REGEX = /^[a-zA-Z0-9_-]+$/;

export const requestSignedUploadSchema = z.object({
  postId: z
    .string()
    .trim()
    .min(1, "Post ID is required")
    .max(50, "Post ID too long")
    .refine((s) => POST_ID_SAFE_REGEX.test(s), "Invalid post ID format"),
  filename: z
    .string()
    .trim()
    .min(1, "Filename is required")
    .max(255, "Filename too long")
    .refine(
      (s) => /^[a-zA-Z0-9._-]+$/.test(s),
      "Filename must contain only letters, numbers, dots, hyphens, and underscores"
    ),
  contentType: z.enum(ALLOWED_COVER_CONTENT_TYPES, {
    error: `Content type must be one of: ${ALLOWED_COVER_CONTENT_TYPES.join(", ")}`,
  }),
  size: z
    .number()
    .int()
    .positive("Size must be positive")
    .max(MAX_COVER_SIZE_BYTES, `File size must not exceed ${MAX_COVER_SIZE_BYTES / 1024 / 1024}MB`),
});

export type RequestSignedUploadInput = z.infer<typeof requestSignedUploadSchema>;

export function slugToFormat(slug: string): string {
  return slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
