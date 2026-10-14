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

  if (file.size === 0) {
    return { valid: false, fileType: file.type, size: 0, message: "This image file is empty. Please choose another photo." };
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

export function validateImageSignature(bytes: Uint8Array): ImageValidationResult {
  if (!detectImageMimeType(bytes)) {
    return { valid: false, message: "This file is not a supported JPEG, PNG, or WEBP image." };
  }

  return { valid: true };
}

export function detectImageMimeType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  return null;
}

export async function validateImageFile(file: File | null): Promise<ImageValidationResult> {
  const basicValidation = validateImage(file);
  if (!basicValidation.valid || !file) return basicValidation;

  try {
    const bitmap = await createImageBitmap(file);
    const validDimensions = bitmap.width >= 128 && bitmap.height >= 128;
    bitmap.close();

    if (!validDimensions) {
      return { ...basicValidation, valid: false, message: "This image is too small to assess. Please choose a clearer photo." };
    }
  } catch {
    return { ...basicValidation, valid: false, message: "This image could not be opened. It may be corrupted; please choose another photo." };
  }

  return basicValidation;
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
