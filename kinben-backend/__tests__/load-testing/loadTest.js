/**
 * Load Testing Script for KINBEN API
 * Measures performance, caching, and concurrent request handling
 *
 * Usage: node __tests__/load-testing/loadTest.js
 * Or: npm run load-test
 */

import http from 'http';
import https from 'https';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS) || 100;
const REQUESTS_PER_USER = parseInt(process.env.REQUESTS_PER_USER) || 10;
const RAMP_UP_TIME = parseInt(process.env.RAMP_UP_TIME) || 30000; // 30 seconds

// Test endpoints to load test
const ENDPOINTS = [
  { path: '/api/health', method: 'GET', name: 'Health Check' },
  { path: '/api/products', method: 'GET', name: 'Product List' },
  { path: '/api/products/categories', method: 'GET', name: 'Categories' },
  { path: '/api/blog', method: 'GET', name: 'Blog List' },
  { path: '/api/products/search?search=test', method: 'GET', name: 'Product Search' }
];

class LoadTestResult {
  constructor() {
    this.results = {};
    this.startTime = null;
    this.endTime = null;
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  addResult(endpoint, statusCode, responseTime, cacheStatus) {
    if (!this.results[endpoint]) {
      this.results[endpoint] = {
        name: endpoint,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        responseTimes: [],
        statusCodes: {},
        cacheHits: 0,
        cacheMisses: 0
      };
    }

    const result = this.results[endpoint];
    result.totalRequests++;
    result.responseTimes.push(responseTime);

    if (statusCode >= 200 && statusCode < 300) {
      result.successfulRequests++;
    } else {
      result.failedRequests++;
    }

    if (!result.statusCodes[statusCode]) {
      result.statusCodes[statusCode] = 0;
    }
    result.statusCodes[statusCode]++;

    if (cacheStatus === 'HIT') {
      result.cacheHits++;
      this.cacheHits++;
    } else if (cacheStatus === 'MISS') {
      result.cacheMisses++;
      this.cacheMisses++;
    }

    this.totalRequests++;
    if (statusCode >= 200 && statusCode < 300) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }
  }

  getStats(endpoint) {
    const result = this.results[endpoint];
    if (!result || result.responseTimes.length === 0) {
      return null;
    }

    const times = result.responseTimes.sort((a, b) => a - b);
    return {
      name: result.name,
      totalRequests: result.totalRequests,
      successfulRequests: result.successfulRequests,
      failedRequests: result.failedRequests,
      avgResponseTime: times.reduce((a, b) => a + b) / times.length,
      minResponseTime: times[0],
      maxResponseTime: times[times.length - 1],
      p50: times[Math.floor(times.length * 0.5)],
      p95: times[Math.floor(times.length * 0.95)],
      p99: times[Math.floor(times.length * 0.99)],
      cacheHitRate: (result.cacheHits / (result.cacheHits + result.cacheMisses) * 100).toFixed(2),
      statusCodes: result.statusCodes
    };
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('LOAD TEST RESULTS');
    console.log('='.repeat(80));

    console.log(`\nTest Configuration:`);
    console.log(`  Concurrent Users: ${CONCURRENT_USERS}`);
    console.log(`  Requests per User: ${REQUESTS_PER_USER}`);
    console.log(`  Total Requests: ${this.totalRequests}`);
    console.log(`  Duration: ${((this.endTime - this.startTime) / 1000).toFixed(2)}s`);

    console.log(`\nOverall Results:`);
    console.log(`  Successful Requests: ${this.successfulRequests} (${(this.successfulRequests / this.totalRequests * 100).toFixed(2)}%)`);
    console.log(`  Failed Requests: ${this.failedRequests} (${(this.failedRequests / this.totalRequests * 100).toFixed(2)}%)`);
    console.log(`  Cache Hit Rate: ${(this.cacheHits / (this.cacheHits + this.cacheMisses) * 100).toFixed(2)}%`);

    console.log(`\nEndpoint Performance:`);
    console.log('-'.repeat(80));

    for (const endpoint in this.results) {
      const stats = this.getStats(endpoint);
      if (stats) {
        console.log(`\n${stats.name}`);
        console.log(`  Total: ${stats.totalRequests} | Success: ${stats.successfulRequests} | Failed: ${stats.failedRequests}`);
        console.log(`  Response Time (ms):`);
        console.log(`    Average: ${stats.avgResponseTime.toFixed(2)}`);
        console.log(`    Min: ${stats.minResponseTime.toFixed(2)}`);
        console.log(`    Max: ${stats.maxResponseTime.toFixed(2)}`);
        console.log(`    P50: ${stats.p50.toFixed(2)}`);
        console.log(`    P95: ${stats.p95.toFixed(2)}`);
        console.log(`    P99: ${stats.p99.toFixed(2)}`);
        console.log(`  Cache Hit Rate: ${stats.cacheHitRate}%`);
        console.log(`  Status Codes: ${JSON.stringify(stats.statusCodes)}`);
      }
    }

    console.log('\n' + '='.repeat(80));
  }
}

/**
 * Make HTTP request to endpoint
 */
function makeRequest(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;

    const onResponse = (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const responseTime = Date.now() - startTime;
        const cacheStatus = response.headers['x-cache'] || 'NONE';

        resolve({
          statusCode: response.statusCode,
          responseTime,
          cacheStatus,
          dataSize: data.length
        });
      });
    };

    client.get(url, onResponse).on('error', () => {
      resolve({
        statusCode: 0,
        responseTime: Date.now() - startTime,
        cacheStatus: 'NONE',
        dataSize: 0
      });
    });
  });
}

/**
 * Simulate a user making multiple requests
 */
async function simulateUser(userId, startTime, results) {
  const delayPerRequest = RAMP_UP_TIME / CONCURRENT_USERS / REQUESTS_PER_USER;

  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    // Stagger requests over ramp-up time
    const delay = (userId * delayPerRequest) + (i * (delayPerRequest / REQUESTS_PER_USER));
    await new Promise(resolve => setTimeout(resolve, delay));

    // Make requests to different endpoints
    const endpoint = ENDPOINTS[i % ENDPOINTS.length];
    const url = `${BASE_URL}${endpoint.path}`;

    const response = await makeRequest(url);
    results.addResult(endpoint.name, response.statusCode, response.responseTime, response.cacheStatus);

    process.stdout.write('.');
  }
}

/**
 * Run the load test
 */
async function runLoadTest() {
  console.log('Starting KINBEN API Load Test...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Requests per User: ${REQUESTS_PER_USER}`);
  console.log(`Total Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}`);
  console.log(`Ramp-up Time: ${RAMP_UP_TIME / 1000}s\n`);

  const results = new LoadTestResult();
  results.startTime = Date.now();

  // Create user simulation promises
  const userPromises = [];
  for (let userId = 0; userId < CONCURRENT_USERS; userId++) {
    userPromises.push(simulateUser(userId, results.startTime, results));
  }

  // Wait for all users to complete
  await Promise.all(userPromises);
  results.endTime = Date.now();

  console.log('\n');
  results.printSummary();

  // Exit with success code if all requests succeeded, failure otherwise
  const exitCode = results.failedRequests === 0 ? 0 : 1;
  process.exit(exitCode);
}

// Run the test
runLoadTest().catch((error) => {
  console.error('Load test error:', error);
  process.exit(1);
});

export { LoadTestResult };
