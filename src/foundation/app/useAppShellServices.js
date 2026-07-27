import useGlobalRefs from '@/hooks/useGlobalRefs';
import useNoticeDialog from '@/hooks/useNoticeDialog';
import useProcessingDialog from '@/hooks/useProcessingDialog';

export default function useAppShellServices() {
    const {
        enableProcessing,
        disableProcessing,
        setProcessingValue,
        processingDialogSettings
    } = useProcessingDialog();
    const { enableNotice, setNoticeValue, noticeDialogSettings } =
        useNoticeDialog();
    const { getRef, addRef } = useGlobalRefs();

    // Dummy popovers implementation to satisfy App.vue provide bindings
    const showQPopover = () => {};
    const closeQPopover = () => {};
    const setQPopoverOptions = () => {};

    return {
        processingDialogSettings,
        noticeDialogSettings,
        enableProcessing,
        disableProcessing,
        setProcessingValue,
        enableNotice,
        setNoticeValue,
        getRef,
        addRef,
        showQPopover,
        closeQPopover,
        setQPopoverOptions
    };
}
