export type ImageValidationResult = {
  valid: boolean;
  fileType?: string;
  size?: number;
  width?: number;
  height?: number;
  message?: string;
};

const MAX_SIZE = 10 * 1024 * 1024;

export function validateImage(file: File | null): ImageValidationResult {
  if (!file) {
    return { valid: false, message: "Please select an image file." };
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowed.includes(file.type)) {
    return { valid: false, fileType: file.type, message: "Unsupported image type. Please use JPG, PNG, or WEBP." };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, fileType: file.type, size: file.size, message: "Image is too large. Please use a file under 10 MB." };
  }

  return {
    valid: true,
    fileType: file.type,
    size: file.size,
    message: "Image passed validation.",
  };
}

export async function compressImage(file: File): Promise<File> {
  const imageBitmap = await createImageBitmap(file);
  const { width, height } = imageBitmap;
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(width, height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return file;
  }

  ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((nextBlob) => resolve(nextBlob), file.type || "image/jpeg", 0.85);
  });

  if (!blob) {
    return file;
  }

  return new File([blob], file.name, { type: file.type || "image/jpeg" });
}
