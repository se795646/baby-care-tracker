<template>
    <v-dialog v-model="internalValue" max-width="500px" persistent>
        <v-card
            class="bq-rounded-20 bq-overflow-hidden !bq-border-0 bq-shadow-xl"
        >
            <!-- 標題欄 -->
            <v-card-title
                class="bq-flex bq-items-center bq-justify-between bq-bg-gradient-to-r bq-from-amber-500 bq-to-orange-600 bq-px-6 bq-py-4 bq-text-white"
            >
                <div class="bq-flex bq-items-center bq-gap-2">
                    <span class="bq-text-xl">🧷</span>
                    <span class="bq-text-base bq-font-bold">記錄更換尿布</span>
                </div>
                <button
                    type="button"
                    class="bq-text-xl bq-text-white/80 bq-transition hover:bq-text-white"
                    @click="closeDialog"
                >
                    ✕
                </button>
            </v-card-title>

            <!-- 內容區 -->
            <v-card-text
                class="bq-flex bq-flex-col bq-gap-5 bq-bg-slate-50/50 bq-p-6"
            >
                <!-- 1. 尿布狀態類型 -->
                <div>
                    <label
                        class="bq-mb-2 bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                        >更換類型</label
                    >
                    <div class="bq-rounded-10 bq-flex bq-bg-gray-100 bq-p-1">
                        <button
                            v-for="t in diaperTypes"
                            :key="t.value"
                            type="button"
                            class="bq-rounded-8 bq-flex-1 bq-py-2.5 bq-text-xs bq-font-bold bq-transition-all"
                            :class="
                                diaperForm.type === t.value
                                    ? 'scale-102 bq-bg-white bq-text-orange-600 bq-shadow-sm'
                                    : 'bq-text-gray-500 hover:bq-text-gray-800'
                            "
                            @click="diaperForm.type = t.value"
                        >
                            {{ t.label }}
                        </button>
                    </div>
                </div>

                <!-- 2. 大便顏色選擇 (僅限 dirty 或 both) -->
                <div
                    v-if="
                        diaperForm.type === 'dirty' ||
                        diaperForm.type === 'both'
                    "
                    class="bq-space-y-3"
                >
                    <div class="bq-flex bq-items-center bq-justify-between">
                        <label
                            class="bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                            >便便顏色（黃金九色卡對照）</label
                        >
                        <span class="bq-text-[10px] bq-text-gray-400"
                            >💡 請在日光或白光下比對</span
                        >
                    </div>

                    <!-- 顏色方塊選擇器 -->
                    <div class="bq-grid bq-grid-cols-4 bq-gap-2">
                        <button
                            v-for="color in poopColors"
                            :key="color.value"
                            type="button"
                            class="bq-rounded-12 bq-flex bq-flex-col bq-items-center bq-gap-1.5 bq-border-2 bq-p-2 bq-transition active:bq-scale-95"
                            :class="[
                                diaperForm.poopColor === color.value
                                    ? 'scale-102 bq-border-orange-500 bq-bg-white bq-shadow-sm'
                                    : 'bq-border-gray-100 bq-bg-white hover:bq-border-gray-300'
                            ]"
                            @click="diaperForm.poopColor = color.value"
                        >
                            <span
                                class="bq-h-6 bq-w-6 bq-rounded-full bq-border bq-border-gray-200 bq-shadow-inner"
                                :style="{ backgroundColor: color.hex }"
                            ></span>
                            <span
                                class="bq-text-[10px] bq-font-bold"
                                :class="
                                    color.isWarning
                                        ? 'bq-text-red-500'
                                        : 'bq-text-gray-600'
                                "
                            >
                                {{ color.label }}
                            </span>
                        </button>
                    </div>

                    <!-- 顏色異常警告橫幅 -->
                    <div
                        v-if="selectedColorWarning"
                        class="bq-rounded-12 bq-p-3.5 bq-text-xs bq-leading-relaxed"
                        :class="
                            selectedColorWarning.isCritical
                                ? 'bq-border bq-border-red-100 bq-bg-red-50 bq-text-red-700'
                                : 'bq-border bq-border-amber-100 bq-bg-amber-50 bq-text-amber-700'
                        "
                    >
                        <strong>{{
                            selectedColorWarning.isCritical
                                ? '🚨 警訊！'
                                : '⚠️ 兒科醫學會提醒：'
                        }}</strong>
                        {{ selectedColorWarning.text }}
                    </div>
                </div>

                <!-- 3. 大便形狀/狀態 (僅限 dirty 或 both) -->
                <div
                    v-if="
                        diaperForm.type === 'dirty' ||
                        diaperForm.type === 'both'
                    "
                >
                    <label
                        class="bq-mb-2 bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                        >便便狀態</label
                    >
                    <div class="bq-grid bq-grid-cols-4 bq-gap-2">
                        <button
                            v-for="s in poopStatuses"
                            :key="s.value"
                            type="button"
                            class="bq-rounded-10 bq-border bq-py-2 bq-text-xs bq-font-semibold bq-transition active:bq-scale-95"
                            :class="
                                diaperForm.poopStatus === s.value
                                    ? 'bq-border-orange-500 bq-bg-orange-50/50 bq-font-bold bq-text-orange-700'
                                    : 'bq-border-gray-200 bq-bg-white bq-text-gray-600 hover:bq-bg-gray-50'
                            "
                            @click="diaperForm.poopStatus = s.value"
                        >
                            {{ s.label }}
                        </button>
                    </div>

                    <!-- 腹瀉或便秘提醒 -->
                    <div
                        v-if="diaperForm.poopStatus === 'watery'"
                        class="bq-rounded-10 bq-mt-2.5 bq-border bq-border-red-100 bq-bg-red-50 bq-p-3 bq-text-xs bq-text-red-700"
                    >
                        ⚠️
                        <strong>腹瀉警訊：</strong
                        >便便呈稀水樣、次數突然增加可能為腹瀉或急性腸胃炎，請注意寶寶水分補充，若持續出現或活動力下降請儘速就醫。
                    </div>
                    <div
                        v-if="diaperForm.poopStatus === 'hard'"
                        class="bq-rounded-10 bq-mt-2.5 bq-border bq-border-amber-100 bq-bg-amber-50 bq-p-3 bq-text-xs bq-text-amber-700"
                    >
                        💡
                        <strong>便秘提醒：</strong
                        >便便硬、乾、呈顆粒狀代表有便秘傾向，請注意寶寶水分攝取或與兒科醫師討論是否需要調整奶粉。
                    </div>
                </div>

                <!-- 4. 更換時間 -->
                <div>
                    <label
                        class="bq-mb-1 bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                        >記錄時間</label
                    >
                    <input
                        v-model="diaperForm.time"
                        type="datetime-local"
                        class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm focus:bq-border-orange-300 focus:bq-outline-none"
                    />
                </div>

                <!-- 5. 拍照 (大便卡對照或給醫生看必備) -->
                <div>
                    <div
                        class="bq-mb-1 bq-flex bq-items-center bq-justify-between"
                    >
                        <label
                            class="bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                            >拍照記錄
                            (建議便便有疑慮時拍攝，以便就醫對照)</label
                        >
                    </div>
                    <CameraPicker v-model="diaperForm.photo" />
                </div>

                <!-- 6. 備註 -->
                <div>
                    <label
                        class="bq-mb-1 bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                        >備註</label
                    >
                    <input
                        v-model="diaperForm.note"
                        type="text"
                        placeholder="例如：尿布滿沉的、大便有酸味、紅屁屁擦藥等"
                        class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm focus:bq-border-orange-300 focus:bq-outline-none"
                    />
                </div>

                <!-- 7. 醫生專業衛教提示折疊區 -->
                <div
                    class="bq-rounded-12 bq-overflow-hidden bq-border bq-border-gray-200 bq-bg-white"
                >
                    <button
                        type="button"
                        class="bq-flex bq-w-full bq-items-center bq-justify-between bq-bg-gray-50 bq-px-4 bq-py-3 bq-transition hover:bq-bg-gray-100"
                        @click="showEduPanel = !showEduPanel"
                    >
                        <span class="bq-text-xs bq-font-bold bq-text-gray-700"
                            >🩺 小兒科醫師專業黃疸與尿布衛教</span
                        >
                        <span class="bq-text-xs bq-text-gray-500">{{
                            showEduPanel ? '▲' : '▼'
                        }}</span>
                    </button>

                    <div
                        v-show="showEduPanel"
                        class="bq-space-y-3 bq-border-t bq-border-gray-100 bq-px-4 bq-py-3.5 bq-text-xs bq-leading-relaxed bq-text-gray-600"
                    >
                        <div>
                            <strong class="bq-text-gray-800"
                                >1. 黃金九色大便辨識卡說明：</strong
                            >
                            <p class="bq-mt-0.5">
                                請在亮光下比對大便。7-9 號為正常黃/綠色；<span
                                    class="bq-font-bold bq-text-red-500"
                                    >1-6 號為異常淡黃/灰白色</span
                                >，此可能為膽道閉鎖或肝臟疾病，黃金治療期為出生後
                                60 天內，若有疑慮請務必拍照存檔並帶往兒科就診。
                            </p>
                        </div>
                        <hr class="bq-border-gray-100" />
                        <div>
                            <strong class="bq-text-gray-800"
                                >2. 寶寶每日尿尿脫水指標：</strong
                            >
                            <p class="bq-mt-0.5">
                                出生第 6 天起，每天應換 6
                                次以上沉甸甸的尿布。若尿液呈現深黃色代表水分不足，若尿布出現<span
                                    class="bq-font-bold bq-text-orange-500"
                                    >粉紅色/磚紅色結晶（尿酸鹽結晶）</span
                                >，代表奶量嚴重不足有脫水危險，應加強餵奶或就醫。
                            </p>
                        </div>
                    </div>
                </div>
            </v-card-text>

            <!-- 底部操作按鈕 -->
            <v-card-actions
                class="bq-flex bq-justify-end bq-gap-3 bq-bg-gray-50 bq-px-6 bq-py-4"
            >
                <button
                    type="button"
                    class="active:bq-scale-98 bq-rounded-10 bq-bg-gray-200 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-gray-700 bq-transition hover:bq-bg-gray-300"
                    @click="closeDialog"
                >
                    取消
                </button>
                <button
                    type="button"
                    class="active:bq-scale-98 bq-rounded-10 bq-bg-orange-500 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-white bq-shadow-sm bq-transition hover:bq-bg-orange-600"
                    @click="saveDiaperRecord"
                >
                    儲存記錄
                </button>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import CameraPicker from '@/components/CameraPicker.vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'save-record']);

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const showEduPanel = ref(false);

