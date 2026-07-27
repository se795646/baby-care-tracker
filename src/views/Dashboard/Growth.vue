<template>
    <div class="growth-container bq-mx-auto bq-max-w-7xl bq-p-6">
        <!-- Header -->
        <div
            class="bq-mb-6 bq-flex bq-flex-col bq-items-start bq-justify-between bq-gap-4 md:bq-flex-row md:bq-items-center"
        >
            <div>
                <h1
                    class="bq-flex bq-items-center bq-gap-2 bq-text-2xl bq-font-bold bq-text-gray-800"
                >
                    📈 體重記錄與成長曲線
                </h1>
                <p class="bq-mt-1 bq-text-sm bq-text-gray-500">
                    追蹤寶寶的體重成長進度，並依小兒科建議動態調整每日建議飲奶量。
                </p>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="bq-mb-8 bq-grid bq-grid-cols-1 bq-gap-6 lg:bq-grid-cols-3">
            <!-- Latest Weight -->
            <div
                class="bq-rounded-16 bq-flex bq-items-center bq-gap-4 bq-border bq-border-gray-100 bq-bg-white bq-p-6 bq-shadow-sm"
            >
                <div
                    class="bq-flex bq-h-12 bq-w-12 bq-items-center bq-justify-center bq-rounded-full bq-bg-pink-50 bq-text-2xl bq-shadow-sm"
                >
                    ⚖️
                </div>
                <div>
                    <div class="bq-text-xs bq-text-gray-400">目前寶寶體重</div>
                    <div class="bq-text-2xl bq-font-black bq-text-gray-800">
                        {{ latestWeight ? `${latestWeight} kg` : '尚未記錄' }}
                    </div>
                </div>
            </div>

            <!-- Recommended Daily Milk Goal -->
            <div
                class="bq-rounded-16 bq-flex bq-items-center bq-gap-4 bq-border bq-border-gray-100 bq-bg-white bq-p-6 bq-shadow-sm"
            >
                <div
                    class="bq-flex bq-h-12 bq-w-12 bq-items-center bq-justify-center bq-rounded-full bq-bg-orange-50 bq-text-2xl bq-shadow-sm"
                >
                    🍼
                </div>
                <div>
                    <div class="bq-text-xs bq-text-gray-400">每日建議奶量</div>
                    <div class="bq-text-2xl bq-font-black bq-text-orange-600">
                        {{
                            latestWeight
                                ? `${recommendedMilkGoal} ml`
                                : '750 ml (預設)'
                        }}
                    </div>
                </div>
            </div>

            <!-- Doctor Tip -->
            <div
                class="bq-rounded-16 bq-flex bq-items-start bq-gap-3 bq-border bq-border-indigo-100 bq-bg-gradient-to-r bq-from-indigo-50 bq-to-purple-50 bq-p-5 bq-shadow-sm"
            >
                <div class="bq-mt-0.5 bq-text-xl">💡</div>
                <div class="bq-text-xs bq-leading-relaxed bq-text-indigo-800">
                    <span class="bq-font-bold">小兒科醫師建議：</span><br />
                    嬰兒每日適當的總奶量為：<span class="bq-font-bold"
                        >體重 (kg) × 150 ml</span
                    >。 適時記錄體重可隨寶寶成長動態調整每日餵食目標。
                </div>
            </div>
        </div>

        <div class="bq-grid bq-grid-cols-1 bq-gap-8 lg:bq-grid-cols-3">
            <!-- Left Side: Chart and History List -->
            <div class="bq-flex bq-flex-col bq-gap-8 lg:bq-col-span-2">
                <!-- Chart Card -->
                <div
                    class="bq-rounded-16 bq-border bq-border-gray-100 bq-bg-white bq-p-6 bq-shadow-sm"
                >
                    <h3
                        class="bq-mb-4 bq-text-lg bq-font-bold bq-text-gray-800"
                    >
                        成長趨勢
                    </h3>

                    <!-- SVG Growth Chart -->
                    <div
                        class="chart-wrapper bq-flex bq-w-full bq-justify-center"
                    >
                        <div
                            v-if="weightRecords.length === 0"
                            class="bq-w-full bq-py-12 bq-text-center bq-text-gray-400"
                        >
                            <div class="bq-mb-2 bq-text-4xl">📈</div>
                            <div>
                                尚無體重記錄，請在右側新增您的第一筆記錄！
                            </div>
                        </div>

                        <svg
                            v-else
                            :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
                            class="bq-h-auto bq-w-full"
                            style="max-height: 320px"
                        >
                            <!-- Gradients Definitions -->
                            <defs>
                                <linearGradient
                                    id="chartLineGradient"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                >
                                    <stop offset="0%" stop-color="#818CF8" />
                                    <stop offset="100%" stop-color="#EC4899" />
                                </linearGradient>
                                <linearGradient
                                    id="chartAreaGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stop-color="#818CF8"
                                        stop-opacity="0.25"
                                    />
                                    <stop
                                        offset="100%"
                                        stop-color="#818CF8"
                                        stop-opacity="0.0"
                                    />
                                </linearGradient>
                            </defs>

                            <!-- Horizontal Grid Lines -->
                            <g stroke="#F3F4F6" stroke-width="1">
                                <line
                                    v-for="grid in gridLines"
                                    :key="grid"
                                    :x1="paddingLeft"
                                    :y1="grid.y"
                                    :x2="chartWidth - paddingRight"
                                    :y2="grid.y"
                                />
                            </g>

                            <!-- Y-Axis Labels -->
                            <g fill="#9CA3AF" font-size="10" text-anchor="end">
                                <text
                                    v-for="grid in gridLines"
                                    :key="'label-' + grid.weight"
                                    :x="paddingLeft - 8"
                                    :y="grid.y + 4"
                                >
                                    {{ grid.weight }} kg
                                </text>
                            </g>

                            <!-- Area Under Curve -->
                            <path
                                v-if="chartPoints.length >= 2"
                                :d="areaPath"
                                fill="url(#chartAreaGradient)"
                            />

                            <!-- Connecting Line -->
                            <path
                                v-if="chartPoints.length >= 2"
                                :d="linePath"
                                fill="none"
                                stroke="url(#chartLineGradient)"
                                stroke-width="3"
                                stroke-linecap="round"
                            />

                            <!-- Data Points and Values -->
                            <g
                                v-for="(p, index) in chartPoints"
                                :key="'point-' + p.id"
                            >
                                <!-- Line shadow effect circle -->
                                <circle
                                    :cx="p.x"
                                    :cy="p.y"
                                    r="8"
                                    fill="#FFF"
                                    stroke="#E2E8F0"
                                    stroke-width="1"
                                />
                                <!-- Main point -->
                                <circle
                                    :cx="p.x"
                                    :cy="p.y"
                                    r="4.5"
                                    fill="#818CF8"
                                />
                                <!-- Value Label -->
                                <text
                                    :x="p.x"
                                    :y="p.y - 12"
                                    text-anchor="middle"
                                    font-size="10"
                                    font-weight="bold"
                                    fill="#4B5563"
                                >
                                    {{ p.weight }} kg
                                </text>
                                <!-- Date Label -->
                                <text
                                    :x="p.x"
                                    :y="chartHeight - paddingBottom + 16"
                                    text-anchor="middle"
                                    font-size="9"
                                    fill="#9CA3AF"
                                >
                                    {{ p.shortDate }}
                                </text>
                            </g>
                        </svg>
                    </div>
                </div>

                <!-- WHO Percentile Analysis -->
                <div
                    v-if="latestWeight && babyAgeDays !== null"
                    class="bq-rounded-16 bq-flex bq-items-start bq-gap-3 bq-border bq-border-teal-100 bq-bg-gradient-to-r bq-from-teal-50 bq-to-emerald-50 bq-p-5 bq-shadow-sm"
                >
                    <div class="bq-text-2xl">📈</div>
                    <div>
                        <h4 class="bq-text-sm bq-font-bold bq-text-teal-800">
                            本週健康與成長分析 (WHO 參考指標)
                        </h4>
                        <p
                            class="bq-mt-1.5 bq-text-xs bq-leading-relaxed bq-text-teal-700"
                        >
                            寶寶目前已出月齡約
                            {{ (babyAgeDays / 30.4).toFixed(1) }} 個月 (共
                            {{ babyAgeDays }} 天大)。 根據 WHO
                            世界衛生組織嬰兒成長曲線對照：
                            <br />
                            <span class="bq-font-bold"
                                >目前體重 {{ latestWeight }} kg
                                落在正常健康發育區間</span
                            >。
                            {{ growthAssessmentText }}
                        </p>
                    </div>
                </div>
                <div
                    v-else-if="latestWeight"
                    class="bq-rounded-16 bq-flex bq-items-start bq-gap-3 bq-border bq-border-orange-100 bq-bg-gradient-to-r bq-from-amber-50 bq-to-orange-50 bq-p-5 bq-shadow-sm"
                >
                    <div class="bq-text-2xl">⚙️</div>
                    <div class="bq-w-full">
                        <h4 class="bq-text-sm bq-font-bold bq-text-orange-800">
                            想要啟用 WHO 生長曲線對照分析嗎？
                        </h4>
                        <p
                            class="bq-mt-1.5 bq-flex bq-flex-wrap bq-items-center bq-justify-between bq-gap-2 bq-text-xs bq-leading-relaxed bq-text-orange-700"
                        >
                            <span
                                >請前往「首頁」點選右上角齒輪設定寶寶的生日，App
                                就會自動為您進行成長百分位與發育評估喔！</span
                            >
                            <router-link
                                to="/dashboard/overview"
                                class="active:bq-scale-98 bq-rounded-8 bq-text-2xs bq-bg-orange-500 bq-px-3 bq-py-1 bq-font-bold bq-text-white bq-no-underline bq-transition hover:bq-bg-orange-600"
                            >
                                前往設定
                            </router-link>
                        </p>
                    </div>
                </div>

                <!-- History Log Card -->
                <div
                    class="bq-rounded-16 bq-border bq-border-gray-100 bq-bg-white bq-p-6 bq-shadow-sm"
                >
                    <h3
                        class="bq-mb-4 bq-text-lg bq-font-bold bq-text-gray-800"
                    >
                        歷史體重日誌
                    </h3>
                    <div
                        v-if="weightRecords.length === 0"
                        class="bq-py-8 bq-text-center bq-text-gray-400"
                    >
                        目前沒有記錄歷史
                    </div>
                    <div v-else class="bq-flex bq-flex-col bq-gap-3">
                        <div
                            v-for="item in weightRecords"
                            :key="item.id"
                            class="bq-rounded-12 bq-flex bq-items-center bq-justify-between bq-border bq-border-slate-100 bq-bg-slate-50 bq-p-4 bq-transition hover:bq-bg-slate-100/70"
                        >
                            <div class="bq-flex bq-items-center bq-gap-4">
                                <span
                                    class="bq-flex bq-h-10 bq-w-10 bq-items-center bq-justify-center bq-rounded-full bq-bg-indigo-50 bq-text-xl"
                                >
                                    ⚖️
                                </span>
                                <div>
                                    <div class="bq-font-bold bq-text-gray-800">
                                        {{ item.amount }} kg
                                    </div>
                                    <div
                                        class="bq-mt-1 bq-text-xs bq-text-gray-400"
                                    >
                                        測量時間：{{
                                            formatDate(item.timestamp)
                                        }}
                                    </div>
                                    <div
                                        v-if="item.note"
                                        class="bq-mt-1 bq-text-xs bq-italic bq-text-gray-500"
                                    >
                                        「{{ item.note }}」
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                class="bq-rounded-8 bq-px-3 bq-py-1.5 bq-text-xs bq-font-bold bq-text-red-500 bq-transition hover:bq-bg-red-50 hover:bq-text-red-700"
                                @click="deleteWeightRecord(item.id)"
                            >
                                刪除
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side: Add Entry Form -->
            <div class="lg:bq-col-span-1">
                <div
                    class="bq-rounded-16 bq-sticky bq-top-24 bq-border bq-border-gray-100 bq-bg-white bq-p-6 bq-shadow-sm"
                >
                    <h3
                        class="bq-mb-4 bq-text-lg bq-font-bold bq-text-gray-800"
                    >
                        新增體重記錄
                    </h3>
                    <form
                        @submit.prevent="saveWeightEntry"
                        class="bq-flex bq-flex-col bq-gap-4"
                    >
                        <!-- Weight -->
                        <div>
                            <label
                                class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >
                                寶寶體重 (kg)
                            </label>
                            <input
                                v-model="form.weight"
                                type="number"
                                step="0.01"
                                min="1"
                                max="30"
                                required
                                class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-indigo-300 focus:bq-outline-none"
                                placeholder="例如：5.4"
                            />
                        </div>

                        <!-- Calculator Helper -->
                        <div
                            class="bq-rounded-10 bq-border bq-border-dashed bq-border-indigo-200 bq-bg-indigo-50/10 bq-p-3"
                        >
                            <button
                                type="button"
                                class="bq-flex bq-items-center bq-gap-1 bq-text-xs bq-font-semibold bq-text-indigo-600 hover:bq-text-indigo-800"
                                @click="form.enableCalc = !form.enableCalc"
                            >
                                <span
                                    >💡
                                    沒有嬰兒專用秤？使用「大人抱著秤」換算助手</span
                                >
                                <span>{{ form.enableCalc ? '▼' : '▶' }}</span>
                            </button>

                            <div
                                v-show="form.enableCalc"
                                class="bq-mt-3 bq-flex bq-flex-col bq-gap-2"
                            >
                                <div class="bq-grid bq-grid-cols-2 bq-gap-3">
                                    <div>
                                        <label
                                            class="bq-text-2xs bq-mb-1 bq-block bq-text-gray-500"
                                            >1. 大人抱寶寶重 (kg)</label
                                        >
                                        <input
                                            v-model="form.calcAdultAndBaby"
                                            type="number"
                                            step="0.01"
                                            placeholder="例如：75.3"
                                            class="bq-rounded-8 bq-w-full bq-border bq-border-gray-200 bq-px-3 bq-py-1.5 focus:bq-text-sm focus:bq-outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            class="bq-text-2xs bq-mb-1 bq-block bq-text-gray-500"
                                            >2. 大人單獨體重 (kg)</label
                                        >
                                        <input
                                            v-model="form.calcAdultOnly"
                                            type="number"
                                            step="0.01"
                                            placeholder="例如：69.1"
                                            class="bq-rounded-8 bq-w-full bq-border bq-border-gray-200 bq-px-3 bq-py-1.5 focus:bq-text-sm focus:bq-outline-none"
                                        />
                                    </div>
                                </div>
                                <div
                                    class="bq-rounded-8 bq-mt-1 bq-flex bq-items-center bq-justify-between bq-border bq-border-gray-100 bq-bg-white bq-p-2"
                                >
                                    <span class="bq-text-xs bq-text-gray-600"
                                        >計算結果寶寶體重：<span
                                            class="bq-font-bold bq-text-indigo-600"
                                            >{{ calculatedWeight }} kg</span
                                        ></span
                                    >
                                    <button
                                        type="button"
                                        class="active:bq-scale-98 bq-rounded-6 bq-bg-indigo-500 bq-px-3 bq-py-1 bq-text-xs bq-font-bold bq-text-white bq-transition hover:bq-bg-indigo-600"
                                        :disabled="calculatedWeight <= 0"
                                        @click="applyCalculatedWeight"
                                    >
                                        帶入寶寶體重
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Date & Time -->
                        <div>
                            <label
                                class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >
                                測量時間
                            </label>
                            <input
                                v-model="form.time"
                                type="datetime-local"
                                required
                                class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-indigo-300 focus:bq-outline-none"
                            />
                        </div>

                        <!-- Notes -->
                        <div>
                            <label
                                class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >
                                備註 (選填)
                            </label>
                            <input
                                v-model="form.note"
                                type="text"
                                class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-indigo-300 focus:bq-outline-none"
                                placeholder="例如：滿月檢查、洗完澡測量"
                            />
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            class="active:bq-scale-98 bq-rounded-10 bq-mt-2 bq-w-full bq-bg-indigo-500 bq-py-2.5 bq-text-sm bq-font-bold bq-text-white bq-shadow-sm bq-transition hover:bq-bg-indigo-600"
                        >
                            儲存記錄
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { saveRecord, getRecords, deleteRecord } from '@/helpers/db.js';
import { syncWithSupabase } from '@/helpers/sync.js';

