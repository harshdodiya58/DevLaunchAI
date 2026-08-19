import { Request, Response, NextFunction } from 'express';
import { roadmapService } from '../services/roadmap.service';

export class RoadmapController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmaps = await roadmapService.getAll();
      
      let roadmapsWithProgress = roadmaps as any[];
      if (req.user?.userId) {
        roadmapsWithProgress = await Promise.all(
          roadmaps.map(async (r: any) => {
            const progress = await roadmapService.getUserProgress(req.user!.userId, r.id);
            return { ...r, progress };
          })
        );
      }

      res.json({ success: true, data: roadmapsWithProgress, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmap = await roadmapService.getById(req.params.id);
      const progress = await roadmapService.getUserProgress(req.user!.userId, req.params.id);
      res.json({ 
        success: true, 
        data: { roadmap, progress }, 
        meta: { timestamp: new Date().toISOString(), requestId: req.id } 
      });
    } catch (err) { next(err); }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { nodeId, completed } = req.body;
      const progress = await roadmapService.updateProgress(req.user!.userId, req.params.id, nodeId, completed);
      res.json({ success: true, data: progress, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const roadmapController = new RoadmapController();
