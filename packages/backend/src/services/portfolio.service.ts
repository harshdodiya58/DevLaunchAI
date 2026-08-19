import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { aiService } from './ai.service';

export class PortfolioService {
  async getBySlug(slug: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { slug },
      include: {
        user: {
          select: { name: true, email: true, avatarUrl: true, profile: true },
        },
      },
    });
    if (!portfolio) throw new AppError(404, 'PORTFOLIO_NOT_FOUND', 'Portfolio not found');
    if (!portfolio.isPublic) throw new AppError(403, 'PORTFOLIO_PRIVATE', 'This portfolio is private');

    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { viewCount: { increment: 1 } },
    });

    return portfolio;
  }

  async getMyPortfolio(userId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, email: true, avatarUrl: true, profile: true, resumes: { where: { isDefault: true }, take: 1 } },
        },
      },
    });
    if (!portfolio) throw new AppError(404, 'PORTFOLIO_NOT_FOUND', 'Portfolio not found');
    return portfolio;
  }

  async update(userId: string, data: { slug?: string; isPublic?: boolean; sections?: Record<string, unknown> }) {
    if (data.slug) {
      const existing = await prisma.portfolio.findUnique({ where: { slug: data.slug } });
      if (existing && existing.userId !== userId) {
        throw new AppError(409, 'SLUG_TAKEN', 'This portfolio URL is already taken');
      }
    }

    const portfolio = await prisma.portfolio.update({
      where: { userId },
      data: data as any,
    });
    return portfolio;
  }

  async generateBio(userId: string, resumeText?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    const result = await aiService.generatePortfolioBio({
      name: user.name,
      skills: (user.profile?.skills as string[]) || [],
      experience: user.profile?.bio || '',
      targetRole: user.profile?.targetRole || 'Software Engineer',
      resumeText,
    });

    try {
      const match = result.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON object found in response");
      return JSON.parse(match[0]);
    } catch (err) {
      console.error('Failed to parse AI bio response:', result);
      throw new AppError(500, 'AI_PARSE_ERROR', 'Failed to parse AI response');
    }
  }
}

export const portfolioService = new PortfolioService();
