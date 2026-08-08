import { Request, Response } from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPlanDetails,
  getGemPackDetails,
} from '../services/payment.service';
import { User, Subscription, GemTransaction } from '../models';
import type { AuthRequest } from '../types';
import { getAppConfig } from '../services/config.service';
import mongoose from 'mongoose';
import { verifyGooglePlayPurchase } from '../services/google-play.service';
import { createError } from '../middleware/error';

export const createPremiumOrder = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { planId, method } = req.body;
  
  if (!planId || !['monthly', 'yearly', 'lifetime'].includes(planId)) {
    res.status(400).json({ success: false, message: 'Valid plan required' });
    return;
  }
  
  try {
    if (method === 'razorpay' || !method) {
      const order = await createRazorpayOrder('premium', planId, authReq.userId!);
      res.json({ success: true, data: { ...order, provider: 'razorpay' } });
    } else {
      res.status(400).json({ success: false, message: 'Only verified Razorpay checkout is supported by this endpoint' });
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { type, id, orderId, paymentId, signature } = req.body;
  
  if (type !== 'razorpay' || !id || !orderId || !paymentId || !signature) {
    res.status(400).json({ success: false, message: 'Complete Razorpay verification details are required' });
    return;
  }

  const purchaseType = id.startsWith('g') ? 'gems' : 'premium';
  const verification = await verifyRazorpayPayment(
    orderId,
    paymentId,
    signature,
    purchaseType,
    id,
    authReq.userId!
  );

  if (!verification.valid || !verification.amount) {
    res.status(400).json({ success: false, message: 'Payment could not be verified' });
    return;
  }
  
  if (id.startsWith('g')) {
    await handleGemPurchase(authReq.userId!, id, paymentId);
  } else {
    await handlePremiumPurchase(authReq.userId!, id, paymentId, verification.amount);
  }
  
  res.json({ success: true, message: 'Payment verified successfully' });
};

const handlePremiumPurchase = async (userId: string, planId: string, paymentId: string, amount: number): Promise<void> => {
  const plan = getPlanDetails(planId);
  if (!plan) throw new Error('Invalid plan');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (await Subscription.exists({ paymentId }).session(session)) return;
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error('User not found');
      const startDate = new Date();
      const endDate = user.premiumExpiry && user.premiumExpiry > startDate
        ? new Date(user.premiumExpiry)
        : new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.days);

      await User.findByIdAndUpdate(userId, {
        isPremium: true,
        premiumExpiry: endDate,
      }, { session });

      await Subscription.create([{
        userId,
        planId,
        status: 'active',
        startDate,
        endDate,
        paymentId,
        amount,
      }], { session });
    });
  } finally {
    await session.endSession();
  }
};

const handleGemPurchase = async (userId: string, packId: string, paymentId: string): Promise<void> => {
  const pack = getGemPackDetails(packId);
  if (!pack) throw new Error('Invalid gem pack');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (await GemTransaction.exists({ paymentId, type: 'purchase' }).session(session)) return;
      const totalGems = pack.gems + pack.bonus;
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { gems: totalGems } },
        { new: true, session }
      );
      if (!user) throw new Error('User not found');

      await GemTransaction.create([{
        userId,
        type: 'purchase',
        amount: totalGems,
        balance: user.gems,
        paymentId,
        description: `Purchased ${pack.gems} gems + ${pack.bonus} bonus`,
      }], { session });
    });
  } finally {
    await session.endSession();
  }
};

const handleGooglePremiumPurchase = async (
  userId: string,
  planId: string,
  paymentId: string,
  verifiedExpiry?: Date,
): Promise<void> => {
  const plan = getPlanDetails(planId);
  if (!plan) throw createError(400, 'Invalid Premium plan');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existing = await Subscription.findOne({ paymentId }).session(session);
      if (existing && existing.userId !== userId) throw createError(409, 'Purchase already belongs to another user');

      const user = await User.findById(userId).session(session);
      if (!user) throw createError(404, 'User not found');

      const startDate = new Date();
      const storeEndDate = verifiedExpiry ? new Date(verifiedExpiry) : new Date(startDate);
      if (!verifiedExpiry) storeEndDate.setDate(storeEndDate.getDate() + plan.days);
      const currentExpiry = user.premiumExpiry ? new Date(user.premiumExpiry) : undefined;
      const entitlementEnd = currentExpiry && currentExpiry > storeEndDate ? currentExpiry : storeEndDate;

      await User.findByIdAndUpdate(userId, {
        isPremium: true,
        premiumExpiry: entitlementEnd,
      }, { session });

      if (existing) {
        existing.status = 'active';
        existing.endDate = entitlementEnd;
        existing.amount = plan.amount;
        await existing.save({ session });
      } else {
        await Subscription.create([{
          userId,
          planId,
          status: 'active',
          startDate,
          endDate: entitlementEnd,
          paymentId,
          amount: plan.amount,
        }], { session });
      }
    });
  } finally {
    await session.endSession();
  }
};

