import { describe, it, expect } from 'vitest';
import useProcessingDialog from '@/hooks/useProcessingDialog';

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('useProcessingDialog', () => {

    function setup() {
        return useProcessingDialog();
    }

    // ── Initial state ─────────────────────────────────────────────────────────
    describe('initial state', () => {
        it('show is false', () => {
            const { processingDialogSettings } = setup();
            expect(processingDialogSettings.show).toBe(false);
        });

        it('isProcessing computed returns false', () => {
            const { isProcessing } = setup();
            expect(isProcessing.value).toBe(false);
        });

        it('progressValue computed returns -1 (default modelValue)', () => {
            const { progressValue } = setup();
            expect(progressValue.value).toBe(-1);
        });

        it('has sensible defaults for all fields', () => {
            const { processingDialogSettings } = setup();
            expect(processingDialogSettings.enableCancel).toBe(false);
            expect(processingDialogSettings.cancelCallback).toBeNull();
            expect(processingDialogSettings.desc).toBe('');
            expect(processingDialogSettings.indeterminate).toBe(true);
            expect(processingDialogSettings.modelValue).toBe(-1);
        });
    });

    // ── enableProcessing ──────────────────────────────────────────────────────
    describe('enableProcessing', () => {
        it('sets show=true', () => {
            const { processingDialogSettings, enableProcessing } = setup();
            enableProcessing();
            expect(processingDialogSettings.show).toBe(true);
        });

        it('accepts a number shorthand and sets modelValue', () => {
            const { processingDialogSettings, enableProcessing } = setup();
            enableProcessing(75);
            expect(processingDialogSettings.modelValue).toBe(75);
        });

        it('accepts an options object and applies all fields', () => {
            const { processingDialogSettings, enableProcessing } = setup();
            const cb = () => {};
            enableProcessing({
                enableCancel: true,
                cancelCallback: cb,
                desc: 'Uploading…',
                indeterminate: false,
                modelValue: 50
            });
            expect(processingDialogSettings.enableCancel).toBe(true);
            expect(processingDialogSettings.cancelCallback).toBe(cb);
            expect(processingDialogSettings.desc).toBe('Uploading…');
            expect(processingDialogSettings.indeterminate).toBe(false);
            expect(processingDialogSettings.modelValue).toBe(50);
        });

        it('uses defaults for omitted options', () => {
            const { processingDialogSettings, enableProcessing } = setup();
            enableProcessing({ desc: 'Loading' });
            expect(processingDialogSettings.enableCancel).toBe(false);
            expect(processingDialogSettings.indeterminate).toBe(true);
        });

        it('updates isProcessing computed to true', () => {
            const { isProcessing, enableProcessing } = setup();
            enableProcessing();
            expect(isProcessing.value).toBe(true);
        });
    });

    // ── disableProcessing ─────────────────────────────────────────────────────
    describe('disableProcessing', () => {
        it('sets show=false', () => {
            const { processingDialogSettings, enableProcessing, disableProcessing } = setup();
            enableProcessing();
            disableProcessing();
            expect(processingDialogSettings.show).toBe(false);
        });

        it('resets all fields to defaults', () => {
            const { processingDialogSettings, enableProcessing, disableProcessing } = setup();
            enableProcessing({ desc: 'Working', modelValue: 40, enableCancel: true });
            disableProcessing();
            expect(processingDialogSettings.desc).toBe('');
            expect(processingDialogSettings.modelValue).toBe(-1);
            expect(processingDialogSettings.enableCancel).toBe(false);
            expect(processingDialogSettings.indeterminate).toBe(true);
            expect(processingDialogSettings.cancelCallback).toBeNull();
        });

        it('updates isProcessing computed to false', () => {
            const { isProcessing, enableProcessing, disableProcessing } = setup();
            enableProcessing();
            disableProcessing();
            expect(isProcessing.value).toBe(false);
        });
    });

    // ── setProcessingValue ────────────────────────────────────────────────────
    describe('setProcessingValue', () => {
        it('updates a known key', () => {
            const { processingDialogSettings, setProcessingValue } = setup();
            setProcessingValue('desc', 'New desc');
            expect(processingDialogSettings.desc).toBe('New desc');
        });

        it('ignores unknown keys', () => {
            const { processingDialogSettings, setProcessingValue } = setup();
            setProcessingValue('unknownKey', 'value');
            expect(processingDialogSettings.unknownKey).toBeUndefined();
        });

        it('updates modelValue and reflects in progressValue computed', () => {
            const { progressValue, setProcessingValue } = setup();
            setProcessingValue('modelValue', 90);
            expect(progressValue.value).toBe(90);
        });
    });
});
