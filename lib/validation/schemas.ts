import { z } from "zod";

export const petFormSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  species: z.enum(["Dog", "Cat"]),
  breed: z.string().optional().or(z.literal("")),
  age: z.string().optional().or(z.literal("")),
  sex: z.string().optional().or(z.literal("")),
  weight: z.string().optional().or(z.literal("")),
  ownerName: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")),
  mobile: z.string().optional().or(z.literal("")),
  lineId: z.string().optional().or(z.literal("")),
});

export const imageValidationSchema = z.object({
  valid: z.boolean(),
  fileType: z.string().optional(),
  size: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  message: z.string().optional(),
});

export const aiIndicatorSchema = z.object({
  code: z.string(),
  label: z.string(),
  severity: z.enum(["MILD", "MODERATE", "SEVERE"]),
  confidence: z.number().min(0).max(1),
});

export const analysisResultSchema = z.object({
  petSpecies: z.enum(["Dog", "Cat"]),
  overallRisk: z.enum(["GREEN", "YELLOW", "RED", "UNABLE_TO_DETERMINE"]),
  confidence: z.number().min(0).max(1),
  imageQuality: z.enum(["GOOD", "FAIR", "POOR"]),
  visibleIndicators: z.array(aiIndicatorSchema),
  summary: z.string(),
  recommendations: z.array(z.string()),
  veterinaryAdvice: z.boolean(),
  disclaimer: z.string(),
});

export const visionAssessmentSchema = analysisResultSchema.extend({
  petDetected: z.boolean(),
  petSpecies: z.enum(["Dog", "Cat", "Other", "Uncertain"]),
});

export const productClickSchema = z.object({
  memberId: z.string().optional().nullable(),
  screeningSessionId: z.string().optional().nullable(),
  productId: z.string(),
  source: z.string().default("web"),
  userAgent: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
});

export type PetFormInput = z.infer<typeof petFormSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
