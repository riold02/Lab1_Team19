const HTTPClient = require('./client');
const os = require('os');

/**
 * Monitor.js - Optional monitoring tool for the application
 * Monitors server health and performance
 */

class ApplicationMonitor {
    constructor() {
        this.client = new HTTPClient({
            timeout: 5000,
            enableLogging: false
        });
        this.serverUrl = 'http://localhost:3000';
        this.monitoringInterval = null;
        this.stats = {
            totalChecks: 0,
            successfulChecks: 0,
            failedChecks: 0,
            averageResponseTime: 0,
            lastCheckTime: null,
            serverStatus: 'unknown'
        };
    }

    /**
     * Start monitoring the server
     */
    startMonitoring(intervalMs = 30000) {
        console.log('🔍 Starting application monitoring...');
        console.log(`📊 Check interval: ${intervalMs / 1000} seconds`);
        console.log('-'.repeat(50));

        // Initial check
        this.checkServerHealth();

        // Set up periodic monitoring
        this.monitoringInterval = setInterval(() => {
            this.checkServerHealth();
        }, intervalMs);

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            this.stopMonitoring();
            process.exit(0);
        });
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('\n🛑 Monitoring stopped.');
            this.printFinalReport();
        }
    }

    /**
     * Check server health
     */
    async checkServerHealth() {
        const startTime = Date.now();
        this.stats.totalChecks++;
        this.stats.lastCheckTime = new Date().toISOString();

        try {
            // Test server endpoints
            const [timestampResponse, serverInfoResponse] = await Promise.all([
                this.client.get(`${this.serverUrl}/api/timestamp`),
                this.client.get(`${this.serverUrl}/api/server-info`)
            ]);

            const responseTime = Date.now() - startTime;
            this.stats.successfulChecks++;
            this.stats.serverStatus = 'healthy';
            this.updateAverageResponseTime(responseTime);

            this.logHealthCheck(true, responseTime, {
                timestamp: timestampResponse.status,
                serverInfo: serverInfoResponse.status
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.stats.failedChecks++;
            this.stats.serverStatus = 'unhealthy';

            this.logHealthCheck(false, responseTime, { error: error.message });
        }
    }

    /**
     * Update average response time
     */
    updateAverageResponseTime(newTime) {
        if (this.stats.successfulChecks === 1) {
            this.stats.averageResponseTime = newTime;
        } else {
            this.stats.averageResponseTime = 
                (this.stats.averageResponseTime * (this.stats.successfulChecks - 1) + newTime) / this.stats.successfulChecks;
        }
    }

    /**
     * Log health check result
     */
    logHealthCheck(success, responseTime, details) {
        const timestamp = new Date().toLocaleTimeString();
        const status = success ? '✅' : '❌';
        const statusText = success ? 'HEALTHY' : 'UNHEALTHY';
        
        console.log(`${status} [${timestamp}] Server ${statusText} (${responseTime}ms)`);
        
        if (success) {
            console.log(`   └─ Endpoints: timestamp(${details.timestamp}), server-info(${details.serverInfo})`);
        } else {
            console.log(`   └─ Error: ${details.error}`);
        }
        
        // Show stats every 5 checks
        if (this.stats.totalChecks % 5 === 0) {
            this.printStats();
        }
    }

    /**
     * Print current statistics
     */
    printStats() {
        const successRate = ((this.stats.successfulChecks / this.stats.totalChecks) * 100).toFixed(1);
        
        console.log('\n📊 Current Statistics:');
        console.log(`   Total Checks: ${this.stats.totalChecks}`);
        console.log(`   Success Rate: ${successRate}%`);
        console.log(`   Avg Response Time: ${Math.round(this.stats.averageResponseTime)}ms`);
        console.log(`   Server Status: ${this.stats.serverStatus.toUpperCase()}`);
        console.log('-'.repeat(50));
    }

    /**
     * Print final monitoring report
     */
    printFinalReport() {
        console.log('\n📋 Final Monitoring Report:');
        console.log('='.repeat(50));
        console.log(`📊 Total Health Checks: ${this.stats.totalChecks}`);
        console.log(`✅ Successful Checks: ${this.stats.successfulChecks}`);
        console.log(`❌ Failed Checks: ${this.stats.failedChecks}`);
        
        if (this.stats.totalChecks > 0) {
            const successRate = ((this.stats.successfulChecks / this.stats.totalChecks) * 100).toFixed(1);
            console.log(`📈 Success Rate: ${successRate}%`);
        }
        
        if (this.stats.successfulChecks > 0) {
            console.log(`⚡ Average Response Time: ${Math.round(this.stats.averageResponseTime)}ms`);
        }
        
        console.log(`🏥 Final Server Status: ${this.stats.serverStatus.toUpperCase()}`);
        console.log(`⏰ Last Check: ${this.stats.lastCheckTime || 'N/A'}`);
        console.log('='.repeat(50));
    }

    /**
     * Get system information
     */
    getSystemInfo() {
        return {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpus: os.cpus().length,
            uptime: os.uptime()
        };
    }

    /**
     * Print system information
     */
    printSystemInfo() {
        const sysInfo = this.getSystemInfo();
        console.log('\n💻 System Information:');
        console.log(`   Platform: ${sysInfo.platform} (${sysInfo.arch})`);
        console.log(`   Node.js: ${sysInfo.nodeVersion}`);
        console.log(`   CPUs: ${sysInfo.cpus} cores`);
        console.log(`   Memory: ${Math.round(sysInfo.freeMemory / 1024 / 1024 / 1024)}GB free / ${Math.round(sysInfo.totalMemory / 1024 / 1024 / 1024)}GB total`);
        console.log(`   System Uptime: ${Math.round(sysInfo.uptime / 3600)}h`);
    }
}

// Run monitor if this file is executed directly
if (require.main === module) {
    const monitor = new ApplicationMonitor();
    
    // Print system info first
    monitor.printSystemInfo();
    
    // Start monitoring with 15 second intervals
    monitor.startMonitoring(15000);
}

module.exports = ApplicationMonitor;
