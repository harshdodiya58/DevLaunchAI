import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { AppError } from '../middleware/errorHandler';

export class ArchitectController {
  async generateBlueprint(req: Request, res: Response, next: NextFunction) {
    try {
      const { idea } = req.body;
      if (!idea) {
        throw new AppError(400, 'MISSING_IDEA', 'Project idea is required');
      }

      const blueprintJson = await aiService.generateProjectBlueprint(idea);
      const cleanJson = blueprintJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const blueprint = JSON.parse(cleanJson);

      res.json({ success: true, data: blueprint });
    } catch (error) {
      next(error);
    }
  }
}

export const architectController = new ArchitectController();
