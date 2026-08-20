import { prisma } from '../config/database';
import { aiService } from './ai.service';
import { AppError } from '../middleware/errorHandler';

const interviewQuestions: Record<string, string[]> = {
  DSA: [
    'Explain the difference between an array and a linked list. When would you use one over the other?',
    'What is time complexity and why does it matter? Explain Big O notation with examples.',
    'Describe how a hash table works internally. How do you handle collisions?',
    'Explain depth-first search vs breadth-first search. When would you choose one?',
    'What is dynamic programming? Explain the concept of memoization with an example.',
  ],
  FRONTEND: [
    'Explain the virtual DOM and how React uses it to optimize rendering.',
    'What is the difference between controlled and uncontrolled components in React?',
    'How does CSS specificity work? Give an example of a high-specificity selector.',
    'Explain closures in JavaScript with a practical example.',
    'What are React hooks? Explain useState and useEffect with side effects.',
  ],
  BACKEND: [
    'Explain RESTful API design principles. What makes an API RESTful?',
    'What is database indexing and how does it improve query performance?',
    'Explain the difference between SQL and NoSQL databases. When would you use each?',
    'What is middleware in Express.js? Give examples of common middleware.',
    'Explain how JWT authentication works step by step.',
  ],
  'SYSTEM DESIGN': [
    'Design a URL shortening service like TinyURL. Walk through your architecture.',
    'How would you design a real-time chat application for 1 million users?',
    'Explain how you would design a rate limiter for a distributed system.',
    'Design the backend for a social media news feed. Consider scale and latency.',
    'How would you design a distributed caching system?',
  ],
  'FULL STACK': [
    'Explain the architecture of a full-stack application you have built.',
    'How do you handle state management in a large React application?',
    'Describe your approach to handling API errors gracefully on the frontend.',
    'How would you implement real-time updates in a web application?',
    'Explain the concept of CORS. When does it occur and how do you fix it?',
  ],
  GENERAL: [
    'Tell me about a time you had a conflict with a coworker and how you resolved it.',
    'Describe a situation where you had to meet a tight deadline. How did you handle the pressure?',
    'What is your greatest weakness, and how are you working to improve it?',
    'Tell me about a time you failed or made a significant mistake. What did you learn?',
    'Why do you want to work for our company, and what unique value can you bring?',
  ],
};

export class InterviewService {
  async startSession(userId: string, type: string, domain: string) {
    const normalizedDomain = domain.toUpperCase();
    const questions = interviewQuestions[normalizedDomain] || interviewQuestions['FULL STACK'];
    const sessionQuestions = questions.slice(0, 3).map(q => ({ question: q, answer: null, feedback: null }));

    const session = await prisma.interviewSession.create({
      data: {
        userId,
        type: type.toUpperCase() as any,
        domain,
        questionAnswers: sessionQuestions,
      },
    });

    return {
      sessionId: session.id,
      currentQuestion: sessionQuestions[0],
      totalQuestions: sessionQuestions.length,
    };
  }

  async submitAnswer(userId: string, sessionId: string, questionIndex: number, answer: string) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new AppError(404, 'SESSION_NOT_FOUND', 'Interview session not found');

    const qa = session.questionAnswers as any[];
    if (questionIndex >= qa.length) {
      throw new AppError(400, 'SESSION_COMPLETE', 'All questions have been answered');
    }

    const currentQ = qa[questionIndex];
    const feedback = await aiService.conductInterview({
      type: session.type,
      domain: session.domain,
      question: currentQ.question,
      answer,
      history: qa.filter(q => q.feedback).map(q => ({ q: q.question, a: q.answer })),
    });

    let parsedFeedback = feedback;
    if (typeof feedback === 'string') {
      const cleanFeedback = feedback.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedFeedback = JSON.parse(cleanFeedback);
    }

    qa[questionIndex] = { ...currentQ, answer, feedback: parsedFeedback };
    const isComplete = qa.every(q => q.answer !== null);
    const overallScore = isComplete
      ? Math.round(qa.reduce((sum, q) => sum + (q.feedback?.score || 0), 0) / qa.length * 10)
      : null;

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        questionAnswers: qa,
        overallScore,
        feedback: isComplete ? JSON.stringify({ summary: 'Interview completed', details: qa.map(q => q.feedback) }) : undefined,
      },
    });

    const nextQuestion = questionIndex + 1 < qa.length ? qa[questionIndex + 1] : null;

    return {
      feedback: parsedFeedback,
      nextQuestion: nextQuestion ? { ...nextQuestion, index: questionIndex + 1 } : null,
      isComplete,
      overallScore,
    };
  }

  async getHistory(userId: string) {
    return prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, type: true, domain: true, overallScore: true, createdAt: true },
    });
  }

  async getSession(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new AppError(404, 'SESSION_NOT_FOUND', 'Interview session not found');
    return session;
  }
}

export const interviewService = new InterviewService();
