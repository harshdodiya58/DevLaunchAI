import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { aiService } from '../services/ai.service';

export class ChatController {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      if (!message) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Message is required' }, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
        return;
      }

      await prisma.chatMessage.create({
        data: { userId: req.user!.userId, role: 'user', content: message },
      });

      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { profile: true },
      });

      const reply = await aiService.getCareerAdvice(message, {
        skills: (user?.profile?.skills as string[]) || [],
        targetRole: user?.profile?.targetRole || undefined,
      });

      await prisma.chatMessage.create({
        data: { userId: req.user!.userId, role: 'assistant', content: reply },
      });

      res.json({ success: true, data: { reply }, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });
      res.json({ success: true, data: messages, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async clearHistory(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.chatMessage.deleteMany({ where: { userId: req.user!.userId } });
      res.json({ success: true, data: null, message: 'Chat history cleared', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const chatController = new ChatController();
