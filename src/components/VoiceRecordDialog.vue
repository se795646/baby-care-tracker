<template>
    <v-dialog
        v-model="internalValue"
        max-width="500px"
        persistent
        class="voice-record-dialog"
    >
        <v-card
            class="voice-card bq-rounded-20 bq-overflow-hidden !bq-border-0 bq-shadow-xl"
        >
            <!-- 頂部防呆拖拉條 (Bottom Sheet 質感) -->
            <div
                class="bq-flex bq-justify-center bq-bg-gradient-to-r bq-from-indigo-500 bq-to-purple-600 bq-py-2 sm:bq-hidden"
            >
                <div
                    class="bq-h-1.5 bq-w-12 bq-rounded-full bq-bg-white/40"
                ></div>
            </div>

            <!-- 標題欄 -->
            <v-card-title
                class="bq-flex bq-items-center bq-justify-between bq-bg-gradient-to-r bq-from-indigo-500 bq-to-purple-600 bq-px-6 bq-py-4 bq-text-white"
            >
                <div class="bq-flex bq-items-center bq-gap-2">
                    <span class="bq-text-xl">🎙️</span>
                    <span class="bq-text-base bq-font-bold">語音智慧記錄</span>
                </div>
                <button
                    type="button"
                    class="bq-flex bq-h-10 bq-w-10 bq-items-center bq-justify-center bq-rounded-full bq-text-xl bq-text-white/80 bq-transition hover:bq-bg-white/10 hover:bq-text-white"
                    @click="closeDialog"
                >
                    ✕
                </button>
            </v-card-title>

            <!-- 內容區 -->
            <v-card-text
                class="bq-flex bq-flex-col bq-items-center bq-gap-6 bq-bg-slate-50/50 bq-p-6"
            >
                <!-- 瀏覽器不支援提示 -->
                <div
                    v-if="!isSupported"
                    class="bq-rounded-12 bq-w-full bq-bg-red-50 bq-p-4 bq-text-center bq-text-sm bq-text-red-500"
                >
                    ⚠️ 您的行動裝置或瀏覽器目前不支援此語音辨識功能。<br />
                    建議使用 iOS Safari 或 Android Chrome 瀏覽器開啟。
                </div>

                <div
                    v-else
                    class="bq-flex bq-w-full bq-flex-col bq-items-center bq-gap-6"
                >
                    <!-- 錯誤狀態提示 -->
                    <div
                        v-if="errorMessage"
                        class="bq-rounded-12 bq-w-full bq-border bq-border-red-100 bq-bg-red-50 bq-p-4 bq-text-xs bq-text-red-700"
                    >
                        {{ errorMessage }}
                    </div>

                    <!-- 1. 錄音狀態與動畫 -->
                    <div
                        v-if="state === 'idle' || state === 'recording'"
                        class="bq-flex bq-flex-col bq-items-center bq-gap-4 bq-py-4"
                    >
                        <!-- 麥克風按鈕與波紋動畫 -->
                        <div
                            class="bq-relative bq-flex bq-h-32 bq-w-32 bq-items-center bq-justify-center"
                        >
                            <!-- 脈衝波紋效果 -->
                            <div
                                v-if="state === 'recording'"
                                class="bq-absolute bq-inset-0 bq-animate-ping bq-rounded-full bq-bg-indigo-400/30"
                            ></div>
                            <div
                                v-if="state === 'recording'"
                                class="bq-absolute bq-h-24 bq-w-24 bq-animate-pulse bq-rounded-full bq-bg-indigo-300/40"
                            ></div>

                            <!-- 主按鈕 -->
                            <button
                                type="button"
                                class="bq-relative bq-z-10 bq-flex bq-h-20 bq-w-20 bq-items-center bq-justify-center bq-rounded-full bq-shadow-md bq-transition-all bq-duration-300"
                                :class="
                                    state === 'recording'
                                        ? 'scale-110 active:scale-95 bq-bg-red-500 bq-text-white hover:bq-bg-red-600'
                                        : 'active:scale-95 bq-bg-gradient-to-tr bq-from-indigo-500 bq-to-purple-600 bq-text-white hover:bq-shadow-lg'
                                "
                                @click="toggleRecording"
                            >
                                <span
                                    v-if="state === 'recording'"
                                    class="bq-text-2xl"
                                    >⏹️</span
                                >
                                <span v-else class="bq-text-2xl">🎤</span>
                            </button>
                        </div>

                        <!-- 狀態提示文字 -->
                        <div class="bq-text-center">
                            <span
                                class="bq-text-sm bq-font-bold"
                                :class="
                                    state === 'recording'
                                        ? 'bq-animate-pulse bq-text-red-500'
                                        : 'bq-text-gray-500'
                                "
                            >
                                {{
                                    state === 'recording'
                                        ? '正在聆聽中...請說話'
                                        : '點擊麥克風開始說話'
                                }}
                            </span>
                            <div class="bq-mt-1 bq-text-xs bq-text-gray-400">
                                例如：「餵奶 120cc」、「睡了 1 個小時」
                            </div>
                        </div>
                    </div>

                    <!-- 2. 即時辨識出的文字顯示 -->
                    <div
                        v-if="transcript || interimTranscript"
                        class="bq-rounded-12 bq-w-full bq-border bq-border-gray-100 bq-bg-white bq-p-4 bq-shadow-inner"
                    >
                        <label
                            class="bq-mb-1 bq-block bq-text-[10px] bq-font-bold bq-uppercase bq-tracking-wider bq-text-gray-400"
                            >我聽到的內容</label
                        >
                        <p
                            class="bq-min-h-10 bq-text-sm bq-leading-relaxed bq-text-gray-700"
                        >
                            <span>{{ transcript }}</span>
                            <span class="bq-italic bq-text-gray-400">{{
                                interimTranscript
                            }}</span>
                        </p>
                    </div>

                    <!-- 3. 解析結果卡片 -->
                    <div
                        v-if="state === 'parsed' && parsedResult"
                        class="bq-flex bq-w-full bq-flex-col bq-gap-4"
                    >
                        <div
                            class="bq-rounded-12 bq-flex bq-items-start bq-gap-3 bq-border bq-border-emerald-100 bq-bg-emerald-50 bq-p-4"
                        >
                            <span class="bq-text-xl bq-text-emerald-500"
                                >✨</span
                            >
                            <div class="bq-flex-1">
                                <h4
                                    class="bq-text-sm bq-font-bold bq-text-emerald-800"
                                >
                                    成功辨識作息記錄！
                                </h4>
                                <p
                                    class="bq-mt-0.5 bq-text-xs bq-text-emerald-600"
                                >
                                    請確認以下內容無誤，亦可手動微調。
                                </p>
                            </div>
                        </div>

                        <!-- 記錄資訊編輯卡片 -->
                        <div
                            class="bq-rounded-16 bq-flex bq-flex-col bq-gap-4 bq-border bq-border-gray-100 bq-bg-white bq-p-5 bq-shadow-sm"
                        >
                            <!-- 類型標籤 -->
                            <div class="bq-flex bq-items-center bq-gap-3">
                                <span class="bq-text-3xl">{{
                                    parsedResult.type === 'milk' ? '🍼' : '💤'
                                }}</span>
                                <div>
                                    <span
                                        class="bq-text-base bq-font-bold bq-text-gray-800"
                                    >
                                        {{
                                            parsedResult.type === 'milk'
                                                ? '餵奶記錄'
                                                : '睡眠記錄'
                                        }}
                                    </span>
                                    <span
                                        class="bq-block bq-text-xs bq-text-gray-400"
                                    >
                                        {{ getSubtypeName() }}
                                    </span>
                                </div>
                            </div>

                            <hr class="bq-border-gray-100" />

                            <!-- 餵奶細節調整 -->
                            <div
                                v-if="parsedResult.type === 'milk'"
                                class="bq-flex bq-flex-col bq-gap-3"
                            >
                                <!-- 非親餵 (配方奶/瓶餵/副食品) 調整奶量 -->
                                <div
                                    v-if="
                                        parsedResult.milkType !==
                                        'breast_direct'
                                    "
                                >
                                    <label
                                        class="bq-mb-1 bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                                    >
                                        餵奶量 (ml)
                                    </label>
                                    <div
                                        class="bq-flex bq-items-center bq-gap-2"
                                    >
                                        <button
                                            type="button"
                                            class="bq-rounded-8 bq-h-12 bq-w-12 bq-bg-gray-100 bq-text-lg bq-font-bold bq-text-gray-600 bq-transition hover:bq-bg-gray-200 active:bq-scale-95"
                                            @click="adjustAmount(-10)"
                                        >
                                            -
                                        </button>
                                        <input
                                            v-model.number="parsedResult.amount"
                                            type="number"
                                            class="bq-rounded-8 bq-h-12 bq-flex-1 bq-border bq-border-gray-200 bq-text-center bq-text-base bq-font-bold focus:bq-border-indigo-400 focus:bq-outline-none"
                                        />
                                        <button
                                            type="button"
                                            class="bq-rounded-8 bq-h-12 bq-w-12 bq-bg-gray-100 bq-text-lg bq-font-bold bq-text-gray-600 bq-transition hover:bq-bg-gray-200 active:bq-scale-95"
                                            @click="adjustAmount(10)"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <!-- 親餵時間調整 -->
                                <div
                                    v-else
                                    class="bq-grid bq-grid-cols-2 bq-gap-3"
                                >
                                    <div>
                                        <label
                                            class="bq-mb-1 bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                                            >左側時間 (分)</label
                                        >
                                        <div
                                            class="bq-flex bq-items-center bq-gap-1"
                                        >
                                            <input
                                                v-model.number="
                                                    parsedResult.leftDuration
                                                "
                                                type="number"
                                                class="bq-rounded-8 bq-h-12 bq-w-full bq-border bq-border-gray-200 bq-text-center bq-text-base bq-font-bold focus:bq-border-indigo-400 focus:bq-outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            class="bq-mb-1 bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                                            >右側時間 (分)</label
                                        >
                                        <div
                                            class="bq-flex bq-items-center bq-gap-1"
                                        >
                                            <input
                                                v-model.number="
                                                    parsedResult.rightDuration
                                                "
                                                type="number"
                                                class="bq-rounded-8 bq-h-12 bq-w-full bq-border bq-border-gray-200 bq-text-center bq-text-base bq-font-bold focus:bq-border-indigo-400 focus:bq-outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 睡眠細節調整 -->
                            <div
                                v-if="parsedResult.type === 'sleep'"
                                class="bq-flex bq-flex-col bq-gap-3"
                            >
                                <div>
                                    <label
                                        class="bq-mb-1 bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                                    >
                                        睡眠時間 (分鐘)
                                    </label>
                                    <div
                                        class="bq-flex bq-items-center bq-gap-2"
                                    >
                                        <button
                                            type="button"
                                            class="bq-rounded-8 bq-h-12 bq-w-12 bq-bg-gray-100 bq-text-lg bq-font-bold bq-text-gray-600 bq-transition hover:bq-bg-gray-200 active:bq-scale-95"
                                            @click="adjustDuration(-5)"
                                        >
                                            -
                                        </button>
                                        <input
                                            v-model.number="
                                                parsedResult.duration
                                            "
                                            type="number"
                                            class="bq-rounded-8 bq-h-12 bq-flex-1 bq-border bq-border-gray-200 bq-text-center bq-text-base bq-font-bold focus:bq-border-indigo-400 focus:bq-outline-none"
                                        />
                                        <button
                                            type="button"
                                            class="bq-rounded-8 bq-h-12 bq-w-12 bq-bg-gray-100 bq-text-lg bq-font-bold bq-text-gray-600 bq-transition hover:bq-bg-gray-200 active:bq-scale-95"
                                            @click="adjustDuration(5)"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span
                                        class="bq-mt-1 bq-block bq-text-[11px] bq-text-gray-400"
                                    >
                                        等同於:
                                        {{
                                            formatDuration(
                                                parsedResult.duration
                                            )
                                        }}
                                    </span>
                                </div>
                            </div>

                            <!-- 備註編輯 -->
                            <div>
                                <label
                                    class="bq-mb-1 bq-block bq-text-xs bq-font-bold bq-text-gray-500"
                                    >備註</label
                                >
                                <textarea
                                    v-model="parsedResult.note"
                                    rows="2"
                                    class="bq-rounded-8 bq-w-full bq-border bq-border-gray-200 bq-p-3 bq-text-xs focus:bq-border-indigo-400 focus:bq-outline-none"
                                    placeholder="備註資訊..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- 4. 解析失敗提示 -->
                    <div
                        v-if="state === 'failed'"
                        class="bq-flex bq-w-full bq-flex-col bq-gap-4"
                    >
                        <div
                            class="bq-rounded-12 bq-flex bq-items-start bq-gap-3 bq-border bq-border-red-100 bq-bg-red-50 bq-p-4"
                        >
                            <span class="bq-text-xl bq-text-red-500">❌</span>
                            <div class="bq-flex-1">
                                <h4
                                    class="bq-text-sm bq-font-bold bq-text-red-800"
                                >
                                    無法分析語音內容
                                </h4>
                                <p class="bq-mt-0.5 bq-text-xs bq-text-red-600">
                                    請嘗試用更精確的詞彙，或重新錄製一遍。
                                </p>
                            </div>
                        </div>

                        <div class="bq-px-2 bq-text-xs bq-text-gray-500">
                            <strong>💡 建議說法：</strong>
                            <ul
                                class="bq-mt-1 bq-list-inside bq-list-disc bq-space-y-1"
                            >
                                <li>「餵奶 120cc」</li>
                                <li>「剛剛餵了配方奶 150 毫升」</li>
                                <li>「吃副食品 80克」</li>
                                <li>「親餵 20 分鐘」</li>
                                <li>「睡了 1 個小時」</li>
                                <li>「剛剛睡了 45 分鐘」</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </v-card-text>

            <!-- 底部按鈕 (加高高度與 padding，方便行動端點擊) -->
            <v-card-actions
                class="bq-flex bq-justify-end bq-gap-3 bq-bg-slate-100 bq-px-6 bq-py-4"
            >
                <button
                    v-if="state === 'parsed'"
                    type="button"
                    class="bq-rounded-8 bq-h-11 bq-border bq-border-gray-300 bq-px-4 bq-text-xs bq-font-bold bq-text-gray-600 bq-transition hover:bq-bg-gray-50 active:bq-scale-95"
                    @click="resetState"
                >
                    重新錄製
                </button>
                <button
                    v-if="state === 'failed'"
                    type="button"
                    class="bq-rounded-8 bq-h-11 bq-bg-indigo-500 bq-px-5 bq-text-xs bq-font-bold bq-text-white bq-transition hover:bq-bg-indigo-600 active:bq-scale-95"
                    @click="resetState"
                >
                    再試一次
                </button>
                <button
                    type="button"
                    class="bq-rounded-8 bq-h-11 bq-border bq-border-gray-300 bq-px-5 bq-text-xs bq-font-bold bq-text-gray-600 bq-transition hover:bq-bg-gray-50 active:bq-scale-95"
                    @click="closeDialog"
                >
                    關閉
                </button>
                <button
                    v-if="state === 'parsed'"
                    type="button"
                    class="bq-rounded-8 bq-h-11 bq-bg-gradient-to-r bq-from-indigo-500 bq-to-purple-600 bq-px-6 bq-text-xs bq-font-bold bq-text-white bq-transition hover:bq-shadow active:bq-scale-95"
                    @click="saveResult"
                >
                    確認儲存
                </button>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { parseVoiceInput } from '@/helpers/voiceParser.js';

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

