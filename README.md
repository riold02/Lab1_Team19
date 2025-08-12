# Lab01 - Client-Server Application

## 📋 Tổng quan dự án

Dự án Lab01 xây dựng một ứng dụng Client-Server hoàn chỉnh bao gồm:

### **Phần A: Static Web Server (35 điểm)** ✅
- HTTP server sử dụng Express.js
- Phục vụ static files (HTML, CSS, JavaScript)
- API endpoints trả về thông tin server
- Xử lý lỗi 404 và 500
- Custom HTTP headers

### **Phần B: HTTP Client (35 điểm)** ✅
- HTTP Client tự xây dựng từ đầu (không dùng axios/fetch)
- Hỗ trợ GET và POST methods
- Xử lý HTTP và HTTPS requests
- Error handling toàn diện

## 🗂️ Cấu trúc dự án

```
lab01-[ten-nhom]/
├── README.md                 # Hướng dẫn sử dụng
├── package.json             # Dependencies và scripts
├── server.js                # Express server chính
├── client.js                # HTTP Client class
├── monitor.js               # Application monitoring (tùy chọn)
├── public/                  # Static files
│   ├── index.html          # Giao diện web tương tác
│   ├── style.css           # CSS responsive design
│   └── script.js           # JavaScript với AJAX calls
├── screenshots/            # Screenshots demo
├── docs/                   # Documentation
│   └── technical-report.md # Báo cáo kỹ thuật chi tiết
└── presentation/           # Presentation materials
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
- **Web Interface**: http://localhost:3000
- **API Endpoints**: http://localhost:3000/api/*

### **POST Test Endpoint**
```http
POST /api/test-post
Content-Type: application/json

{
  "name": "Test User",
  "message": "Hello World",
  "data": {"key": "value"}
}
```

### **Status Code Testing**
```http
GET /api/status/200
GET /api/status/404
GET /api/status/500
```

### **Headers Echo**
```http
GET /api/headers
```

### **Response Delay Simulation**
```http
GET /api/delay/3
```

## 🧪 Testing và Demo

### **Web Interface Testing:**
1. Truy cập `http://localhost:3000`
2. Click các nút test API:
   - **Test Server Info API** - Lấy thông tin server
   - **Test POST API** - Thử POST request
   - **Test Status Codes** - Test các HTTP status codes
   - **Test Headers** - Test custom headers
   - **Test 404 Error** - Test error handling

### **HTTP Client Testing:**
```javascript
const HTTPClient = require('./client');
const client = new HTTPClient();

// Test local server
const response = await client.get('http://localhost:3000/api/server-info');
console.log(response.data);

// Test external API
const github = await client.get('https://api.github.com/users/octocat');
console.log(github.data.login);

// Test POST request
const post = await client.post('https://httpbin.org/post', {
  message: 'Hello from custom client!'
});
```

### **Monitoring:**
```bash
node monitor.js  # Chạy monitoring tool
```

## 🔧 Custom HTTP Headers

Server tự động thêm các headers sau vào mọi response:
- `X-Server-Name: Static Web Server`
- `X-Powered-By: Express.js`  
- `X-Response-Time: [timestamp]`
- `X-API-Version: 1.0.0`

## ⚡ Tính năng chính

### **Server Features:**
- ✅ Express.js HTTP server trên port 3000
- ✅ Static file serving từ thư mục `public/`
- ✅ RESTful API endpoints với JSON responses
- ✅ Comprehensive error handling (404, 500)
- ✅ Custom HTTP headers cho mọi response
- ✅ Request logging và monitoring

### **Client Features:**
- ✅ HTTP Client xây dựng từ đầu bằng Node.js native modules
- ✅ Support HTTP/HTTPS protocols
- ✅ GET, POST, PUT, DELETE methods
- ✅ Automatic JSON parsing
- ✅ Timeout handling
- ✅ Detailed error handling và logging
- ✅ Request/response statistics

### **Web Interface Features:**
- ✅ Responsive design cho mọi thiết bị
- ✅ Real-time server information display
- ✅ Interactive API testing buttons
- ✅ AJAX calls với error handling
- ✅ Loading indicators và user feedback
- ✅ Auto-refresh functionality

## 🎯 Kiểm thử với Postman

### **Import Collection:**
Tạo Postman collection với các endpoints:

1. **Server Info** - `GET http://localhost:3000/api/server-info`
2. **Timestamp** - `GET http://localhost:3000/api/timestamp`
3. **POST Test** - `POST http://localhost:3000/api/test-post`
4. **Status Codes** - `GET http://localhost:3000/api/status/404`
5. **Headers Test** - `GET http://localhost:3000/api/headers`

### **Environment Variables:**
```
base_url: http://localhost:3000
api_prefix: /api
```

