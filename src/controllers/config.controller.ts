import { Request, Response } from 'express';
import { getAppConfig, checkAppVersion } from '../services/config.service';

export const getConfig = async (req: Request, res: Response): Promise<void> => {
  const config = await getAppConfig();
  res.json({ success: true, data: config });
};

export const checkVersion = async (req: Request, res: Response): Promise<void> => {
  const { version } = req.query;
  
  if (!version || typeof version !== 'string') {
    res.status(400).json({ success: false, message: 'Version required' });
    return;
  }
  
  const result = await checkAppVersion(version);
  res.json({ success: true, data: result });
};

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'ChinesApp Backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
  });
};