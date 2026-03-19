# Setup Neon: chạy migrations + seed
# Usage: .\scripts\setup-neon.ps1
# Hoặc: $env:DATABASE_URL="postgresql://..."; .\scripts\setup-neon.ps1

$ErrorActionPreference = "Stop"

if (-not $env:DATABASE_URL) {
    Write-Host "Lỗi: Chưa đặt DATABASE_URL" -ForegroundColor Red
    Write-Host ""
    Write-Host "Chạy:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL = "postgresql://USER:PASS@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"'
    Write-Host "  .\scripts\setup-neon.ps1"
    Write-Host ""
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
Set-Location $rootDir

Write-Host "Đang chạy prisma migrate deploy..." -ForegroundColor Cyan
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Migrate thất bại. Thử prisma db push..." -ForegroundColor Yellow
    npx prisma db push
}
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Đang chạy seed..." -ForegroundColor Cyan
npm run db:seed
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "Xong! Kiểm tra bảng trên Neon Dashboard." -ForegroundColor Green
