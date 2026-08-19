import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service';
import { jobSearchService } from '../services/jobSearch.service';

export class JobController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await jobService.list(req.user!.userId, req.query.status as string);
      res.json({ success: true, data: jobs, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.getById(req.user!.userId, req.params.id);
      res.json({ success: true, data: job, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: job, message: 'Application added', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.update(req.user!.userId, req.params.id, req.body);
      res.json({ success: true, data: job, message: 'Application updated', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await jobService.delete(req.user!.userId, req.params.id);
      res.json({ success: true, data: null, message: 'Application deleted', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async analytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await jobService.getAnalytics(req.user!.userId);
      res.json({ success: true, data, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  /** Search live jobs across multiple real job boards */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, location, type, remote, page } = req.query as Record<string, string>;
      const results = await jobSearchService.search({
        query: query || 'software engineer',
        location: location || '',
        type: type || '',
        remote: remote === 'true',
        page: parseInt(page || '1'),
      });
      res.json({ success: true, data: results, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const jobController = new JobController();
