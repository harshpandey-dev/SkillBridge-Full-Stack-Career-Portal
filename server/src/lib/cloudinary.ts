import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary';
import { logger } from './logger';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Upload a buffer to Cloudinary using a stream.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: UploadApiOptions
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        logger.error('Cloudinary upload error:', error);
        return reject(error || new Error('Failed to upload file to Cloudinary'));
      }
      resolve(result);
    });

    uploadStream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary by its public ID.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' | 'video' | 'auto' = 'image'
): Promise<void> {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    logger.error(`Error deleting Cloudinary asset ${publicId}:`, error);
  }
}
