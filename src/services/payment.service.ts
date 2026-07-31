import Razorpay from 'razorpay';
import Stripe from 'stripe';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const PLANS = {
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
    const plan = PLANS[id as keyof typeof PLANS];
    if (!plan) throw new Error('Invalid plan');
    amount = plan.amount;
    receipt = `premium_${userId}_${id}_${Date.now()}`;
  } else {
    const pack = GEM_PACKS[id];
    if (!pack) throw new Error('Invalid gem pack');
    amount = pack.amount;
    receipt = `gems_${userId}_${id}_${Date.now()}`;
  }
  
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt,
  });
  
  return {
    orderId: order.id,
    amount: order.amount / 100,
    currency: order.currency,
  };
};

export const verifyRazorpayPayment = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex');
  
  return expectedSignature === signature;
};

export const createStripePaymentIntent = async (
  type: 'premium' | 'gems',
  id: string,
  userId: string
): Promise<{ clientSecret: string; amount: number }> => {
  let amount: number;
  
  if (type === 'premium') {
    const plan = PLANS[id as keyof typeof PLANS];
    if (!plan) throw new Error('Invalid plan');
    amount = plan.amount;
  } else {
    const pack = GEM_PACKS[id];
    if (!pack) throw new Error('Invalid gem pack');
    amount = pack.amount;
  }
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'usd',
    metadata: { type, id, userId },
  });
  
  return {
    clientSecret: paymentIntent.client_secret || '',
    amount,
  };
};

export const getPlanDetails = (planId: string) => PLANS[planId as keyof typeof PLANS];
export const getGemPackDetails = (packId: string) => GEM_PACKS[packId];