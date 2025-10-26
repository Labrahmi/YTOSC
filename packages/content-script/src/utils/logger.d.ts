/**
 * Logging utilities for debugging
 */
export declare const logger: {
    log: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
    success: (message: string, ...args: any[]) => void;
};
