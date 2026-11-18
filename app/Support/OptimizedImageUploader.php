<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Stores resized WebP images in the existing Supabase disk.
 * Works with PHP GD (included in Wasmer's PHP runtime, subject to verification).
 * Browser-side optimization is still used to reduce request size before Wasmer.
 */
class OptimizedImageUploader
{
    public static function store(
        UploadedFile $file,
        string $directory,
        string $field = 'photo',
        int $maxDimension = 1600
    ): string {
        $filePath = $file->getRealPath();
        $info = $filePath ? @getimagesize($filePath) : false;

        if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
            throw ValidationException::withMessages([
                $field => 'Please upload a valid JPG, PNG, or WebP image.',
            ]);
        }

        [$width, $height] = $info;

        // Prevent decompression bombs from exhausting Wasmer's PHP memory.
        // Regular browser uploads arrive already resized to <= 1600 pixels.
        if ($width <= 0 || $height <= 0 || $width * $height > 16_000_000) {
            throw ValidationException::withMessages([
                $field => 'This image has too many pixels to process safely. Try uploading it from the FleetFlow website.',
            ]);
        }

        $original = file_get_contents($filePath);
        if ($original === false) {
            throw ValidationException::withMessages([
                $field => 'Could not read the uploaded image.',
            ]);
        }

        // The browser already delivers a resized, compressed WebP. Keep it
        // unchanged, avoiding a second lossy encode and GD CPU/memory use.
        // This also lets normal FleetFlow uploads work if GD is unavailable.
        if ($info[2] === IMAGETYPE_WEBP && max($width, $height) <= $maxDimension) {
            $optimized = $original;
        } else {
            if (!function_exists('imagecreatefromstring') || !function_exists('imagewebp')) {
                throw ValidationException::withMessages([
                    $field => 'Server image processing is unavailable. Please upload through the FleetFlow website.',
                ]);
            }

            $source = @imagecreatefromstring($original);
            if ($source === false) {
                throw ValidationException::withMessages([
                    $field => 'Could not decode the image.',
                ]);
            }

            $scale = min(1, $maxDimension / max($width, $height));
            $newWidth = max(1, (int) round($width * $scale));
            $newHeight = max(1, (int) round($height * $scale));
            $target = imagecreatetruecolor($newWidth, $newHeight);

            if ($target === false) {
                imagedestroy($source);
                throw ValidationException::withMessages([
                    $field => 'Could not process this image.',
                ]);
            }

            imagealphablending($target, false);
            imagesavealpha($target, true);
            $transparent = imagecolorallocatealpha($target, 0, 0, 0, 127);
            imagefilledrectangle($target, 0, 0, $newWidth, $newHeight, $transparent);
            imagecopyresampled(
                $target,
                $source,
                0,
                0,
                0,
                0,
                $newWidth,
                $newHeight,
                $width,
                $height
            );

            ob_start();
            try {
                $encoded = @imagewebp($target, null, 78);
                $optimized = ob_get_contents();
            } finally {
                ob_end_clean();
                imagedestroy($target);
                imagedestroy($source);
            }

            if (!$encoded || !$optimized) {
                throw ValidationException::withMessages([
                    $field => 'Could not compress this image.',
                ]);
            }

        }

        $path = trim($directory, '/') . '/' . Str::uuid() . '.webp';
        $written = Storage::disk('supabase')->put($path, $optimized, [
            'ContentType' => 'image/webp',
        ]);

        if (!$written) {
            throw ValidationException::withMessages([
                $field => 'The image could not be saved. Please try again.',
            ]);
        }

        return $path;
    }
}