const diaperTypes = [
    { label: '尿尿 💦', value: 'wet' },
    { label: '大便 💩', value: 'dirty' },
    { label: '都有 💦+💩', value: 'both' },
    { label: '檢查/乾淨 ✨', value: 'dry' }
];

// 大便卡 1-9 號顏色定義及警告狀態
const poopColors = [
    {
        label: '黃色 (7-9號)',
        value: 'normal_yellow',
        hex: '#E6B012',
        isWarning: false
    },
    {
        label: '綠色 (7-9號)',
        value: 'normal_green',
        hex: '#63802C',
        isWarning: false
    },
    {
        label: '褐色 (7-9號)',
        value: 'normal_brown',
        hex: '#876735',
        isWarning: false
    },
    {
        label: '灰白 (1-6號)',
        value: 'abnormal_white',
        hex: '#E5E4DE',
        isWarning: true
    },
    {
        label: '淡黃 (1-6號)',
        value: 'abnormal_light_yellow',
        hex: '#F0E6A2',
        isWarning: true
    },
    { label: '血便 (紅色)', value: 'red', hex: '#BE2B30', isWarning: true },
    { label: '黑便 (黑色)', value: 'black', hex: '#1C1B1B', isWarning: true }
];

const poopStatuses = [
    { label: '稀糊 (母乳)', value: 'loose' },
    { label: '軟便 (正常)', value: 'soft' },
    { label: '硬便 (注意)', value: 'hard' },
    { label: '水樣 (腹瀉)', value: 'watery' }
];

