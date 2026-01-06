
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  // The exact path to the folder defined in the Python script
  const filePath = path.join('/home/node/channel_profiles', `${id}.jpg`);

  try {
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      const webStream = Readable.toWeb(fileStream) as ReadableStream<Uint8Array>;
      
      return new NextResponse(webStream, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400', // Cache for performance
        },
      });
    }
  } catch (error) {
    console.error("Error reading avatar file:", error);
  }

  // If the avatar is not found, return a default image or a 404 error
  return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
}
