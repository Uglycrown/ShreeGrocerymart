import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
}

export async function uploadToCloudinary(
    base64Data: string,
    folder: string = 'products'
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            base64Data,
            {
                folder: `shree-grocery-mart/${folder}`,
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                        width: result.width,
                        height: result.height,
                        format: result.format,
                    });
                } else {
                    reject(new Error('No result from Cloudinary'));
                }
            }
        );
    });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export { cloudinary };