// 狀態管理：'idle' (閒置), 'recording' (錄音中), 'parsed' (已解析成功), 'failed' (解析失敗)
const state = ref('idle');
const transcript = ref('');
const interimTranscript = ref('');
const parsedResult = ref(null);
const errorMessage = ref('');

// Web Speech API 語音辨識實例
let recognition = null;
const isSupported = ref(false);

// 觸覺回饋震動
const triggerHaptic = (type) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            if (type === 'start') {
                navigator.vibrate(25); // 短促輕震
            } else if (type === 'success') {
                navigator.vibrate([20, 50, 20]); // 雙輕震
            } else if (type === 'error') {
                navigator.vibrate(80); // 長震
            }
        } catch (e) {
            console.warn('Vibration failed', e);
        }
    }
};

// 初始化語音辨識
const initRecognition = () => {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        isSupported.value = true;
        recognition = new SpeechRecognition();
        recognition.continuous = false; // 行動端單次錄音效果較佳，避免長時間開啟佔用資源
        recognition.interimResults = true; // 行動端即時回傳辨識結果以提供視覺回饋
        recognition.lang = 'zh-TW'; // 預設繁體中文

        recognition.onstart = () => {
            state.value = 'recording';
            transcript.value = '';
            interimTranscript.value = '';
            errorMessage.value = '';
            triggerHaptic('start');
        };

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            if (final) {
                transcript.value += final;
            }
            interimTranscript.value = interim;
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            triggerHaptic('error');

            // 行動瀏覽器常見錯誤處理
            if (event.error === 'not-allowed') {
                errorMessage.value =
                    '⚠️ 麥克風權限被拒絕。請檢查瀏覽器設定，允許此網頁使用您的麥克風。';
                state.value = 'idle';
            } else if (event.error === 'no-speech') {
                errorMessage.value =
                    '⚠️ 沒有偵測到聲音。請靠近麥克風並大聲一點說話。';
                state.value = 'idle';
            } else if (event.error === 'network') {
                errorMessage.value =
                    '⚠️ 網路連線中斷或不穩定，語音辨識服務暫時不可用。';
                state.value = 'idle';
            } else if (event.error !== 'aborted') {
                errorMessage.value = '⚠️ 語音辨識出錯：' + event.error;
                state.value = 'idle';
            }
        };

        recognition.onend = () => {
            if (state.value === 'recording') {
                // 如果是正常錄音結束
                processTranscript();
            }
        };
    } else {
        isSupported.value = false;
    }
};

