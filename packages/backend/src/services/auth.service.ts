import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../validators/auth';

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        profile: { create: {} },
        portfolio: { create: { slug: input.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 6) } },
      },
      select: { id: true, email: true, name: true, role: true },
    });

    const tokens = this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.passwordHash) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const tokens = this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new AppError(401, 'REFRESH_EXPIRED', 'Refresh token expired, please login again');
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const tokens = this.generateTokens(stored.user);
    await this.storeRefreshToken(stored.user.id, tokens.refreshToken);

    return { user: stored.user, ...tokens };
  }

  async logout(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, role: true, avatarUrl: true, isVerified: true,
        profile: true,
      },
    });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    return user;
  }

  async updateProfile(userId: string, data: {
    name?: string;
    avatarUrl?: string;
    headline?: string;
    bio?: string;
    targetRole?: string;
    location?: string;
    linkedinUrl?: string;
    githubUsername?: string;
    websiteUrl?: string;
    skills?: string[];
  }) {
    const {
      name,
      avatarUrl,
      headline,
      bio,
      targetRole,
      location,
      linkedinUrl,
      githubUsername,
      websiteUrl,
      skills,
    } = data;

    const profileFields = {
      ...(headline !== undefined ? { headline } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(targetRole !== undefined ? { targetRole } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(linkedinUrl !== undefined ? { linkedinUrl } : {}),
      ...(githubUsername !== undefined ? { githubUsername } : {}),
      ...(websiteUrl !== undefined ? { websiteUrl } : {}),
      ...(skills !== undefined ? { skills } : {}),
    };
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        profile: {
          upsert: {
            create: profileFields,
            update: profileFields,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        profile: true,
      },
    });

    return user;
  }

  private generateTokens(user: { id: string; email: string; role: string }) {
    const payload = { userId: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  }
}

export const authService = new AuthService();
