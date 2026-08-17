import { Request, Response } from 'express';
import { User } from '../models';
import { normalizeEmail } from '../services/email-verification.service';
import {
  deleteUserAccount,
  issueAccountDeletionCode,
  verifyAccountDeletionCode,
} from '../services/account-deletion.service';

export const requestAccountDeletion = async (req: Request, res: Response): Promise<void> => {
  const email = normalizeEmail(req.body?.email);
  if (!email) {
    res.status(400).json({ success: false, message: 'Enter a valid email address' });
    return;
  }

  await issueAccountDeletionCode(email);
  res.json({
    success: true,
    message: 'If a Learn Chinese account exists for this email, a deletion code has been sent.',
    data: { email },
  });
};

export const confirmAccountDeletion = async (req: Request, res: Response): Promise<void> => {
  const email = normalizeEmail(req.body?.email);
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!email) {
    res.status(400).json({ success: false, message: 'Enter a valid email address' });
    return;
  }
  if (!/^\d{6}$/.test(code)) {
    res.status(400).json({ success: false, message: 'Enter the 6-digit deletion code' });
    return;
  }

  const verification = await verifyAccountDeletionCode(email, code);
  if (!verification.valid) {
    res.status(400).json({ success: false, message: verification.message });
    return;
  }

  const user = await User.findOne({ email }).select('_id').lean();
  if (user) await deleteUserAccount(user._id.toString());

  res.json({
    success: true,
    message: 'Your Learn Chinese account and associated app data have been permanently deleted.',
  });
};
