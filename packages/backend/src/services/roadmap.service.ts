import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const defaultRoadmaps = [
  {
    title: 'Frontend Developer',
    category: 'FRONTEND',
    description: 'Master HTML, CSS, JavaScript, React, and modern frontend tools',
    nodes: [
      { id: 'html-css', title: 'HTML & CSS Fundamentals', resources: ['MDN Web Docs', 'freeCodeCamp Responsive Web Design'], duration: '2 weeks' },
      { id: 'javascript', title: 'JavaScript Core Concepts', resources: ['JavaScript.info', 'You Don\'t Know JS'], duration: '4 weeks' },
      { id: 'git', title: 'Git & Version Control', resources: ['GitHub Skills', 'Pro Git Book'], duration: '1 week' },
      { id: 'react-basics', title: 'React Fundamentals', resources: ['React Docs', 'Epic React'], duration: '4 weeks' },
      { id: 'state-mgmt', title: 'State Management', resources: ['Zustand Docs', 'Redux Toolkit Docs'], duration: '2 weeks' },
      { id: 'testing', title: 'Frontend Testing', resources: ['Vitest', 'React Testing Library'], duration: '2 weeks' },
      { id: 'typescript', title: 'TypeScript for Frontend', resources: ['TypeScript Handbook', 'Total TypeScript'], duration: '2 weeks' },
      { id: 'advanced-react', title: 'Advanced React Patterns', resources: ['React Patterns', 'Advanced React Course'], duration: '2 weeks' },
    ],
  },
  {
    title: 'Backend Developer',
    category: 'BACKEND',
    description: 'Build robust server-side applications with Node.js, databases, and APIs',
    nodes: [
      { id: 'node-basics', title: 'Node.js Fundamentals', resources: ['Node.js Docs', 'The Odin Project'], duration: '3 weeks' },
      { id: 'express', title: 'Express.js & REST APIs', resources: ['Express Docs', 'REST API Tutorial'], duration: '2 weeks' },
      { id: 'databases', title: 'Databases (SQL & NoSQL)', resources: ['PostgreSQL Tutorial', 'MongoDB University'], duration: '3 weeks' },
      { id: 'authentication', title: 'Authentication & Authorization', resources: ['JWT.io', 'Passport.js Docs'], duration: '2 weeks' },
      { id: 'testing-backend', title: 'Backend Testing', resources: ['Jest', 'Supertest'], duration: '1 week' },
      { id: 'docker', title: 'Docker & Containerization', resources: ['Docker Docs', 'Docker Curriculum'], duration: '2 weeks' },
      { id: 'deployment', title: 'Deployment & DevOps', resources: ['AWS Basics', 'Railway Docs'], duration: '2 weeks' },
      { id: 'scaling', title: 'Performance & Scaling', resources: ['System Design Primer', 'High Scalability'], duration: '2 weeks' },
    ],
  },
  {
    title: 'Full Stack Developer',
    category: 'FULLSTACK',
    description: 'Become a complete full-stack developer capable of building entire applications',
    nodes: [
      { id: 'html-css-js', title: 'HTML, CSS & JavaScript', resources: ['MDN Web Docs', 'JavaScript.info'], duration: '4 weeks' },
      { id: 'frontend-framework', title: 'React or Next.js', resources: ['React Docs', 'Next.js Docs'], duration: '4 weeks' },
      { id: 'backend-node', title: 'Node.js & Express', resources: ['Node.js Docs', 'Express Docs'], duration: '3 weeks' },
      { id: 'database-full', title: 'Full-Stack Databases', resources: ['Prisma Docs', 'PostgreSQL Tutorial'], duration: '2 weeks' },
      { id: 'api-design', title: 'API Design & GraphQL', resources: ['REST API Design', 'Apollo GraphQL'], duration: '2 weeks' },
      { id: 'auth-security', title: 'Auth & Security', resources: ['OWASP Top 10', 'JWT Handbook'], duration: '2 weeks' },
      { id: 'deploy-full', title: 'Deployment & CI/CD', resources: ['Vercel Docs', 'GitHub Actions'], duration: '2 weeks' },
      { id: 'monitoring', title: 'Monitoring & Observability', resources: ['Sentry Docs', 'Datadog Basics'], duration: '1 week' },
    ],
  },
  {
    title: 'DevOps Engineer',
    category: 'DEVOPS',
    description: 'Learn infrastructure, automation, CI/CD, and cloud platforms',
    nodes: [
      { id: 'linux', title: 'Linux Fundamentals', resources: ['Linux Journey', 'Ubuntu Tutorials'], duration: '2 weeks' },
      { id: 'networking', title: 'Networking Basics', resources: ['Computer Networking Course', 'Khan Academy'], duration: '2 weeks' },
      { id: 'scripting', title: 'Scripting (Bash/Python)', resources: ['Bash Guide', 'Python Automate'], duration: '2 weeks' },
      { id: 'docker-devops', title: 'Docker & Kubernetes', resources: ['Docker Docs', 'Kubernetes Basics'], duration: '4 weeks' },
      { id: 'cicd', title: 'CI/CD Pipelines', resources: ['GitHub Actions', 'Jenkins Docs'], duration: '2 weeks' },
      { id: 'cloud', title: 'Cloud Platforms (AWS/GCP)', resources: ['AWS Free Tier', 'Google Cloud Skills Boost'], duration: '4 weeks' },
      { id: 'iac', title: 'Infrastructure as Code', resources: ['Terraform Docs', 'Ansible Docs'], duration: '2 weeks' },
      { id: 'monitoring-devops', title: 'Monitoring & Logging', resources: ['Prometheus Docs', 'Grafana Tutorials'], duration: '2 weeks' },
    ],
  },
  {
    title: 'Machine Learning Engineer',
    category: 'ML',
    description: 'Learn ML fundamentals, deep learning, and MLOps',
    nodes: [
      { id: 'python-ml', title: 'Python for ML', resources: ['Python.org', 'NumPy Docs'], duration: '2 weeks' },
      { id: 'math-ml', title: 'Math for ML (Linear Algebra, Calculus)', resources: ['3Blue1Brown', 'Khan Academy'], duration: '3 weeks' },
      { id: 'ml-fundamentals', title: 'ML Fundamentals', resources: ['Andrew Ng ML Course', 'Scikit-learn Docs'], duration: '4 weeks' },
      { id: 'deep-learning', title: 'Deep Learning', resources: ['Fast.ai', 'PyTorch Tutorials'], duration: '4 weeks' },
      { id: 'nlp-cv', title: 'NLP & Computer Vision', resources: ['Hugging Face Course', 'CS231n'], duration: '3 weeks' },
      { id: 'mlops', title: 'MLOps & Deployment', resources: ['MLflow Docs', 'BentoML'], duration: '2 weeks' },
    ],
  },
];

