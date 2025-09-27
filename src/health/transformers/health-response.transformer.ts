import { HealthCheckResult } from '@nestjs/terminus';
import { HealthCheckDto, HealthIndicatorStatus } from '../dto/health-check.dto';

export class HealthResponseTransformer {
  static transform(result: HealthCheckResult): HealthCheckDto {
    return {
      status: result.status,
      info: result.info ? this.transformIndicators(result.info) : undefined,
      error: result.error ? this.transformIndicators(result.error) : undefined,
      details: this.transformIndicators(result.details),
    };
  }

  private static transformIndicators(
    indicators: Record<string, any>
  ): Record<string, HealthIndicatorStatus> {
    const transformed: Record<string, HealthIndicatorStatus> = {};
    
    for (const [key, value] of Object.entries(indicators)) {
      transformed[key] = {
        status: value.status,
        message: value.message,
        ...value, // Spread any additional properties
      };
    }
    
    return transformed;
  }
}