import Razorpay from 'razorpay';
import crypto from 'crypto';
import type { AppConfig } from '../types';
import { getAppConfig } from './config.service';

let razorpayClient: Razorpay | null = null;

const getRazorpay = (): Razorpay => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured');
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
};

const PLAN_METADATA = {
  monthly: { amount: 499, currency: 'INR', days: 30, name: 'Monthly Premium' },
  yearly: { amount: 2999, currency: 'INR', days: 365, name: 'Yearly Premium' },
  lifetime: { amount: 7999, currency: 'INR', days: 36500, name: 'Lifetime Premium' },
};

const GEM_PACKS: Record<string, { gems: number; bonus: number; amount: number }> = {
  g1: { gems: 100, bonus: 0, amount: 49 },
  g2: { gems: 500, bonus: 50, amount: 199 },
  g3: { gems: 1200, bonus: 200, amount: 399 },
  g4: { gems: 3000, bonus: 600, amount: 899 },
  g5: { gems: 8000, bonus: 2000, amount: 1999 },
};

export const createRazorpayOrder = async (
  type: 'premium' | 'gems',
  id: string,
  userId: string
): Promise<{ orderId: string; amount: number; currency: string }> => {
  let amount: number;
  let receipt: string;
  
  if (type === 'premium') {
    const plan = getPlanDetails(id, (await getAppConfig()).pricing);
    if (!plan) throw new Error('Invalid plan');
    amount = plan.amount;
    receipt = `premium_${userId}_${id}_${Date.now()}`;
  } else {
    const pack = GEM_PACKS[id];
    if (!pack) throw new Error('Invalid gem pack');
    amount = pack.amount;
    receipt = `gems_${userId}_${id}_${Date.now()}`;
  }
  
  const order = await getRazorpay().orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt,
    notes: { type, id, userId },
  });
  
  return {
    orderId: order.id,
    amount: Number(order.amount) / 100,
    currency: order.currency,
  };
};

export const verifyRazorpayPayment = async (
  orderId: string,
  paymentId: string,
  signature: string,
  purchaseType: 'premium' | 'gems',
  purchaseId: string,
  userId: string
): Promise<{ valid: boolean; amount?: number }> => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) return { valid: false };
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const receivedBuffer = Buffer.from(signature, 'utf8');
  if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return { valid: false };
  }

  const [order, payment] = await Promise.all([
    getRazorpay().orders.fetch(orderId),
    getRazorpay().payments.fetch(paymentId),
  ]);
  const knownPurchase = purchaseType === 'premium'
    ? getPlanDetails(purchaseId)
    : getGemPackDetails(purchaseId);
  if (!knownPurchase) return { valid: false };

  const notes = (order.notes || {}) as Record<string, unknown>;
  const valid = payment.order_id === orderId
    && ['authorized', 'captured'].includes(payment.status)
    && Number(payment.amount) > 0
    && Number(payment.amount) === Number(order.amount)
    && String(order.currency).toUpperCase() === 'INR'
    && String(notes.type || '') === purchaseType
    && String(notes.id || '') === purchaseId
    && String(notes.userId || '') === userId;
  return { valid, amount: valid ? Number(order.amount) / 100 : undefined };
};

export const getPlanDetails = (planId: string, pricing?: AppConfig['pricing']) => {
  const metadata = PLAN_METADATA[planId as keyof typeof PLAN_METADATA];
  if (!metadata) return undefined;
  const configuredAmount = pricing?.[planId as keyof AppConfig['pricing']];
  return {
    ...metadata,
    amount: Number.isFinite(configuredAmount) && Number(configuredAmount) > 0
      ? Number(configuredAmount)
      : metadata.amount,
  };
};
export const getGemPackDetails = (packId: string) => GEM_PACKS[packId];
