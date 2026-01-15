import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image, folder = 'products' } = body;

        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        // Validate that it's a base64 image
        if (!image.startsWith('data:image/')) {
            return NextResponse.json(
                { error: 'Invalid image format. Expected base64 encoded image.' },
                { status: 400 }
            );
        }

        console.log('Uploading image to Cloudinary...');
        const result = await uploadToCloudinary(image, folder);
        console.log('Upload successful:', result.secure_url);

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        });
    } catch (error: any) {
        console.error('Error uploading to Cloudinary:', error);
        return NextResponse.json(
            { error: 'Failed to upload image', message: error.message },
            { status: 500 }
        );
    }
}
