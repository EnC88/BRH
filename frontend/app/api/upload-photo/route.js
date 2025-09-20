import { NextRequest, NextResponse } from 'next/server';

// Import the Firebase functions from storing_photos.js
// Note: This is a simplified approach - in production you'd want to use Firebase Admin SDK
export async function POST(request) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo');
    const caption = formData.get('caption') || '';
    const tags = JSON.parse(formData.get('tags') || '[]');

    if (!photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 });
    }

    // Convert the photo to data URL for the storing_photos.js function
    const arrayBuffer = await photo.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${photo.type};base64,${base64}`;

    // For now, we'll return the data URL and let the frontend handle the upload
    // In a full implementation, you'd use Firebase Admin SDK here
    return NextResponse.json({
      success: true,
      dataUrl: dataUrl,
      caption: caption,
      tags: tags,
      message: 'Photo ready for upload'
    });

  } catch (error) {
    console.error('Error processing photo upload:', error);
    return NextResponse.json({ error: 'Failed to process photo' }, { status: 500 });
  }
}
