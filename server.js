const express = require('express');
const path = require('path');
const os = require('os');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON
app.use(express.json());

// Custom middleware to add custom headers
app.use((req, res, next) => {
    res.setHeader('X-Server-Name', 'Static Web Server');
    res.setHeader('X-Powered-By', 'Express.js');
    res.setHeader('X-Response-Time', new Date().toISOString());
    res.setHeader('X-API-Version', '1.0.0');
    next();
});

// API endpoint to get server information
app.get('/api/server-info', (req, res) => {
    try {
        const serverInfo = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpus: os.cpus().length,
            nodeVersion: process.version,
            port: PORT,
            environment: process.env.NODE_ENV || 'development'
        };
        
        res.json({
            success: true,
            message: 'Server information retrieved successfully',
            data: serverInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving server information',
            error: error.message
        });
    }
});

// API endpoint for timestamp
app.get('/api/timestamp', (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        unixTimestamp: Math.floor(Date.now() / 1000)
    });
});

// API endpoint to test POST requests
app.post('/api/test-post', (req, res) => {
    try {
        const { name, message, data } = req.body;
        
        res.json({
            success: true,
            message: 'POST request received successfully',
            received: {
                name: name || 'Unknown',
                message: message || 'No message',
                data: data || null,
                timestamp: new Date().toISOString(),
                clientIP: req.ip,
                userAgent: req.get('User-Agent')
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid POST data',
            error: error.message
        });
    }
});

// API endpoint to test different HTTP status codes
app.get('/api/status/:code', (req, res) => {
    const statusCode = parseInt(req.params.code);
    
    const statusMessages = {
        200: 'OK - Request successful',
        201: 'Created - Resource created successfully',
        400: 'Bad Request - Invalid request format',
        401: 'Unauthorized - Authentication required',
        403: 'Forbidden - Access denied',
        404: 'Not Found - Resource not found',
        500: 'Internal Server Error - Server error occurred'
    };
    
    const message = statusMessages[statusCode] || 'Unknown status code';
    
    res.status(statusCode).json({
        status: statusCode,
        message: message,
        timestamp: new Date().toISOString()
    });
});

// API endpoint to simulate delays
app.get('/api/delay/:seconds', (req, res) => {
    const delay = parseInt(req.params.seconds) || 1;
    const maxDelay = 10; // Maximum 10 seconds
    
    const actualDelay = Math.min(delay, maxDelay);
    
    setTimeout(() => {
        res.json({
            success: true,
            message: `Response delayed by ${actualDelay} seconds`,
            delay: actualDelay,
            timestamp: new Date().toISOString()
        });
    }, actualDelay * 1000);
});

// API endpoint to echo request headers
app.get('/api/headers', (req, res) => {
    res.json({
        success: true,
        message: 'Request headers information',
        headers: req.headers,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
});

// 404 Error handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});

// 404 Error handler for static files
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Không Tìm Thấy Trang</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .error-container {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                    max-width: 600px;
                    margin: 0 auto;
                }
                .error-code { 
                    font-size: 6rem; 
                    font-weight: bold; 
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .error-message { 
                    font-size: 1.5rem; 
                    margin-bottom: 30px; 
                }
                .back-home {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 8px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                }
                .back-home:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-code">404</div>
                <div class="error-message">Oops! Trang bạn tìm kiếm không tồn tại</div>
                <p>Trang mà bạn đang cố gắng truy cập có thể đã bị di chuyển, xóa hoặc không bao giờ tồn tại.</p>
                <a href="/" class="back-home">🏠 Quay về trang chủ</a>
            </div>
        </body>
        </html>
    `);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Socket.IO connection handling
const connectedUsers = new Map();
let messageHistory = [];

io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    
    // Send current user count and message history to new user
    socket.emit('user-count', connectedUsers.size + 1);
    socket.emit('message-history', messageHistory);
    
    // Handle user join
    socket.on('user-join', (userData) => {
        const user = {
            id: socket.id,
            name: userData.name || `User_${socket.id.substring(0, 6)}`,
            joinTime: new Date().toISOString(),
            ...userData
        };
        
        connectedUsers.set(socket.id, user);
        
        // Notify all users about new user
        socket.broadcast.emit('user-joined', {
            user: user,
            message: `${user.name} đã tham gia phòng chat`
        });
        
        // Send updated user list to all clients
        io.emit('user-list', Array.from(connectedUsers.values()));
        io.emit('user-count', connectedUsers.size);
        
        console.log(`👤 User joined: ${user.name} (${socket.id})`);
    });
    
    // Handle chat messages
    socket.on('chat-message', (messageData) => {
        const user = connectedUsers.get(socket.id);
        if (!user) return;
        
        const message = {
            id: Date.now() + Math.random(),
            user: user.name,
            userId: socket.id,
            text: messageData.text,
            timestamp: new Date().toISOString(),
            type: messageData.type || 'text'
        };
        
        // Store message in history (keep last 100 messages)
        messageHistory.push(message);
        if (messageHistory.length > 100) {
            messageHistory.shift();
        }
        
        // Broadcast message to all users
        io.emit('new-message', message);
        
        console.log(`💬 Message from ${user.name}: ${message.text}`);
    });
    
    // Handle typing indicators
    socket.on('typing-start', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            socket.broadcast.emit('user-typing', {
                userId: socket.id,
                userName: user.name,
                typing: true
            });
        }
    });
    
    socket.on('typing-stop', () => {
        socket.broadcast.emit('user-typing', {
            userId: socket.id,
            typing: false
        });
    });
    
    // Handle server status requests
    socket.on('get-server-status', () => {
        socket.emit('server-status', {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            connectedUsers: connectedUsers.size,
            totalMessages: messageHistory.length,
            memory: process.memoryUsage(),
            platform: os.platform(),
            nodeVersion: process.version
        });
    });
    
    // Handle custom events for real-time features
    socket.on('ping', (data) => {
        socket.emit('pong', {
            ...data,
            serverTime: Date.now(),
            latency: Date.now() - (data.clientTime || 0)
        });
    });
    
    // Handle disconnect
    socket.on('disconnect', (reason) => {
        const user = connectedUsers.get(socket.id);
        
        if (user) {
            connectedUsers.delete(socket.id);
            
            // Notify other users
            socket.broadcast.emit('user-left', {
                user: user,
                message: `${user.name} đã rời khỏi phòng chat`,
                reason: reason
            });
            
            // Send updated user list and count
            io.emit('user-list', Array.from(connectedUsers.values()));
            io.emit('user-count', connectedUsers.size);
            
            console.log(`👋 User disconnected: ${user.name} (${socket.id}) - Reason: ${reason}`);
        }
    });
});

// API endpoint to get socket information
app.get('/api/socket-info', (req, res) => {
    res.json({
        success: true,
        message: 'Socket.IO information',
        data: {
            connectedUsers: connectedUsers.size,
            totalMessages: messageHistory.length,
            users: Array.from(connectedUsers.values()).map(user => ({
                id: user.id,
                name: user.name,
                joinTime: user.joinTime
            })),
            recentMessages: messageHistory.slice(-10) // Last 10 messages
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server with Socket.IO running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
    console.log(`🔌 Socket.IO enabled for real-time communication`);
    console.log(`⏰ Server started at: ${new Date().toISOString()}`);
});

module.exports = app;
