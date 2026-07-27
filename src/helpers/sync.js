import { supabase, isSupabaseConfigured } from './supabase.js';
import { saveRecord, getRecords, deleteRecord } from './db.js';

let isSyncing = false;

// Convert base64 data to Blob for Supabase Storage uploads
function base64ToBlob(base64Data, contentType = '') {
    const base64Parts = base64Data.split(',');
    const base64String = base64Parts[1] || base64Parts[0];
    const byteCharacters = atob(base64String);
    const byteArrays = [];
    const sliceSize = 512;

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
}

/**
 * Upload a base64 photo to Supabase Storage bucket "baby-photos"
 * and return its public URL.
 */
async function uploadPhoto(recordId, base64Photo) {
    if (!base64Photo || !base64Photo.startsWith('data:image')) {
        return base64Photo; // Already a URL or empty
    }

    try {
        const mimeMatch = base64Photo.match(/data:(.*?);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const extension = mimeType.split('/')[1] || 'jpg';
        const blob = base64ToBlob(base64Photo, mimeType);
        const fileName = `${recordId}.${extension}`;

        // Upload file to Supabase Storage
        const { error } = await supabase.storage
            .from('baby-photos')
            .upload(`records/${fileName}`, blob, {
                contentType: mimeType,
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const {
            data: { publicUrl }
        } = supabase.storage
            .from('baby-photos')
            .getPublicUrl(`records/${fileName}`);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading photo to Supabase:', error);
        return base64Photo; // Fallback to base64 locally if upload fails
    }
}

/**
 * Perform a bi-directional synchronization between local IndexedDB and Supabase.
 */
export async function syncWithSupabase() {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase is not configured. Sync skipped.');
        return false;
    }

    if (isSyncing) {
        console.log('Sync already in progress. Skipped.');
        return false;
    }

    isSyncing = true;
    console.log('Sync started...');

    try {
        // 1. Process Local Deletes
        const deletedIds = JSON.parse(
            localStorage.getItem('baby_tracker_deleted_ids') || '[]'
        );
        if (deletedIds.length > 0) {
            console.log(`Syncing ${deletedIds.length} deletions...`);
            const successfulDeletes = [];

            for (const id of deletedIds) {
                try {
                    const { error } = await supabase
                        .from('records')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    successfulDeletes.push(id);
                } catch (err) {
                    console.error(
                        `Failed to delete record ${id} from Supabase:`,
                        err
                    );
                }
            }

            // Clean up successfully synced deletes from localStorage
            const remainingDeletes = deletedIds.filter(
                (id) => !successfulDeletes.includes(id)
            );
            localStorage.setItem(
                'baby_tracker_deleted_ids',
                JSON.stringify(remainingDeletes)
            );
        }

        // 2. Upload Unsynced Local Records
        const localRecords = await getRecords();
        const unsyncedRecords = localRecords.filter((r) => r.synced === false);

        if (unsyncedRecords.length > 0) {
            console.log(
                `Uploading ${unsyncedRecords.length} unsynced records...`
            );
            for (const record of unsyncedRecords) {
                try {
                    // Upload photo first if it's base64
                    let photoUrl = record.photo;
                    if (photoUrl && photoUrl.startsWith('data:image')) {
                        photoUrl = await uploadPhoto(record.id, photoUrl);
                    }

                    const recordToUpload = {
                        id: record.id,
                        type: record.type,
                        timestamp: record.timestamp,
                        milkType: record.milkType || null,
                        amount:
                            record.amount !== undefined ? record.amount : null,
                        leftDuration:
                            record.leftDuration !== undefined
                                ? record.leftDuration
                                : null,
                        rightDuration:
                            record.rightDuration !== undefined
                                ? record.rightDuration
                                : null,
                        endTime: record.endTime || null,
                        duration:
                            record.duration !== undefined
                                ? record.duration
                                : null,
                        photo: photoUrl || null,
                        note: record.note || null,
                        updatedAt: record.updatedAt || Date.now()
                    };

                    // Upsert to Supabase
                    const { error } = await supabase
                        .from('records')
                        .upsert(recordToUpload);

                    if (error) throw error;

                    // Mark as synced locally
                    await saveRecord({
                        ...record,
                        photo: photoUrl,
                        synced: true
                    });
                } catch (err) {
                    console.error(`Failed to upload record ${record.id}:`, err);
                }
            }
        }

        // 3. Download Remote Records & Merge
        console.log('Downloading remote records...');
        const { data: remoteRecords, error } = await supabase
            .from('records')
            .select('*');

        if (error) throw error;

        // Fetch refreshed local records
        const freshLocalRecords = await getRecords();
        const localRecordMap = new Map(freshLocalRecords.map((r) => [r.id, r]));
        const remoteRecordMap = new Map(remoteRecords.map((r) => [r.id, r]));

        // Merge remote records to local IndexedDB
        for (const remoteRecord of remoteRecords) {
            const localRecord = localRecordMap.get(remoteRecord.id);

            if (!localRecord) {
                // Not present locally, save it
                await saveRecord({
                    ...remoteRecord,
                    synced: true
                });
            } else {
                // Present locally, check timestamps to resolve conflict
                const remoteUpdatedAt = remoteRecord.updatedAt || 0;
                const localUpdatedAt = localRecord.updatedAt || 0;

                if (remoteUpdatedAt > localUpdatedAt) {
                    // Remote is newer, update local
                    await saveRecord({
                        ...remoteRecord,
                        synced: true
                    });
                }
            }
        }

        // 4. Handle Remote Deletes
        // If a local record is marked as synced (meaning it has been successfully synced before),
        // but it is NOT found in the remote records map, it means another client deleted it.
        for (const localRecord of freshLocalRecords) {
            if (
                localRecord.synced === true &&
                !remoteRecordMap.has(localRecord.id)
            ) {
                console.log(
                    `Deleting local record ${localRecord.id} due to remote deletion.`
                );
                await deleteRecord(localRecord.id, true); // skipLog = true to avoid adding to deleted logs list
            }
        }

        console.log('Sync completed successfully.');
        return true;
    } catch (err) {
        console.error('Error during synchronization:', err);
        return false;
    } finally {
        isSyncing = false;
    }
}

/**
 * Subscribe to realtime changes on the Supabase records table.
 * @param {Function} onSyncRequired - Callback triggered when changes are detected.
 */
export function subscribeToRealtime(onSyncRequired) {
    if (!isSupabaseConfigured()) return null;

    const channel = supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'records'
            },
            (payload) => {
                console.log(
                    'Realtime change detected:',
                    payload.eventType,
                    payload.new?.id || payload.old?.id
                );
                onSyncRequired();
            }
        )
        .subscribe();

    return channel;
}