const diaperForm = reactive({
    type: 'wet',
    poopColor: 'normal_yellow',
    poopStatus: 'soft',
    time: '',
    photo: '',
    note: ''
});

// 當前選擇的顏色警示文字
const selectedColorWarning = computed(() => {
    if (diaperForm.type !== 'dirty' && diaperForm.type !== 'both') return null;

    if (
        diaperForm.poopColor === 'abnormal_white' ||
        diaperForm.poopColor === 'abnormal_light_yellow'
    ) {
        return {
            isCritical: true,
            text: '寶寶大便呈現 1~6 號灰白色或淡黃色為「異常顏色」！這可能是膽道閉鎖或肝臟疾病的警訊，黃金治療期為出生後 60 天內，請務必拍照留存，並立即帶寶寶前往小兒科就醫諮詢。'
        };
    }
    if (diaperForm.poopColor === 'red') {
        return {
            isCritical: true,
            text: '寶寶大便帶血為血便！可能由腸胃發炎、過敏或消化道出血引起，請立刻拍照大便，並儘速就醫診療。'
        };
    }
    if (diaperForm.poopColor === 'black') {
        return {
            isCritical: true,
            text: '寶寶大便呈現深黑色（黑便 / 柏油便，排除剛出生的胎便外）可能表示上消化道出血，請拍照後立刻帶寶寶就醫。'
        };
    }

    // 正常顏色提示
    return {
        isCritical: false,
        text: '黃色、綠色及褐色均屬於 7~9 號「正常顏色」，代表寶寶肝膽功能健全，膽汁分泌正常。'
    };
});

