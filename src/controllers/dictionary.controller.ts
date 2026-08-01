import { Request, Response } from 'express';
import { lookupDictionary } from '../services/dictionary.service';

export const lookupWord = async (req: Request, res: Response): Promise<void> => {
  if (typeof req.query.q !== 'string') {
    res.status(400).json({ success: false, message: 'Chinese word or phrase is required' });
    return;
  }

  const query = req.query.q.trim().normalize('NFKC');
  const length = Array.from(query).length;
  if (length < 1 || length > 32) {
    res.status(400).json({ success: false, message: 'Dictionary query must be 1 to 32 characters' });
    return;
  }
  if (!/\p{Script=Han}/u.test(query)) {
    res.status(400).json({ success: false, message: 'Enter Chinese characters to look up' });
    return;
  }

  const result = await lookupDictionary(query);
  res.json({ success: true, data: result });
};
