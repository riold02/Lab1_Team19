// Global variables
let requestCount = 0;
let pageViews = parseInt(localStorage.getItem('pageViews') || '0') + 1;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Static Web Server Client initialized');
    
    // Update page views
    localStorage.setItem('pageViews', pageViews.toString());
    updatePageViews();
    
    // Load initial data
    loadServerTime();
    loadServerInfo();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-refresh timestamp every 30 seconds
    setInterval(loadServerTime, 30000);
    
    // Check server status every 60 seconds
    setInterval(checkServerStatus, 60000);
});

// Event listeners setup
function setupEventListeners() {
    // Refresh time button
    document.getElementById('refresh-time').addEventListener('click', loadServerTime);
    
    // Get server info button
    document.getElementById('get-server-info').addEventListener('click', loadServerInfo);
    
    // Test API button
    document.getElementById('test-api').addEventListener('click', testAPI);
    
    // Test error button
    document.getElementById('test-error').addEventListener('click', testError);
    
    // Add new event listeners for new buttons
    const testPostBtn = document.getElementById('test-post');
    if (testPostBtn) {
        testPostBtn.addEventListener('click', testPOSTAPI);
    }
    
    const testStatusBtn = document.getElementById('test-status');
    if (testStatusBtn) {
        testStatusBtn.addEventListener('click', testStatusCodes);
    }
    
    const testHeadersBtn = document.getElementById('test-headers');
    if (testHeadersBtn) {
        testHeadersBtn.addEventListener('click', testHeaders);
    }
}

// AJAX utility function
async function makeAPIRequest(url, options = {}) {
    showLoading();
    requestCount++;
    updateRequestCount();
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Request': 'true',
                'X-Request-ID': generateRequestId(),
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        // Log custom headers
        logResponseHeaders(response);
        
        hideLoading();
        return { response, data };
    } catch (error) {
        console.error('API Request failed:', error);
        hideLoading();
        throw error;
    }
}

// Load server timestamp
async function loadServerTime() {
    try {
        const { data } = await makeAPIRequest('/api/timestamp');
        
        const timeElement = document.getElementById('server-time');
        const timestamp = new Date(data.timestamp);
        
        timeElement.innerHTML = `
            <strong>📅 ${timestamp.toLocaleDateString('vi-VN')}</strong><br>
            <strong>🕐 ${timestamp.toLocaleTimeString('vi-VN')}</strong><br>
            <small>Timezone: ${data.timezone}</small><br>
            <small>Unix: ${data.unixTimestamp}</small>
        `;
        
        console.log('✅ Server time updated:', data.timestamp);
    } catch (error) {
        console.error('❌ Error loading server time:', error);
        document.getElementById('server-time').innerHTML = 
            '<span style="color: red;">❌ Lỗi khi tải thời gian</span>';
    }
}

// Load server information
async function loadServerInfo() {
    try {
        const { data } = await makeAPIRequest('/api/server-info');
        
        const systemInfoElement = document.getElementById('system-info');
        const serverData = data.data;
        
        systemInfoElement.innerHTML = `
            <div><strong>Platform:</strong> ${serverData.platform}</div>
            <div><strong>Architecture:</strong> ${serverData.arch}</div>
            <div><strong>Hostname:</strong> ${serverData.hostname}</div>
            <div><strong>Node.js:</strong> ${serverData.nodeVersion}</div>
            <div><strong>CPUs:</strong> ${serverData.cpus} cores</div>
            <div><strong>Total Memory:</strong> ${formatBytes(serverData.totalMemory)}</div>
            <div><strong>Free Memory:</strong> ${formatBytes(serverData.freeMemory)}</div>
            <div><strong>Uptime:</strong> ${formatUptime(serverData.uptime)}</div>
            <div><strong>Environment:</strong> ${serverData.environment}</div>
        `;
        
        // Update uptime in stats
        document.getElementById('uptime').textContent = formatUptime(serverData.uptime);
        
        console.log('✅ Server info loaded:', serverData);
    } catch (error) {
        console.error('❌ Error loading server info:', error);
        document.getElementById('system-info').innerHTML = 
            '<div style="color: red;">❌ Lỗi khi tải thông tin server</div>';
    }
}

