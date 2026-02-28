import { NextResponse } from 'next/server';

const REMOTE_PLANE_MODEL_URL =
  'https://storage.googleapis.com/gmp-maps-demos/p3d-map/assets/Airplane.glb';

export async function GET() {
  try {
    const upstream = await fetch(REMOTE_PLANE_MODEL_URL, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch plane model.' },
        { status: upstream.status },
      );
    }

    const arrayBuffer = await upstream.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Unexpected error while fetching plane model.' },
      { status: 500 },
    );
  }
}
