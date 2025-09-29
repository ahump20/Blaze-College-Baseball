/**
 * Custom error classes for Blaze Sports Intel
 */
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode["API_UNAVAILABLE"] = "API_UNAVAILABLE";
    ErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    ErrorCode["INVALID_RESPONSE"] = "INVALID_RESPONSE";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["CACHE_ERROR"] = "CACHE_ERROR";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
})(ErrorCode || (ErrorCode = {}));
export class ApiError extends Error {
    code;
    statusCode;
    retryAfter;
    constructor(code, message, statusCode, retryAfter) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.retryAfter = retryAfter;
        this.name = 'ApiError';
    }
}
/**
 * Error recovery strategies
 */
export class ErrorHandler {
    static DEFAULT_RETRY_DELAY = 1000;
    static MAX_RETRIES = 3;
    /**
     * Handle API errors with graceful fallbacks
     */
    static async handleWithFallback(operation, fallback, options = {}) {
        const { retries = this.MAX_RETRIES, retryDelay = this.DEFAULT_RETRY_DELAY, onError, } = options;
        let lastError = null;
        // Attempt operation with retries
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (onError) {
                    onError(lastError);
                }
                console.error(`[Error] Attempt ${attempt + 1}/${retries} failed:`, lastError.message);
                // Check if error is retryable
                if (!this.isRetryable(lastError)) {
                    break;
                }
                // Wait before retry with exponential backoff
                if (attempt < retries - 1) {
                    const delay = retryDelay * Math.pow(2, attempt);
                    console.log(`[Retry] Waiting ${delay}ms before retry...`);
                    await this.sleep(delay);
                }
            }
        }
        // Use fallback if available
        const fallbackData = fallback();
        if (fallbackData !== null) {
            console.log('[Fallback] Using fallback data');
            return {
                data: fallbackData,
                isStale: true,
                staleSince: new Date(),
                source: 'cache',
            };
        }
        // No fallback available, throw the last error
        throw lastError || new Error('Operation failed with no fallback');
    }
    /**
     * Determine if an error is retryable
     */
    static isRetryable(error) {
        if (error instanceof ApiError) {
            // Don't retry validation errors
            if (error.code === ErrorCode.VALIDATION_ERROR) {
                return false;
            }
            // Don't retry if rate limited with retry-after header
            if (error.code === ErrorCode.RATE_LIMITED && error.retryAfter) {
                return false;
            }
            // Retry network and temporary errors
            return [
                ErrorCode.NETWORK_ERROR,
                ErrorCode.API_UNAVAILABLE,
            ].includes(error.code);
        }
        // Retry network-related errors
        return error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('timeout');
    }
    /**
     * Sleep utility for retry delays
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Create user-friendly error messages
     */
    static getUserMessage(error) {
        if (error instanceof ApiError) {
            switch (error.code) {
                case ErrorCode.API_UNAVAILABLE:
                    return 'Sports data is temporarily unavailable. Please try again later.';
                case ErrorCode.RATE_LIMITED:
                    return 'Too many requests. Please wait a moment and try again.';
                case ErrorCode.INVALID_RESPONSE:
                    return 'Received invalid data from the sports provider.';
                case ErrorCode.NETWORK_ERROR:
                    return 'Network connection issue. Please check your connection.';
                case ErrorCode.CACHE_ERROR:
                    return 'Error accessing cached data.';
                case ErrorCode.VALIDATION_ERROR:
                    return 'Data validation failed. The information may be incorrect.';
                default:
                    return 'An unexpected error occurred. Please try again.';
            }
        }
        // Generic error message
        return 'Something went wrong. Please refresh and try again.';
    }
    /**
     * Log error with context
     */
    static logError(error, context) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            ...context,
        };
        if (error instanceof ApiError) {
            Object.assign(errorInfo, {
                code: error.code,
                statusCode: error.statusCode,
                retryAfter: error.retryAfter,
            });
        }
        console.error('[Error Log]', JSON.stringify(errorInfo, null, 2));
        // In production, send to monitoring service
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            // TODO: Send to monitoring service (e.g., Sentry, LogRocket)
        }
    }
}
/**
 * Default fallback data for each sport
 */
export const DEFAULT_FALLBACKS = {
    MLB: {
        team: {
            name: 'St. Louis Cardinals',
            division: 'NL Central',
            venue: 'Busch Stadium',
            message: 'Live data temporarily unavailable',
        },
        standings: {
            divisionName: 'NL Central',
            rows: [],
            message: 'Standings data temporarily unavailable',
        },
    },
    NFL: {
        team: {
            name: 'Tennessee Titans',
            abbreviation: 'TEN',
            location: 'Nashville',
            conference: 'AFC',
            division: 'AFC South',
            venue: 'Nissan Stadium',
            record: null,
            dataSource: 'Cache Fallback',
            lastUpdated: null,
            truthLabel: 'OFFLINE DATA - SERVICE UNAVAILABLE',
        },
        standings: {
            conference: 'AFC',
            division: 'AFC South',
            rows: [],
            lastUpdated: null,
            dataSource: 'Cache Fallback',
            truthLabel: 'OFFLINE DATA - SERVICE UNAVAILABLE',
        },
    },
    NBA: {
        team: {
            name: 'Memphis Grizzlies',
            division: 'Southwest',
            venue: 'FedExForum',
            message: 'Live data temporarily unavailable',
        },
    },
    NCAA: {
        team: {
            name: 'Texas Longhorns',
            conference: 'SEC',
            venue: 'Darrell K Royal Stadium',
            message: 'Live data temporarily unavailable',
        },
    },
};
/**
 * Circuit breaker for API calls
 */
export class CircuitBreaker {
    threshold;
    timeout;
    failures = 0;
    lastFailureTime = 0;
    state = 'CLOSED';
    constructor(threshold = 5, timeout = 60000 // 1 minute
    ) {
        this.threshold = threshold;
        this.timeout = timeout;
    }
    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
                console.log('[Circuit Breaker] Entering HALF_OPEN state');
            }
            else {
                throw new ApiError(ErrorCode.API_UNAVAILABLE, 'Service temporarily disabled due to repeated failures');
            }
        }
        try {
            const result = await operation();
            if (this.state === 'HALF_OPEN') {
                this.reset();
                console.log('[Circuit Breaker] Success in HALF_OPEN, resetting to CLOSED');
            }
            return result;
        }
        catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.threshold) {
            this.state = 'OPEN';
            console.log(`[Circuit Breaker] OPEN after ${this.failures} failures`);
        }
    }
    reset() {
        this.failures = 0;
        this.lastFailureTime = 0;
        this.state = 'CLOSED';
    }
    getState() {
        return this.state;
    }
}
//# sourceMappingURL=errors.js.map