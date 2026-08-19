import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const [resumes, jobs, interviews, submissions, profile, atsScans] = await Promise.all([
        prisma.resume.count({ where: { userId } }),
        prisma.jobApplication.findMany({ where: { userId }, orderBy: { appliedAt: 'desc' }, take: 5 }),
        prisma.interviewSession.count({ where: { userId } }),
        prisma.codingSubmission.findMany({ where: { userId }, include: { problem: true }, take: 5, orderBy: { submittedAt: 'desc' } }),
        prisma.profile.findUnique({ where: { userId } }),
        prisma.atsHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 })
      ]);

      const defaultResume = await prisma.resume.findFirst({ where: { userId, isDefault: true } });

      res.json({
        success: true,
        data: {
          stats: {
            totalResumes: resumes,
            totalApplications: jobs.length,
            totalInterviews: interviews,
            atsScore: atsScans.length > 0 ? Math.max(...atsScans.map((s: any) => s.score)) : (defaultResume?.atsScore || null),
            resumeCompletion: profile?.skills ? Math.min(100, (profile.skills as string[]).length * 10) : 0,
          },
          recentApplications: jobs,
          recentSubmissions: submissions,
          recentAtsScans: atsScans,
          profile,
        },
        meta: { timestamp: new Date().toISOString(), requestId: req.id },
      });
    } catch (err) { next(err); }
  }
}

export const dashboardController = new DashboardController();
