import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import { cacheService } from '../utils/cache';
import crypto from 'crypto';

const aiClient = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;

export class AIService {
  private getClient(): GoogleGenAI {
    if (!aiClient) {
      throw new AppError(503, 'AI_UNAVAILABLE', 'AI service is not configured');
    }
    return aiClient;
  }

  async improveBulletPoint(bullet: string, context: { role?: string; company?: string }) {
    const prompt = `You are an expert resume writer. Improve the following bullet point to be more impactful, quantified, and ATS-friendly.

Role: ${context.role || 'N/A'}
Company: ${context.company || 'N/A'}

Original: "${bullet}"

Respond ONLY with a JSON object:
{
  "improved": "the improved bullet point",
  "reasoning": "brief explanation of changes",
  "keywordsAdded": ["keyword1", "keyword2"]
}`;

    return this.callLLM(prompt);
  }

  async generateProfessionalSummary(profile: {
    name: string; skills: string[]; experience: string; targetRole: string; currentSummary?: string;
  }) {
    const prompt = `You are a professional resume writer. Generate a compelling professional summary.

Name: ${profile.name}
Skills: ${profile.skills.join(', ')}
Experience: ${profile.experience}
Target Role: ${profile.targetRole}
${profile.currentSummary ? `Current Draft/Input: "${profile.currentSummary}"\n(Please rewrite, expand, and professionalize this draft into a 2-3 sentence summary)` : ''}

Respond ONLY with a JSON object:
{
  "summary": "2-3 sentence professional summary",
  "tone": "professional",
  "keywordsIncorporated": ["keyword1", "keyword2"]
}`;

    return this.callLLM(prompt);
  }

  async analyzeATS(resumeText: string, jobDescription?: string) {
    const prompt = `You are an enterprise Applicant Tracking System (ATS) parsing bot and HR expert. Analyze this resume and provide a highly accurate compatibility score and detailed feedback.

Resume:
${resumeText.substring(0, 8000)}
${jobDescription ? `\nJob Description:\n${jobDescription.substring(0, 4000)}` : ''}

SCORING RULES (CRITICAL):
1. Evaluate three categories: "format" (structure/parsing), "keywords" (matching JD skills), and "content" (impact/metrics).
2. Assign a score from 0-100 for each category.
3. The overall "score" MUST NOT be a random number. It MUST be a logical reflection of the three category scores.
   - Normally, the overall score is the exact average of format, keywords, and content.
   - However, if the "format" score is extremely low (e.g. under 40) because it's a massive unformatted text block, you MUST heavily penalize the overall score (e.g. max 35/100), because real ATS systems will instantly reject unparseable resumes regardless of keywords.

Respond ONLY with a JSON object:
{
  "score": 0-100,
  "sectionScores": { "format": 0-100, "keywords": 0-100, "content": 0-100 },
  "issues": [{ "section": "string", "issue": "string", "severity": "high|medium|low", "suggestion": "string" }],
  "missingKeywords": ["keyword1"],
  "strengths": ["strength1"]
}`;

    return this.callLLM(prompt, false);
  }

  async enhanceResumeForATS(resumeText: string, jobDescription?: string, atsIssues?: any) {
    const jobText = jobDescription ? `Target Job Description:\n${jobDescription.substring(0, 4000)}\n` : '';
    const issuesText = atsIssues ? `Previous ATS Feedback to fix:\n${JSON.stringify(atsIssues).substring(0, 2000)}\n` : '';
    const prompt = `You are an expert ATS (Applicant Tracking System) optimizer and professional resume writer.
I have a raw resume and (optionally) a target job description and ATS feedback.
Your goal is to completely rewrite and format the resume to be highly ATS-friendly, professional, and impactful.

Raw Resume:
${resumeText.substring(0, 8000)}

${jobText}
${issuesText}
Please rewrite the resume. Ensure:
1. The very first line is the applicant's Name as an H1 heading (# Name).
2. The second line is the contact info separated by " | " (e.g. City, State | Phone | Email | Links).
3. Clear standard sections: ## Professional Summary, ## Skills, ## Experience, ## Education, ## Projects.
4. In the Skills section, format it as a bulleted list where each category is a separate bullet (e.g., "- **Languages:** JavaScript, HTML\n- **Frameworks:** React, Next.js").
5. For Experience and Projects, use H3 for the title line (e.g., "### Company Name | Role | Dates | Location").
6. Bullets are quantified and start with strong action verbs.
7. Relevant keywords from the job description are naturally integrated.
8. The formatting is strictly clean markdown.

Respond ONLY with a JSON object:
{
  "enhancedResume": "the full markdown-formatted rewritten resume text",
  "improvementsMade": ["string"]
}`;

    return this.callLLM(prompt, false);
  }

