#!/bin/bash

# ==============================================================================
# SCRIPT DEPLOY TỰ ĐỘNG CHO DỰ ÁN MY_COURSE (PRODUCTION STANDARD)
# HĐH: Ubuntu 24.04 LTS | Docker CE + Compose V2 | PostgreSQL 15 | Spring Boot | React
# ==============================================================================

set -e

# Màu sắc thông báo
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

echo -e "${BLUE}"
echo "=================================================================="
echo "      🚀 BẮT ĐẦU QUÁ TRÌNH DEPLOY TỰ ĐỘNG DỰ ÁN MY_COURSE"
echo "=================================================================="
echo -e "${NC}"

# 1. Kiểm tra Docker & Docker Compose V2
log_info "Bước 1: Kiểm tra Docker và Docker Compose V2..."

if ! command -v docker &> /dev/null; then
    log_error "Docker CE chưa được cài đặt! Vui lòng làm theo Bước 2 trong DEPLOY.md để cài đặt Docker CE."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    log_error "Docker Compose Plugin (V2) chưa được cài đặt! Vui lòng cài đặt docker-compose-plugin."
    exit 1
fi

log_success "Docker CE và Docker Compose V2 đã sẵn sàng:"
docker --version
docker compose version

# 2. Kiểm tra file .env
log_info "Bước 2: Kiểm tra cấu hình môi trường (.env)..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        log_warning "Không tìm thấy file .env. Đang tự động sao chép từ .env.example..."
        cp .env.example .env
        log_success "Đã tạo file .env từ .env.example!"
    else
        log_error "Không tìm thấy cả .env lẫn .env.example! Vui lòng kiểm tra lại repository."
        exit 1
    fi
else
    log_success "File .env đã tồn tại."
fi

# 3. Khởi động PostgreSQL
log_info "Bước 3: Khởi chạy PostgreSQL Container..."
docker compose up -d postgres

log_info "Đang chờ PostgreSQL sẵn sàng nhận kết nối..."
MAX_RETRIES=30
RETRY_COUNT=0
UNTIL_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec postgres pg_isready -U admin -d course &> /dev/null; then
        UNTIL_READY=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 2
done

echo ""

if [ "$UNTIL_READY" = true ]; then
    log_success "PostgreSQL đã READY!"
else
    log_error "PostgreSQL không phản hồi sau 60 giây. Xem log với: docker compose logs postgres"
    exit 1
fi

# 4. Kiểm tra & Restore Database nếu cần
log_info "Bước 4: Kiểm tra dữ liệu Database PostgreSQL..."
TABLE_COUNT=$(docker exec -i postgres psql -U admin -d course -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$TABLE_COUNT" -gt 0 ]; then
    log_success "Database đã có $TABLE_COUNT bảng dữ liệu. Bỏ qua bước restore tự động."
else
    log_warning "Database hiện đang trống ($TABLE_COUNT bảng)."
    
    # Tìm file backup
    BACKUP_FILE=""
    if [ -f "./course_backup.sql" ]; then
        BACKUP_FILE="./course_backup.sql"
    elif [ -f "/root/course_backup.sql" ]; then
        BACKUP_FILE="/root/course_backup.sql"
    elif [ -f "/root/course/course_backup.sql" ]; then
        BACKUP_FILE="/root/course/course_backup.sql"
    fi

    if [ -n "$BACKUP_FILE" ]; then
        log_info "Phát hiện file backup tại: $BACKUP_FILE. Đang tiến hành restore..."
        docker exec -i postgres psql -U admin -d course < "$BACKUP_FILE"
        
        # Verify restore
        NEW_TABLE_COUNT=$(docker exec -i postgres psql -U admin -d course -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ' || echo "0")
        log_success "Restore Database hoàn tất! Tổng số bảng hiện tại: $NEW_TABLE_COUNT."
    else
        log_warning "Không tìm thấy file course_backup.sql tại ./ hoặc /root/. Database sẽ chạy với dữ liệu trống ban đầu."
    fi
fi

# 5. Build và khởi chạy toàn bộ dịch vụ
log_info "Bước 5: Build và khởi chạy toàn bộ ứng dụng (Backend, Frontend Main, Frontend 48Ngay)..."
docker compose up -d --build

# 6. Kiểm tra trạng thái các container
log_info "Bước 6: Kiểm tra trạng thái toàn bộ Container..."
docker compose ps

# 7. Thông báo hoàn tất
echo -e "${GREEN}"
echo "=================================================================="
echo "🎉 TẤT CẢ DỊCH VỤ ĐÃ ĐƯỢC DEPLOY THÀNH CÔNG!"
echo "=================================================================="
echo -e "${NC}"
echo -e "📍 Backend API direct:       http://SERVER_IP:8081"
echo -e "📍 Frontend Main direct:      http://SERVER_IP:5173"
echo -e "📍 Frontend 48Ngay direct:    http://SERVER_IP:5174"
echo -e "📍 Web chính (qua Nginx/SSL): https://khoahocdrivemh.pro.vn"
echo -e "📍 Web 48Ngay (qua Nginx/SSL): https://english.khoahocdrivemh.pro.vn"
echo ""
echo -e "${YELLOW}💡 Gợi ý kiểm tra log Backend:${NC} docker compose logs -f backend"
echo -e "${YELLOW}💡 Gợi ý kiểm tra log Postgres:${NC} docker compose logs -f postgres"
echo "=================================================================="
