import { prisma } from '../config/database';
import { aiService } from './ai.service';
import { AppError } from '../middleware/errorHandler';

export class SkillGapService {
  async analyze(userId: string, targetRole: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, resumes: { where: { isDefault: true }, take: 1 } },
    });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    const skills = (user.profile?.skills as string[]) || [];
    if (skills.length === 0) {
      throw new AppError(400, 'NO_SKILLS', 'Please add skills to your profile first');
    }

    const resumeText = user.resumes[0]?.content ? JSON.stringify(user.resumes[0].content) : undefined;

    const result = await aiService.performSkillGapAnalysis(skills, targetRole, resumeText);
    return JSON.parse(result);
  }

  async updateSkills(userId: string, skills: string[]) {
    await prisma.profile.upsert({
      where: { userId },
      update: { skills },
      create: { userId, skills },
    });
  }
}

export const skillGapService = new SkillGapService();
