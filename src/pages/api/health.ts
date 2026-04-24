import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import mongoose from 'mongoose';

/**
 * Health Check Endpoint
 * 
 * Returns application health status for monitoring tools
 * No authentication required - this is a public health check
 * 
 * Usage:
 * - Uptime monitoring (UptimeRobot, Pingdom, etc.)
 * - Load balancer health checks
 * - Kubernetes liveness/readiness probes
 */

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    application: {
      status: 'up';
      uptime: number;
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse>
) {
  const startTime = Date.now();
  
  const healthCheck: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    checks: {
      database: {
        status: 'down',
      },
      application: {
        status: 'up',
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        },
      },
    },
  };

  // Test database connection
  try {
    await dbConnect();
    
    // Ping database
    const dbStartTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const dbResponseTime = Date.now() - dbStartTime;

    healthCheck.checks.database = {
      status: 'up',
      responseTime: dbResponseTime,
    };
  } catch (error: any) {
    healthCheck.checks.database = {
      status: 'down',
      error: error.message,
    };
    healthCheck.status = 'unhealthy';
  }

  // Determine overall status
  if (healthCheck.checks.database.status === 'down') {
    healthCheck.status = 'unhealthy';
  } else if (healthCheck.checks.database.responseTime! > 1000) {
    healthCheck.status = 'degraded';
  }

  // Memory warning
  if (healthCheck.checks.application.memory.percentage > 90) {
    healthCheck.status = 'degraded';
  }

  // Return appropriate status code
  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                     healthCheck.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(healthCheck);
}
