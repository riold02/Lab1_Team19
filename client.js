const http = require('http');
const https = require('https');
const url = require('url');

/**
 * Custom HTTP Client class - Built from scratch without external libraries
 * Supports GET and POST methods for both HTTP and HTTPS
 */
class HTTPClient {
    constructor(options = {}) {
        this.defaultTimeout = options.timeout || 10000;
        this.defaultHeaders = {
            'User-Agent': 'Custom-HTTP-Client/1.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            ...options.headers
        };
        this.requestCount = 0;
        this.enableLogging = options.enableLogging !== false;
    }

    /**
     * Main request method that handles both HTTP and HTTPS
     */
    async request(requestUrl, options = {}) {
        return new Promise((resolve, reject) => {
            this.requestCount++;
            const requestId = `req_${this.requestCount}_${Date.now()}`;
            
            const startTime = Date.now();
            
            try {
                const parsedUrl = url.parse(requestUrl);
                const isHttps = parsedUrl.protocol === 'https:';
                const httpModule = isHttps ? https : http;
                
                const requestOptions = {
                    hostname: parsedUrl.hostname,
                    port: parsedUrl.port || (isHttps ? 443 : 80),
                    path: parsedUrl.path,
                    method: options.method || 'GET',
                    headers: {
                        ...this.defaultHeaders,
                        ...options.headers
                    },
                    timeout: options.timeout || this.defaultTimeout
                };

                // Add Content-Length for POST requests with data
                if (options.data) {
                    const dataString = typeof options.data === 'string' 
                        ? options.data 
                        : JSON.stringify(options.data);
                    
                    requestOptions.headers['Content-Length'] = Buffer.byteLength(dataString);
                    
                    if (!requestOptions.headers['Content-Type']) {
                        requestOptions.headers['Content-Type'] = 'application/json';
                    }
                }

                this._log(`🚀 [${requestId}] Starting ${requestOptions.method} request to ${requestUrl}`);
                this._logDetails('Request Options:', requestOptions);

                const req = httpModule.request(requestOptions, (res) => {
                    const responseTime = Date.now() - startTime;
                    
                    this._log(`📡 [${requestId}] Response received - Status: ${res.statusCode} ${res.statusMessage} (${responseTime}ms)`);
                    this._logDetails('Response Headers:', res.headers);

                    let responseData = '';
                    
                    res.on('data', (chunk) => {
                        responseData += chunk;
                    });

                    res.on('end', () => {
                        try {
                            const endTime = Date.now();
                            const totalTime = endTime - startTime;
                            
                            // Try to parse JSON, fallback to raw text
                            let parsedData;
                            try {
                                parsedData = JSON.parse(responseData);
                            } catch (e) {
                                parsedData = responseData;
                            }

                            const response = {
                                status: res.statusCode,
                                statusText: res.statusMessage,
                                headers: res.headers,
                                data: parsedData,
                                url: requestUrl,
                                method: requestOptions.method,
                                requestId: requestId,
                                timing: {
                                    start: startTime,
                                    end: endTime,
                                    duration: totalTime
                                }
                            };

                            this._log(`✅ [${requestId}] Request completed successfully (${totalTime}ms)`);
                            this._logDetails('Response Data:', typeof parsedData === 'object' ? 
                                JSON.stringify(parsedData, null, 2) : parsedData.substring(0, 200) + '...');

                            // Check for HTTP error status codes
                            if (res.statusCode >= 400) {
                                const error = new Error(`HTTP Error ${res.statusCode}: ${res.statusMessage}`);
                                error.response = response;
                                error.isHTTPError = true;
                                this._log(`❌ [${requestId}] HTTP Error: ${error.message}`);
                                reject(error);
                            } else {
                                resolve(response);
                            }

                        } catch (parseError) {
                            this._log(`❌ [${requestId}] Error parsing response: ${parseError.message}`);
                            reject(new Error(`Response parsing failed: ${parseError.message}`));
                        }
                    });
                });

                req.on('error', (error) => {
                    const responseTime = Date.now() - startTime;
                    this._log(`❌ [${requestId}] Request error (${responseTime}ms): ${error.message}`);
                    
                    // Enhance error with more details
                    error.requestId = requestId;
                    error.url = requestUrl;
                    error.method = requestOptions.method;
                    error.timing = responseTime;
                    
                    reject(error);
                });

                req.on('timeout', () => {
                    const responseTime = Date.now() - startTime;
                    this._log(`⏰ [${requestId}] Request timeout (${responseTime}ms)`);
                    
                    req.destroy();
                    const timeoutError = new Error(`Request timeout after ${options.timeout || this.defaultTimeout}ms`);
                    timeoutError.isTimeout = true;
                    timeoutError.requestId = requestId;
                    timeoutError.url = requestUrl;
                    
                    reject(timeoutError);
                });

                // Write data for POST requests
                if (options.data) {
                    const dataToWrite = typeof options.data === 'string' 
                        ? options.data 
                        : JSON.stringify(options.data);
                    
                    this._logDetails('Request Body:', dataToWrite);
                    req.write(dataToWrite);
                }

                req.end();

            } catch (error) {
                this._log(`❌ [${requestId}] Setup error: ${error.message}`);
                reject(error);
            }
        });
    }

