/**
 * Optimizes an image before it is posted to Laravel/Wasmer.
 * The ORIGINAL selected file may be larger than the old 2,100 KB limit.
 * The uploaded file will be a resized WebP (or JPEG fallback) instead.
 *
 * No external JavaScript dependencies are required.
 */
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Could not open this image. Please choose a JPG, PNG, or WebP photo.'));
        };

        image.src = objectUrl;
    });
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Could not compress this image. Please try another photo.')),
            type,
            quality
        );
    });
}

export async function optimizeImage(file, { maxDimension = 1600, quality = 0.78 } = {}) {
    if (!file || !ACCEPTED_TYPES.has(file.type)) {
        throw new Error('Please select a JPG, PNG, or WebP image.');
    }

    const image = await loadImage(file);
    const originalWidth = image.naturalWidth;
    const originalHeight = image.naturalHeight;

    if (!originalWidth || !originalHeight) {
        throw new Error('The selected image has invalid dimensions.');
    }

    const scale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight));
    const width = Math.max(1, Math.round(originalWidth * scale));
    const height = Math.max(1, Math.round(originalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Image compression is not supported in this browser.');
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    let blob = await canvasToBlob(canvas, 'image/webp', quality);
    let extension = 'webp';

    // Older browsers may silently return PNG when WebP encoding is unsupported.
    if (blob.type !== 'image/webp') {
        const fallback = document.createElement('canvas');
        fallback.width = width;
        fallback.height = height;
        const fallbackContext = fallback.getContext('2d');

        if (!fallbackContext) {
            throw new Error('Image compression is not supported in this browser.');
        }

        // JPEG does not support transparency; use white instead of black.
        fallbackContext.fillStyle = '#ffffff';
        fallbackContext.fillRect(0, 0, width, height);
        fallbackContext.drawImage(canvas, 0, 0);
        blob = await canvasToBlob(fallback, 'image/jpeg', quality);
        extension = 'jpg';
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'photo';
    return new File([blob], `${baseName}-optimized.${extension}`, {
        type: blob.type,
        lastModified: Date.now(),
    });
}