// 切換錄音狀態
const toggleRecording = () => {
    if (!recognition) return;

    if (state.value === 'recording') {
        recognition.stop();
    } else {
        resetState();
        try {
            recognition.start();
        } catch (e) {
            console.error(e);
        }
    }
};

// 處理辨識出的文字
const processTranscript = () => {
    const fullText = (transcript.value + interimTranscript.value).trim();
    if (!fullText) {
        state.value = 'failed';
        triggerHaptic('error');
        return;
    }

    const result = parseVoiceInput(fullText);
    if (result) {
        parsedResult.value = result;
        state.value = 'parsed';
        triggerHaptic('success');
    } else {
        state.value = 'failed';
        triggerHaptic('error');
    }
};

// 取得細項名稱
const getSubtypeName = () => {
    if (!parsedResult.value) return '';
    if (parsedResult.value.type === 'milk') {
        switch (parsedResult.value.milkType) {
            case 'formula':
                return '配方奶 🍼';
            case 'breast_bottle':
                return '母乳瓶餵 🍼';
            case 'breast_direct':
                return '母乳親餵 👩‍🍼';
            case 'solid':
                return '副食品 🥣';
            default:
                return '';
        }
    }
    return '睡眠時長';
};

// 調整餵奶量
const adjustAmount = (offset) => {
    if (parsedResult.value && parsedResult.value.type === 'milk') {
        parsedResult.value.amount = Math.max(
            0,
            (parsedResult.value.amount || 0) + offset
        );
    }
};

