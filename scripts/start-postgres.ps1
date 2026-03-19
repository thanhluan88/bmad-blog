# Chay Postgres bang Docker (khong can quyen admin).
# Dieu kien: Docker Desktop da cai va dang chay.
$name = "simple-blog-postgres"
$exists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^$name$"
if ($exists) {
  docker start $name
  Write-Host "Container $name da duoc start."
} else {
  docker run --name $name `
    -e POSTGRES_USER=simple_blog `
    -e POSTGRES_PASSWORD=simple_blog `
    -e POSTGRES_DB=simple_blog `
    -p 5432:5432 `
    -d postgres:16
  Write-Host "Container $name da duoc tao va start. Port 5432."
}
Write-Host "DATABASE_URL=postgresql://simple_blog:simple_blog@localhost:5432/simple_blog?schema=public"
