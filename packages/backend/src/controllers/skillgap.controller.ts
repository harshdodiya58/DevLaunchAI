import { Request, Response, NextFunction } from 'express';
import { skillGapService } from '../services/skillgap.service';

export class SkillGapController {
  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetRole } = req.body;
      if (!targetRole) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Target role is required' }, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
        return;
      }
      const result = await skillGapService.analyze(req.user!.userId, targetRole);
      res.json({ success: true, data: result, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async updateSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const { skills } = req.body;
      await skillGapService.updateSkills(req.user!.userId, skills);
      res.json({ success: true, data: null, message: 'Skills updated', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const skillGapController = new SkillGapController();
