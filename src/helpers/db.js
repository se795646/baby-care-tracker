const DB_NAME = 'BabyTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'records';

let dbInstance = null;

/**
 * Initialize IndexedDB. If IndexedDB is not supported, it returns null.
 */
export function initDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        // Fallback for environments without indexedDB (e.g. server-side or older test runners)
        if (typeof window === 'undefined' || !window.indexedDB) {
            resolve(null);
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error: ', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

// Memory fallback store
let memoryStore = {};

function getMemoryStore() {
    try {
        const stored = localStorage.getItem(DB_NAME);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return memoryStore;
    }
}

function saveMemoryStore(store) {
    memoryStore = store;
    try {
        localStorage.setItem(DB_NAME, JSON.stringify(store));
    } catch (e) {
        // Fail silently if localStorage quota is exceeded
    }
}

/**
 * Save or update a baby record.
 * @param {Object} record - The baby record (milk or sleep).
 * @returns {Promise<Object>} The saved record.
 */
export async function saveRecord(record) {
    const db = await initDB();
    if (!db) {
        const store = getMemoryStore();
        store[record.id] = record;
        saveMemoryStore(store);
        return record;
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(record);

        request.onsuccess = () => resolve(record);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Get all baby records sorted by timestamp descending.
 * @returns {Promise<Array>} List of baby records.
 */
export async function getRecords() {
    const db = await initDB();
    if (!db) {
        const store = getMemoryStore();
        return Object.values(store).sort((a, b) => b.timestamp - a.timestamp);
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const result = request.result || [];
            result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(result);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Delete a baby record by ID.
 * @param {string} id - The record ID.
 * @returns {Promise<string>} The deleted record ID.
 */
export async function deleteRecord(id) {
    const db = await initDB();
    if (!db) {
        const store = getMemoryStore();
        delete store[id];
        saveMemoryStore(store);
        return id;
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve(id);
        request.onerror = (event) => reject(event.target.error);
    });
}
