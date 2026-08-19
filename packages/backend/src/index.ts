import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import routes from './routes';
import { roadmapService } from './services/roadmap.service';
import { CodingService } from './services/coding.service';
import { cacheService } from './utils/cache';
import RedisStore from 'rate-limit-redis';

const app = express();
const codingService = new CodingService();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestId);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
  ...(cacheService.redisClient && cacheService.isConnected ? {
    store: new RedisStore({
      sendCommand: (...args: string[]) => cacheService.redisClient!.sendCommand(args),
    })
  } : {})
});
app.use('/api/', limiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'AI_RATE_LIMITED', message: 'AI request limit reached. Please wait a moment.' } },
  ...(cacheService.redisClient && cacheService.isConnected ? {
    store: new RedisStore({
      sendCommand: (...args: string[]) => cacheService.redisClient!.sendCommand(args),
      prefix: 'rl:ai:'
    })
  } : {})
});
app.use('/api/v1/ai/', aiLimiter);

app.use('/api/v1', routes);

app.get('/health', (_req, res) => {
  // Trigger restart for new env DB string
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function start() {
  try {
    await connectDatabase();
    await roadmapService.seedDefaultRoadmaps();
    logger.info(`Default roadmaps seeded`);
    
    await codingService.seedDefaultProblems();
    logger.info(`Default coding problems seeded`);

    app.listen(env.PORT, () => {
      logger.info(`DevLaunch AI API running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
