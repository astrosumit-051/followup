import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';

/**
 * Metrics Controller
 *
 * Exposes Prometheus metrics endpoint for scraping.
 *
 * Endpoints:
 * - GET /metrics - Returns all metrics in Prometheus format
 * - GET /metrics/health - Health check endpoint with basic stats
 */
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Prometheus metrics endpoint
   *
   * Returns all metrics in Prometheus text-based format for scraping.
   *
   * @returns Prometheus formatted metrics
   */
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

  /**
   * Health check endpoint with cache hit rate
   *
   * Provides a simple health check with key performance indicators.
   *
   * @returns Health status with cache hit rate
   */
  @Get('health')
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    cacheHitRate: number;
  }> {
    const cacheHitRate = await this.metricsService.getCacheHitRate();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    };
  }
}
