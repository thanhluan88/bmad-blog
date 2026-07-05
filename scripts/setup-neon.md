# Setup Neon Database

## 1. Connection strings

Neon provides two URLs:

| Use | Host pattern | Env var |
|-----|--------------|---------|
| App runtime (Vercel) | `ep-xxx-**pooler**.region.aws.neon.tech` | `DATABASE_URL` |
| Migrations (`db:deploy`) | `ep-xxx.region.aws.neon.tech` (no `-pooler`) | `DIRECT_URL` (optional) |

**Lưu ý:**
- Neon bắt buộc `?sslmode=require` ở cuối.
- **Vercel `DATABASE_URL`:** dùng connection string **Pooled**.
- **Không** chạy `prisma migrate deploy` trong Vercel build — pooler không hỗ trợ advisory lock (lỗi P1002).
- `npm run db:deploy` tự đổi `-pooler` → direct nếu chưa có `DIRECT_URL`.

## 2. Chạy migrations

### Windows (PowerShell)

```powershell
cd C:\MyWork\BMAD\blog

# Pooled URL cho app (hoặc direct URL cũng được khi migrate local)
$env:DATABASE_URL = "postgresql://USER:PASS@ep-xxx-pooler.region.aws.neon.tech/simple_blog?sslmode=require"

# Chạy migrations (dùng direct connection)
npm run db:deploy

# Seed admin user
npm run db:seed
```

### Kiểm tra kết quả

Vào Neon Dashboard → SQL Editor:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Bạn sẽ thấy: `User`, `Post`, `PmpQuizStat`, `SiteStat`, `_prisma_migrations`.

## 3. Vercel deploy

1. Set `DATABASE_URL` = pooled Neon URL trong Vercel Environment Variables.
2. Build chỉ chạy `prisma generate && next build` (không migrate).
3. Sau khi thêm migration mới, chạy `npm run db:deploy` từ máy local hoặc CI với direct URL.

## 4. Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| `P1002` advisory lock timeout | Đang dùng pooler cho migrate — chạy `npm run db:deploy` thay vì migrate qua pooler |
| `Can't reach database server` | Kiểm tra connection string, thêm `?sslmode=require` |
| `Authentication failed` | Kiểm tra user/password trong URL |
| `relation "User" does not exist` | Migration chưa chạy; chạy `npm run db:deploy` |
