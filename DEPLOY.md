# 🚀 TÀI LIỆU HƯỚNG DẪN DEPLOY DỰ ÁN PRODUCTION TỪ A - Z (UBUNTU 24.04 LTS)

Tài liệu này được biên soạn chuẩn **Production DevOps** dành cho dự án **MY_COURSE**. Tài liệu giúp bất kỳ ai (kể cả người chưa có kinh nghiệm về Docker hay Linux) cũng có thể làm theo từ trên xuống dưới bằng cách **Copy & Paste** để triển khai dự án thành công 100%.

---

## 📌 BẢNG CẤU HÌNH HỆ THỐNG VÀ CỔNG DỊCH VỤ

| Dịch vụ | Thư mục Nguồn | Cổng Internal / Docker Host | Tên Miền / Đường Dẫn HTTPS | Nhiệm Vụ |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL 15** | Docker Volume (`postgres_data`) | `5432:5432` | `localhost:5432` | Cơ sở dữ liệu chính của dự án |
| **Backend API** | `./backend` | `8081:8081` | `https://khoahocdrivemh.pro.vn:8081` | RESTful API Spring Boot |
| **Frontend Chính** | `./frontend/FE` | `5173:80` | `https://khoahocdrivemh.pro.vn` | Giao diện học viên / Admin |
| **Frontend 48Ngay** | `./48ngay` | `5174:80` | `https://english.khoahocdrivemh.pro.vn` | Subdomain học Tiếng Anh |
| **Nginx Proxy** | `/etc/nginx` | `80, 443` | `khoahocdrivemh.pro.vn` | Reverse Proxy & SSL Let's Encrypt |

---

## ⚡ PHƯƠNG PHÁP DEPLOY NHANH (SỬ DỤNG SCRIPT TỰ ĐỘNG `deploy.sh`)

Nếu bạn muốn deploy nhanh chóng chỉ với **1 câu lệnh**, dự án đã tích hợp sẵn script `deploy.sh`. Script sẽ tự động kiểm tra Docker, file `.env`, khởi chạy Database PostgreSQL, tự động Restore SQL nếu DB trống, build Backend, build Frontend và kiểm tra sức khỏe của toàn bộ hệ thống.

### Các bước chạy Script tự động:

1. **Cấp quyền thực thi và khởi chạy script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

> [!TIP]
> Nếu bạn muốn tìm hiểu chi tiết từng bước, tùy chỉnh cấu hình hoặc tự tay thao tác theo chuẩn thủ công để hiểu sâu kiến trúc, hãy làm theo **HƯỚNG DẪN CHI TIẾT TỪ BƯỚC 1 ĐẾN BƯỚC 8** bên dưới.

---

## 🛠️ BƯỚC 1: CẤU HÌNH DNS TÊN MIỀN (DOMAIN & SUBDOMAIN)

### 📝 Giải thích:
Trước khi cài đặt SSL hoặc cấu hình Nginx, tên miền của bạn phải được trỏ đúng về địa chỉ IP của VPS Server. Nếu chưa trỏ DNS thành công, quá trình đăng ký SSL HTTPS sẽ thất bại hoàn toàn.

### 💻 Lệnh thực hiện:
Vào trang quản lý tên miền (Cloudflare, Mắt Bão, iNet, Namecheap, v.v.) và thêm 2 bản ghi **A Record**:

| Type | Name | IPv4 Address (Target) | TTL | Mục đích |
| :--- | :--- | :--- | :--- | :--- |
| `A` | `@` (hoặc `khoahocdrivemh.pro.vn`) | `IP_SERVER_CỦA_BẠN` | Auto / 300s | Tên miền chính cho dự án |
| `A` | `english` (tức `english.khoahocdrivemh.pro.vn`) | `IP_SERVER_CỦA_BẠN` | Auto / 300s | Subdomain cho trang 48Ngay |

### 🔍 Verify (Kiểm tra DNS):
Chạy các lệnh sau trên máy tính cá nhân hoặc Server:
```bash
ping khoahocdrivemh.pro.vn
ping english.khoahocdrivemh.pro.vn
nslookup khoahocdrivemh.pro.vn
```

