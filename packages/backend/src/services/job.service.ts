import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class JobService {
  async list(userId: string, status?: string) {
    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    return prisma.jobApplication.findMany({
      where,
      orderBy: { appliedAt: 'desc' },
      include: { resume: { select: { id: true, title: true } } },
    });
  }

  async getById(userId: string, id: string) {
    const job = await prisma.jobApplication.findFirst({ where: { id, userId } });
    if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Job application not found');
    return job;
  }

  async create(userId: string, data: {
    company: string; role: string; jobUrl?: string; status?: string; notes?: string; resumeId?: string; followUpDate?: string;
  }) {
    return prisma.jobApplication.create({
      data: { userId, ...data, status: (data.status as any) || 'APPLIED', followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined },
    });
  }

  async update(userId: string, id: string, data: Partial<{
    company: string; role: string; jobUrl: string; status: string; notes: string; resumeId: string; followUpDate: string;
  }>) {
    await this.getById(userId, id);
    return prisma.jobApplication.update({
      where: { id },
      data: { ...data, followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined } as any,
    });
  }

  async delete(userId: string, id: string) {
    await this.getById(userId, id);
    await prisma.jobApplication.delete({ where: { id } });
  }

  async getAnalytics(userId: string) {
    const all = await prisma.jobApplication.findMany({ where: { userId } });
    return {
      total: all.length,
      byStatus: {
        APPLIED: all.filter((j: any) => j.status === 'APPLIED').length,
        SCREENING: all.filter((j: any) => j.status === 'SCREENING').length,
        INTERVIEW: all.filter((j: any) => j.status === 'INTERVIEW').length,
        OFFER: all.filter((j: any) => j.status === 'OFFER').length,
        REJECTED: all.filter((j: any) => j.status === 'REJECTED').length,
      },
      responseRate: all.length > 0 ? ((all.filter((j: any) => j.status !== 'APPLIED').length / all.length) * 100).toFixed(1) : '0',
    };
  }
}

export const jobService = new JobService();
