import { Request, Response } from 'express';
import { AppAnalyticsEvent } from '../models';
import type { AuthRequest } from '../types';

const EVENT_NAME = /^[a-z][a-z0-9_.-]{1,79}$/;
const PLATFORM = new Set(['android', 'ios', 'web', 'unknown']);

export const recordAnalyticsEvents = async (req: Request, res: Response): Promise<void> => {
  const body = req.body || {};
  const input = Array.isArray(body.events) ? body.events : [body];
  const events = input.slice(0, 50).flatMap((raw: any) => {
    const event = String(raw?.event || '').trim().toLowerCase();
    if (!EVENT_NAME.test(event)) return [];
    const rawProperties = raw?.properties && typeof raw.properties === 'object' && !Array.isArray(raw.properties)
      ? raw.properties
      : {};
    const properties = Object.fromEntries(Object.entries(rawProperties).slice(0, 20).flatMap(([key, value]) => {
      if (!/^[a-zA-Z][a-zA-Z0-9_.-]{0,39}$/.test(key)) return [];
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return [[key, String(value).slice(0, 200)]];
      }
      return [];
    }));
    const authReq = req as AuthRequest;
    return [{
      event,
      userId: authReq.userId,
      installationId: String(raw?.installationId || '').slice(0, 120) || undefined,
      platform: PLATFORM.has(raw?.platform) ? raw.platform : 'unknown',
      appVersion: String(raw?.appVersion || '').slice(0, 40) || undefined,
      properties,
    }];
  });

  if (events.length > 0) await AppAnalyticsEvent.insertMany(events, { ordered: false });
  res.status(202).json({ success: true, data: { accepted: events.length } });
};
