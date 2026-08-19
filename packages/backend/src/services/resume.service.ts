import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class ResumeService {
  async list(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, version: true, atsScore: true, isDefault: true, updatedAt: true },
    });
  }

  async getById(userId: string, resumeId: string) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });
    if (!resume) throw new AppError(404, 'RESUME_NOT_FOUND', 'Resume not found');
    return resume;
  }

  async create(userId: string, data: { title: string; content: Record<string, unknown> }) {
    const resume = await prisma.resume.create({
      data: { userId, title: data.title, content: data.content as any },
    });
    return resume;
  }

  async update(userId: string, resumeId: string, data: { title?: string; content?: Record<string, unknown> }) {
    await this.getById(userId, resumeId);
    const resume = await prisma.resume.update({
      where: { id: resumeId },
      data: data as any,
    });
    return resume;
  }

  async delete(userId: string, resumeId: string) {
    await this.getById(userId, resumeId);
    await prisma.resume.delete({ where: { id: resumeId } });
  }

  async setDefault(userId: string, resumeId: string) {
    await this.getById(userId, resumeId);
    await prisma.resume.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    await prisma.resume.update({
      where: { id: resumeId },
      data: { isDefault: true },
    });
  }

  async duplicate(userId: string, resumeId: string) {
    const original = await this.getById(userId, resumeId);
    const resume = await prisma.resume.create({
      data: {
        userId,
        title: `${original.title} (Copy)`,
        content: original.content as any,
        version: original.version + 1,
      },
    });
    return resume;
  }
}

export const resumeService = new ResumeService();
