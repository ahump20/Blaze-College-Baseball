/**
 * Custom error classes for Blaze Sports Intel
 */
export declare enum ErrorCode {
    API_UNAVAILABLE = "API_UNAVAILABLE",
    RATE_LIMITED = "RATE_LIMITED",
    INVALID_RESPONSE = "INVALID_RESPONSE",
    NETWORK_ERROR = "NETWORK_ERROR",
    CACHE_ERROR = "CACHE_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR"
}
export declare class ApiError extends Error {
    code: ErrorCode;
    statusCode?: number | undefined;
    retryAfter?: number | undefined;
    constructor(code: ErrorCode, message: string, statusCode?: number | undefined, retryAfter?: number | undefined);
}
export interface FallbackData<T> {
    data: T;
    isStale: boolean;
    staleSince: Date;
    source: 'cache' | 'default';
}
/**
 * Error recovery strategies
 */
export declare class ErrorHandler {
    private static readonly DEFAULT_RETRY_DELAY;
    private static readonly MAX_RETRIES;
    /**
     * Handle API errors with graceful fallbacks
     */
    static handleWithFallback<T>(operation: () => Promise<T>, fallback: () => T | null, options?: {
        retries?: number;
        retryDelay?: number;
        onError?: (error: Error) => void;
    }): Promise<T | FallbackData<T>>;
    /**
     * Determine if an error is retryable
     */
    private static isRetryable;
    /**
     * Sleep utility for retry delays
     */
    private static sleep;
    /**
     * Create user-friendly error messages
     */
    static getUserMessage(error: Error): string;
    /**
     * Log error with context
     */
    static logError(error: Error, context: {
        operation: string;
        sport?: string;
        teamId?: string;
        [key: string]: unknown;
    }): void;
}
/**
 * Default fallback data for each sport
 */
export declare const DEFAULT_FALLBACKS: {
    MLB: {
        team: {
            name: string;
            division: string;
            venue: string;
            message: string;
        };
        standings: {
            divisionName: string;
            rows: never[];
            message: string;
        };
    };
    NFL: {
        team: {
            name: string;
            abbreviation: string;
            location: string;
            conference: string;
            division: string;
            venue: string;
            record: null;
            dataSource: string;
            lastUpdated: null;
            truthLabel: string;
        };
        standings: {
            conference: string;
            division: string;
            rows: never[];
            lastUpdated: null;
            dataSource: string;
            truthLabel: string;
        };
    };
    NBA: {
        team: {
            name: string;
            division: string;
            venue: string;
            message: string;
        };
    };
    NCAA: {
        team: {
            name: string;
            conference: string;
            venue: string;
            message: string;
        };
    };
};
/**
 * Circuit breaker for API calls
 */
export declare class CircuitBreaker {
    private readonly threshold;
    private readonly timeout;
    private failures;
    private lastFailureTime;
    private state;
    constructor(threshold?: number, timeout?: number);
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private recordFailure;
    private reset;
    getState(): string;
}
//# sourceMappingURL=errors.d.ts.map