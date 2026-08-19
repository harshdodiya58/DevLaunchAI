import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => resumeController.list(req, res, next));
router.get('/:id', (req, res, next) => resumeController.getById(req, res, next));
router.post('/', (req, res, next) => resumeController.create(req, res, next));
router.patch('/:id', (req, res, next) => resumeController.update(req, res, next));
router.delete('/:id', (req, res, next) => resumeController.delete(req, res, next));
router.post('/:id/default', (req, res, next) => resumeController.setDefault(req, res, next));
router.post('/:id/duplicate', (req, res, next) => resumeController.duplicate(req, res, next));

router.post('/ai/improve-bullet', (req, res, next) => resumeController.improveBullet(req, res, next));
router.post('/ai/generate-summary', (req, res, next) => resumeController.generateSummary(req, res, next));

export default router;
