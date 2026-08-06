# 🚀 Hướng Dẫn Deploy Dự Án Chi Tiết Từ A - Z Trên Server VPS (Ubuntu)

Tài liệu này được viết chi tiết từng bước để bạn copy-paste thực hiện theo thứ tự từ trên xuống dưới mà không gặp bất kỳ lỗi nào.

---

## 📌 BẢNG THÔNG TIN TÊN MIỀN VÀ CỔNG DỊCH VỤ

| Dịch vụ | Thư mục | Cổng Docker Host | Tên miền / Đường dẫn chính thức |
| :--- | :--- | :--- | :--- |
| **Database** | Volume | `5432` | `localhost:5432` (PostgreSQL 15) |
| **Backend API** | `./backend` | `8081` | `https://khoahocdrivemh.pro.vn:8081` |
| **Frontend Chính** | `./frontend/FE` | `5173` | `https://khoahocdrivemh.pro.vn` |
| **Frontend 48Ngay** | `./48ngay` | `5174` | `https://english.khoahocdrivemh.pro.vn` |

---

## 🛠️ BƯỚC 1: Cấu Hình DNS Tên Miền (Thực hiện trên trang quản lý Tên miền)

Vào trang quản lý Tên miền (Cloudflare, MatBao, Inet, v.v.) và thêm 2 bản ghi **A Record**:

1. **Bản ghi 1 (Tên miền chính)**:
   - **Type**: `A`
   - **Name**: `@` (hoặc `khoahocdrivemh.pro.vn`)
   - **IPv4 Address**: `IP_SERVER_CỦA_BẠN`
   - **TTL**: Auto

2. **Bản ghi 2 (Subdomain Tiếng Anh 48 ngày)**:
   - **Type**: `A`
   - **Name**: `english` (tức `english.khoahocdrivemh.pro.vn`)
   - **IPv4 Address**: `IP_SERVER_CỦA_BẠN`
   - **TTL**: Auto

---

## 💻 BƯỚC 2: Cài Đặt Môi Trường Trên Server (VPS Ubuntu)

SSH vào Server Ubuntu của bạn và chạy lần lượt các lệnh sau:

### 2.1. Cập nhật hệ thống:
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2. Cài đặt Docker, Docker Compose, Git và Nginx:
```bash
sudo apt install -y docker.io docker-compose-v2 git nginx certbot python3-certbot-nginx
```

### 2.3. Cấp quyền chạy Docker cho User hiện tại (tránh lỗi Permission Denied):
```bash
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📂 BƯỚC 3: Clone Source Code Và Khởi Tạo Môi Trường

### 3.1. Clone dự án từ GitHub về thư mục root:
```bash
cd ~
git clone https://github.com/Hungmai06/course.git
cd course
```

### 3.2. Khởi tạo file `.env`:
File `.env.example` đã chứa đầy đủ 100% cấu hình thực tế. Bạn chỉ cần chạy lệnh copy:
```bash
cp .env.example .env
```

---

## 🗄️ BƯỚC 4: Import Cơ Sở Dữ Liệu (`course_backup.sql`)

Nếu bạn có file sao lưu cơ sở dữ liệu `course_backup.sql` từ máy local:

### 4.1. Upload file `course_backup.sql` từ máy Local lên Server:
*(Mở Terminal tại máy Local - nơi chứa file course_backup.sql - và chạy lệnh):*
```bash
scp course_backup.sql ubuntu@IP_SERVER_CỦA_BẠN:~/course/
```
*(Thay `ubuntu` và `IP_SERVER_CỦA_BẠN` bằng thông tin VPS của bạn).*

### 4.2. Khởi chạy riêng container Database Postgres trên Server:
*(Quay lại Terminal của Server VPS)*:
```bash
docker compose up -d postgres
```

### 4.3. Kiểm tra Postgres đã sẵn sàng (khoảng 5-10 giây) và Import SQL:
```bash
docker exec -i postgres psql -U admin -d course < course_backup.sql
```
*(Lệnh trên sẽ tự động khôi phục toàn bộ bảng và dữ liệu vào cơ sở dữ liệu `course`).*

---

## 🚀 BƯỚC 5: Khởi Chạy Toàn Bộ Ứng Dụng Với Docker Compose

Chạy 1 lệnh duy nhất để build và khởi chạy cả 4 services (`postgres`, `backend`, `frontend`, `48ngay`):

```bash
docker compose up -d --build
```

### Kiểm Tra Kết Quả Khởi Chạy:
1. **Kiểm tra trạng thái các container:**
   ```bash
   docker compose ps
   ```
   *(Đảm bảo cả 4 container `postgres`, `backend`, `frontend`, `48ngay-frontend` đều ghi `Up` hoặc `running`).*

2. **Xem log khởi động Backend:**
   ```bash
   docker compose logs -f backend
   ```
   *(Nhấn `Ctrl + C` để thoát màn hình xem log).*

---

## 🌐 BƯỚC 6: Cấu Hình Nginx Reverse Proxy (Subdomain & Domain)

### 6.1. Copy file cấu hình Nginx có sẵn trong dự án:
```bash
sudo cp nginx-subdomain.conf /etc/nginx/sites-available/default
```

### 6.2. Kiểm tra cú pháp Nginx và khởi động lại Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 BƯỚC 7: Cài Đặt SSL Miễn Phí (HTTPS với Certbot)

Chạy Certbot để tự động đăng ký chứng chỉ HTTPS SSL cho cả Domain chính và Subdomain:

```bash
sudo certbot --nginx -d khoahocdrivemh.pro.vn -d www.khoahocdrivemh.pro.vn -d english.khoahocdrivemh.pro.vn
```

- Nhập email của bạn khi được hỏi.
- Chọn `Y` để đồng ý với điều khoản service.
- Certbot sẽ tự động gia hạn chứng chỉ khi hết hạn.

---

## 🛠️ HƯỚNG DẪN BẢO TRÌ & LỆNH THƯỜNG DÙNG

- **Xem log tất cả dịch vụ:**
  ```bash
  docker compose logs -f
  ```
- **Khởi động lại Backend:**
  ```bash
  docker compose restart backend
  ```
- **Cập nhật code mới từ GitHub sau này:**
  ```bash
  git pull origin main
  docker compose up -d --build
  ```
- **Dừng toàn bộ hệ thống:**
  ```bash
  docker compose down
  ```

🎉 **Chúc mừng! Hệ thống của bạn đã được deploy thành công và chạy mượt mà với HTTPS!**