const handleGoogleGemPurchase = async (userId: string, packId: string, paymentId: string): Promise<void> => {
  const pack = getGemPackDetails(packId);
  if (!pack) throw createError(400, 'Invalid gem pack');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existing = await GemTransaction.findOne({ paymentId, type: 'purchase' }).session(session);
      if (existing) {
        if (existing.userId !== userId) throw createError(409, 'Purchase already belongs to another user');
        return;
      }

      const totalGems = pack.gems + pack.bonus;
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { gems: totalGems } },
        { new: true, session },
      );
      if (!user) throw createError(404, 'User not found');

      await GemTransaction.create([{
        userId,
        type: 'purchase',
        amount: totalGems,
        balance: user.gems,
        paymentId,
        description: `Google Play purchase: ${pack.gems} gems + ${pack.bonus} bonus`,
      }], { session });
    });
  } finally {
    await session.endSession();
  }
};

export const verifyGooglePlayPayment = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { productId, purchaseToken, orderId, productType, planId, packId } = req.body;
  if (
    typeof productId !== 'string' || !productId ||
    typeof purchaseToken !== 'string' || purchaseToken.length < 10 || purchaseToken.length > 5000 ||
    !['subs', 'inapp'].includes(productType) ||
    (!!planId === !!packId)
  ) {
    throw createError(400, 'Complete Google Play purchase details are required');
  }

  const kind = planId ? 'premium' : 'gems';
  const id = String(planId || packId);
  const verified = await verifyGooglePlayPurchase({
    userId: authReq.userId!,
    kind,
    id,
    productId,
    productType,
    purchaseToken,
    orderId: typeof orderId === 'string' ? orderId : undefined,
  });

  if (kind === 'premium') {
    await handleGooglePremiumPurchase(authReq.userId!, id, verified.paymentId, verified.expiryTime);
  } else {
    await handleGoogleGemPurchase(authReq.userId!, id, verified.paymentId);
  }

  const user = await User.findById(authReq.userId!).select('isPremium premiumExpiry gems').lean();
  if (!user) throw createError(404, 'User not found');
  res.json({
    success: true,
    message: 'Google Play purchase verified successfully',
    data: {
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry,
      gems: user.gems,
    },
  });
};

export const createGemOrder = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { packId, method } = req.body;
  
  if (!packId || !getGemPackDetails(packId)) {
    res.status(400).json({ success: false, message: 'Valid gem pack required' });
    return;
  }
  
  try {
    if (method === 'razorpay' || !method) {
      const order = await createRazorpayOrder('gems', packId, authReq.userId!);
      res.json({ success: true, data: { ...order, provider: 'razorpay' } });
    } else {
      res.status(400).json({ success: false, message: 'Only verified Razorpay checkout is supported by this endpoint' });
    }
  } catch (error) {
    console.error('Create gem order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

export const getPlans = async (req: Request, res: Response): Promise<void> => {
  const config = await getAppConfig();
  const pricing = config.pricing;
  const talkMinutes = config.aiConfig.premiumTalkMinutesPerMonth || 300;
  const chatReplies = config.aiConfig.premiumChatMessagesPerMonth || 1000;
  const premiumFeatures = [
    `${talkMinutes} AI Talk minutes per month`,
    `${chatReplies} AI tutor replies per month`,
    'All Premium courses, stories and scenarios',
    'Ling Live, detailed feedback and no ads',
  ];
  const plans = [
    { id: 'monthly', name: 'Monthly', price: pricing.monthly, currency: 'INR', period: '/month', features: premiumFeatures },
    { id: 'yearly', name: 'Annual', price: pricing.yearly, currency: 'INR', period: '/year', discount: 'Save versus monthly billing', features: premiumFeatures, isPopular: true },
  ];
  
  res.json({ success: true, data: plans });
};

export const getGemPacks = async (req: Request, res: Response): Promise<void> => {
  const packs = [
    { id: 'g1', gems: 100, bonus: 0, price: 49, currency: 'INR' },
    { id: 'g2', gems: 500, bonus: 50, price: 199, currency: 'INR', isPopular: true },
    { id: 'g3', gems: 1200, bonus: 200, price: 399, currency: 'INR' },
    { id: 'g4', gems: 3000, bonus: 600, price: 899, currency: 'INR' },
    { id: 'g5', gems: 8000, bonus: 2000, price: 1999, currency: 'INR' },
  ];
  
  res.json({ success: true, data: packs });
};
