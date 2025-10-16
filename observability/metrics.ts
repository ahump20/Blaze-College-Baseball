import pino from 'pino';

const logger = pino({ name: 'observability', level: process.env.LOG_LEVEL || 'info' });

export interface MetricEvent {
  name: string;
  value: number;
  tags?: Record<string, string | number>;
  at?: string;
}

export interface LogEvent {
  message: string;
  context?: Record<string, unknown>;
  level?: 'info' | 'warn' | 'error';
}

export class MonitoringClient {
  private readonly metricsEndpoint = process.env.METRICS_WEBHOOK_URL;

  async emitMetric(event: MetricEvent) {
    const payload = {
      name: event.name,
      value: event.value,
      tags: event.tags ?? {},
      at: event.at ?? new Date().toISOString()
    };

    logger.info({ metric: payload }, 'metric emitted');

    if (!this.metricsEndpoint) {
      return;
    }

    try {
      await fetch(this.metricsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      logger.warn({ err: error }, 'failed to post metric to webhook');
    }
  }

  log(event: LogEvent) {
    const level = event.level ?? 'info';
    logger[level]({ context: event.context }, event.message);
  }
}

export const monitoringClient = new MonitoringClient();
