import { google, GEMINI_MODEL } from '@/lib/google-model';
import { generateText } from 'ai';
import { type GoogleLanguageModelOptions } from '@ai-sdk/google';

export async function POST(req: Request) {
  const { prompt, achievementName } = await req.json();

  try {
    const result = await generateText({
      model: google(GEMINI_MODEL),
      providerOptions: {
        vertex: {
          thinkingConfig: {
            includeThoughts: false,
            thinkingBudget: 0,
          },
        } satisfies GoogleLanguageModelOptions,
        google: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      },
      prompt: `Generate a beautiful achievement badge image for a flight companion app. The achievement is called "${achievementName}". ${prompt}. Style: digital illustration, badge/medal shape, vibrant colors, aviation theme.`,
    });

    // Extract image from response files
    const imageFile = result.files?.[0];
    if (imageFile) {
      return Response.json({
        imageUrl: `data:${imageFile.mediaType};base64,${imageFile.base64}`,
        text: result.text,
      });
    }

    return Response.json(
      { imageUrl: null, text: result.text },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error generating achievement image:', error);
    return Response.json(
      { error: 'Failed to generate image' },
      { status: 500 },
    );
  }
}
