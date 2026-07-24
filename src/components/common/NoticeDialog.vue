<template>
    <v-dialog :model-value="show" persistent max-width="400">
        <v-card class="bq-rounded-16 bq-overflow-hidden">
            <v-card-title class="bq-bg-gray-50 bq-p-4 bq-text-base bq-font-bold bq-text-gray-800 bq-border-b bq-flex bq-justify-between bq-items-center">
                <span>{{ title || '系統提示' }}</span>
            </v-card-title>
            <v-card-text class="bq-p-6 bq-text-sm bq-text-gray-600 bq-text-center">
                {{ desc }}
            </v-card-text>
            <v-card-actions class="bq-p-4 bq-bg-gray-50 bq-flex bq-justify-end">
                <button
                    type="button"
                    class="bq-bg-pink-500 hover:bq-bg-pink-600 active:bq-scale-98 bq-text-white bq-px-5 bq-py-2 bq-rounded-8 bq-font-bold bq-transition bq-text-sm bq-shadow-sm"
                    @click="onClick"
                >
                    {{ btnText || '確認' }}
                </button>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ''
    },
    desc: {
        type: String,
        default: ''
    },
    btnText: {
        type: String,
        default: ''
    },
    btnCallback: {
        type: Function,
        default: () => {}
    }
});

const onClick = () => {
    if (props.btnCallback) {
        props.btnCallback();
    }
};
</script>