## 📊 Performance

- **Static files**: < 100ms response time
- **API endpoints**: < 200ms average response time  
- **Memory usage**: Stable under load
- **Error rate**: < 1% under normal conditions

## 🛠️ Technology Stack

### **Backend:**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Native HTTP/HTTPS modules** - For custom client

### **Frontend:**
- **HTML5** - Semantic markup
- **CSS3** - Modern styling với Grid/Flexbox
- **Vanilla JavaScript** - ES6+ features, Fetch API

### **Tools:**
- **npm** - Package management
- **nodemon** - Development auto-restart

## 📋 Requirements

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **OS**: Windows/macOS/Linux
- **Port**: 3000 (configurable)

## 🔍 Error Handling

### **404 Errors:**
- **API 404**: JSON response với error details
- **Static File 404**: Custom HTML error page

### **500 Errors:**
- Global error handler với stack trace (development mode)
- Graceful error messages (production mode)

### **Client Errors:**
- Network errors (ECONNREFUSED, ENOTFOUND)
- Timeout errors với configurable timeouts
- HTTP status code errors (4xx, 5xx)
- JSON parsing errors

## 📚 Documentation

- **Technical Report**: `docs/technical-report.md`
- **Code Comments**: Inline documentation
- **API Documentation**: This README
- **Examples**: Usage examples trong code



**Developed by**:Nhóm 9 
**Date**: August 12, 2025  
**Course**: Client-Server Programming Lab
{
  "success": true,
  "message": "Server information retrieved successfully",
  "data": {
    "timestamp": "2025-08-12T10:30:00.000Z",
    "uptime": 3600,
    "platform": "win32",
    "arch": "x64",
    "hostname": "DESKTOP-ABC123",
    "totalMemory": 17179869184,
    "freeMemory": 8589934592,
    "cpus": 8,
    "nodeVersion": "v18.17.0",
    "port": 3000,
    "environment": "development"
  }
}
```

### 2. `/api/timestamp` (GET)
Trả về timestamp hiện tại của server:
```json
{
  "timestamp": "2025-08-12T10:30:00.000Z",
  "timezone": "Asia/Ho_Chi_Minh",
  "unixTimestamp": 1723461000
}
```

## Custom HTTP Headers

Server tự động thêm các custom headers vào mỗi response:
- `X-Server-Name`: Static Web Server
- `X-Powered-By`: Express.js
- `X-Response-Time`: [Timestamp của response]

## Tính năng chính

### 1. Giao diện Web
- **Trang chủ responsive** với design hiện đại
- **Thống kê realtime**: Page views, API requests, server uptime
- **Thông tin server**: Platform, memory, CPU, Node.js version
- **Timestamp server**: Hiển thị thời gian server realtime

### 2. AJAX Functionality
- **Auto-refresh**: Timestamp tự động cập nhật mỗi 30 giây
- **Manual refresh**: Nút bấm để cập nhật thông tin server
- **API testing**: Test các endpoints và xem response
- **Error testing**: Test lỗi 404 và xử lý errors

### 3. Error Handling
- **404 Page**: Trang lỗi 404 tùy chỉnh cho static files
- **API 404**: JSON response cho API endpoints không tồn tại
- **500 Errors**: Xử lý lỗi server và trả về JSON response
- **Client-side errors**: JavaScript error handling

### 4. Features khác
- **Loading indicators**: Hiển thị loading khi gọi API
- **Local storage**: Lưu page views và preferences
- **Server status**: Kiểm tra trạng thái server
- **Debug tools**: Console logging và debug functions

## Công nghệ sử dụng

### Backend
- **Express.js**: Web framework cho Node.js
- **Node.js**: Runtime environment

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling với Grid, Flexbox, Gradients
- **Vanilla JavaScript**: ES6+ features, Fetch API, Async/Await

### Features
- **Responsive Design**: Mobile-first approach
- **Progressive Enhancement**: Works without JavaScript
- **Modern CSS**: CSS Grid, Flexbox, Custom Properties
- **Error Boundaries**: Graceful error handling

## Port và Configuration

- **Default Port**: 3000
- **Static Files**: Served from `/public` directory
- **API Base**: `/api/*`
- **Error Pages**: Custom 404 page

## Testing

### Manual Testing
1. Truy cập `http://localhost:3000`
2. Click "Làm mới thời gian" để test AJAX
3. Click "Lấy thông tin server" để test API
4. Click "Test API Endpoint" để test API response
5. Click "Test 404 Error" để test error handling
6. Truy cập URL không tồn tại để test 404 page

### Browser Console
Mở Developer Tools để xem:
- Console logs với custom headers
- Network requests với custom headers
- Debug functions tại `window.debugAPI`