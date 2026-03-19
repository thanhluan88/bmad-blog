# Setup Neon Database

## 1. Kiểm tra DATABASE_URL

Đảm bảo connection string từ Neon có dạng:

```
postgresql://USER:PASSWORD@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Lưu ý:**
- Neon bắt buộc `?sslmode=require` ở cuối.
- **Vercel:** Dùng connection string **Pooled** (host có `-pooler`), không dùng Direct.

## 2. Chạy migrations

### Windows (PowerShell)

```powershell
cd C:\MyWork\BMAD\blog

# Đặt DATABASE_URL (thay bằng connection string thật của bạn)
$env:DATABASE_URL = "postgresql://USER:PASS@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Chạy migrations
npx prisma migrate deploy

# Seed admin user
npm run db:seed
```

### Kiểm tra kết quả

```powershell
# Xem bảng đã tạo
npx prisma db execute --stdin --schema=./prisma/schema.prisma <<< "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

Hoặc vào Neon Dashboard → SQL Editor → chạy:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Bạn sẽ thấy: `User`, `Post`, `_prisma_migrations`.

## 3. Nếu migrate deploy báo lỗi

Thử dùng `db push` (đồng bộ schema trực tiếp, không dùng migration history):

```powershell
$env:DATABASE_URL = "postgresql://..."
npx prisma db push
npm run db:seed
```

## 4. Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| `Can't reach database server` | Kiểm tra connection string, thêm `?sslmode=require` |
| `Authentication failed` | Kiểm tra user/password trong URL |
| `relation "User" does not exist` | Migration chưa chạy; chạy `prisma migrate deploy` |
