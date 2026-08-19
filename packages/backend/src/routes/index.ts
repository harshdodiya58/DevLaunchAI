import { Router } from 'express';
import authRoutes from './auth.routes';
import resumeRoutes from './resume.routes';
import { authenticate, authorize } from '../middleware/auth';
import { atsController } from '../controllers/ats.controller';
import { portfolioController } from '../controllers/portfolio.controller';
import { jobController } from '../controllers/job.controller';
import { interviewController } from '../controllers/interview.controller';
import { codingController } from '../controllers/coding.controller';
import { skillGapController } from '../controllers/skillgap.controller';
import { gitHubController } from '../controllers/github.controller';
import { dashboardController } from '../controllers/dashboard.controller';
import { chatController } from '../controllers/chat.controller';
import { adminController } from '../controllers/admin.controller';
import { roadmapController } from '../controllers/roadmap.controller';
import { autonomousController } from '../controllers/autonomous.controller';
import { architectController } from '../controllers/architect.controller';
import { simulatorController } from '../controllers/simulator.controller';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);

router.get('/dashboard/summary', authenticate, (req, res, next) => dashboardController.getSummary(req, res, next));

router.get('/ats/history', authenticate, (req, res, next) => atsController.getHistory(req, res, next));
router.post('/ats/analyze', authenticate, (req, res, next) => atsController.analyze(req, res, next));
router.post('/ats/upload', authenticate, upload.single('resume'), (req, res, next) => atsController.upload(req, res, next));
router.post('/ats/enhance', authenticate, (req, res, next) => atsController.enhance(req, res, next));

router.get('/portfolio/slug/:slug', (req, res, next) => portfolioController.getBySlug(req, res, next));
router.get('/portfolio/mine', authenticate, (req, res, next) => portfolioController.getMyPortfolio(req, res, next));
router.get('/portfolio/download/mine', authenticate, (req, res, next) => portfolioController.downloadPortfolio(req, res, next));
router.patch('/portfolio/mine', authenticate, (req, res, next) => portfolioController.update(req, res, next));
router.post('/portfolio/generate-bio', authenticate, (req, res, next) => portfolioController.generateBio(req, res, next));
router.post('/portfolio/extract-text', authenticate, upload.single('resume'), (req, res, next) => portfolioController.extractText(req, res, next));

router.get('/jobs/search', authenticate, (req, res, next) => jobController.search(req, res, next));
router.get('/jobs', authenticate, (req, res, next) => jobController.list(req, res, next));
router.post('/jobs', authenticate, (req, res, next) => jobController.create(req, res, next));
router.get('/jobs/analytics', authenticate, (req, res, next) => jobController.analytics(req, res, next));
router.get('/jobs/:id', authenticate, (req, res, next) => jobController.getById(req, res, next));
router.patch('/jobs/:id', authenticate, (req, res, next) => jobController.update(req, res, next));
router.delete('/jobs/:id', authenticate, (req, res, next) => jobController.delete(req, res, next));

router.post('/interview/start', authenticate, (req, res, next) => interviewController.start(req, res, next));
router.post('/interview/:id/answer', authenticate, (req, res, next) => interviewController.submitAnswer(req, res, next));
router.get('/interview/history', authenticate, (req, res, next) => interviewController.history(req, res, next));
router.get('/interview/:id', authenticate, (req, res, next) => interviewController.getSession(req, res, next));

router.get('/coding/problems', (req, res, next) => codingController.listProblems(req, res, next));
router.get('/coding/problems/:id', (req, res, next) => codingController.getProblem(req, res, next));
router.post('/coding/problems/:id/submit', authenticate, (req, res, next) => codingController.submit(req, res, next));
router.get('/coding/submissions', authenticate, (req, res, next) => codingController.submissions(req, res, next));
router.get('/coding/stats', authenticate, (req, res, next) => codingController.stats(req, res, next));

router.post('/skill-gap/analyze', authenticate, (req, res, next) => skillGapController.analyze(req, res, next));
router.post('/skill-gap/skills', authenticate, (req, res, next) => skillGapController.updateSkills(req, res, next));

router.get('/roadmaps', authenticate, (req, res, next) => roadmapController.getAll(req, res, next));
router.get('/roadmaps/:id', authenticate, (req, res, next) => roadmapController.getById(req, res, next));
router.post('/roadmaps/:id/progress', authenticate, (req, res, next) => roadmapController.updateProgress(req, res, next));

router.get('/github/analytics', authenticate, (req, res, next) => gitHubController.getAnalytics(req, res, next));
router.patch('/github/username', authenticate, (req, res, next) => gitHubController.updateUsername(req, res, next));

router.get('/autonomous/config', authenticate, (req, res, next) => autonomousController.getConfig(req, res, next));
router.patch('/autonomous/config', authenticate, (req, res, next) => autonomousController.updateConfig(req, res, next));
router.get('/autonomous/logs', authenticate, (req, res, next) => autonomousController.getLogs(req, res, next));

router.post('/chat/message', authenticate, (req, res, next) => chatController.sendMessage(req, res, next));
router.get('/chat/history', authenticate, (req, res, next) => chatController.getHistory(req, res, next));
router.delete('/chat/history', authenticate, (req, res, next) => chatController.clearHistory(req, res, next));

router.get('/admin/stats', authenticate, authorize('ADMIN'), (req, res, next) => adminController.getStats(req, res, next));
router.get('/admin/users', authenticate, authorize('ADMIN'), (req, res, next) => adminController.listUsers(req, res, next));
router.patch('/admin/users/:id/role', authenticate, authorize('ADMIN'), (req, res, next) => adminController.updateUserRole(req, res, next));
router.delete('/admin/users/:id', authenticate, authorize('ADMIN'), (req, res, next) => adminController.deleteUser(req, res, next));

router.post('/architect/generate', authenticate, (req, res, next) => architectController.generateBlueprint(req, res, next));
router.post('/simulator/turn', authenticate, (req, res, next) => simulatorController.simulateTurn(req, res, next));

export default router;
