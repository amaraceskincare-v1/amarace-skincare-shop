const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/amarace/image/upload';

/**
 * Injects Cloudinary optimization params into image URLs.
 * Works with ANY cloud name — preserves the original cloud name in the URL.
 *
 * q_auto: Best quality/compression ratio
 * f_auto: Best format for browser (WebP, AVIF, etc.)
 * c_limit: Resize without upscaling or cropping full product details
 * w_[width]: Limit to given width
 */
export const optimizeImage = (url, width) => {
    if (!url || typeof url !== 'string') {
        return url || '/placeholder.jpg';
    }

    let processedUrl = url.trim();

    // If it's a blob, data URL, or local path (starts with /), return as-is
    if (processedUrl.startsWith('blob:') || processedUrl.startsWith('data:') || processedUrl.startsWith('/')) {
        return processedUrl;
    }

    // If not a Cloudinary URL at all, return as-is
    if (!processedUrl.includes('cloudinary.com')) {
        return processedUrl;
    }

    // If URL already has transformation params injected, return as-is (avoid double injection)
    if (processedUrl.includes('/upload/q_auto')) {
        return processedUrl;
    }

    // Inject optimization params after /upload/
    if (processedUrl.includes('/upload/')) {
        const parts = processedUrl.split('/upload/');
        const transformation = width
            ? `f_auto,q_auto:good,c_limit,w_${width}`
            : 'f_auto,q_auto:good';
        return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }

    return processedUrl;
};