### ✅ Expected Output:
```text
PING khoahocdrivemh.pro.vn (103.x.x.x) 56(84) bytes of data.
64 bytes from 103.x.x.x: icmp_seq=1 ttl=55 time=12.4 ms
```
*(Địa chỉ IP trả về phải trùng khớp chính xác với `IP_SERVER_CỦA_BẠN`).*

### ⚠️ Common Errors:
- **Lỗi DNS lookup failed**: Do bản ghi mới tạo chưa kịp lan truyền (phân giải). Hãy chờ từ 5 đến 15 phút.
- **Lỗi ping ra IP cũ**: Do cache DNS cục bộ. Thử xóa cache DNS trên Windows bằng `ipconfig /flushdns`.

---

## 💻 BƯỚC 2: CÀI ĐẶT MÔI TRƯỜNG DOCKER CE CHUẨN PRODUCTION (UBUNTU 24.04 LTS)

> [!WARNING]
> Không dùng `apt install docker.io` hoặc `docker-compose` cũ! Chúng ta sẽ sử dụng **Docker CE Official Repository** và **Docker Compose V2** chuẩn chính thức từ Docker Inc.

### 📝 Giải thích:
Cài đặt Docker Engine bản mới nhất, Docker Buildx, và Docker Compose Plugin V2 từ Kho lưu trữ chính thức của Docker để đảm bảo tính ổn định và bảo mật cao nhất cho môi trường Production.

### 💻 Lệnh thực hiện:

#### 2.1. Gỡ bỏ các phiên bản Docker cũ (nếu có):
```bash
sudo apt-get remove -y docker docker-engine docker.io containerd runc
```

#### 2.2. Cập nhật hệ thống và cài đặt các gói tiền đề:
```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg lsb-release git nginx certbot python3-certbot-nginx ufw
```

#### 2.3. Thêm GPG Key chính thức của Docker:
```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

#### 2.4. Thêm Docker Repository vào danh sách apt:
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

#### 2.5. Cài đặt Docker CE Engine & Docker Compose Plugin V2:
```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### 2.6. Bật dịch vụ Docker và cấp quyền quản trị:
```bash
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

### 🔍 Verify (Kiểm tra phiên bản):
```bash
docker --version
docker compose version
sudo systemctl status docker
```

### ✅ Expected Output:
```text
Docker version 27.x.x, build ...
Docker Compose version v2.x.x
● docker.service - Docker Application Container Engine
     Active: active (running) since ...
```

### ⚠️ Common Errors:
- **Lỗi `Permission denied` khi gõ docker**: Do chưa cập nhật group user. Bạn có thể gõ `newgrp docker` hoặc logout và SSH lại vào VPS.

---

## 🛡️ BƯỚC 3: CẤU HÌNH TƯỜNG LỬA FIREWALL (UFW)

### 📝 Giải thích:
Mở các cổng mạng cần thiết trên VPS để người dùng truy cập được Web (80, 443), SSH quản trị (22) và kiểm tra trực tiếp Backend (8081).

### 💻 Lệnh thực hiện:
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8081/tcp
sudo ufw enable
```

### 🔍 Verify:
```bash
sudo ufw status verbose
```

### ✅ Expected Output:
```text
Status: active
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
8081/tcp                   ALLOW IN    Anywhere
```

---

## 📂 BƯỚC 4: CLONE SOURCE CODE VÀ CẤU HÌNH BIẾN MÔI TRƯỜNG (.ENV)

### 📝 Giải thích:
Clone mã nguồn từ GitHub về thư mục cá nhân của root (`/root/course`), tạo file cấu hình `.env` chứa các bí mật quốc gia (mật khẩu database, JWT secret, email, API key VietQR).

### 💻 Lệnh thực hiện:

#### 4.1. Clone dự án về VPS:
```bash
cd /root
git clone https://github.com/Hungmai06/course.git
cd /root/course
```

#### 4.2. Khởi tạo và chỉnh sửa file `.env`:
```bash
cp .env.example .env
nano .env
```

### 📋 GIẢI THÍCH CHI TIẾT CÁC BIẾN QUAN TRỌNG TRONG `.ENV`:

| Tên Biến Môi Trường | Giá Trị Mặc Định / Ví Dụ | Giải Thích Chi Tiết Ý Nghĩa |
| :--- | :--- | :--- |
| `POSTGRES_DB` | `course` | Tên của Database PostgreSQL sẽ được tạo tự động |
| `POSTGRES_USER` | `admin` | Tài khoản Supperuser quản trị PostgreSQL |
| `POSTGRES_PASSWORD` | `Admin123@` | Mật khẩu truy cập PostgreSQL (Nên đổi ở Production) |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres:5432/course` | Đường dẫn kết nối JDBC từ Backend tới container `postgres` qua mạng nội bộ Docker |
| `JWT_ACCESS_KEY` | `Z3YmEphCpEaLM14gjwN3WWMs...` | Chuỗi mã hóa bí mật cấp phát Token Access cho User |
| `JWT_REFRESH_KEY` | `YzWtBjqYoRn5XX+AUkf5iSX...` | Chuỗi mã hóa bí mật cấp phát Refresh Token |
| `SPRING_MAIL_USERNAME` | `khoahocdrive0604@gmail.com` | Email gửi mã OTP / Thông báo tự động qua SMTP |
| `SPRING_MAIL_PASSWORD` | `itjo getr enfy bqqh` | Mật khẩu ứng dụng (App Password 16 ký tự của Google) |
| `VITE_API_BASE_URL` | `https://khoahocdrivemh.pro.vn` | Domain Backend API công khai để Frontend gọi AJAX |

> [!NOTE]
> Sau khi chỉnh sửa các thông số trong `nano .env`, nhấn `Ctrl + O` -> `Enter` để lưu file, sau đó nhấn `Ctrl + X` để thoát editor.

### 🔍 Verify:
```bash
ls -la .env
head -n 15 .env
```

---

## 🗄️ BƯỚC 5: KHOẢNG CÁCH IMPORT VÀ RESTORE CƠ SỞ DỮ LIỆU (`course_backup.sql`)

### 📝 Giải thích:
Nếu bạn có file sao lưu cơ sở dữ liệu `course_backup.sql` từ máy local, bạn cần upload file lên VPS (vào `/root/`) sau đó import toàn bộ bảng và dữ liệu vào container PostgreSQL.

### 💻 Lệnh thực hiện:

#### 5.1. Upload file `course_backup.sql` từ máy LOCAL lên SERVER (Mở Terminal máy local):
```bash
scp course_backup.sql root@IP_SERVER_CỦA_BẠN:/root/
```
*(Nếu file đã có sẵn trong thư mục dự án `/root/course/course_backup.sql`, bạn có thể bỏ qua bước SCP).*

#### 5.2. Khởi chạy riêng container Database Postgres trên Server:
*(Thao tác trên Terminal của Server VPS)*:
```bash
cd /root/course
docker compose up -d postgres
```

#### 5.3. Kiểm tra Postgres đã sẵn sàng nhận kết nối:
```bash
docker compose ps
docker compose logs postgres
```

#### 5.4. Thực hiện Restore Database bằng đường dẫn tuyệt đối:
```bash
docker exec -i postgres psql -U admin -d course < /root/course_backup.sql
```
*(Nếu file nằm trong thư mục course: `docker exec -i postgres psql -U admin -d course < /root/course/course_backup.sql`)*.

> [!NOTE]
> **HƯỚNG DẪN ĐỌC THÔNG BÁO KHI RESTORE DATABASE:**
> Nếu trong quá trình chạy lệnh restore, màn hình hiển thị các thông báo như:
> - `psql:ERROR: relation "..." already exists`
> - `psql:ERROR: duplicate key value violates unique constraint`
> - `psql:ERROR: multiple primary keys for table "..." are not allowed`
> 
> 👉 **ĐÂY KHÔNG PHẢI LÀ LỖI HỆ THỐNG TRẦM TRỌNG!** Các thông báo này chỉ đơn giản cho biết Database đã được tạo cấu trúc hoặc dữ liệu này đã được import từ trước đó. Bạn hoàn toàn có thể yên tâm bỏ qua và tiếp tục sang bước tiếp theo.

### 🔍 Verify (Kiểm tra danh sách bảng đã Restore):
```bash
docker exec -it postgres psql -U admin -d course -c "\dt"
```

