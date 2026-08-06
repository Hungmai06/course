# Hướng Dẫn Đẩy Unified Source Lên Git & Deploy Subdomain Trên Server

Tài liệu này hướng dẫn bạn cách đẩy **1 Repository duy nhất (Monorepo)** chứa toàn bộ Frontend, Backend, 48ngay và Docker Compose lên Git, cùng với cách cấu hình **Subdomain** cho folder `48ngay` trên Server.

---

## 🌐 Sơ Đồ Định Tuyến Tên Miền (Subdomain Setup)

| Service | Thư mục | Port Docker | Tên Miền / Subdomain Trên Server |
| :--- | :--- | :--- | :--- |
| **Backend API** | `./backend` | `8081` | `https://khoahocdrivemh.pro.vn:8081` |
| **Frontend FE** | `./frontend/FE` | `5173` | `https://khoahocdrivemh.pro.vn` |
| **48Ngay FE** | `./48ngay` | `5174` | `https://english.khoahocdrivemh.pro.vn` |

---

## 🚀 BƯỚC 1: Đẩy 1 Source Duy Nhất Lên Git (Máy Local)

Thư mục gốc `my_course` đã được gộp các `.git` con và khởi tạo 1 Git duy nhất.

Bạn chỉ cần mở Terminal tại máy local và chạy đúng các câu lệnh sau:

```bash
# 1. Thêm tất cả file vào Git (File .gitignore đã tự lọc loại bỏ file rác, .env và node_modules)
git add .

# 2. Commit code
git commit -m "feat: setup single monorepo source for docker & subdomain"

# 3. Kết nối repo GitHub/GitLab của bạn và push (Thay URL repo của bạn vào câu lệnh dưới)
git remote add origin https://github.com/USERNAME/YOUR_REPOSITORY.git
git push -u origin master
```

---

## 💻 BƯỚC 2: Clone & Chạy Trên Server (VPS Ubuntu)

### 2.1. Clone Code Về Server
```bash
cd ~
git clone https://github.com/USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### 2.2. Khởi Tạo File .env
File `.env.example` đã có sẵn 100% dữ liệu thực tế. Bạn chỉ cần copy sang `.env`:
```bash
cp .env.example .env
```

### 2.3. Khởi Chạy Docker Compose
```bash
docker compose up -d --build
```
*(Cả 4 dịch vụ `postgres`, `backend`, `frontend`, và `48ngay-frontend` sẽ khởi chạy thành công ngay lập tức).*

---

## 🌐 BƯỚC 3: Cấu Hình Subdomain 48ngay Với Nginx Trên Server

Để `english.khoahocdrivemh.pro.vn` chạy mượt mà trên Subdomain:

### 1. Trỏ DNS Domain:
Trong trang quản lý tên miền (Cloudflare / MatBao / Inet / ...), bạn tạo 2 bản ghi **A**:
- **A Record**: `@` (hoặc `khoahocdrivemh.pro.vn`) -> Trỏ về IP Server của bạn.
- **A Record**: `english` (tức `english.khoahocdrivemh.pro.vn`) -> Trỏ về IP Server của bạn.

### 2. Cài Đặt Nginx & Copy File Cấu Hình:
Trên Server Ubuntu, chạy:
```bash
sudo apt update && sudo apt install nginx -y

# Copy nội dung từ file nginx-subdomain.conf vào Nginx:
sudo cp nginx-subdomain.conf /etc/nginx/sites-available/default

# Kiểm tra cú pháp Nginx và Reload:
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Cài SSL Miễn Phí (HTTPS với Certbot):
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d khoahocdrivemh.pro.vn -d english.khoahocdrivemh.pro.vn
```

Certbot sẽ tự động cấu hình HTTPS miễn phí cho cả Domain chính và Subdomain `english.khoahocdrivemh.pro.vn`! 🎉
