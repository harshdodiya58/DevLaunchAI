import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function connectDatabase(retries = 10, delay = 5000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
      return;
    } catch (error) {
      logger.warn(`Failed to connect to database (attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
      if (i === retries - 1) {
        logger.error('Exhausted all database connection retries:', error);
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

import { logger } from './logger';