### ✅ Expected Output:
```text
              List of relations
 Schema |      Name       | Type  | Owner 
--------+-----------------+-------+-------
 public | authors         | table | admin
 public | categories      | table | admin
 public | courses         | table | admin
 public | orders          | table | admin
 public | users           | table | admin
(15 rows)
```
*(Xuất hiện danh sách các bảng như `authors`, `users`, `courses`... => Database Restore THÀNH CÔNG 100%).*

---

## 🚀 BƯỚC 6: KHỞI CHẠY TOÀN BỘ ỨNG DỤNG VỚI DOCKER COMPOSE V2

### 📝 Giải thích:
Build hình ảnh Docker (Docker Image) cho Backend Spring Boot, Frontend Main React, Frontend 48Ngay React và khởi chạy tất cả 4 dịch vụ cùng lúc dưới nền (`-d`).

### 💻 Lệnh thực hiện:
```bash
cd /root/course
docker compose up -d --build
```

### 🔍 Verify & Kiểm tra chi tiết từng Container:

#### 6.1. Kiểm tra danh sách Container đang chạy:
```bash
docker compose ps
```

### 💡 Giải thích các Trạng Thái (Status) Container:
- **`Up (healthy)` / `Up`**: Container đang chạy bình thường, ứng dụng hoạt động ổn định.
- **`Exited (1)` / `Exited (137)`**: Container đã bị dừng hoặc gặp sự cố crash. Cần kiểm tra log ngay.
- **`Restarting`**: Container bị lỗi và Docker đang liên tục cố gắng khởi chạy lại.

#### 6.2. Verify Backend Log (Xác nhận Spring Boot chạy thành công):
```bash
docker compose logs -f backend
```
*(Bấm `Ctrl + C` để thoát màn hình xem log).*

### ✅ Expected Output Log Backend:
```text
backend  | 2026-08-06T15:00:00.123Z  INFO 1 --- [main] c.e.course.BackendApplication : Started BackendApplication in 8.452 seconds (process running for 9.1)
```

#### 6.3. Verify trực tiếp cổng dịch vụ Frontend trên Trình Duyệt:
Mở trình duyệt web trên máy tính của bạn và truy cập trực tiếp IP:
- **Frontend Chính (Vite React)**: `http://IP_SERVER_CỦA_BẠN:5173`
- **Frontend 48Ngay (Vite React)**: `http://IP_SERVER_CỦA_BẠN:5174`
- **Backend API Direct**: `http://IP_SERVER_CỦA_BẠN:8081`

---

## 🌐 BƯỚC 7: CẤU HÌNH NGINX REVERSE PROXY CHO DOMAIN VÀ SUBDOMAIN

### 📝 Giải thích:
Nginx sẽ đóng vai trò Cổng Chuyển Tiếp (Reverse Proxy), nhận lưu lượng truy cập từ Cổng 80/443 của Domain `khoahocdrivemh.pro.vn` và `english.khoahocdrivemh.pro.vn`, sau đó điều hướng nội bộ tới đúng các cổng Docker Container (5173 và 5174).

### 💻 Lệnh thực hiện:

#### 7.1. Copy cấu hình Nginx mẫu của dự án vào thư mục Nginx hệ thống:
```bash
sudo cp /root/course/nginx-subdomain.conf /etc/nginx/sites-available/default
```

#### 7.2. Kiểm tra cú pháp file cấu hình Nginx:
```bash
sudo nginx -t
```

#### 7.3. Khởi động lại dịch vụ Nginx:
```bash
sudo systemctl reload nginx
```

### 🔍 Verify:
```bash
sudo systemctl status nginx
```

### ✅ Expected Output:
```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
● nginx.service - A high performance web server and a reverse proxy server
     Active: active (running) since ...
```

---

## 🔒 BƯỚC 8: CÀI ĐẶT SSL HTTPS MIỄN PHÍ VỚI CERTBOT (LET'S ENCRYPT)

### 📝 Giải thích:
Đăng ký và cài đặt tự động chứng chỉ bảo mật SSL HTTPS cho cả tên miền chính và subdomain. Certbot sẽ tự động can thiệp cập nhật file cấu hình Nginx để mã hóa toàn bộ dữ liệu qua cổng 443.

> [!IMPORTANT]
> Chỉ thực hiện bước này khi **BƯỚC 1 (DNS)** đã trỏ IP thành công và **BƯỚC 7 (Nginx)** đang hoạt động bình thường!