const formatDatetimeLocal = (timestamp) => {
    const date = new Date(timestamp);
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

const resetForm = () => {
    diaperForm.type = 'wet';
    diaperForm.poopColor = 'normal_yellow';
    diaperForm.poopStatus = 'soft';
    diaperForm.time = formatDatetimeLocal(Date.now());
    diaperForm.photo = '';
    diaperForm.note = '';
    showEduPanel.value = false;
};

const closeDialog = () => {
    internalValue.value = false;
};

// 儲存換尿布
const saveDiaperRecord = () => {
    const timestamp = new Date(diaperForm.time).getTime();

    // 包裝成 JSON 序列化存入 note，以相容舊的 Supabase 資料庫欄位 Schema
    const diaperMetadata = {
        diaperType: diaperForm.type,
        poopColor:
            diaperForm.type === 'dirty' || diaperForm.type === 'both'
                ? diaperForm.poopColor
                : null,
        poopStatus:
            diaperForm.type === 'dirty' || diaperForm.type === 'both'
                ? diaperForm.poopStatus
                : null,
        realNote: diaperForm.note || ''
    };

    const record = {
        id: `diaper-${Date.now()}`,
        type: 'diaper',
        timestamp,
        photo: diaperForm.photo || '',
        note: JSON.stringify(diaperMetadata),
        updatedAt: Date.now(),
        synced: false
    };

    emit('save-record', record);
    closeDialog();
};

watch(internalValue, (newVal) => {
    if (newVal) {
        resetForm();
    }
});
</script>

<style scoped>
/* 精緻的微小動畫 */
.scale-102 {
    transform: scale(1.02);
}
</style>
