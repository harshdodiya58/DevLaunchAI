import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

export class GitHubService {
  private baseUrl = 'https://api.github.com';

  async getProfile(username: string) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${username}`);
      if (response.status === 404) {
        throw new AppError(404, 'GITHUB_NOT_FOUND', 'GitHub user not found. Please verify your username.');
      }
      if (response.status === 403) {
        throw new AppError(429, 'RATE_LIMITED', 'GitHub API rate limit exceeded. Please try again later.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('GitHub API error:', error);
      throw new AppError(502, 'GITHUB_ERROR', 'Failed to fetch GitHub profile');
    }
  }

  async getRepos(username: string) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${username}/repos?per_page=100&sort=updated`);
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      return response.json();
    } catch (error) {
      logger.error('GitHub repos error:', error);
      throw new AppError(502, 'GITHUB_ERROR', 'Failed to fetch GitHub repositories');
    }
  }

  async getContributions(username: string) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${username}/events?per_page=100`);
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      return response.json();
    } catch (error) {
      logger.error('GitHub events error:', error);
      throw new AppError(502, 'GITHUB_ERROR', 'Failed to fetch GitHub contributions');
    }
  }

  async getLanguages(repos: any[]): Promise<Record<string, number>> {
    const languages: Record<string, number> = {};
    for (const repo of repos.slice(0, 20)) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    }
    return languages;
  }

  async getAnalytics(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile?.githubUsername) {
      throw new AppError(400, 'GITHUB_NOT_CONFIGURED', 'GitHub username not set in profile');
    }

    const username = user.profile.githubUsername;
    const [profile, repos] = await Promise.all([
      this.getProfile(username),
      this.getRepos(username),
    ]);

    const languages = await this.getLanguages(repos);
    const topRepos = repos
      .sort((a: any, b: any) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 10)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
      }));

    const totalStars = topRepos.reduce((acc: number, r: any) => acc + (r.stars || 0), 0);
    const langCount = Object.keys(languages).length;
    
    // Score Calculation (Max 100)
    const followersScore = Math.min(20, profile.followers * 1);
    const reposScore = Math.min(30, profile.public_repos * 0.5);
    const starsScore = Math.min(40, totalStars * 2);
    const langScore = Math.min(10, langCount * 1);
    const overallScore = Math.round(followersScore + reposScore + starsScore + langScore);

    // Field Determination
    let field = 'Software Engineer';
    const langArray = Object.entries(languages).sort((a: any, b: any) => b[1] - a[1]);
    if (langArray.length > 0) {
      const topLang = langArray[0][0].toLowerCase();
      const frontend = ['javascript', 'typescript', 'html', 'css', 'vue', 'svelte'];
      const backend = ['python', 'java', 'go', 'ruby', 'php', 'c#', 'rust', 'c++', 'c'];
      const mobile = ['swift', 'kotlin', 'dart', 'objective-c'];
      
      if (frontend.includes(topLang)) {
        const hasBackend = langArray.some(([l, _]) => backend.includes(l.toLowerCase()));
        field = hasBackend ? 'Full Stack Developer' : 'Frontend Developer';
      } else if (backend.includes(topLang)) {
        field = 'Backend Developer';
      } else if (mobile.includes(topLang)) {
        field = 'Mobile Developer';
      } else if (topLang === 'jupyter notebook' || topLang === 'r') {
        field = 'Data Scientist';
      }
    }

    return {
      username: profile.login,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      languages,
      topRepos,
      profileUrl: profile.html_url,
      overallScore,
      field,
    };
  }

  async updateUsername(userId: string, username: string) {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { githubUsername: username },
      create: { userId, githubUsername: username },
    });
    return profile;
  }
}

export const githubService = new GitHubService();
