/**
 * Automatically injects Cloudinary optimization parameters into image URLs.
 * q_auto: Automatically chooses the best quality/compression ratio.
 * f_auto: Automatically chooses the best image format for the browser (e.g., WebP).
 * w_[width]: Resizes the image to the specified width.
 */
export const optimizeImage = (url, width) => {
    if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
        return url;
    }

    // Check if URL already has transformations
    if (url.includes('/upload/')) {
        const parts = url.split('/upload/');
        const transformation = width ? `q_auto,f_auto,w_${width}` : 'q_auto,f_auto';
        return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }

    return url;
};
