import { computed, reactive } from 'vue';

export default function useProcessingDialog() {
    const defaultOptions = {
        enableCancel: false,
        cancelCallback: null,
        desc: '',
        indeterminate: true,
        modelValue: -1
    };

    const processingDialogSettings = reactive({
        show: false,
        ...defaultOptions
    });

    const isProcessing = computed(() => processingDialogSettings.show);
    const progressValue = computed(() => processingDialogSettings.modelValue);

    function enableProcessing(options = -1) {
        const normalizedOptions =
            typeof options === 'number' ? { modelValue: options } : options;
        const mergedOptions = {
            ...defaultOptions,
            ...(normalizedOptions || {})
        };

        processingDialogSettings.show = true;
        processingDialogSettings.enableCancel = mergedOptions.enableCancel;
        processingDialogSettings.cancelCallback = mergedOptions.cancelCallback;
        processingDialogSettings.desc = mergedOptions.desc;
        processingDialogSettings.indeterminate = mergedOptions.indeterminate;
        processingDialogSettings.modelValue = mergedOptions.modelValue;
    }

    function disableProcessing() {
        processingDialogSettings.show = false;
        resetProcessingValue();
    }

    function setProcessingValue(key, value) {
        if (typeof processingDialogSettings[key] === 'undefined') {
            return;
        }

        processingDialogSettings[key] = value;
    }

    function resetProcessingValue() {
        processingDialogSettings.enableCancel = defaultOptions.enableCancel;
        processingDialogSettings.cancelCallback = defaultOptions.cancelCallback;
        processingDialogSettings.desc = defaultOptions.desc;
        processingDialogSettings.indeterminate = defaultOptions.indeterminate;
        processingDialogSettings.modelValue = defaultOptions.modelValue;
    }

    return {
        isProcessing,
        progressValue,
        processingDialogSettings,
        enableProcessing,
        disableProcessing,
        setProcessingValue
    };
}
