import { Request, Response, NextFunction } from 'express';
import { autonomousService } from '../services/autonomous.service';

export class AutonomousController {
  async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await autonomousService.getConfig(req.user!.userId);
      res.json({ success: true, data: config, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await autonomousService.updateConfig(req.user!.userId, req.body);
      res.json({ success: true, data: config, message: 'Agent configuration updated', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await autonomousService.getLogs(req.user!.userId);
      res.json({ success: true, data: logs, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const autonomousController = new AutonomousController();
