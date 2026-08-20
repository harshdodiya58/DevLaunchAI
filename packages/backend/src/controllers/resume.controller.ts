import { Request, Response, NextFunction } from 'express';
import { resumeService } from '../services/resume.service';
import { aiService } from '../services/ai.service';
import { prisma } from '../config/database';

export class ResumeController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const resumes = await resumeService.list(req.user!.userId);
      res.json({ success: true, data: resumes, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.getById(req.user!.userId, req.params.id);
      res.json({ success: true, data: resume, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: resume, message: 'Resume created', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.update(req.user!.userId, req.params.id, req.body);
      res.json({ success: true, data: resume, message: 'Resume updated', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await resumeService.delete(req.user!.userId, req.params.id);
      res.json({ success: true, data: null, message: 'Resume deleted', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async setDefault(req: Request, res: Response, next: NextFunction) {
    try {
      await resumeService.setDefault(req.user!.userId, req.params.id);
      res.json({ success: true, data: null, message: 'Default resume updated', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.duplicate(req.user!.userId, req.params.id);
      res.status(201).json({ success: true, data: resume, message: 'Resume duplicated', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async improveBullet(req: Request, res: Response, next: NextFunction) {
    try {
      const { bullet, role, company } = req.body;
      if (!bullet) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Bullet point is required' }, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
        return;
      }
      const result = await aiService.improveBulletPoint(bullet, { role, company });
      try {
        const parsedData = typeof result === 'string' ? JSON.parse(result.replace(/^```json/m, '').replace(/```$/m, '').trim()) : result;
        res.json({ success: true, data: parsedData, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
      } catch (parseErr) {
        throw new Error('Failed to parse AI response for bullet point');
      }
    } catch (err) { next(err); }
  }

  async generateSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { profile: true },
      });
      if (!user) {
        res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' }, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
        return;
      }
      const profile = {
        name: user.name,
        skills: req.body.skills?.length ? req.body.skills : ((user.profile?.skills as string[]) || []),
        experience: req.body.experience || ((user.profile?.bio as string) || ''),
        targetRole: user.profile?.targetRole || 'Software Engineer',
        currentSummary: req.body.currentSummary || ''
      };
      const result = await aiService.generateProfessionalSummary(profile);
      try {
        const parsedData = typeof result === 'string' ? JSON.parse(result.replace(/^```json/m, '').replace(/```$/m, '').trim()) : result;
        res.json({ success: true, data: parsedData, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
      } catch (parseErr) {
        throw new Error('Failed to parse AI response for professional summary');
      }
    } catch (err) { next(err); }
  }
}

export const resumeController = new ResumeController();
