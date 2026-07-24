import { describe, expect, it, beforeEach } from 'vitest';
import { saveRecord, getRecords, deleteRecord } from '@/helpers/db.js';

describe('db.js storage helper', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    it('should save and get records', async () => {
        const record = {
            id: 'test-1',
            type: 'milk',
            timestamp: 1627000000000,
            amount: 120,
            note: 'Morning feed'
        };

        await saveRecord(record);
        const records = await getRecords();

        expect(records.length).toBe(1);
        expect(records[0]).toEqual(record);
    });

    it('should sort records by timestamp in descending order', async () => {
        const record1 = {
            id: 'test-1',
            type: 'milk',
            timestamp: 1627000000000,
            amount: 120
        };
        const record2 = {
            id: 'test-2',
            type: 'sleep',
            timestamp: 1627010000000,
            duration: 60
        };

        await saveRecord(record1);
        await saveRecord(record2);

        const records = await getRecords();
        expect(records.length).toBe(2);
        // The one with larger timestamp (record2) should be first
        expect(records[0].id).toBe('test-2');
        expect(records[1].id).toBe('test-1');
    });

    it('should delete a record', async () => {
        const record = {
            id: 'test-delete',
            type: 'milk',
            timestamp: 1627000000000,
            amount: 100
        };

        await saveRecord(record);
        let records = await getRecords();
        expect(records.length).toBe(1);

        await deleteRecord('test-delete');
        records = await getRecords();
        expect(records.length).toBe(0);
    });
});
