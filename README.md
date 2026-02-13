# 💳 Discord VietQR Bot

Bot Discord tự động tạo mã QR thanh toán VietQR cho MB Bank.

## 🌟 Tính năng

- ✅ Tạo mã QR thanh toán tự động
- ✅ Hiển thị thông tin thanh toán đầy đủ
- ✅ Cấu hình linh hoạt thông tin ngân hàng
- ✅ Chỉ Admin mới được thay đổi cấu hình
- ✅ Giao diện đẹp mắt với Discord Embed

## 📋 Yêu cầu

- Node.js phiên bản 16.9.0 trở lên
- Tài khoản Discord Bot Token
- Kết nối internet

## 🚀 Cài đặt

### 1. Clone hoặc tải project

```bash
git clone <repository-url>
cd discord-vietqr-bot
```

### 2. Cài đặt các package cần thiết

```bash
npm install
```

### 3. Cấu hình Bot

#### Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

#### Chỉnh sửa file `.env`:

```env
# Discord Bot Token (lấy từ Discord Developer Portal)
DISCORD_TOKEN=your_discord_bot_token_here

# Thông tin ngân hàng mặc định
BANK_ID=970422
ACCOUNT_NO=0903618454
ACCOUNT_NAME=CAO NGUYEN GIA LAP
```

**Lưu ý:** 
- `BANK_ID` cho MB Bank là `970422`
- `ACCOUNT_NAME` nên viết HOA, không dấu

### 4. Khởi động Bot

```bash
npm start
```

Hoặc:

```bash
node index.js
```

Khi thấy thông báo `✅ Bot đã sẵn sàng!` là bot đã hoạt động thành công.

## 📖 Hướng dẫn sử dụng

### 1️⃣ Tạo mã QR thanh toán

**Cú pháp:**
```
/taoqr <tên khách hàng> <giá tiền>
```

**Ví dụ:**
```
/taoqr Nguyen Van A 500000
/taoqr Tran Thi B 1000000
/taoqr Khach Hang VIP 2500000
```

**Kết quả:** Bot sẽ tạo một embed đẹp mắt với:
- Thông tin khách hàng
- Số tiền (định dạng VND)
- Thông tin ngân hàng
- Mã QR có thể quét để thanh toán

### 2️⃣ Xem cấu hình hiện tại

**Cú pháp:**
```
/config
```

**Yêu cầu:** Cần có quyền Administrator

**Kết quả:** Hiển thị thông tin ngân hàng đang được cấu hình

### 3️⃣ Thay đổi thông tin ngân hàng

**Cú pháp:**
```
/config <bank_id> <số_tài_khoản> <tên_chủ_tài_khoản>
```

**Yêu cầu:** Cần có quyền Administrator

**Ví dụ:**
```
/config 970422 0793137155 TRAN PHAM MINH DUC
/config 970415 9876543210 NGUYEN VAN A
```

**Lưu ý:**
- Bank ID của MB Bank: `970422`
- Tên chủ tài khoản nên viết HOA, không dấu
- Cấu hình sẽ được lưu vào file `config.json`

### 4️⃣ Xem hướng dẫn

**Cú pháp:**
```
/help
```

**Kết quả:** Hiển thị tất cả lệnh và cách sử dụng

## 🏦 Danh sách mã ngân hàng (Bank ID)

| Ngân hàng | Mã Bank ID |
|-----------|-----------|
| MB Bank | 970422 |
| Vietcombank | 970436 |
| Techcombank | 970407 |
| VietinBank | 970415 |
| BIDV | 970418 |
| ACB | 970416 |
| VPBank | 970432 |
| Sacombank | 970403 |
| Agribank | 970405 |
| TPBank | 970423 |

## ⚙️ Cấu trúc project

```
discord-vietqr-bot/
│
├── index.js              # File chính của bot
├── package.json          # Thông tin project và dependencies
├── config.json           # File lưu cấu hình (tự động tạo)
├── .env                  # File cấu hình môi trường (cần tạo)
├── .env.example          # Mẫu file cấu hình
├── .gitignore           # File gitignore
└── README.md            # File hướng dẫn này
```

## 🔒 Bảo mật

- ⚠️ **KHÔNG** chia sẻ file `.env` với người khác
- ⚠️ **KHÔNG** commit file `.env` lên Git/GitHub
- ⚠️ Chỉ Admin mới có thể thay đổi cấu hình ngân hàng
- ⚠️ Bảo vệ Discord Bot Token của bạn

## ❓ Câu hỏi thường gặp

### Bot không hoạt động?
- Kiểm tra Discord Token đã đúng chưa
- Kiểm tra bot đã được invite vào server chưa
- Kiểm tra bot có quyền đọc và gửi tin nhắn không

### Mã QR không hiển thị?
- Kiểm tra kết nối internet
- Kiểm tra thông tin ngân hàng đã đúng chưa (Bank ID, số tài khoản)

### Không thể thay đổi config?
- Chỉ thành viên có quyền Administrator mới có thể sử dụng `/config`

## 📝 Ghi chú

- Bot sử dụng API VietQR miễn phí: `https://img.vietqr.io`
- Nội dung chuyển khoản tự động: `Thanh toan <tên khách hàng>`
- Số tiền được format theo chuẩn Việt Nam (VND)

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📄 License

MIT License

---

**Chúc bạn sử dụng bot thành công! 🎉**
