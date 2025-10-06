import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

/**
 * Application Bootstrap
 *
 * Security Configuration:
 * - Helmet middleware for HTTP security headers
 * - CORS with environment-based origin configuration
 * - Credentials support for cookie-based authentication
 * - GraphQL-friendly CSP directives
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers with Helmet
  app.use(
    helmet({
      // Content Security Policy - allows GraphQL playground in development
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Required for GraphQL playground
          scriptSrc: ["'self'", "'unsafe-inline'"], // Required for GraphQL playground
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
      // Strict Transport Security - enforces HTTPS in production
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      // Prevent clickjacking attacks
      frameguard: { action: 'deny' },
      // Prevent MIME type sniffing
      noSniff: true,
      // XSS Protection (legacy browsers)
      xssFilter: true,
    }),
  );

  // CORS Configuration - environment-based origin
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies for session management
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();
