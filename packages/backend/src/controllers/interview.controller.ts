import { Request, Response, NextFunction } from 'express';
import { interviewService } from '../services/interview.service';

export class InterviewController {
  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, domain } = req.body;
      const session = await interviewService.startSession(req.user!.userId, type, domain);
      res.json({ success: true, data: session, message: 'Interview started', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionIndex, answer } = req.body;
      const result = await interviewService.submitAnswer(req.user!.userId, req.params.id, questionIndex, answer);
      res.json({ success: true, data: result, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async history(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await interviewService.getHistory(req.user!.userId);
      res.json({ success: true, data: sessions, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await interviewService.getSession(req.user!.userId, req.params.id);
      res.json({ success: true, data: session, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const interviewController = new InterviewController();
