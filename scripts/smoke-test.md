# Smoke Test Checklist

Run after deploying to Cloud Run to verify the blog works end-to-end.

## Prerequisites

- Deployment complete; service URL known
- Admin user seeded (run `npm run db:seed` in env with DATABASE_URL, or use seed workflow)

## Steps

1. **GET /** — Homepage lists published posts
   - Open `{SERVICE_URL}/` in browser
   - Expect: list of published posts (or empty state if none)

2. **Login** — Admin can authenticate
   - Navigate to `{SERVICE_URL}/admin/posts`
   - Expect: redirect to login if not authenticated
   - Log in with admin credentials
   - Expect: land on `/admin/posts` with post list

3. **CRUD** — Create draft, edit, publish
   - Create new post (title, slug, content)
   - Save as draft
   - Edit the draft
   - Publish the post
   - Expect: post appears in list with PUBLISHED status

4. **Public read** — Published post visible
   - Open `{SERVICE_URL}/p/{slug}` for the published post
   - Expect: post content renders; no 404

5. **Upload cover** — Cover image flow works
   - Edit a post
   - Upload a cover image
   - Save/publish
   - Open public post page
   - Expect: cover image displays

## Pass Criteria

All steps complete without errors. No 500s in Cloud Run logs during the run.

## Troubleshooting

- **500 on DB operations**: Check DATABASE_URL and Cloud SQL connection
- **Upload fails**: Check GCS_BUCKET, CORS, and service account permissions
- **Auth redirect loop**: Check AUTH_SECRET and AUTH_TRUST_HOST
