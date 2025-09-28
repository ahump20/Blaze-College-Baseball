/**
 * BLAZE SPORTS INTEL - HTTP CLIENT
 * Phase 2B: Enterprise HTTP client with retry logic, timeouts, and circuit breaker
 *
 * Production-ready HTTP client for reliable API integration
 */

class HttpClient {
  constructor(logger, options = {}) {
    this.logger = logger;
    this.baseTimeout = options.timeout || 10000; // 10 seconds
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000; // 1 second
    this.circuitBreakerThreshold = options.circuitBreakerThreshold || 5;

    // Circuit breaker state per endpoint
    this.circuitBreakers = new Map();

    // Request metrics
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      retries: 0,
      circuitBreakerTrips: 0
    };
  }

  /**
   * Main HTTP request method with retry logic and circuit breaker
   */
  async request(url, options = {}) {
    const startTime = Date.now();
    const method = options.method || 'GET';
    const timeout = options.timeout || this.baseTimeout;

    this.metrics.requests++;

    // Extract domain for circuit breaker
    const domain = new URL(url).hostname;

    // Check circuit breaker
    if (this.isCircuitOpen(domain)) {
      this.metrics.circuitBreakerTrips++;
      const error = new Error(`Circuit breaker open for ${domain}`);
      error.code = 'CIRCUIT_BREAKER_OPEN';
      throw error;
    }

    let lastError = null;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        const response = await this.makeRequest(url, options, timeout);

        // Success - record metrics
        this.metrics.successes++;
        this.recordSuccess(domain);

        const duration = Date.now() - startTime;
        this.logger?.logApiCall(url, duration, true);

        return response;

      } catch (error) {
        lastError = error;
        attempt++;

        this.recordFailure(domain);

        // Don't retry on certain errors
        if (this.shouldNotRetry(error) || attempt > this.maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const delay = this.calculateRetryDelay(attempt);
        this.logger?.warn(`Request failed, retrying in ${delay}ms`, {
          url,
          attempt,
          error: error.message
        });

        this.metrics.retries++;
        await this.sleep(delay);
      }
    }

    // All retries failed
    this.metrics.failures++;
    const duration = Date.now() - startTime;
    this.logger?.logApiCall(url, duration, false, lastError);

    throw lastError;
  }

  /**
   * Make actual HTTP request with timeout
   */
  async makeRequest(url, options, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestOptions = {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Blaze-Sports-Intel/1.0',
          'Accept': 'application/json',
          ...options.headers
        }
      };

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Handle HTTP error status codes
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      // Parse response based on content type
      const contentType = response.headers.get('content-type') || '';
      let data;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      return {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      };

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout after ${timeout}ms`);
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }

      throw error;
    }
  }

  /**
   * GET request wrapper
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST request wrapper
   */
  async post(url, data, options = {}) {
    const postOptions = {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    };

    return this.request(url, postOptions);
  }

  /**
   * PUT request wrapper
   */
  async put(url, data, options = {}) {
    const putOptions = {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    };

    return this.request(url, putOptions);
  }

  /**
   * DELETE request wrapper
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * Circuit breaker implementation
   */
  isCircuitOpen(domain) {
    const breaker = this.circuitBreakers.get(domain);
    if (!breaker) return false;

    // Check if circuit is open
    if (breaker.state === 'open') {
      // Check if it's time to try again (half-open state)
      if (Date.now() - breaker.lastFailure > breaker.timeout) {
        breaker.state = 'half-open';
        return false;
      }
      return true;
    }

    return false;
  }

  recordSuccess(domain) {
    const breaker = this.circuitBreakers.get(domain);
    if (breaker) {
      if (breaker.state === 'half-open') {
        // Success in half-open, close the circuit
        breaker.state = 'closed';
        breaker.failures = 0;
      }
    }
  }

  recordFailure(domain) {
    let breaker = this.circuitBreakers.get(domain);
    if (!breaker) {
      breaker = {
        failures: 0,
        state: 'closed',
        lastFailure: null,
        timeout: 60000 // 1 minute
      };
      this.circuitBreakers.set(domain, breaker);
    }

    breaker.failures++;
    breaker.lastFailure = Date.now();

    // Open circuit if threshold exceeded
    if (breaker.failures >= this.circuitBreakerThreshold) {
      breaker.state = 'open';
      this.logger?.warn(`Circuit breaker opened for ${domain}`, {
        failures: breaker.failures,
        threshold: this.circuitBreakerThreshold
      });
    }
  }

  /**
   * Determine if error should not be retried
   */
  shouldNotRetry(error) {
    // Don't retry on client errors (4xx) except rate limiting
    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
      return true;
    }

    // Don't retry on authentication errors
    if (error.status === 401 || error.status === 403) {
      return true;
    }

    // Don't retry on certain error codes
    const nonRetriableErrors = ['CIRCUIT_BREAKER_OPEN', 'INVALID_URL', 'PARSE_ERROR'];
    return nonRetriableErrors.includes(error.code);
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  calculateRetryDelay(attempt) {
    const baseDelay = this.retryDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
    return Math.min(baseDelay + jitter, 30000); // Max 30 seconds
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch requests with concurrency control
   */
  async batch(requests, options = {}) {
    const concurrency = options.concurrency || 5;
    const results = [];
    const errors = [];

    // Process requests in batches
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);

      const batchPromises = batch.map(async (req, index) => {
        try {
          const result = await this.request(req.url, req.options);
          return { index: i + index, result, success: true };
        } catch (error) {
          return { index: i + index, error, success: false };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            results[result.value.index] = result.value.result;
          } else {
            errors[result.value.index] = result.value.error;
          }
        } else {
          errors[i] = result.reason;
        }
      });
    }

    return { results, errors };
  }

  /**
   * Health check for HTTP client
   */
  async healthCheck() {
    try {
      // Test with a reliable endpoint
      await this.get('https://httpbin.org/get', { timeout: 5000 });
      return {
        status: 'healthy',
        metrics: this.getMetrics()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        metrics: this.getMetrics()
      };
    }
  }

  /**
   * Get client metrics
   */
  getMetrics() {
    const successRate = this.metrics.requests > 0
      ? (this.metrics.successes / this.metrics.requests * 100).toFixed(2)
      : 0;

    return {
      ...this.metrics,
      successRate: `${successRate}%`,
      circuitBreakers: this.circuitBreakers.size,
      openCircuits: Array.from(this.circuitBreakers.entries())
        .filter(([_, breaker]) => breaker.state === 'open')
        .map(([domain]) => domain)
    };
  }

  /**
   * Reset circuit breakers
   */
  resetCircuitBreakers() {
    this.circuitBreakers.clear();
    this.logger?.info('All circuit breakers reset');
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      retries: 0,
      circuitBreakerTrips: 0
    };
    this.logger?.info('HTTP client metrics reset');
  }
}

export default HttpClient;