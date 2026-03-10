const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/amarace/image/upload';

/**
 * Injects Cloudinary optimization params into image URLs.
 * Works with ANY cloud name — preserves the original cloud name in the URL.
 * Only uses CLOUDINARY_BASE_URL to map local paths (no cloud yet).
 *
 * q_auto: Best quality/compression ratio
 * f_auto: Best format for browser (WebP, etc.)
 * w_[width]: Resize to given width
 */
export const optimizeImage = (url, width) => {
    if (!url || typeof url !== 'string') {
        return url;
    }

    let processedUrl = url;

    // If it's a local path (starts with /), map it to the new Cloudinary account's site-assets
    if (url.startsWith('/')) {
        const imageName = url.split('/').pop().split('.')[0];
        processedUrl = `${CLOUDINARY_BASE_URL}/site-assets/${imageName.replace(/-/g, '_')}`;
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
        const transformation = width ? `q_auto,f_auto,w_${width}` : 'q_auto,f_auto';
        return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }

    return processedUrl;
};
