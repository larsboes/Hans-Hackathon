import { google } from '@/lib/google-model';
import { generateImage } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const result = await generateImage({
      model: google.image('gemini-3.1-flash-image-preview'),
      prompt: `Generate one beautiful, atmospheric travel illustration for the entire journey. Scene: ${prompt}. Style: watercolor illustration, warm colors, dreamy travel photography feel, cinematic lighting.`,
      aspectRatio: '16:9',
    });

    const imageFile = result.image;
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
