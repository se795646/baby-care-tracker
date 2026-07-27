<template>
    <v-dialog :model-value="show" persistent width="280">
        <v-card class="bq-rounded-12 bq-p-5 bq-text-center">
            <div class="bq-flex bq-flex-col bq-items-center bq-gap-4">
                <!-- 載入中動畫圈圈 -->
                <v-progress-circular
                    indeterminate
                    color="pink-500"
                    size="40"
                    width="4"
                ></v-progress-circular>

                <div class="bq-text-sm bq-font-bold bq-text-gray-700">
                    {{
                        progressValue >= 0
                            ? `載入中 (${progressValue}%)`
                            : '處理中，請稍候...'
                    }}
                </div>

                <v-progress-linear
                    v-if="progressValue >= 0"
                    :model-value="progressValue"
                    color="pink-500"
                    height="6"
                    rounded
                    class="bq-mt-1"
                ></v-progress-linear>
            </div>
        </v-card>
    </v-dialog>
</template>

<script setup>
defineProps({
    show: {
        type: Boolean,
        default: false
    },
    progressValue: {
        type: Number,
        default: -1
    }
});
</script>
