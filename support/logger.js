/**
 * Minimal structured logger.
 *
 * Cucumber runs each worker in its own process and interleaves their stdout, so a bare
 * console.log gives you no way to tell which worker produced a line. Every record here
 * carries the worker id, and LOG_FORMAT=json switches to one JSON object per line for log
 * shippers that need to parse rather than read.
 */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

const configuredLevel = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info;
const asJson = process.env.LOG_FORMAT?.toLowerCase() === 'json';

// Cucumber sets this for every parallel worker; it is absent in a serial run.
const workerId = process.env.CUCUMBER_WORKER_ID ?? '0';

function write(level, message, context = {}) {
    if (LEVELS[level] < configuredLevel) return;

    const stream = LEVELS[level] >= LEVELS.warn ? process.stderr : process.stdout;

    if (asJson) {
        stream.write(
            `${JSON.stringify({
                timestamp: new Date().toISOString(),
                level,
                worker: workerId,
                message,
                ...context,
            })}\n`,
        );
        return;
    }

    const details = Object.entries(context)
        .map(([key, value]) => `${key}=${value}`)
        .join(' ');

    stream.write(
        `[${level.toUpperCase()}] [worker ${workerId}] ${message}${details ? ` ${details}` : ''}\n`,
    );
}

export const logger = {
    debug: (message, context) => write('debug', message, context),
    info: (message, context) => write('info', message, context),
    warn: (message, context) => write('warn', message, context),
    error: (message, context) => write('error', message, context),
};

export default logger;
