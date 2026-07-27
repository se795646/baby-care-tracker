<template>
    <v-snackbar
        v-model="showDefaultToast"
        :timeout="3000"
        :color="snackbarColor"
        elevation="2"
        rounded="lg"
        location="top"
    >
        <div class="bq-flex bq-items-start bq-gap-2.5">
            <span class="bq-text-lg">{{ iconEmoji }}</span>
            <div class="bq-text-left">
                <div class="bq-text-sm bq-font-bold bq-text-white">
                    {{ toast.msgTitle }}
                </div>
                <div
                    v-if="toast.msgContent"
                    class="bq-mt-0.5 bq-text-xs bq-text-white/80"
                >
                    {{ toast.msgContent }}
                </div>
            </div>
        </div>
        <template #actions>
            <button
                type="button"
                class="bq-px-2 bq-py-1 bq-text-xs bq-font-bold bq-text-white hover:bq-text-white/80"
                @click="closeToast"
            >
                關閉
            </button>
        </template>
    </v-snackbar>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const showDefaultToast = ref(false);
const toast = reactive({
    msgTitle: '',
    msgContent: '',
    statusIcon: ''
});

const snackbarColor = computed(() => {
    if (toast.statusIcon === 'success') return 'teal-darken-1';
    if (toast.statusIcon === 'error') return 'red-darken-1';
    return 'blue-grey-darken-2';
});

const iconEmoji = computed(() => {
    if (toast.statusIcon === 'success') return '✅';
    if (toast.statusIcon === 'error') return '❌';
    return 'ℹ️';
});

const showSuccessToast = (msgTitle, msgContent = '') => {
    showToast(msgTitle, msgContent, 'success');
};

const showErrorToast = (msgTitle, msgContent = '') => {
    showToast(msgTitle, msgContent, 'error');
};

const showToast = (msgTitle, msgContent = '', statusIcon = 'success') => {
    closeToast();
    // 使用 nextTick/setTimeout 來重置 state 以觸發動畫
    setTimeout(() => {
        toast.msgTitle = msgTitle;
        toast.msgContent = msgContent;
        toast.statusIcon = statusIcon;
        showDefaultToast.value = true;
    }, 100);
};

const closeToast = () => {
    showDefaultToast.value = false;
    toast.msgTitle = '';
    toast.msgContent = '';
    toast.statusIcon = '';
};

// 暴露方法給父組件 App.vue 用 ref 呼叫
defineExpose({
    showToast,
    showSuccessToast,
    showErrorToast
});
</script>
