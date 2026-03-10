const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/amarace/image/upload';

/**
 * Automatically injects Cloudinary optimization parameters into image URLs.
 * q_auto: Automatically chooses the best quality/compression ratio.
 * f_auto: Automatically chooses the best image format for the browser (e.g., WebP).
 * w_[width]: Resizes the image to the specified width.
 */
export const optimizeImage = (url, width) => {
    if (!url || typeof url !== 'string') {
        return url;
    }

    // Handle local paths by mapping them to Cloudinary (assuming they've been uploaded to 'site-assets')
    let processedUrl = url;
    if (url.startsWith('/')) {
        const imageName = url.split('/').pop().split('.')[0];
        // Special case for logos/icons that might be in specific folders
        if (url.includes('/payment/')) {
            processedUrl = `${CLOUDINARY_BASE_URL}/site-assets/${imageName.replace('-', '_')}`;
        } else {
            processedUrl = `${CLOUDINARY_BASE_URL}/site-assets/${imageName.replace('-', '_')}`;
        }
    }

    if (!processedUrl.includes('cloudinary.com')) {
        return processedUrl;
    }

    // Check if URL already has transformations
    if (processedUrl.includes('/upload/')) {
        const parts = processedUrl.split('/upload/');
        const transformation = width ? `q_auto,f_auto,w_${width}` : 'q_auto,f_auto';
        return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }

    return processedUrl;
};