  async conductInterview(params: {
    type: string; domain: string; question: string; answer: string; history?: { q: string; a: string }[];
  }) {
    const prompt = `You are a friendly, expert technical interviewer at a top tech company conducting a live verbal interview.
Evaluate the candidate's spoken answer. Your feedback must sound conversational, natural, and encouraging, exactly as if you were speaking it aloud in a real Google or Apple interview. Do NOT use markdown formatting, bullet points, or complex punctuation in the 'spokenFeedback' field, just write it as a spoken script.

Interview Type: ${params.type}
Domain: ${params.domain}
Question: "${params.question}"
Candidate's Answer: "${params.answer}"
${params.history ? `Previous Q&A: ${JSON.stringify(params.history)}` : ''}

Respond ONLY with a JSON object:
{
  "score": 0-10,
  "feedback": {
    "correctness": { "score": 0-10, "comment": "string" },
    "clarity": { "score": 0-10, "comment": "string" },
    "depth": { "score": 0-10, "comment": "string" },
    "communication": { "score": 0-10, "comment": "string" }
  },
  "spokenFeedback": "Write the exact conversational script you will speak back to the candidate here. Acknowledge what they said, give them a hint or correction if needed, and smoothly transition to the next question. Maximum 3-4 sentences.",
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "followUpQuestion": "string (the exact spoken follow-up question)",
  "suggestedResources": ["string"]
}`;

    return this.callLLM(prompt);
  }

  async performSkillGapAnalysis(userSkills: string[], targetRole: string, resumeText?: string) {
    const prompt = `You are a career coach specializing in tech roles. Analyze the skill gap.

Current Skills: ${userSkills.join(', ')}
Target Role: ${targetRole}
${resumeText ? `Resume Context: ${resumeText.substring(0, 3000)}` : ''}

Respond ONLY with a JSON object:
{
  "readinessScore": 0-100,
  "matchingSkills": ["string"],
  "missingSkills": [{ "skill": "string", "priority": "high|medium|low", "learningResources": ["string"] }],
  "recommendedPath": ["step1", "step2"],
  "estimatedPreparationTime": "string"
}`;

    return this.callLLM(prompt);
  }

  async generateStudyPlan(params: {
    targetRole: string; targetDate: string; availableHoursPerWeek: number; currentSkills: string[];
  }) {
    const prompt = `You are a study planner for software engineering interview preparation. Create a weekly plan.

Target Role: ${params.targetRole}
Target Date: ${params.targetDate}
Available Hours/Week: ${params.availableHoursPerWeek}
Current Skills: ${params.currentSkills.join(', ')}

Respond ONLY with a JSON object:
{
  "weeklyPlan": [{ "week": 1, "focus": "string", "topics": ["string"], "estimatedHours": 0, "resources": ["string"] }],
  "totalEstimatedHours": 0,
  "recommendedDailyRoutine": "string"
}`;

    return this.callLLM(prompt);
  }

