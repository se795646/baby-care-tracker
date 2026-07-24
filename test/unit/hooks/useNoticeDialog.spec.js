import { describe, it, expect, vi } from 'vitest';
import useNoticeDialog from '@/hooks/useNoticeDialog';

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('useNoticeDialog', () => {

    function setup() {
        return useNoticeDialog();
    }

    // ── Initial state ─────────────────────────────────────────────────────────
    describe('initial state', () => {
        it('show is false', () => {
            const { noticeDialogSettings } = setup();
            expect(noticeDialogSettings.show).toBe(false);
        });

        it('title, desc, and btnText are empty strings', () => {
            const { noticeDialogSettings } = setup();
            expect(noticeDialogSettings.title).toBe('');
            expect(noticeDialogSettings.desc).toBe('');
            expect(noticeDialogSettings.btnText).toBe('');
        });

        it('default btnCallback hides the dialog when called', () => {
            const { noticeDialogSettings } = setup();
            // Manually show the dialog then call the default callback
            noticeDialogSettings.show = true;
            noticeDialogSettings.btnCallback();
            expect(noticeDialogSettings.show).toBe(false);
        });
    });

    // ── enableNotice ──────────────────────────────────────────────────────────
    describe('enableNotice', () => {
        it('sets show=true', () => {
            const { noticeDialogSettings, enableNotice } = setup();
            enableNotice({});
            expect(noticeDialogSettings.show).toBe(true);
        });

        it('applies title, desc, btnText from options', () => {
            const { noticeDialogSettings, enableNotice } = setup();
            enableNotice({ title: 'Warning', desc: 'Something went wrong', btnText: 'OK' });
            expect(noticeDialogSettings.title).toBe('Warning');
            expect(noticeDialogSettings.desc).toBe('Something went wrong');
            expect(noticeDialogSettings.btnText).toBe('OK');
        });

        it('uses empty defaults for omitted text fields', () => {
            const { noticeDialogSettings, enableNotice } = setup();
            enableNotice({ title: 'Only title' });
            expect(noticeDialogSettings.desc).toBe('');
            expect(noticeDialogSettings.btnText).toBe('');
        });
    });

    // ── btnCallback composition ───────────────────────────────────────────────
    describe('btnCallback', () => {
        it('calls the custom callback provided via enableNotice', () => {
            const { noticeDialogSettings, enableNotice } = setup();
            const customCb = vi.fn();
            enableNotice({ btnCallback: customCb });
            noticeDialogSettings.btnCallback();
            expect(customCb).toHaveBeenCalledOnce();
        });

        it('also calls the default callback (hides dialog)', () => {
            const { noticeDialogSettings, enableNotice } = setup();
            enableNotice({ btnCallback: vi.fn() });
            noticeDialogSettings.btnCallback();
            expect(noticeDialogSettings.show).toBe(false);
        });

        it('hides the dialog even when no custom callback is given', () => {
            const { noticeDialogSettings, enableNotice } = setup();
            // enableNotice merges with defaultOptions.btnCallback
            enableNotice({});
            noticeDialogSettings.btnCallback();
            expect(noticeDialogSettings.show).toBe(false);
        });
    });

    // ── setNoticeValue ────────────────────────────────────────────────────────
    describe('setNoticeValue', () => {
        it('updates a known key', () => {
            const { noticeDialogSettings, setNoticeValue } = setup();
            setNoticeValue('title', 'Updated title');
            expect(noticeDialogSettings.title).toBe('Updated title');
        });

        it('ignores unknown keys', () => {
            const { noticeDialogSettings, setNoticeValue } = setup();
            setNoticeValue('randomField', 'value');
            expect(noticeDialogSettings.randomField).toBeUndefined();
        });

        it('can update show directly', () => {
            const { noticeDialogSettings, setNoticeValue } = setup();
            setNoticeValue('show', true);
            expect(noticeDialogSettings.show).toBe(true);
        });
    });
});
