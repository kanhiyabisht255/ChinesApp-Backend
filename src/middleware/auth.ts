import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken } from '../utils/jwt';
import type { AuthRequest } from '../types';
import { getAppConfig } from '../services/config.service';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }
    
    (req as AuthRequest).userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req.headers.authorization);
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      (req as AuthRequest).userId = decoded.userId;
    }
  }
  next();
};

export const premiumMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    
    const { User } = await import('../models');
    const user = await User.findById(authReq.userId);
    
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    if (!user.isPremium && user.premiumExpiry && user.premiumExpiry > new Date()) {
      user.isPremium = true;
      await user.save();
    }
    
    if (!user.isPremium) {
      res.status(403).json({ success: false, message: 'Premium subscription required' });
      return;
    }
    
    authReq.user = {
      _id: user._id.toString(),
      phone: user.phone,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry,
      gems: user.gems,
      xp: user.xp,
      streak: user.streak,
      lastStreakDate: user.lastStreakDate,
      dailyGoal: user.dailyGoal,
      todayMinutes: user.todayMinutes,
      hskLevel: user.hskLevel,
      googleId: user.googleId,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (authReq.userId === 'admin') {
      next();
      return;
    }

    const { User } = await import('../models');
    const user = await User.findById(authReq.userId);
    if (!user || !user.isAdmin) {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }
    authReq.user = {
      _id: user._id.toString(),
      phone: user.phone,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry,
      gems: user.gems,
      xp: user.xp,
      streak: user.streak,
      lastStreakDate: user.lastStreakDate,
      dailyGoal: user.dailyGoal,
      todayMinutes: user.todayMinutes,
      hskLevel: user.hskLevel,
      googleId: user.googleId,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const checkMaintenance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const isMaintenance = await getAppConfig().then(c => c.maintenanceMode);
  
  if (isMaintenance && req.path !== '/api/health') {
    res.status(503).json({
      success: false,
      message: 'App is under maintenance. Please try again later.',
    });
    return;
  }
  
  next();
};

export const rateLimitMiddleware = (
  maxRequests: number = 100,
  windowMs: number = 60000
) => {
  const requests: Map<string, { count: number; resetTime: number }> = new Map();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const record = requests.get(ip);
    
    if (!record || now > record.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }
    
    if (record.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
      return;
    }
    
    record.count++;
    next();
  };
};