import { Request, Response, NextFunction } from 'express';
import { atsService } from '../services/ats.service';
import { AppError } from '../middleware/errorHandler';

import { prisma } from '../config/database';

export class ATSController {
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const history = await prisma.atsHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: history });
    } catch (err) { next(err); }
  }

  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const { resumeText, jobDescription } = req.body;
      const userId = req.user!.userId;
      if (!resumeText) {
        throw new AppError(400, 'RESUME_REQUIRED', 'Resume text is required for analysis');
      }
      const result = await atsService.analyze(resumeText, jobDescription);

      const historyRecord = await prisma.atsHistory.create({
        data: {
          user: { connect: { id: userId } },
          resumeText,
          jobDescription,
          score: result.score || 0,
          metrics: result.sectionScores || result.metrics,
          issues: result.issues,
          strengths: result.strengths,
          missingKeywords: result.missingKeywords,
        },
      });

      res.json({ success: true, data: { ...result, historyId: historyRecord.id }, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, 'FILE_REQUIRED', 'Resume file is required');
      }
      const text = await atsService.extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
      res.json({ success: true, data: { extractedText: text }, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async enhance(req: Request, res: Response, next: NextFunction) {
    try {
      const { resumeText, jobDescription, atsIssues, historyId } = req.body;
      if (!resumeText) {
        throw new AppError(400, 'RESUME_REQUIRED', 'Resume text is required for enhancement');
      }
      const enhanced = await atsService.enhance(resumeText, jobDescription, atsIssues);

      if (historyId) {
        await prisma.atsHistory.update({
          where: { id: historyId },
          data: { enhancedResume: enhanced.enhancedResume },
        });
      }

      res.json({ success: true, data: { enhancedResume: enhanced.enhancedResume }, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const atsController = new ATSController();
