# Lab01 - Full-Stack Client-Server Application with Real-time Chat

## 🚀 Tổng quan dự án

Dự án Lab01 xây dựng một ứng dụng Client-Server hoàn chỉnh với **real-time communication** bao gồm:

### **Phần A: Static Web Server (35 điểm)** ✅
- HTTP server sử dụng Express.js
- Phục vụ static files (HTML, CSS, JavaScript)
- API endpoints trả về thông tin server
- Xử lý lỗi 404 và 500
- Custom HTTP headers

### **Phần B: HTTP Client (35 điểm)** ✅
- HTTP Client tự xây dựng từ đầu (không dùng axios/fetch)
- Hỗ trợ GET, POST, PUT, DELETE methods
- Xử lý HTTP và HTTPS requests
- Error handling toàn diện
- Request logging và statistics

### **Phần C: Socket.IO Real-time Chat (Bonus)** ✅ 
- **Real-time chat application** với Socket.IO
- **Multi-user support** với user management
- **Typing indicators** và presence status
- **Message history** và persistent chat
- **Real-time notifications** khi user join/leave
- **Responsive chat UI** với modern design

### **Phần D: Monitoring Tool (Bonus)** ✅
- Application monitoring với health checks
- Performance tracking
- System information reporting

## 🗂️ Cấu trúc dự án

```
Lab1_Team19/
├── README.md                 # Hướng dẫn sử dụng (updated)
├── package.json             # Dependencies (+ Socket.IO)
├── server.js                # Express + Socket.IO server
├── client.js                # HTTP Client class
├── monitor.js               # Application monitoring tool
├── public/                  # Static files
│   ├── index.html          # Web UI + Chat Interface
│   ├── style.css           # CSS + Chat Styling
│   └── script.js           # JavaScript + Socket.IO Client
├── screenshots/            # Screenshots demo
└── docs/                   # Documentation
    └── technical-report.md # Báo cáo kỹ thuật
```

## 🚀 Cài đặt và Chạy

### 1. **Cài đặt Dependencies**
```bash
npm install
```

### 2. **Khởi động Server**
```bash
npm start
# hoặc development mode với auto-restart:
npm run dev
```

### 3. **Truy cập ứng dụng**
- **Web Interface + Chat**: http://localhost:3000
- **API Endpoints**: http://localhost:3000/api/*
- **Socket.IO**: ws://localhost:3000 (auto-connect)

## 🔌 Socket.IO Real-time Features

### **Chat Interface**
- **Multi-user real-time chat** với instant messaging
- **User presence** - xem ai đang online
- **Typing indicators** - thấy khi người khác đang gõ
- **Message history** - lưu 100 tin nhắn gần nhất
- **Join/Leave notifications** - thông báo khi có người vào/ra
- **Responsive design** - hoạt động tốt trên mobile và desktop

### **Socket.IO Events**

#### **Client Events (gửi từ client):**
```javascript
socket.emit('user-join', { name: 'Username' });     // Tham gia chat
socket.emit('chat-message', { text: 'Hello!' });   // Gửi tin nhắn
socket.emit('typing-start');                        // Bắt đầu gõ
socket.emit('typing-stop');                         // Dừng gõ
socket.emit('get-server-status');                   // Lấy status server
socket.emit('ping', { clientTime: Date.now() });   // Ping server
```

#### **Server Events (phản hồi từ server):**
```javascript
socket.on('user-count', count => {});               // Số user online
socket.on('user-list', users => {});               // Danh sách users
socket.on('message-history', messages => {});      // Lịch sử chat
socket.on('new-message', message => {});           // Tin nhắn mới
socket.on('user-joined', data => {});              // User vào chat
socket.on('user-left', data => {});                // User rời chat
socket.on('user-typing', data => {});              // Typing indicator
socket.on('server-status', status => {});          // Thông tin server
socket.on('pong', data => {});                     // Pong response
```

## 📡 API Endpoints

### **1. Server Information**
```http
GET /api/server-info
```

### **2. Socket Information** ✨ **NEW!**
```http
GET /api/socket-info
```
Trả về thông tin real-time:
```json
{
  "success": true,
  "message": "Socket.IO information",
  "data": {
    "connectedUsers": 3,
    "totalMessages": 25,
    "users": [
      {"id": "socket_123", "name": "User1", "joinTime": "2025-01-15T10:30:00Z"},
      {"id": "socket_456", "name": "User2", "joinTime": "2025-01-15T10:31:00Z"}
    ],
    "recentMessages": [...]
  }
}
```

### **3. Timestamp**
```http
GET /api/timestamp
```

### **4. POST Test Endpoint**
```http
POST /api/test-post
```

### **5. Status Code Testing**
```http
GET /api/status/200
GET /api/status/404
GET /api/status/500
```

### **6. Headers Echo**
```http
GET /api/headers
```

### **7. Response Delay Simulation**
```http
GET /api/delay/3
```

## ⚡ Tính năng đã implement

### **Server Features (server.js):**
- ✅ Express.js HTTP server trên port 3000
- ✅ **Socket.IO server** với real-time communication
- ✅ **User management** với connected users tracking
- ✅ **Message history** storage (100 messages)
- ✅ **Chat room functionality** với broadcast messaging
- ✅ **Typing indicators** và presence notifications
- ✅ Static file serving từ thư mục `public/`
- ✅ 7 RESTful API endpoints (+ socket-info endpoint)
- ✅ Comprehensive error handling (404, 500)
- ✅ Custom HTTP headers cho mọi response

### **Socket.IO Client Features (public/script.js):**
- ✅ **Real-time chat interface** với Socket.IO client
- ✅ **User authentication** và join/leave functionality
- ✅ **Message sending/receiving** với real-time updates
- ✅ **Typing indicators** với auto-stop timeout
- ✅ **User list management** với online status
- ✅ **Connection status** monitoring
- ✅ **Message history** display khi join
- ✅ **XSS protection** với HTML escaping
- ✅ **Responsive chat UI** cho mobile/desktop

### **HTTP Client Features (client.js):**
- ✅ HTTP Client xây dựng từ đầu bằng Node.js native modules
- ✅ Support HTTP/HTTPS protocols
- ✅ GET, POST, PUT, DELETE methods
- ✅ Automatic JSON parsing
- ✅ Timeout handling (configurable)
- ✅ Detailed error handling và logging
- ✅ Request/response statistics và timing
- ✅ Built-in demo và test functions
- ✅ Ping utility cho server connectivity

### **Web Interface Features (public/):**
- ✅ **Real-time Chat Interface** với Socket.IO integration
- ✅ **Multi-user chat** với user list và typing indicators
- ✅ **Connection status** indicators (Connected/Disconnected)
- ✅ **Message history** và real-time message updates
- ✅ **Responsive chat design** cho tất cả devices
- ✅ Interactive API testing buttons (6 test functions)
- ✅ Real-time server information display
- ✅ AJAX
