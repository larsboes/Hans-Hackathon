import { google, GEMINI_MODEL } from '@/lib/google-model';
import { generateText } from 'ai';
import { type GoogleLanguageModelOptions } from '@ai-sdk/google';

export async function POST(req: Request) {
  const { prompt } = await req.json();

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
      prompt: `Generate a beautiful, atmospheric travel illustration. Scene: ${prompt}. Style: watercolor illustration, warm colors, dreamy travel photography feel, cinematic lighting.`,
    });

    const imageFile = result.files?.[0];
    if (imageFile) {
      return Response.json({
        imageUrl: `data:${imageFile.mediaType};base64,${imageFile.base64}`,
      });
    }

    return Response.json({ imageUrl: null }, { status: 200 });
  } catch (error) {
    console.error('Error generating story image:', error);
    return Response.json(
      { error: 'Failed to generate image' },
      { status: 500 },
    );
  }
}