// Test API endpoint
async function testAPI() {
    try {
        const { response, data } = await makeAPIRequest('/api/server-info');
        
        showAPIResponse('API Test Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: getResponseHeaders(response),
            body: data
        });
        
        console.log('✅ API test successful:', data);
    } catch (error) {
        console.error('❌ API test failed:', error);
        showAPIResponse('API Test Error:', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// Test 404 error
async function testError() {
    try {
        const { response, data } = await makeAPIRequest('/api/nonexistent-endpoint');
        
        showAPIResponse('404 Error Test:', {
            status: response.status,
            statusText: response.statusText,
            body: data
        });
    } catch (error) {
        console.error('❌ Error test failed:', error);
        showAPIResponse('Error Test Failed:', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// Show API response in the response container
function showAPIResponse(title, data) {
    const responseContainer = document.getElementById('api-response');
    responseContainer.innerHTML = `
        <h4>${title}</h4>
        <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
    responseContainer.classList.add('show');
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        responseContainer.classList.remove('show');
    }, 10000);
}

// Check server status
async function checkServerStatus() {
    try {
        const response = await fetch('/api/timestamp');
        const statusElement = document.getElementById('server-status');
        
        if (response.ok) {
            statusElement.innerHTML = '🟢 Online';
            statusElement.className = 'status-online';
        } else {
            statusElement.innerHTML = '🟡 Issues';
            statusElement.className = 'status-warning';
        }
    } catch (error) {
        const statusElement = document.getElementById('server-status');
        statusElement.innerHTML = '🔴 Offline';
        statusElement.className = 'status-offline';
        console.warn('Server status check failed:', error);
    }
}

// Utility functions
function updateRequestCount() {
    document.getElementById('requests-count').textContent = requestCount;
}

function updatePageViews() {
    document.getElementById('page-views').textContent = pageViews;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function generateRequestId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getResponseHeaders(response) {
    const headers = {};
    for (let [key, value] of response.headers.entries()) {
        headers[key] = value;
    }
    return headers;
}

function logResponseHeaders(response) {
    const customHeaders = [];
    for (let [key, value] of response.headers.entries()) {
        if (key.startsWith('x-')) {
            customHeaders.push(`${key}: ${value}`);
        }
    }
    
    if (customHeaders.length > 0) {
        console.log('📋 Custom Headers received:', customHeaders);
    }
}

function showLoading() {
    document.getElementById('loading').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
}

// Error handling for uncaught errors
window.addEventListener('error', function(event) {
    console.error('❌ Uncaught error:', event.error);
    
    showAPIResponse('JavaScript Error:', {
        message: event.error.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString()
    });
});

// Test POST API endpoint
async function testPOSTAPI() {
    try {
        const postData = {
            name: 'Test User from Web Client',
            message: 'Hello from the web interface!',
            data: {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                pageViews: pageViews
            }
        };
        
        const { response, data } = await makeAPIRequest('/api/test-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        showAPIResponse('POST API Test Response:', {
            status: response.status,
            statusText: response.statusText,
            body: data
        });
        
        console.log('✅ POST API test successful:', data);
    } catch (error) {
        console.error('❌ POST API test failed:', error);
        showAPIResponse('POST API Test Error:', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// Test different status codes
async function testStatusCodes() {
    try {
        const statusCodes = [200, 201, 400, 404, 500];
        const results = [];
        
        for (const code of statusCodes) {
            try {
                const { response, data } = await makeAPIRequest(`/api/status/${code}`);
                results.push({
                    code: code,
                    status: response.status,
                    message: data.message
                });
            } catch (error) {
                results.push({
                    code: code,
                    status: error.response?.status || 'error',
                    message: error.message
                });
            }
        }
        
        showAPIResponse('Status Code Tests:', results);
        console.log('✅ Status code tests completed:', results);
    } catch (error) {
        console.error('❌ Status code test failed:', error);
        showAPIResponse('Status Code Test Error:', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// Test headers endpoint
async function testHeaders() {
    try {
        const { response, data } = await makeAPIRequest('/api/headers', {
            headers: {
                'X-Custom-Header': 'Web-Client-Test',
                'X-Test-ID': generateRequestId(),
                'User-Agent': 'Custom-Web-Client/1.0'
            }
        });
        
        showAPIResponse('Headers Test Response:', {
            status: response.status,
            receivedHeaders: data.headers,
            customHeaders: {
                'X-Custom-Header': data.headers['x-custom-header'],
                'X-Test-ID': data.headers['x-test-id']
            }
        });
        
        console.log('✅ Headers test successful:', data);
    } catch (error) {
        console.error('❌ Headers test failed:', error);
        showAPIResponse('Headers Test Error:', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled promise rejection:', event.reason);
    
    showAPIResponse('Promise Rejection:', {
        reason: event.reason.toString(),
        timestamp: new Date().toISOString()
    });
});

// Export functions for debugging
window.debugAPI = {
    loadServerTime,
    loadServerInfo,
    testAPI,
    testError,
    checkServerStatus,
    makeAPIRequest
};

console.log('🎯 Debug functions available at window.debugAPI');
