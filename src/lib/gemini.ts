import { GoogleGenAI } from '@google/genai';
import { AIGenerationMode } from '@/types/ai';

// Mock Notion Avatar (Simple SVG)
const MOCK_AVATAR_SVG = `<svg viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="#fffefc"/>
  <path d="M540 200C350 200 200 350 200 540C200 730 350 880 540 880C730 880 880 730 880 540C880 350 730 200 540 200Z" stroke="black" stroke-width="20"/>
  <circle cx="400" cy="450" r="50" fill="black"/>
  <circle cx="680" cy="450" r="50" fill="black"/>
  <path d="M400 700Q540 800 680 700" stroke="black" stroke-width="20" fill="none"/>
</svg>`;

const MOCK_AVATAR_BASE64 = `data:image/svg+xml;base64,${Buffer.from(
  MOCK_AVATAR_SVG,
).toString('base64')}`;

const PHOTO_PROMPT = `Transform this photo into a Notion Avatar style illustration with these exact characteristics:
- Pure black and white color scheme only
- Simple black outline strokes for facial contours
- Solid black fill for hair (no gradients, no strokes)
- Minimalist facial features: simple shapes for eyes, single line for nose, simple curve for mouth
- Clean white/cream background (#fffefc)
- Cartoon proportions with slightly larger head
- Completely flat design with NO shadows or gradients
- Slight hand-drawn imperfection in lines
- Head and shoulders composition only
- Keep the person's key facial features recognizable but simplified`;

const TEXT_PROMPT = `Generate a Notion Avatar style portrait illustration based on this description:
- Pure black and white color scheme only
- Simple black outline strokes for facial contours  
- Solid black fill for hair (no gradients)
- Minimalist facial features: simple shapes for eyes, single line for nose, simple curve for mouth
- Clean white/cream background (#fffefc)
- Cartoon proportions with slightly larger head
- Completely flat design with NO shadows or gradients
- Slight hand-drawn imperfection in lines
- Head and shoulders composition only

User description: `;

export async function generateAvatar(
  mode: AIGenerationMode,
  input: string,
): Promise<string> {
  // 1. Mock Mode Check
  if (process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY) {
    // eslint-disable-next-line no-console
    console.log('[Mock AI] Generating avatar...');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
    return MOCK_AVATAR_BASE64;
  }

  // 2. Real API Call
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Note: Model name might change, using the preview model for now
  // Using 'gemini-2.0-flash-exp' as per planning
  const model = 'gemini-2.0-flash-exp';

  try {
    let result;

    if (mode === 'photo2avatar') {
      // Input is base64 image (removed data:image/xxx;base64, prefix if needed)
      const base64Data = input.replace(/^data:image\/\w+;base64,/, '');

      result = await genai.models.generateContent({
        model,
        contents: [
          { text: PHOTO_PROMPT },
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
        ],
        config: { responseModalities: ['image'] }, // Force image output
      });
    } else {
      // Input is text description
      result = await genai.models.generateContent({
        model,
        contents: [{ text: `${TEXT_PROMPT}${input}` }],
        config: { responseModalities: ['image'] }, // Force image output
      });
    }

    // Safety check for response
    if (!result?.candidates || result.candidates.length === 0) {
      throw new Error('No image generated');
    }

    // Extract image data
    const parts = result.candidates[0]?.content?.parts;
    if (!parts) {
      throw new Error('No content parts in response');
    }

    const imagePart = parts.find((p: any) => p.inlineData);

    if (imagePart?.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Gemini API Error:', error);
    throw error;
  }
}