  async getCareerAdvice(question: string, context?: { skills?: string[]; targetRole?: string }) {
    const prompt = `You are DevLaunch AI — a highly specialized, strict AI assistant built exclusively for the DevLaunch platform. DevLaunch is a developer career operating system that helps software engineers and tech professionals with: resume building, ATS optimization, mock interview preparation, job application tracking, coding practice, skill gap analysis, and career growth strategy.

YOUR CORE IDENTITY RULES (NON-NEGOTIABLE):
1. You ONLY answer questions that fall within these allowed topics:
   - Resume writing, formatting, ATS optimization, and review
   - Job searching, job applications, cover letters, job pipeline tracking
   - Technical interview preparation (DSA, system design, behavioral, coding rounds)
   - Career advice for software engineers, developers, and tech professionals
   - Skill gap analysis, learning roadmaps, and study plans for tech roles
   - Salary negotiation and offer evaluation for tech jobs
   - LinkedIn profiles, professional branding for developers
   - DevLaunch platform features (how to use DevLaunch tools)
   - Technologies, frameworks, and programming languages as they relate to career

2. STRICTLY FORBIDDEN TOPICS — you must NEVER answer questions about:
   - General knowledge, trivia, history, geography, science not related to tech careers
   - Entertainment, movies, music, sports, gaming, food, travel
   - Politics, religion, philosophy, or any social issues
   - Medical advice, legal advice, financial investment advice
   - Creative writing, poetry, jokes, stories unrelated to careers
   - Any topic that a general-purpose AI would answer but is unrelated to tech careers or DevLaunch

3. HOW TO HANDLE OFF-TOPIC QUESTIONS:
   - If the user asks anything outside the allowed topics, DO NOT attempt to answer it.
   - Instead, respond ONLY with this JSON structure with a polite, friendly redirect message.
   - Keep the redirect warm but firm — remind them what DevLaunch is for.

4. TOPIC DETECTION (think carefully before responding):
   - Ask yourself: "Is this question about helping a developer or tech professional advance their career?"
   - If YES → answer it fully and helpfully
   - If NO → return the off-topic redirect response

${context ? `User Context:
- Skills: ${context.skills?.join(', ') || 'Not provided'}
- Target Role: ${context.targetRole || 'Not provided'}` : ''}

User's Message: "${question}"

RESPONSE FORMAT RULES:
- If the question IS on-topic: Respond with a thorough, well-structured, markdown-formatted answer as a world-class tech career mentor. Be specific, actionable, and encouraging. End with a follow-up question if appropriate.
- If the question is OFF-TOPIC: Respond ONLY with this exact JSON:
{
  "offTopic": true,
  "message": "Hey! 👋 I'm DevLaunch AI — your dedicated tech career assistant. I'm specially trained to help you with things like **resume building**, **ATS optimization**, **interview prep**, **job search strategies**, and **tech career growth**. \\n\\nI'm not able to help with that topic, but I'd love to help you level up your career! Try asking me something like:\\n- *'How do I prepare for a system design interview?'*\\n- *'Can you review my resume bullet points?'*\\n- *'What skills do I need to become a Senior Engineer?'*"
}

Deliver your response now:`;

    return this.callLLM(prompt, false);
  }

  async generatePortfolioBio(profile: {
    name: string; skills: string[]; experience: string; targetRole: string; resumeText?: string;
  }) {
    const prompt = `You are a professional portfolio writer and builder. Generate a complete, highly structured portfolio based on the user's details and resume content.

Name: ${profile.name}
Skills: ${profile.skills.join(', ')}
Target Role: ${profile.targetRole}
Resume Content: ${profile.resumeText || profile.experience}

Extract and organize the information into the following JSON structure. If information is missing for a section, return an empty array for it.
IMPORTANT: Always extract "targetRole" (the user's current or desired job title) and "location" (their city/region) from the resume text. If not found, use sensible defaults based on context.

Respond ONLY with a JSON object:
{
  "bio": "A compelling 3-4 sentence professional bio.",
  "fullName": "The user's full name extracted from the resume (e.g. 'John Doe').",
  "tagline": "A punchy, one-line catchy tagline (e.g. 'Building scalable web applications with React & Node.js').",
  "targetRole": "The user's primary job title extracted from resume (e.g. 'Full Stack Developer')",
  "location": "The user's location extracted from resume (e.g. 'Mumbai, India')",
  "projects": [
    {
      "title": "Project Name",
      "description": ["Bullet point 1", "Bullet point 2"],
      "techStack": ["React", "Node.js"],
      "link": "URL if available"
    }
  ],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "duration": "May 2025 - June 2025",
      "location": "Hybrid/Remote",
      "description": ["Accomplishment 1", "Accomplishment 2"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Technology",
      "institution": "University Name",
      "duration": "2024 - 2027",
      "score": "8.06 CGPA"
    }
  ]
}`;

    return this.callLLM(prompt, true);
  }

