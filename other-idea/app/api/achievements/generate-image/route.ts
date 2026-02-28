import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function POST(req: Request) {
  const { prompt, achievementName } = await req.json()

  try {
    const result = await generateText({
      model: google('gemini-2.5-flash-preview-05-20', {
        responseModalities: ['TEXT', 'IMAGE'],
      }),
      prompt: `Generate a beautiful achievement badge image for a flight companion app. The achievement is called "${achievementName}". ${prompt}. Style: digital illustration, badge/medal shape, vibrant colors, aviation theme.`,
    })

    // Extract image from response files
    const imageFile = result.files?.[0]
    if (imageFile) {
      const base64 = Buffer.from(await imageFile.arrayBuffer()).toString('base64')
      const mimeType = imageFile.type || 'image/png'
      return Response.json({
        imageUrl: `data:${mimeType};base64,${base64}`,
        text: result.text,
      })
    }

    return Response.json({ imageUrl: null, text: result.text }, { status: 200 })
  } catch (error) {
    console.error('Error generating achievement image:', error)
    return Response.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
