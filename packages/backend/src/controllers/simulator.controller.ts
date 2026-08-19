import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { AppError } from '../middleware/errorHandler';

export class SimulatorController {
  async simulateTurn(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, jobDescription, resumeText, history } = req.body;
      
      if (!role || !jobDescription || !history) {
        throw new AppError(400, 'MISSING_DATA', 'Missing required fields for simulation');
      }

      const responseText = await aiService.simulateInterviewTurn({
        role,
        jobDescription,
        resumeText,
        history,
      });

      res.json({ success: true, data: { response: responseText } });
    } catch (error) {
      next(error);
    }
  }
}

export const simulatorController = new SimulatorController();