    /**
     * GET request method
     */
    async get(url, options = {}) {
        return this.request(url, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * POST request method
     */
    async post(url, data = null, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            data: data
        });
    }

    /**
     * PUT request method
     */
    async put(url, data = null, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            data: data
        });
    }

    /**
     * DELETE request method
     */
    async delete(url, options = {}) {
        return this.request(url, {
            ...options,
            method: 'DELETE'
        });
    }

    /**
     * Utility method to test server connectivity
     */
    async ping(url, timeout = 5000) {
        const startTime = Date.now();
        try {
            await this.get(url, { timeout });
            const responseTime = Date.now() - startTime;
            return {
                success: true,
                responseTime,
                message: `Server is reachable (${responseTime}ms)`
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                success: false,
                responseTime,
                error: error.message,
                message: `Server is not reachable (${responseTime}ms)`
            };
        }
    }

    /**
     * Get client statistics
     */
    getStats() {
        return {
            totalRequests: this.requestCount,
            defaultTimeout: this.defaultTimeout,
            defaultHeaders: this.defaultHeaders,
            loggingEnabled: this.enableLogging
        };
    }

    /**
     * Enable or disable logging
     */
    setLogging(enabled) {
        this.enableLogging = enabled;
        this._log(`Logging ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Private logging method
     */
    _log(message) {
        if (this.enableLogging) {
            console.log(`[HTTPClient] ${new Date().toISOString()} ${message}`);
        }
    }

    /**
     * Private method for detailed logging
     */
    _logDetails(title, data) {
        if (this.enableLogging) {
            console.log(`[HTTPClient] ${title}`);
            if (typeof data === 'object') {
                console.log(JSON.stringify(data, null, 2));
            } else {
                console.log(data);
            }
            console.log('---');
        }
    }
}

/**
 * Test and demonstration functions
 */
async function runClientDemo() {
    console.log('🚀 HTTP Client Demo Starting...\n');

    const client = new HTTPClient({
        timeout: 8000,
        enableLogging: true
    });

    try {
        // Test 1: Check if local server is running
        console.log('📍 Test 1: Local Server Check');
        console.log('-'.repeat(40));
        
        try {
            const localResponse = await client.get('http://localhost:3000/api/timestamp');
            console.log('✅ Local server is running!');
            console.log('Server timestamp:', localResponse.data.timestamp);
            console.log('');
        } catch (error) {
            console.log('❌ Local server not available:', error.message);
            console.log('💡 Please start server with: npm start');
            console.log('');
        }

        // Test 2: External API test
        console.log('🌐 Test 2: External API (httpbin.org)');
        console.log('-'.repeat(40));
        
        const response1 = await client.get('https://httpbin.org/get');
        console.log('✅ GET request successful');
        console.log('Status:', response1.status);
        console.log('User-Agent received:', response1.data.headers['User-Agent']);
        console.log('');

        // Test 3: POST request test
        console.log('📝 Test 3: POST Request');
        console.log('-'.repeat(40));
        
        const postData = {
            message: 'Hello from custom HTTP client!',
            timestamp: new Date().toISOString(),
            test: true
        };
        
        const response2 = await client.post('https://httpbin.org/post', postData);
        console.log('✅ POST request successful');
        console.log('Status:', response2.status);
        console.log('Data sent:', response2.data.json);
        console.log('');

        // Test 4: Error handling
        console.log('🚫 Test 4: Error Handling');
        console.log('-'.repeat(40));
        
        try {
            await client.get('https://httpbin.org/status/404');
        } catch (error) {
            console.log('✅ Error handling working correctly');
            console.log('Error type:', error.isHTTPError ? 'HTTP Error' : 'Network Error');
            console.log('Status code:', error.response?.status);
        }
        console.log('');

        // Show client statistics
        console.log('📊 Client Statistics');
        console.log('-'.repeat(40));
        const stats = client.getStats();
        console.log('Total requests made:', stats.totalRequests);
        console.log('Default timeout:', stats.defaultTimeout + 'ms');
        console.log('');

        console.log('🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Demo failed:', error.message);
    }
}

/**
 * Quick test function for specific scenarios
 */
async function quickTest(type = 'all') {
    const client = new HTTPClient({ 
        enableLogging: true,
        timeout: 5000 
    });

    try {
        switch (type) {
            case 'local':
                console.log('Testing local server...');
                const response = await client.get('http://localhost:3000/api/server-info');
                console.log('✅ Local server OK:', response.data.success);
                break;

            case 'external':
                console.log('Testing external API...');
                const extResponse = await client.get('https://httpbin.org/json');
                console.log('✅ External API OK:', extResponse.status === 200);
                break;

            case 'post':
                console.log('Testing POST request...');
                const postResponse = await client.post('https://httpbin.org/post', { test: true });
                console.log('✅ POST request OK:', postResponse.status === 200);
                break;

            default:
                await runClientDemo();
        }
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

// Export for module usage
module.exports = HTTPClient;

// Run demo if file is executed directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const testType = args[0] || 'all';
    
    quickTest(testType).catch(error => {
        console.error('Test failed:', error.message);
        process.exit(1);
    });
}
