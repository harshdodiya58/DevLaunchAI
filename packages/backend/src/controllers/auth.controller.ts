import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Account created successfully',
        meta: { timestamp: new Date().toISOString(), requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
        meta: { timestamp: new Date().toISOString(), requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_TOKEN', message: 'Refresh token is required' },
          meta: { timestamp: new Date().toISOString(), requestId: req.id },
        });
        return;
      }
      const result = await authService.refresh(refreshToken);
      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString(), requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId);
      res.status(200).json({
        success: true,
        data: null,
        message: 'Logged out successfully',
        meta: { timestamp: new Date().toISOString(), requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);
      res.status(200).json({
        success: true,
        data: user,
        meta: { timestamp: new Date().toISOString(), requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
        meta: { timestamp: new Date().toISOString(), requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
