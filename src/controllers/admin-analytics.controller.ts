import { Request, Response } from 'express';
import { AppAnalyticsEvent } from '../models';

export const getProductAnalytics = async (req: Request, res: Response): Promise<void> => {
  const days = Math.max(1, Math.min(Number(req.query.days) || 30, 90));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [summary, daily, topEvents] = await Promise.all([
    AppAnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$event', events: { $sum: 1 }, users: { $addToSet: { $ifNull: ['$userId', '$installationId'] } } } },
      { $project: { _id: 0, event: '$_id', events: 1, users: { $size: '$users' } } },
      { $sort: { events: -1 } },
    ]),
    AppAnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, events: { $sum: 1 }, users: { $addToSet: { $ifNull: ['$userId', '$installationId'] } } } },
      { $project: { _id: 0, date: '$_id', events: 1, users: { $size: '$users' } } },
      { $sort: { date: 1 } },
    ]),
    AppAnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { _id: 0, event: '$_id', count: 1 } },
    ]),
  ]);
  res.json({ success: true, data: { days, summary, daily, topEvents } });
};
