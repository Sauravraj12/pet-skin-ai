export type StoredImageReference = {
  provider: "supabase" | "s3" | "mock";
  key: string;
  mimeType: string;
};

export function getImageStorageStatus(): {
  configured: boolean;
  provider: "supabase" | "s3" | "mock";
  public: false;
} {
  const provider = process.env.STORAGE_PROVIDER?.toLowerCase();
  if (provider === "supabase" && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.STORAGE_BUCKET) {
    return { configured: true, provider: "supabase", public: false };
  }
  if (provider === "s3" && process.env.STORAGE_BUCKET && process.env.AWS_REGION) {
    return { configured: true, provider: "s3", public: false };
  }
  return { configured: false, provider: "mock", public: false };
}

export async function storePrivateScreeningImage(): Promise<StoredImageReference | null> {
  const status = getImageStorageStatus();
  if (!status.configured) return null;

  return null;
}
