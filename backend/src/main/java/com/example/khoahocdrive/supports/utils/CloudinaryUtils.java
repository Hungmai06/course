package com.example.khoahocdrive.supports.utils;

/**
 * Utility class for optimizing Cloudinary image URLs.
 *
 * <p>URLs stored in the database follow the pattern:
 * {@code https://res.cloudinary.com/<cloud>/image/upload/v<version>/image.png}
 *
 * <p>This utility injects {@code f_auto,q_auto} transformation parameters so the
 * browser automatically receives the best format (WebP / AVIF) at the optimal
 * quality level, reducing bandwidth without touching a single database record.
 *
 * <p>Example:
 * <pre>
 *   Input : https://res.cloudinary.com/cloud/image/upload/v123/photo.jpg
 *   Output: https://res.cloudinary.com/cloud/image/upload/f_auto,q_auto/v123/photo.jpg
 * </pre>
 *
 * <p><b>Transformation reference:</b>
 * <ul>
 *   <li>{@code f_auto} – serves WebP to Chrome/Edge/Firefox, AVIF where supported,
 *       JPEG/PNG as fallback. Typically saves 25-40 % vs the original format.</li>
 *   <li>{@code q_auto} – Cloudinary chooses the perceptually optimal quality
 *       (roughly equivalent to JPEG 80). Typically saves another 20-30 %.</li>
 * </ul>
 */
public final class CloudinaryUtils {

    /** Cloudinary upload path segment that marks where to inject transformations. */
    private static final String UPLOAD_SEGMENT = "/image/upload/";

    /** Transformations to inject. Add more here as needed (e.g. "w_auto,dpr_auto"). */
    private static final String DEFAULT_TRANSFORMS = "f_auto,q_auto";

    private CloudinaryUtils() {
        // Utility class – no instantiation
    }

    /**
     * Optimizes a Cloudinary URL by injecting {@code f_auto,q_auto} after the
     * {@code /image/upload/} segment.
     *
     * <p>If the URL is {@code null}, empty, not a Cloudinary URL, or the
     * transformations are already present, the original value is returned unchanged.
     *
     * @param url the raw URL stored in the database
     * @return the optimized URL, or the original URL if no transformation is needed
     */
    public static String optimize(String url) {
        return optimize(url, DEFAULT_TRANSFORMS);
    }

    /**
     * Optimizes a Cloudinary URL with a custom set of transformations.
     *
     * @param url        the raw URL stored in the database
     * @param transforms a comma-separated Cloudinary transformation string,
     *                   e.g. {@code "f_auto,q_auto,w_800,dpr_auto"}
     * @return the optimized URL, or the original URL if no transformation is needed
     */
    public static String optimize(String url, String transforms) {
        if (url == null || url.isBlank()) {
            return url;
        }

        int uploadIdx = url.indexOf(UPLOAD_SEGMENT);
        if (uploadIdx < 0) {
            // Not a standard Cloudinary upload URL – return as-is
            return url;
        }

        // Check if any Cloudinary transformation is already present
        // (i.e. something between /upload/ and the resource path that is not a version)
        String afterUpload = url.substring(uploadIdx + UPLOAD_SEGMENT.length());

        // A transformation block contains letters/underscores/commas and does NOT
        // start with 'v' followed only by digits (that would be a version tag like v123).
        // We skip injection if f_auto or q_auto is already in the URL.
        if (url.contains("f_auto") || url.contains("q_auto")) {
            return url;
        }

        // Build the optimized URL: everything up to and including "/image/upload/"
        // + the transforms + "/" + the rest
        return url.substring(0, uploadIdx + UPLOAD_SEGMENT.length())
                + transforms
                + "/"
                + afterUpload;
    }
}