### 💻 Lệnh thực hiện:
```bash
sudo certbot --nginx -d khoahocdrivemh.pro.vn -d www.khoahocdrivemh.pro.vn -d english.khoahocdrivemh.pro.vn
```

### 📋 Hướng dẫn tương tác với Certbot khi được hỏi:
1. **Enter email address**: Nhập email cá nhân của bạn (Ví dụ: `admin@gmail.com`).
2. **Terms of Service (Y/N)**: Nhập `Y` để đồng ý.
3. **Share email with EFF (Y/N)**: Nhập `N` (hoặc `Y` tùy chọn).
4. Certbot sẽ tự động xác minh DNS và sinh chứng chỉ SSL.

### 🔍 Verify & Kiểm Tra URL HTTPS Chính Thức:
Mở trình duyệt web và truy cập các đường dẫn HTTPS:
- 🔒 **Website Chính**: [https://khoahocdrivemh.pro.vn](https://khoahocdrivemh.pro.vn)
- 🔒 **Subdomain 48Ngay**: [https://english.khoahocdrivemh.pro.vn](https://english.khoahocdrivemh.pro.vn)
- 🔒 **Backend API**: [https://khoahocdrivemh.pro.vn:8081](https://khoahocdrivemh.pro.vn:8081)

### ✅ Expected Output trên Certbot Terminal:
```text
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/khoahocdrivemh.pro.vn/fullchain.pem
Deploying certificate to VirtualHost /etc/nginx/sites-enabled/default...
Congratulations! You have successfully enabled HTTPS on https://khoahocdrivemh.pro.vn and https://english.khoahocdrivemh.pro.vn
```

---

## 📦 QUẢN LÝ BACKUP & RESTORE DATABASE TRONG TƯƠNG LAI

### 📤 1. Xuất file Backup Database (Backup Database):
Chạy lệnh xuất file `.sql` kèm dấu mốc thời gian để sao lưu dữ liệu an toàn:
```bash
docker exec postgres pg_dump -U admin course > /root/course_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 📥 2. Khôi phục dữ liệu từ file Backup (Restore Backup):
```bash
docker exec -i postgres psql -U admin -d course < /root/course_backup.sql
```

---

## 🔄 HƯỚNG DẪN BẢO TRÌ, CẬP NHẬT CODE VÀ RESTART DỊCH VỤ

### 🔄 1. Cập nhật mã nguồn mới từ GitHub (Update Source Code):
Khi bạn đẩy code mới lên branch `main` của GitHub, hãy chạy các lệnh sau trên Server:
```bash
cd /root/course
git pull origin main
docker compose up -d --build
```

### 🔁 2. Khởi động lại riêng lẻ các dịch vụ (Restart Services):
- Khởi động lại Backend:
  ```bash
  docker compose restart backend
  ```
- Khởi động lại Frontend Main & 48Ngay:
  ```bash
  docker compose restart frontend 48ngay
  ```
- Khởi động lại Database PostgreSQL:
  ```bash
  docker compose restart postgres
  ```
- Khởi động lại Nginx Web Server:
  ```bash
  sudo systemctl restart nginx
  ```

### 📋 3. Xem Log các dịch vụ theo thời gian thực (View Logs):
- Xem log tất cả các dịch vụ:
  ```bash
  docker compose logs -f
  ```
- Xem log riêng Backend:
  ```bash
  docker compose logs -f backend
  ```
- Xem log riêng PostgreSQL:
  ```bash
  docker compose logs -f postgres
  ```
- Xem log riêng Frontend Main:
  ```bash
  docker compose logs -f frontend
  ```

---

## 🛠️ TỔNG HỢP CÁC LỆNH DOCKER & HỆ THỐNG THƯỜNG DÙNG (COMMON COMMANDS)

| Lệnh Thao Tác | Ý Nghĩa Chức Năng |
| :--- | :--- |
| `docker compose up -d` | Khởi chạy tất cả container dưới nền |
| `docker compose down` | Dừng và xóa tất cả container của dự án |
| `docker compose ps` | Xem trạng thái hoạt động của các container |
| `docker compose logs -f [service]` | Xem log chi tiết dịch vụ theo thời gian thực |
| `docker exec -it [container] bash` | Truy cập trực tiếp vào bên trong terminal container |
| `docker images` | Liệt kê tất cả Docker Images đã build trên hệ thống |
| `docker volume ls` | Liệt kê danh sách các Docker Volume (chứa dữ liệu DB) |
| `docker network ls` | Kiểm tra danh sách các mạng Docker nội bộ |
| `sudo systemctl status docker` | Kiểm tra trạng thái dịch vụ Docker Engine |
| `sudo systemctl status nginx` | Kiểm tra trạng thái dịch vụ Nginx Reverse Proxy |
| `sudo ufw status` | Kiểm tra trạng thái quy tắc tường lửa Firewall |

---

## ❓ HƯỚNG DẪN XỬ LÝ LỖI THƯỜNG GẶP CHI TIẾT (TROUBLESHOOTING GUIDE)

### 1. ❌ Lỗi: `Docker service does not exist` hoặc `docker: command not found`
- **Nguyên nhân**: Docker chưa được cài đặt đúng cách hoặc chưa bật service.
- **Cách khắc phục**:
  ```bash
  sudo systemctl enable --now docker
  ```

### 2. ❌ Lỗi: `Docker Compose not found` hoặc `docker-compose: command not found`
- **Nguyên nhân**: Bạn đang dùng lệnh `docker-compose` cũ thay vì `docker compose` V2.
- **Cách khắc phục**: Hãy đổi toàn bộ câu lệnh sang chuẩn V2: `docker compose up -d`.

### 3. ❌ Lỗi: `Permission denied` khi chạy lệnh Docker
- **Nguyên nhân**: User hiện tại chưa được gán vào group `docker`.
- **Cách khắc phục**:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

### 4. ❌ Lỗi: `Connection refused` khi kết nối PostgreSQL
- **Nguyên nhân**: Container PostgreSQL chưa sẵn sàng hoặc bị crash.
- **Cách khắc phục**: Kiểm tra log Postgres với `docker compose logs postgres` và chờ 10s để Postgres hoàn tất khởi tạo.

### 5. ❌ Lỗi: `role "admin" does not exist`
- **Nguyên nhân**: Tên user trong file `.env` không trùng khớp với dữ liệu Postgres cũ.
- **Cách khắc phục**: Kiểm tra lại biến `POSTGRES_USER=admin` trong `.env`.

### 6. ❌ Lỗi: `database "course" does not exist`
- **Nguyên nhân**: Database `course` chưa được khởi tạo.
- **Cách khắc phục**:
  ```bash
  docker exec -it postgres psql -U admin -c "CREATE DATABASE course;"
  ```

### 7. ❌ Lỗi khi Restore: `Relation "..." already exists` / `Duplicate Key` / `Multiple Primary Keys`
- **Nguyên nhân**: Database đã chứa dữ liệu và cấu trúc từ lần import trước.
- **Cách khắc phục**: Đây không phải là lỗi làm gián đoạn hệ thống. Bỏ qua và tiếp tục chạy ứng dụng.

### 8. ❌ Container ở trạng thái `Restarting` liên tục
- **Nguyên nhân**: Backend không kết nối được tới Database hoặc thiếu biến môi trường.
- **Cách khắc phục**: Chạy `docker compose logs backend` để đọc nguyên nhân cụ thể (thường do sai password DB hoặc thiếu key JWT).

### 9. ❌ Container ở trạng thái `Exited (1)` hoặc `Exited (137)`
- **Nguyên nhân**: Code bị crash hoặc VPS bị cháy RAM (Out Of Memory - OOM Kill).
- **Cách khắc phục**: Kiểm tra RAM bằng lệnh `free -h`. Nếu thiếu RAM, hãy tạo thêm **Swap Space** (bộ nhớ ảo) cho Ubuntu (xem mục 12).

### 10. ❌ Lỗi Docker Volume bị mất hoặc hỏng dữ liệu
- **Nguyên nhân**: Volume bị xóa thủ công khi dùng `docker compose down -v`.
- **Cách khắc phục**: Hạn chế dùng cờ `-v`. Nếu lỡ xóa, hãy thực hiện lại bước Restore Database từ file `course_backup.sql`.

### 11. ❌ Lỗi `Git Pull Conflict`
- **Nguyên nhân**: Đã có sự thay đổi file trực tiếp trên VPS.
- **Cách khắc phục**:
  ```bash
  git reset --hard HEAD
  git pull origin main
  ```

### 12. ❌ Lỗi VPS Hết RAM (Out Of Memory - OOM Kill) khi Build Frontend/Backend
- **Nguyên nhân**: VPS 1GB/2GB RAM bị quá tải khi build ứng dụng Node.js/Spring Boot.
- **Cách khắc phục (Tạo Swap Space 2GB cho Ubuntu)**:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```

### 13. ❌ Lỗi `Nginx 502 Bad Gateway`
- **Nguyên nhân**: Nginx không thể kết nối tới Container Frontend (cổng 5173/5174) hoặc Container chưa khởi chạy.
- **Cách khắc phục**: Chạy `docker compose ps` kiểm tra xem container `frontend` và `48ngay-frontend` có đang `Up` hay không.

### 14. ❌ Lỗi `Certbot Failed` / `SSL Failed` / `DNS chưa trỏ`
- **Nguyên nhân**: Tên miền chưa được trỏ IP về VPS hoặc Tường lửa UFW chặn cổng 80.
- **Cách khắc phục**: Kiểm tra lại `ping domain` và đảm bảo đã chạy `sudo ufw allow 80/tcp`.

### 15. ❌ Backend không thể kết nối PostgreSQL (`Connection to localhost:5432 refused`)
- **Nguyên nhân**: Trong file `.env` đặt `SPRING_DATASOURCE_URL` là `localhost` thay vì tên dịch vụ Docker `postgres`.
- **Cách khắc phục**: Đổi URL thành `jdbc:postgresql://postgres:5432/course` trong `.env`.

### 16. ❌ Frontend Build Failed (`vite: command not found` hoặc Out of Memory)
- **Nguyên nhân**: Thiếu node_modules hoặc RAM VPS bị đầy khi thực hiện step `npm run build` trong Dockerfile.
- **Cách khắc phục**: Kiểm tra Dockerfile của Frontend đã có `npm install` đầy đủ và VPS đã bật Swap.

---

## 📋 CHECKLIST KIỂM TRA DEPLOY THÀNH CÔNG (DEPLOYMENT CHECKLIST)

Hãy đánh dấu chọn đầy đủ các mục dưới đây để đảm bảo hệ thống đã sẵn sàng 100% Production:

- [ ] ☑ **Ubuntu Updated**: Đã chạy `apt update && apt upgrade -y` thành công.
- [ ] ☑ **Docker Installed**: Đã cài đặt Docker CE từ Official Repository.
- [ ] ☑ **Docker Running**: Dịch vụ Docker đang `active (running)`.
- [ ] ☑ **Git Installed**: Git đã được cài đặt và clone được source code.
- [ ] ☑ **Nginx Installed**: Nginx đã được cài đặt và đang hoạt động.
- [ ] ☑ **Firewall Configured**: Đã mở các cổng 22, 80, 443, 8081 trên UFW.
- [ ] ☑ **Source Cloned**: Mã nguồn đã nằm tại thư mục `/root/course`.
- [ ] ☑ **.env Configured**: File `.env` đã được copy và chỉnh sửa các tham số chuẩn.
- [ ] ☑ **PostgreSQL Running**: Container `postgres` ở trạng thái `Up (healthy)`.
- [ ] ☑ **Database Restored**: Kiểm tra `docker exec -it postgres psql -U admin -d course -c "\dt"` ra đầy đủ danh sách bảng.
- [ ] ☑ **Backend Running**: Log backend có dòng `Started BackendApplication`.
- [ ] ☑ **Frontend Running**: Đã mở được giao diện qua IP cổng `5173` và `5174`.
- [ ] ☑ **Domain Working**: Kiểm tra `ping domain` trả về đúng IP VPS.
- [ ] ☑ **SSL Installed**: Certbot báo `Congratulations!` và truy cập được `https://`.
- [ ] ☑ **API Working**: Các tính năng Đăng nhập, Đăng ký, Lấy danh sách khóa học trên giao diện Web hoạt động trơn tru.

---
🎉 **CHÚC MỪNG BẠN ĐÃ HOÀN THÀNH QUÁ TRÌNH DEPLOY DỰ ÁN DOCKER PRODUCTION CHUYÊN NGHIỆP!**