  private async callLLM(prompt: string, isJson: boolean = true, retries: number = 3): Promise<any> {
    const cacheKey = `llm:${crypto.createHash('sha256').update(prompt + isJson.toString()).digest('hex')}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return isJson ? JSON.parse(cached) : cached;
    }

    try {
      const client = this.getClient();
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          ...(isJson && { responseMimeType: "application/json" })
        }
      });

      const rawText = response.text || '';
      
      if (!isJson) {
        await cacheService.set(cacheKey, rawText, 60 * 60 * 24 * 7); // Cache for 7 days
        return rawText;
      }

      try {
        // Strip markdown code fences Gemini sometimes wraps JSON in
        let jsonText = rawText.trim();
        const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (fenceMatch) jsonText = fenceMatch[1].trim();
        const result = JSON.parse(jsonText);
        await cacheService.set(cacheKey, JSON.stringify(result), 60 * 60 * 24 * 7); // Cache JSON for 7 days
        return result;
      } catch (parseError) {
        // If JSON mode is on but parse fails, return raw text as fallback instead of throwing
        console.warn('JSON parse failed, returning raw text:', parseError);
        return rawText;
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      // If we hit a 503, 429, or fetch failed and have retries left, wait and try again
      if (retries > 0 && (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('429') || errorMessage.includes('fetch failed') || errorMessage.includes('socket hang up') || errorMessage.includes('ECONNRESET'))) {
        console.warn(`AI Service high demand/network error. Retrying in 2 seconds... (${retries} retries left) - ${errorMessage}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.callLLM(prompt, isJson, retries - 1);
      }

      console.error('FULL AI ERROR:', error);
      logger.error('AI service error:', errorMessage);
      throw new AppError(503, 'AI_SERVICE_ERROR', 'AI service temporarily unavailable: ' + errorMessage);
    }
  }

  async extractTextFromPDF(buffer: Buffer, mimeType: string): Promise<string> {
    try {
      const client = this.getClient();
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          'Extract all the readable text from this document exactly as it is written. Do not summarize or add markdown, just return the raw text block.',
          { inlineData: { data: buffer.toString('base64'), mimeType } }
        ]
      });
      return response.text || '';
    } catch (error) {
      console.error('Gemini PDF Extraction Error:', error);
      return '';
    }
  }

  async generateProjectBlueprint(idea: string) {
    const prompt = `You are a Staff-Level Software Architect. The user wants to build the following project: "${idea}".
Generate a complete, production-ready system design blueprint.

Respond ONLY with a JSON object exactly matching this schema:
{
  "title": "A catchy name for the project",
  "summary": "1-2 paragraph executive summary",
  "mermaidArchitecture": "graph TD\\n  A[\\\"Client\\\"] --> B[\\\"API Gateway\\\"]\\n...", // Write raw mermaid.js flowchart code representing the architecture (use graph TD, no markdown backticks). CRITICAL: All node labels MUST be enclosed in double quotes (e.g. A["Label"]).
  "techStack": {
    "frontend": ["Tech 1", "Tech 2"],
    "backend": ["Tech 1", "Tech 2"],
    "database": ["Tech 1", "Tech 2"],
    "devops": ["Tech 1"]
  },
  "databaseSchema": "Write a brief markdown representation of the key tables/collections.",
  "kanbanSprints": [
    {
      "sprintName": "Sprint 1: Foundation",
      "tasks": [
        { "title": "Setup repo", "description": "Initialize monorepo", "difficulty": "Low" }
      ]
    }
  ]
}`;

    return this.callLLM(prompt);
  }

  async simulateInterviewTurn(data: { role: 'INTERVIEWER' | 'CANDIDATE', jobDescription: string, resumeText?: string, history: { role: string, content: string }[] }) {
    let prompt = '';

    if (data.role === 'INTERVIEWER') {
      prompt = `You are an expert, strict Technical Interviewer. 
You are interviewing a candidate for the following Job Description:
---
${data.jobDescription}
---
Review the chat history and ask ONE single follow-up question. Do not evaluate them yet, just ask the question exactly as if you were speaking to them. Be concise.

Chat History:
${data.history.map(h => `${h.role}: ${h.content}`).join('\\n')}

Your response (just the question/text to say):`;
    } else {
      prompt = `You are a job candidate. You are trying to pass a technical interview for the following Job Description:
---
${data.jobDescription}
---
Your true skills and background are defined by this Resume:
---
${data.resumeText || 'Junior Developer with some React and Node experience'}
---
Review the chat history, especially the last question from the INTERVIEWER, and answer it as realistically as possible based ONLY on your resume. If you don't know something, admit it or relate it to something you do know. Be concise, spoken-word style.

Chat History:
${data.history.map(h => `${h.role}: ${h.content}`).join('\\n')}

Your response (just the text to say):`;
    }

    const response = await this.callLLM(prompt);
    return response.trim();
  }
}

export const aiService = new AIService();