export class RoadmapService {
  async getAll() {
    return prisma.roadmap.findMany({ where: { isPublished: true } });
  }

  async seedDefaultRoadmaps() {
    const count = await prisma.roadmap.count();
    if (count > 0) return;

    for (const roadmap of defaultRoadmaps) {
      await prisma.roadmap.create({
        data: { ...roadmap, isPublished: true },
      });
    }
  }

  async getById(roadmapId: string) {
    const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap) throw new AppError(404, 'ROADMAP_NOT_FOUND', 'Roadmap not found');
    return roadmap;
  }

  async getUserProgress(userId: string, roadmapId: string) {
    await this.getById(roadmapId);

    let progress = await prisma.userRoadmapProgress.findUnique({
      where: { userId_roadmapId: { userId, roadmapId } },
    });

    if (!progress) {
      progress = await prisma.userRoadmapProgress.create({
        data: { userId, roadmapId, completedNodes: [], percentComplete: 0 },
      });
    }

    return progress;
  }

  async updateProgress(userId: string, roadmapId: string, nodeId: string, completed: boolean) {
    await this.getById(roadmapId);

    const progress = await this.getUserProgress(userId, roadmapId);
    const completedNodes: string[] = (progress.completedNodes as string[]) || [];

    const updatedNodes = completed
      ? [...new Set([...completedNodes, nodeId])]
      : completedNodes.filter(id => id !== nodeId);

    const roadmap = await this.getById(roadmapId);
    const nodes = roadmap.nodes as any[];
    const percentComplete = nodes.length > 0
      ? Math.round((updatedNodes.length / nodes.length) * 100)
      : 0;

    return prisma.userRoadmapProgress.update({
      where: { userId_roadmapId: { userId, roadmapId } },
      data: { completedNodes: updatedNodes, percentComplete },
    });
  }
}

export const roadmapService = new RoadmapService();
