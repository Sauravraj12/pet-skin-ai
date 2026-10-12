export type ProductClickPayload = {
  memberId?: string | null;
  screeningSessionId?: string | null;
  productId: string;
  source: string;
  userAgent?: string | null;
  referrer?: string | null;
};

export function createTrackingPayload(payload: ProductClickPayload) {
  return {
    success: true,
    payload,
  };
}
