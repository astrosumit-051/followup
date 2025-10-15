import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

/**
 * Metrics Module
 *
 * Provides Prometheus metrics integration for monitoring application performance.
 *
 * Features:
 * - Default Node.js metrics (CPU, memory, event loop)
 * - Custom application metrics (AI latency, cache hit rate, etc.)
 * - HTTP metrics endpoint at /metrics
 */
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'relationhub_',
        },
      },
      path: '/metrics',
      defaultLabels: {
        app: 'relationhub-api',
        environment: process.env.NODE_ENV || 'development',
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
