import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export class AdminController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalUsers, totalResumes, totalApplications, totalInterviews] = await Promise.all([
        prisma.user.count(),
        prisma.resume.count(),
        prisma.jobApplication.count(),
        prisma.interviewSession.count(),
      ]);

      res.json({
        success: true,
        data: { totalUsers, totalResumes, totalApplications, totalInterviews },
        meta: { timestamp: new Date().toISOString(), requestId: req.id },
      });
    } catch (err) { next(err); }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, isVerified: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: users, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
        select: { id: true, email: true, name: true, role: true },
      });
      res.json({ success: true, data: user, message: 'User role updated', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ success: true, data: null, message: 'User deleted', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const adminController = new AdminController();
