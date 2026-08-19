import { Request, Response, NextFunction } from 'express';
import { githubService } from '../services/github.service';

export class GitHubController {
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await githubService.getAnalytics(req.user!.userId);
      res.json({ success: true, data, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async updateUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.body;
      if (!username) {
        res.status(400).json({ success: false, error: { message: 'Username is required' } });
        return;
      }
      const data = await githubService.updateUsername(req.user!.userId, username);
      res.json({ success: true, data, message: 'GitHub username updated', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const gitHubController = new GitHubController();
