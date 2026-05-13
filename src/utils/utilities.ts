export const cx = (...classes: (string | boolean | undefined | null)[]) =>
    classes.filter(Boolean).join(" ");

export const random = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min)) + min;

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Creates a unique ID using crypto.randomUUID with optional shortening
 * @param {Object} options Configuration options
 * @param {string} options.prefix Optional prefix for the ID
 * @param {number} options.length Length of random portion (null for full UUID)
 * @param {boolean} options.noHyphens Remove hyphens from UUID
 * @returns {string} A unique identifier
 */
export function generateId({ prefix = "", length = 8, noHyphens = true } = {}) {
    // Use crypto for strong randomness
    let id = crypto.randomUUID();

    // Process the UUID based on options
    if (noHyphens) {
        id = id.replace(/-/g, "");
    }

    // Truncate if specified
    if (length && length < id.length) {
        id = id.substring(0, length);
    }

    // Add prefix if provided
    return prefix ? `${prefix}-${id}` : id;
}

/* Linear interpolation */
export const lerp = (
    number: number,
    currentScaleMin: number,
    currentScaleMax: number,
    newScaleMin = 0,
    newScaleMax = 1,
) => {
    const standardNormalization =
        (number - currentScaleMin) / (currentScaleMax - currentScaleMin);

    return (newScaleMax - newScaleMin) * standardNormalization + newScaleMin;
};

/**
 * Format bytes as human-readable text.
 *
 * Source: https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export const humanFileSize = (bytes: number, si = true, dp = 1) => {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + " B";
    }

    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );

    return bytes.toFixed(dp) + " " + units[u];
};