// 調整睡眠時間
const adjustDuration = (offset) => {
    if (parsedResult.value && parsedResult.value.type === 'sleep') {
        parsedResult.value.duration = Math.max(
            0,
            (parsedResult.value.duration || 0) + offset
        );
    }
};

// 格式化睡眠時間
const formatDuration = (mins) => {
    if (!mins) return '0 分鐘';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) {
        return `${h} 小時 ${m > 0 ? m + ' 分鐘' : ''}`;
    }
    return `${m} 分鐘`;
};

// 儲存結果
const saveResult = () => {
    if (parsedResult.value) {
        emit('save-record', parsedResult.value);
        closeDialog();
    }
};

// 重置狀態
const resetState = () => {
    state.value = 'idle';
    transcript.value = '';
    interimTranscript.value = '';
    parsedResult.value = null;
    errorMessage.value = '';
};

const closeDialog = () => {
    if (recognition && state.value === 'recording') {
        recognition.stop();
    }
    resetState();
    internalValue.value = false;
};

// 監聽 Dialog 開關
watch(internalValue, (newVal) => {
    if (newVal) {
        if (!recognition) {
            initRecognition();
        }
        resetState();
    } else {
        if (recognition && state.value === 'recording') {
            recognition.stop();
        }
    }
});
</script>

<style scoped>
/* 針對行動裝置 (Mobile Bottom Sheet) 的響應式 CSS 覆寫 */
@media (max-width: 600px) {
    .voice-record-dialog :deep(.v-overlay__content) {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        border-radius: 20px 20px 0 0 !important;
        overflow: hidden;
    }

    .voice-card {
        border-radius: 20px 20px 0 0 !important;
    }
}
</style>
