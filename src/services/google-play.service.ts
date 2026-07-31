import crypto from 'crypto';
import { GoogleAuth } from 'google-auth-library';
import { createError } from '../middleware/error';
import { getIntegrationSecret } from './integration-secrets.service';

type ProductType = 'subs' | 'inapp';
type PurchaseKind = 'premium' | 'gems';

export interface ProductDefinition {
  id: string;
  kind: PurchaseKind;
  productId: string;
  productType: ProductType;
}

interface SubscriptionPurchaseV2 {
  latestOrderId?: string;
  subscriptionState?: string;
  externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string };
  lineItems?: Array<{ productId?: string; expiryTime?: string }>;
}

interface ProductPurchase {
  orderId?: string;
  purchaseState?: number;
  quantity?: number;
  obfuscatedExternalAccountId?: string;
}

export interface VerifiedGooglePlayPurchase {
  definition: ProductDefinition;
  paymentId: string;
  orderId?: string;
  expiryTime?: Date;
}

const envProduct = (name: string, fallback: string): string => process.env[name]?.trim() || fallback;

const productCatalog = (): ProductDefinition[] => [
  { id: 'monthly', kind: 'premium', productId: envProduct('PLAY_PREMIUM_MONTHLY_ID', 'chinesapp_premium_monthly'), productType: 'subs' },
  { id: 'yearly', kind: 'premium', productId: envProduct('PLAY_PREMIUM_YEARLY_ID', 'chinesapp_premium_yearly'), productType: 'subs' },
  { id: 'lifetime', kind: 'premium', productId: envProduct('PLAY_PREMIUM_LIFETIME_ID', 'chinesapp_premium_lifetime'), productType: 'inapp' },
  { id: 'g1', kind: 'gems', productId: envProduct('PLAY_GEMS_100_ID', 'chinesapp_gems_100'), productType: 'inapp' },
  { id: 'g2', kind: 'gems', productId: envProduct('PLAY_GEMS_500_ID', 'chinesapp_gems_500'), productType: 'inapp' },
  { id: 'g3', kind: 'gems', productId: envProduct('PLAY_GEMS_1200_ID', 'chinesapp_gems_1200'), productType: 'inapp' },
  { id: 'g4', kind: 'gems', productId: envProduct('PLAY_GEMS_3000_ID', 'chinesapp_gems_3000'), productType: 'inapp' },
  { id: 'g5', kind: 'gems', productId: envProduct('PLAY_GEMS_8000_ID', 'chinesapp_gems_8000'), productType: 'inapp' },
];

const parseServiceAccount = async (): Promise<Record<string, unknown>> => {
  const rawJson = await getIntegrationSecret('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON');
  const rawBase64 = await getIntegrationSecret('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64');
  if (!rawJson && !rawBase64) {
    throw createError(503, 'Google Play verification is not configured');
  }

  try {
    const decoded = rawJson || Buffer.from(rawBase64!, 'base64').toString('utf8');
    const credentials = JSON.parse(decoded) as Record<string, unknown>;
    if (typeof credentials.private_key === 'string') {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
    return credentials;
  } catch {
    throw createError(503, 'Google Play service account JSON is invalid');
  }
};

const getDefinition = (kind: PurchaseKind, id: string): ProductDefinition => {
  const definition = productCatalog().find(item => item.kind === kind && item.id === id);
  if (!definition) throw createError(400, 'Unknown Google Play product');
  return definition;
};

const requestGooglePlay = async <T>(url: string): Promise<T> => {
  const auth = new GoogleAuth({
    credentials: await parseServiceAccount(),
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
  try {
    const response = await auth.request<T>({ url, method: 'GET' });
    return response.data;
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 400 || status === 404) throw createError(400, 'Google Play could not find this purchase');
    if (status === 401 || status === 403) throw createError(503, 'Google Play service account does not have purchase access');
    throw createError(503, 'Google Play purchase verification is temporarily unavailable');
  }
};

const ensureOwnership = (googleAccountId: string | undefined, userId: string): void => {
  if (googleAccountId && googleAccountId !== userId) {
    throw createError(409, 'This purchase belongs to another account');
  }
};

export const verifyGooglePlayPurchase = async (input: {
  userId: string;
  kind: PurchaseKind;
  id: string;
  productId: string;
  productType: string;
  purchaseToken: string;
  orderId?: string;
}): Promise<VerifiedGooglePlayPurchase> => {
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim() || 'com.chinesapp.learn';
  const definition = getDefinition(input.kind, input.id);
  if (input.productId !== definition.productId || input.productType !== definition.productType) {
    throw createError(400, 'Google Play product details do not match the requested item');
  }

  const app = encodeURIComponent(packageName);
  const token = encodeURIComponent(input.purchaseToken);
  let verifiedOrderId: string | undefined;
  let expiryTime: Date | undefined;

  if (definition.productType === 'subs') {
    const purchase = await requestGooglePlay<SubscriptionPurchaseV2>(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${app}/purchases/subscriptionsv2/tokens/${token}`,
    );
    const allowedStates = new Set([
      'SUBSCRIPTION_STATE_ACTIVE',
      'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
      'SUBSCRIPTION_STATE_CANCELED',
    ]);
    if (!purchase.subscriptionState || !allowedStates.has(purchase.subscriptionState)) {
      throw createError(400, 'Google Play subscription is not active');
    }
    const lineItem = purchase.lineItems?.find(item => item.productId === definition.productId);
    if (!lineItem?.expiryTime) throw createError(400, 'Subscription product or expiry does not match');
    expiryTime = new Date(lineItem.expiryTime);
    if (Number.isNaN(expiryTime.getTime()) || expiryTime <= new Date()) {
      throw createError(400, 'Google Play subscription has expired');
    }
    verifiedOrderId = purchase.latestOrderId;
    ensureOwnership(purchase.externalAccountIdentifiers?.obfuscatedExternalAccountId, input.userId);
  } else {
    const product = encodeURIComponent(definition.productId);
    const purchase = await requestGooglePlay<ProductPurchase>(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${app}/purchases/products/${product}/tokens/${token}`,
    );
    if (purchase.purchaseState !== 0 || (purchase.quantity !== undefined && purchase.quantity < 1)) {
      throw createError(400, 'Google Play purchase is not completed');
    }
    verifiedOrderId = purchase.orderId;
    ensureOwnership(purchase.obfuscatedExternalAccountId, input.userId);
  }

  if (input.orderId && verifiedOrderId && input.orderId !== verifiedOrderId) {
    throw createError(400, 'Google Play order ID does not match');
  }

  return {
    definition,
    paymentId: `google-play:${crypto.createHash('sha256').update(input.purchaseToken).digest('hex')}`,
    orderId: verifiedOrderId,
    expiryTime,
  };
};
