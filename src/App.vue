<template>
    <v-app id="my-app">
        <router-view />
        <processing-dialog
            :show="processingDialogSettings.show"
            :progressValue="processingDialogSettings.modelValue"
        />
        <notice-dialog
            :show="noticeDialogSettings.show"
            :title="noticeDialogSettings.title"
            :desc="noticeDialogSettings.desc"
            :btnText="noticeDialogSettings.btnText"
            :btnCallback="noticeDialogSettings.btnCallback"
        />
        <app-toast-panel ref="toastPanel" />
    </v-app>
</template>

<script>
import WebFont from 'webfontloader';
import ProcessingDialog from '@/components/common/ProcessingDialog.vue';
import NoticeDialog from '@/components/common/NoticeDialog.vue';
import AppToastPanel from '@/components/common/AppToastPanel.vue';
import useAppShellServices from '@/foundation/app/useAppShellServices';

export default {
    name: 'App',
    expose: [],
    components: {
        ProcessingDialog,
        NoticeDialog,
        AppToastPanel
    },
    setup() {
        return useAppShellServices();
    },
    provide() {
        return {
            // Qtify popover
            showQPopover: this.showQPopover,
            closeQPopover: this.closeQPopover,
            setQPopoverOptions: this.setQPopoverOptions,
            // Processing dialog
            enableProcessing: this.enableProcessing,
            disableProcessing: this.disableProcessing,
            setProcessingValue: this.setProcessingValue,
            // Notice dialog
            enableNotice: this.enableNotice,
            setNoticeValue: this.setNoticeValue,
            // Toast
            showToast: this.showToast,
            showSuccessToast: this.showSuccessToast,
            showErrorToast: this.showErrorToast,
            // Global refs
            getRef: this.getRef,
            addRef: this.addRef
        };
    },
    created() {
        WebFont.load({
            google: {
                families: ['Poppins:400,500,700', 'Roboto:400,500,700']
            },
            custom: {
                families: ['Material Design Icons'],
                urls: [
                    'https://cdn.jsdelivr.net/npm/@mdi/font/css/materialdesignicons.min.css'
                ]
            }
        });
    },
    methods: {
        showToast(msgTitle, msgContent = '', statusIcon = 'success') {
            this.$refs.toastPanel?.showToast(msgTitle, msgContent, statusIcon);
        },
        showSuccessToast(msgTitle, msgContent = '') {
            this.$refs.toastPanel?.showSuccessToast(msgTitle, msgContent);
        },
        showErrorToast(msgTitle, msgContent = '') {
            this.$refs.toastPanel?.showErrorToast(msgTitle, msgContent);
        }
    }
};
</script>

<style>
#my-app {
    font-family: 'Roboto', sans-serif;
}
</style>
