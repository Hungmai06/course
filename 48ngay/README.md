# DolphinLearn & 48ngay - Tài liệu Tích hợp Backend & API (Chi tiết nhất)

Tài liệu này mô tả chi tiết kiến trúc, luồng hoạt động, cấu trúc dữ liệu (Schema) và danh sách API cần thiết của dự án **DolphinLearn** (hệ thống học từ vựng/tài liệu công khai) và **48ngay** (khóa học lấy gốc tiếng Anh nội bộ) để đội ngũ Backend tiện thiết kế cơ sở dữ liệu và xây dựng Admin Dashboard quản lý dữ liệu.

---

## 1. Tổng quan Kiến trúc & Cơ chế Xác thực

Hệ thống được thiết kế tách biệt làm 2 phân hệ chạy song song trên cùng một ứng dụng:

### Phân hệ 1: DolphinLearn (Học cộng đồng)
*   **Mục đích**: Học từ vựng theo chủ đề, làm flashcard/trắc nghiệm/gõ chính tả, xem bảng xếp hạng công khai, tải tài liệu.
*   **Tài khoản**: Đăng ký và Đăng nhập tự do bằng Email.
*   **Thông tin tài khoản cần lưu**: Họ tên, Email, Mật khẩu (mã hóa), Ảnh đại diện (Avatar), Điểm số tích lũy (Points - XP), Chuỗi ngày học liên tiếp (Streak).

### Phân hệ 2: 48ngay (Khóa học lấy gốc tiếng Anh nội bộ)
*   **Mục đích**: Học viên đăng nhập để xem video bài giảng của khóa học, làm bài tập đính kèm Google Drive.
*   **Tài khoản**: Học viên được cấp tài khoản thủ công từ Admin.
*   **Thông tin đăng nhập**: Chỉ cần **Số điện thoại (hoặc Tên đăng nhập)**, **KHÔNG cần mật khẩu** (để tối giản trải nghiệm cho học viên lớn tuổi/trẻ em).

---

## 2. Mô hình Dữ liệu & Các trường Schema (Cho Database & Admin Dashboard)

Dưới đây là thiết kế chi tiết các bảng cơ sở dữ liệu. Admin Dashboard sẽ cần các form CRUD (Thêm, Sửa, Xóa) cho các bảng này.

### Bảng 1: Users (Người dùng học DolphinLearn)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | BigInt / UUID | Primary Key, Auto Increment | Khóa chính |
| `name` | String (255) | Not Null | Họ và tên người dùng |
| `email` | String (255) | Unique, Not Null | Email đăng nhập |
| `password` | String (255) | Not Null | Mật khẩu (đã mã hóa bcrypt/argon2) |
| `avatar_url` | Text | Nullable | Link ảnh đại diện (hoặc chuỗi Base64) |
| `points` | Integer | Default: 0 | Tổng điểm tích lũy (XP) |
| `streak` | Integer | Default: 0 | Số ngày học liên tục hiện tại |
| `last_active` | Timestamp | Nullable | Ngày cuối cùng hoạt động để tính Streak |
| `role` | String (50) | Default: 'USER' | Quyền hạn: `USER`, `ADMIN` |

### Bảng 2: CourseStudents (Học viên khóa học 48ngay)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | BigInt / UUID | Primary Key, Auto Increment | Khóa chính |
| `username` | String (255) | Unique, Not Null | SĐT hoặc tên đăng nhập được cấp |
| `name` | String (255) | Not Null | Tên học viên hiển thị |
| `class_name` | String (100) | Nullable | Lớp học (ví dụ: K48, K49) |
| `created_at` | Timestamp | Not Null | Thời điểm tạo tài khoản |

### Bảng 3: VocabularyCollections (Danh mục chính Từ vựng)
*Dành cho giao diện chọn bộ từ chính (Ví dụ: IELTS, Giao tiếp, Cơ bản).*
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto Increment | Khóa chính |
| `title` | String (255) | Not Null | Tiêu đề danh mục (ví dụ: "IELTS Từ Vựng") |
| `description` | Text | Nullable | Mô tả ngắn |
| `icon` | String (100) | Default: 'school' | Tên icon Material Symbols (ví dụ: 'translate') |
| `color` | String (50) | Default: 'primary' | Màu chủ đề UI (`primary`, `accent`, `success`) |

### Bảng 4: VocabularySubCollections (Chủ đề con)
*Các chủ đề nằm trong Danh mục chính (Ví dụ: IELTS -> "Environment", "Education").*
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto Increment | Khóa chính |
| `collection_id` | Integer | Foreign Key -> `VocabularyCollections.id` | Thuộc danh mục chính nào |
| `title` | String (255) | Not Null | Tên chủ đề (ví dụ: "Environment") |
| `description` | Text | Nullable | Mô tả ngắn về chủ đề |

### Bảng 5: VocabularyWords (Từ vựng chi tiết)
*Danh sách từ vựng chi tiết trong mỗi chủ đề.*
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto Increment | Khóa chính |
| `sub_collection_id`| Integer | Foreign Key -> `VocabularySubCollections.id` | Thuộc chủ đề con nào |
| `word` | String (255) | Not Null | Từ tiếng Anh (ví dụ: "Biodiversity") |
| `pronunciation` | String (255) | Not Null | Phiên âm IPA (ví dụ: "/ˌbaɪoʊdaɪˈvɜːrsəti/") |
| `meaning` | String (255) | Not Null | Nghĩa tiếng Việt (ví dụ: "Đa dạng sinh học") |

