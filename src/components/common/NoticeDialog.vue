<template>
    <v-dialog :model-value="show" persistent max-width="400">
        <v-card class="bq-rounded-16 bq-overflow-hidden">
            <v-card-title
                class="bq-flex bq-items-center bq-justify-between bq-border-b bq-bg-gray-50 bq-p-4 bq-text-base bq-font-bold bq-text-gray-800"
            >
                <span>{{ title || '系統提示' }}</span>
            </v-card-title>
            <v-card-text
                class="bq-p-6 bq-text-center bq-text-sm bq-text-gray-600"
            >
                {{ desc }}
            </v-card-text>
            <v-card-actions class="bq-flex bq-justify-end bq-bg-gray-50 bq-p-4">
                <button
                    type="button"
                    class="active:bq-scale-98 bq-rounded-8 bq-bg-pink-500 bq-px-5 bq-py-2 bq-text-sm bq-font-bold bq-text-white bq-shadow-sm bq-transition hover:bq-bg-pink-600"
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