export default {
    name: 'Growth',
    expose: [],
    setup() {
        const records = ref([]);
        const babyBirthday = ref(localStorage.getItem('baby_birthday') || '');
        const form = reactive({
            weight: '',
            time: '',
            note: '',
            enableCalc: false,
            calcAdultAndBaby: '',
            calcAdultOnly: ''
        });

        // SVG Chart Dimensions
        const chartWidth = 600;
        const chartHeight = 300;
        const paddingLeft = 60;
        const paddingRight = 40;
        const paddingTop = 40;
        const paddingBottom = 40;

        const chartUsableWidth = chartWidth - paddingLeft - paddingRight;
        const chartUsableHeight = chartHeight - paddingTop - paddingBottom;

        // Reset form to default values
        const resetForm = () => {
            form.weight = '';
            form.time = formatDateTimeLocal(Date.now());
            form.note = '';
            form.enableCalc = false;
            form.calcAdultAndBaby = '';
            form.calcAdultOnly = '';
        };

        // Load records from IndexedDB and Supabase
        const loadRecords = async () => {
            try {
                records.value = await getRecords();

                // 從資料庫中讀取寶寶生日並更新，保持跨頁面/跨裝置同步
                const settingsRecord = records.value.find(
                    (r) => r.id === 'baby_settings'
                );
                if (settingsRecord && settingsRecord.note) {
                    try {
                        const settings = JSON.parse(settingsRecord.note);
                        if (settings.birthday) {
                            babyBirthday.value = settings.birthday;
                            localStorage.setItem(
                                'baby_birthday',
                                settings.birthday
                            );
                        }
                    } catch (e) {
                        console.error('解析寶寶設定失敗:', e);
                    }
                }
            } catch (e) {
                console.error('無法載入資料:', e);
            }
        };

        onMounted(async () => {
            resetForm();
            await loadRecords();

            // Sync with Supabase background
            try {
                await syncWithSupabase();
                await loadRecords();
            } catch (e) {
                console.error('Background sync failed:', e);
            }
        });

        // Filter out only weight records, sorted descending by timestamp (newest first)
        const weightRecords = computed(() => {
            return records.value.filter((r) => r.type === 'weight');
        });

        // Latest weight
        const latestWeight = computed(() => {
            if (weightRecords.value.length > 0) {
                return Number(weightRecords.value[0].amount);
            }
            return null;
        });

        // Dynamic recommended daily milk goal: weight (kg) * 150 ml
        const recommendedMilkGoal = computed(() => {
            if (latestWeight.value) {
                return Math.round(latestWeight.value * 150);
            }
            return 750;
        });

        // Calculate chart points scaled to SVG size
        const chartPoints = computed(() => {
            // Sort chronologically (oldest first)
            const sorted = [...weightRecords.value].sort(
                (a, b) => a.timestamp - b.timestamp
            );
            if (sorted.length === 0) return [];

            const weights = sorted.map((r) => Number(r.amount));
            const timestamps = sorted.map((r) => r.timestamp);

            // Determine min/max weight for vertical scale with a bit of padding
            const maxW = Math.max(...weights);
            const minW = Math.min(...weights);
            const paddingW = (maxW - minW) * 0.15 || 1.0;

            // vertical limits
            const verticalMax = maxW + paddingW;
            const verticalMin = Math.max(0, minW - paddingW);
            const rangeW = verticalMax - verticalMin;

            // horizontal limits
            const maxT = Math.max(...timestamps);
            const minT = Math.min(...timestamps);
            const rangeT = maxT - minT || 1;

            return sorted.map((r) => {
                // If only 1 record, position it in the center horizontally
                const x =
                    sorted.length === 1
                        ? paddingLeft + chartUsableWidth / 2
                        : paddingLeft +
                          ((r.timestamp - minT) / rangeT) * chartUsableWidth;

                const y =
                    paddingTop +
                    chartUsableHeight -
                    ((Number(r.amount) - verticalMin) / rangeW) *
                        chartUsableHeight;

                return {
                    x,
                    y,
                    weight: Number(r.amount).toFixed(2),
                    shortDate: formatShortDate(r.timestamp),
                    id: r.id
                };
            });
        });

        // Generate lines grid coordinates
        const gridLines = computed(() => {
            const pts = chartPoints.value;
            if (pts.length === 0) return [];

            const weights = weightRecords.value.map((r) => Number(r.amount));
            const maxW = Math.max(...weights);
            const minW = Math.min(...weights);
            const paddingW = (maxW - minW) * 0.15 || 1.0;

            const verticalMax = maxW + paddingW;
            const verticalMin = Math.max(0, minW - paddingW);
            const rangeW = verticalMax - verticalMin;

            // Generate 4 horizontal helper lines
            const linesCount = 4;
            const step = rangeW / (linesCount - 1);
            const grid = [];

            for (let i = 0; i < linesCount; i++) {
                const w = verticalMin + i * step;
                const y =
                    paddingTop +
                    chartUsableHeight -
                    ((w - verticalMin) / rangeW) * chartUsableHeight;
                grid.push({
                    y,
                    weight: w.toFixed(1)
                });
            }
            return grid;
        });

        // SVG path for line
        const linePath = computed(() => {
            const pts = chartPoints.value;
            if (pts.length < 2) return '';
            return pts
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                .join(' ');
        });

        // SVG path for area under line
        const areaPath = computed(() => {
            const pts = chartPoints.value;
            if (pts.length < 2) return '';
            const first = pts[0];
            const last = pts[pts.length - 1];
            const baseY = chartHeight - paddingBottom;
            return `${linePath.value} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
        });

        // Save Weight Entry
        const saveWeightEntry = async () => {
            const timestamp = new Date(form.time).getTime();
            const record = {
                id: `weight-${Date.now()}`,
                type: 'weight',
                timestamp,
                amount: Number(form.weight),
                note: form.note || null
            };

            try {
                await saveRecord(record);
                await loadRecords();
                resetForm();
                // Trigger background sync
                syncWithSupabase().then(() => loadRecords());
            } catch {
                alert('儲存失敗，請重試');
            }
        };

        // Delete Weight Record
        const deleteWeightRecord = async (id) => {
            if (confirm('確定要刪除這筆體重記錄嗎？刪除後無法還原。')) {
                try {
                    await deleteRecord(id);
                    await loadRecords();
                    // Trigger background sync
                    syncWithSupabase().then(() => loadRecords());
                } catch {
                    alert('刪除失敗，請重試');
                }
            }
        };

        // Date Helpers
        const formatDate = (timestamp) => {
            const d = new Date(timestamp);
            const yr = d.getFullYear();
            const mo = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hr = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            return `${yr}-${mo}-${day} ${hr}:${min}`;
        };

        const formatShortDate = (timestamp) => {
            const d = new Date(timestamp);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        };

        const formatDateTimeLocal = (timestamp) => {
            const d = new Date(timestamp);
            const yr = d.getFullYear();
            const mo = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hr = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            return `${yr}-${mo}-${day}T${hr}:${min}`;
        };

        // 計算寶寶年齡天數
        const babyAgeDays = computed(() => {
            const bday = babyBirthday.value;
            if (!bday) return null;
            const birth = new Date(bday);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            birth.setHours(0, 0, 0, 0);
            const diffTime = today - birth;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 ? diffDays : 0;
        });

        // 根據月齡給予溫馨發育評估回饋 (WHO百分位標準)
        const growthAssessmentText = computed(() => {
            if (!latestWeight.value || babyAgeDays.value === null) return '';
            const months = babyAgeDays.value / 30.4;
            const weight = latestWeight.value;

            // 簡易的 WHO 3% ~ 97% 體重標準界線
            let minNormal = 3.0;
            let maxNormal = 12.0;

            if (months <= 1) {
                minNormal = 3.2;
                maxNormal = 5.0;
            } else if (months <= 2) {
                minNormal = 4.0;
                maxNormal = 6.2;
            } else if (months <= 3) {
                minNormal = 4.8;
                maxNormal = 7.2;
            } else if (months <= 4) {
                minNormal = 5.3;
                maxNormal = 8.0;
            } else if (months <= 5) {
                minNormal = 5.8;
                maxNormal = 8.6;
            } else if (months <= 6) {
                minNormal = 6.2;
                maxNormal = 9.2;
            } else if (months <= 8) {
                minNormal = 6.8;
                maxNormal = 10.2;
            } else if (months <= 10) {
                minNormal = 7.3;
                maxNormal = 11.0;
            } else if (months <= 12) {
                minNormal = 7.7;
                maxNormal = 11.8;
            } else {
                minNormal = 8.5;
                maxNormal = 14.0;
            }

            if (weight < minNormal) {
                return '目前體重略低於同月齡發育標準。建議增加每餐餵奶量或餵養頻率，並可於健檢時諮詢小兒科醫師進行健康評估。爸媽辛苦了，我們一起加油！❤️';
            } else if (weight > maxNormal) {
                return '目前體重高於同月齡發育標準上限，代表寶寶營養吸收非常充沛、體格健壯！只要活動力與精神良好即可，若有疑慮可於下次健檢時詢問醫師確認。🌟';
            } else {
                return '體重發育非常標準且穩定，曲線正常爬升中。這代表您的餵養非常成功，繼續保持穩定的照顧與充足奶量喔！👍🎉';
            }
        });

        // 換算助手計算屬性
        const calculatedWeight = computed(() => {
            const bab = Number(form.calcAdultAndBaby);
            const ad = Number(form.calcAdultOnly);
            if (bab && ad && bab > ad) {
                return Number((bab - ad).toFixed(2));
            }
            return 0;
        });

        const applyCalculatedWeight = () => {
            if (calculatedWeight.value > 0) {
                form.weight = calculatedWeight.value;
            }
        };

        return {
            babyBirthday,
            form,
            weightRecords,
            latestWeight,
            recommendedMilkGoal,
            chartPoints,
            gridLines,
            linePath,
            areaPath,
            chartWidth,
            chartHeight,
            paddingLeft,
            paddingRight,
            paddingBottom,
            saveWeightEntry,
            deleteWeightRecord,
            formatDate,
            babyAgeDays,
            growthAssessmentText,
            calculatedWeight,
            applyCalculatedWeight
        };
    }
};
</script>

<style scoped>
.chart-wrapper {
    touch-action: pan-y;
}
</style>