### Bảng 6: UserVocabularyProgress (Tiến độ học từ vựng cá nhân)
*Lưu vết để hiển thị thanh % tiến độ của người dùng trên mỗi chủ đề.*
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto Increment | Khóa chính |
| `user_id` | BigInt | Foreign Key -> `Users.id` | Học viên tương ứng |
| `sub_collection_id`| Integer | Foreign Key -> `VocabularySubCollections.id` | Chủ đề tương ứng |
| `learned_word_ids`| Text / JSON | Not Null | Danh sách ID từ vựng đã học xong (dưới dạng mảng JSON `[101, 102]`) |
| `updated_at` | Timestamp | Not Null | Thời điểm cập nhật tiến độ |

### Bảng 7: DocumentCategories (Danh mục tài liệu)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto Increment | Khóa chính |
| `name` | String (255) | Not Null | Tên danh mục (ví dụ: "Tài liệu IELTS") |
| `icon` | String (100) | Default: 'folder' | Tên icon Material Symbols |

### Bảng 8: Documents (Tài liệu tải về)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto Increment | Khóa chính |
| `category_id` | Integer | Foreign Key -> `DocumentCategories.id` | Thuộc danh mục tài liệu nào |
| `title` | String (255) | Not Null | Tiêu đề tài liệu |
| `description` | Text | Nullable | Mô tả tài liệu |
| `views` | Integer | Default: 0 | Lượt xem |
| `download_url` | Text | Not Null | Link file tải về (Google Drive/S3) |

---

## 3. Danh sách Endpoints API chi tiết (RESTful)

### 3.1. Phân hệ Xác thực (Authentication)
*   **Đăng ký DolphinLearn**: `POST /api/auth/register`
    *   *Body*: `{ name, email, password }`
    *   *Response*: Thông tin User + JWT Token.
*   **Đăng nhập DolphinLearn**: `POST /api/auth/login`
    *   *Body*: `{ email, password }`
    *   *Response*: Thông tin User + JWT Token.
*   **Đăng nhập Khóa học 48ngay**: `POST /api/auth/course-login`
    *   *Body*: `{ username }` (Số điện thoại học viên)
    *   *Response*: Thông tin học viên 48ngay + Khóa học được chỉ định + Access Token.

### 3.2. Quản lý Từ vựng (Vocabulary)
*   **Lấy danh mục chính**: `GET /api/vocabulary/collections`
    *   *Response*: Danh sách Collection kèm tính toán % tiến độ trung bình của User hiện tại.
*   **Lấy chủ đề con theo Collection ID**: `GET /api/vocabulary/collections/{id}/subs`
    *   *Response*: Danh sách các chủ đề con và tiến độ % của riêng từng chủ đề.
*   **Lấy danh sách từ vựng theo chủ đề con**: `GET /api/vocabulary/subs/{subId}/words`
    *   *Response*: Danh sách các từ gồm `id`, `word`, `pronunciation`, `meaning`.
*   **Cập nhật từ đã học (Tiến độ)**: `POST /api/vocabulary/progress`
    *   *Headers*: Bearer Token
    *   *Body*: `{ subCollectionId, wordId }`
    *   *Mục đích*: Thêm từ đó vào danh sách đã học để tính điểm và tính % tiến độ.

### 3.3. Bảng xếp hạng (Leaderboard)
*   **Lấy danh sách xếp hạng công khai**: `GET /api/leaderboard`
    *   *Response*: Danh sách User xếp hạng theo **Streak (ngày 🔥)** và **Điểm tích lũy (Points - XP 🏆)** từ cao xuống thấp (Top 50).
    *   *Dữ liệu trả về*: `{ rank, name, avatar_url, points, streak }`.

### 3.4. Tài liệu (Documents)
*   **Lấy danh mục tài liệu**: `GET /api/documents/categories`
*   **Lấy danh sách tài liệu (lọc theo danh mục/tìm kiếm)**: `GET /api/documents`
    *   *Params*: `categoryId` (optional), `search` (optional)
*   **Tăng lượt xem tài liệu**: `POST /api/documents/{id}/view`

---

## 4. Đặc tả tính năng của Admin Dashboard

Hệ thống quản lý Admin sẽ cần giao diện quản trị cho các nghiệp vụ sau:

1.  **Quản lý người dùng DolphinLearn**:
    *   Xem danh sách, tìm kiếm theo tên/email, chỉnh sửa/reset điểm (XP), sửa số ngày Streak học viên.
2.  **Quản lý Học viên 48ngay**:
    *   Thêm học viên mới bằng số điện thoại (chỉ cần điền SĐT và Họ tên học viên).
    *   Xóa hoặc khóa tài khoản học viên không còn tham gia khóa học.
3.  **Quản lý Ngân hàng từ vựng (Quan trọng nhất)**:
    *   **Thêm Danh mục chính** (ví dụ: IELTS 350 từ).
    *   **Thêm Chủ đề con** trực thuộc Danh mục chính (ví dụ: Kinh tế, Y học).
    *   **Thêm Từ vựng** vào từng chủ đề con: Cho phép nhập các trường `Từ tiếng Anh`, `Phiên âm IPA`, và `Nghĩa tiếng Việt`.
5.  **Quản lý Tài liệu học**:
    *   Đăng tải tài liệu, phân danh mục tài liệu, cập nhật link tải Google Drive.
