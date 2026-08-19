import { Request, Response, NextFunction } from 'express';
import { portfolioService } from '../services/portfolio.service';
import { atsService } from '../services/ats.service';
import { AppError } from '../middleware/errorHandler';
import { generatePortfolioHtml } from '../utils/htmlGenerator';

export class PortfolioController {
  async downloadPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await portfolioService.getMyPortfolio(req.user!.userId);
      const htmlContent = generatePortfolioHtml(portfolio);
      
      res.setHeader('Content-disposition', 'attachment; filename=my-portfolio.html');
      res.setHeader('Content-type', 'text/html');
      res.send(htmlContent);
    } catch (err) { next(err); }
  }
  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await portfolioService.getBySlug(req.params.slug);
      res.json({ success: true, data: portfolio, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async getMyPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await portfolioService.getMyPortfolio(req.user!.userId);
      res.json({ success: true, data: portfolio, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await portfolioService.update(req.user!.userId, req.body);
      res.json({ success: true, data: portfolio, message: 'Portfolio updated', meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async generateBio(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await portfolioService.generateBio(req.user!.userId, req.body.resumeText);
      res.json({ success: true, data: result, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }

  async extractText(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, 'FILE_REQUIRED', 'Resume file is required');
      }
      const text = await atsService.extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
      
      // DEBUG: Log extraction info to help diagnose PDF issues
      console.log(`[EXTRACTION] File: ${req.file.originalname}, Size: ${req.file.size}, Mime: ${req.file.mimetype}`);
      console.log(`[EXTRACTION] Extracted Length: ${text?.length}, Trimmed Length: ${text?.trim()?.length}`);
      if (text && text.length < 500) {
        console.log(`[EXTRACTION] Content preview: ${text.substring(0, 100)}`);
      }

      res.json({ success: true, data: { extractedText: text }, meta: { timestamp: new Date().toISOString(), requestId: req.id } });
    } catch (err) { next(err); }
  }
}

export const portfolioController = new PortfolioController();
