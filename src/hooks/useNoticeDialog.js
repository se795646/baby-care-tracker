import { reactive } from 'vue';

export default function useNoticeDialog() {
    const defaultOptions = {
        btnCallback: () => {
            noticeDialogSettings.show = false;
        },
        title: '',
        desc: '',
        btnText: ''
    };

    const noticeDialogSettings = reactive({
        show: false,
        ...defaultOptions
    });

    function enableNotice(options = {}) {
        const mergedOptions = { ...defaultOptions, ...options };
        noticeDialogSettings.show = true;
        noticeDialogSettings.title = mergedOptions.title;
        noticeDialogSettings.desc = mergedOptions.desc;
        noticeDialogSettings.btnText = mergedOptions.btnText;
        noticeDialogSettings.btnCallback = () => {
            mergedOptions.btnCallback();
            defaultOptions.btnCallback();
        };
    }

    function setNoticeValue(key, value) {
        if (typeof noticeDialogSettings[key] === 'undefined') {
            return;
        }

        noticeDialogSettings[key] = value;
    }

    return {
        enableNotice,
        noticeDialogSettings,
        setNoticeValue
    };
}
