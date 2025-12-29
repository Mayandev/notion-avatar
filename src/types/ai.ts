export type AIGenerationMode = 'photo2avatar' | 'text2avatar';

export interface AIGenerateRequest {
  mode: AIGenerationMode;
  image?: string; // Base64 for photo2avatar
  description?: string; // Text prompt for text2avatar
}

export interface AIGenerateResponse {
  success: boolean;
  image?: string; // Base64 image
  error?: string;
}

export interface AIUsageState {
  remaining: number;
  total: number;
  isUnlimited: boolean;
}
