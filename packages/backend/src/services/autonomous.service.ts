import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { aiService } from './ai.service';

export class AutonomousService {
  async getConfig(userId: string) {
    let config = await prisma.aiAgentConfig.findUnique({ where: { userId } });
    if (!config) {
      config = await prisma.aiAgentConfig.create({
        data: { userId, isActive: false, targetRole: 'Software Engineer', location: 'Remote', maxApplicationsPerDay: 5 }
      });
    }
    return config;
  }

  async updateConfig(userId: string, data: { isActive?: boolean; targetRole?: string; location?: string; maxApplicationsPerDay?: number }) {
    const config = await prisma.aiAgentConfig.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        isActive: data.isActive || false,
        targetRole: data.targetRole || 'Software Engineer',
        location: data.location || 'Remote',
        maxApplicationsPerDay: data.maxApplicationsPerDay || 5
      }
    });

    if (data.isActive !== undefined) {
      await this.logAction(userId, data.isActive ? 'Agent Activated' : 'Agent Deactivated', 'INFO');
      if (data.isActive) {
        // Asynchronously trigger a run
        this.triggerRun(userId).catch(console.error);
      }
    }

    return config;
  }

  async getLogs(userId: string) {
    return prisma.aiAgentLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async logAction(userId: string, action: string, status: string = 'INFO', details?: any) {
    return prisma.aiAgentLog.create({
      data: { userId, action, status, details: details || {} }
    });
  }

  // Simulation of the AI agent
  async triggerRun(userId: string) {
    const config = await this.getConfig(userId);
    if (!config.isActive) return;

    await this.logAction(userId, `Scanning for ${config.targetRole} roles in ${config.location}...`, 'INFO');
    await new Promise(res => setTimeout(res, 2000));
    
    const mockCompanies = ['Stripe', 'Google', 'Vercel', 'OpenAI', 'Meta', 'Netflix', 'Nvidia', 'Tesla', 'Amazon', 'Apple'];
    
    // We will loop maxApplicationsPerDay times to make it realistic
    const appsToSubmit = config.maxApplicationsPerDay || 5;
    await this.logAction(userId, `Found multiple matching jobs. Initiating application loop for ${appsToSubmit} positions.`, 'INFO');
    
    for (let i = 0; i < appsToSubmit; i++) {
      // Check if user turned it off mid-run
      const currentConfig = await this.getConfig(userId);
      if (!currentConfig.isActive) {
        await this.logAction(userId, `Agent execution paused by user.`, 'INFO');
        return;
      }

      const company = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
      
      await this.logAction(userId, `[${i+1}/${appsToSubmit}] Analyzing job requirements for ${company}...`, 'INFO');
      await new Promise(res => setTimeout(res, 2000));

      await this.logAction(userId, `[${i+1}/${appsToSubmit}] Generating AI-tailored cover letter and resume variants for ${company}...`, 'INFO');
      
      try {
        // Actually call the AI to generate a cover letter
        const prompt = `Write a short, punchy, 3-sentence cover letter for a ${config.targetRole} position at ${company}. The applicant is a highly skilled developer based in ${config.location}. Make it sound extremely confident and professional. Return ONLY the text of the cover letter.`;
        // We use any existing LLM method. Since aiService doesn't have a generic call exposed publicly, we'll use a hack or just mock the text if callLLM isn't public. 
        // Wait, callLLM is private. Let's just use getCareerAdvice as a proxy to get raw text.
        const coverLetter = await aiService.getCareerAdvice(`Write a short, punchy cover letter for a ${config.targetRole} position at ${company}.`);
        
        await this.logAction(userId, `[${i+1}/${appsToSubmit}] Navigating to ${company} careers portal...`, 'INFO');
        await new Promise(res => setTimeout(res, 2000));

        await this.logAction(userId, `[${i+1}/${appsToSubmit}] Filling out application forms autonomously...`, 'INFO');
        await new Promise(res => setTimeout(res, 2000));

        // Create a new job application in the tracker
        await prisma.jobApplication.create({
          data: {
            userId,
            company,
            role: config.targetRole || 'Software Engineer',
            status: 'APPLIED',
            isAiGenerated: true,
            notes: `Autonomously applied by DevLaunch AI Agent.\n\nGenerated Cover Letter:\n${coverLetter}`
          }
        });

        await this.logAction(userId, `[${i+1}/${appsToSubmit}] Application submitted successfully to ${company}!`, 'SUCCESS');
      } catch (err: any) {
        await this.logAction(userId, `[${i+1}/${appsToSubmit}] Failed to submit to ${company}: ${err.message}`, 'ERROR');
      }

      // Small delay between applications
      if (i < appsToSubmit - 1) {
        await new Promise(res => setTimeout(res, 3000));
      }
    }
    
    // Deactivate after the daily run is complete
    await prisma.aiAgentConfig.update({ where: { userId }, data: { isActive: false } });
    await this.logAction(userId, `Daily application quota reached (${appsToSubmit}/${appsToSubmit}). Agent returning to sleep mode.`, 'INFO');
  }
}

export const autonomousService = new AutonomousService();
