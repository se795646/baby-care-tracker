/**
 * Common utility functions.
 * Add project-specific helpers here.
 */

/**
 * Split array into chunks of given size.
 */
export function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
