import { Request, Response, NextFunction } from 'express';
import { codingService } from '../services/coding.service';

export class CodingController {
  async listProblems(req: Request, res: Response, next: NextFunction) {
    try {
      const problems = await codingService.listProblems(req.query.topic as string, req.query.difficulty as string);
      res.json({ success: true, data: problems, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async getProblem(req: Request, res: Response, next: NextFunction) {
    try {
      const problem = await codingService.getProblem(req.params.id);
      res.json({ success: true, data: problem, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, language } = req.body;
      const submission = await codingService.submit(req.user!.userId, req.params.id, code, language);
      res.json({ success: true, data: submission, message: 'Code submitted', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async submissions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await codingService.getUserSubmissions(req.user!.userId, req.query.problemId as string);
      res.json({ success: true, data, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await codingService.getStats(req.user!.userId);
      res.json({ success: true, data, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const codingController = new CodingController();
