<template>
    <div class="growth-container bq-p-6 bq-max-w-7xl bq-mx-auto">
        <!-- Header -->
        <div class="bq-mb-6 bq-flex bq-flex-col md:bq-flex-row bq-justify-between bq-items-start md:bq-items-center bq-gap-4">
            <div>
                <h1 class="bq-text-2xl bq-font-bold bq-text-gray-800 bq-flex bq-items-center bq-gap-2">
                    📈 體重記錄與成長曲線
                </h1>
                <p class="bq-text-sm bq-text-gray-500 bq-mt-1">
                    追蹤寶寶的體重成長進度，並依小兒科建議動態調整每日建議飲奶量。
                </p>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="bq-grid bq-grid-cols-1 lg:bq-grid-cols-3 bq-gap-6 bq-mb-8">
            <!-- Latest Weight -->
            <div class="bq-bg-white bq-shadow-sm bq-rounded-16 bq-p-6 bq-border bq-border-gray-100 bq-flex bq-items-center bq-gap-4">
                <div class="bq-bg-pink-50 bq-w-12 bq-h-12 bq-rounded-full bq-flex bq-items-center bq-justify-center bq-text-2xl bq-shadow-sm">
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
            <div class="bq-bg-white bq-shadow-sm bq-rounded-16 bq-p-6 bq-border bq-border-gray-100 bq-flex bq-items-center bq-gap-4">
                <div class="bq-bg-orange-50 bq-w-12 bq-h-12 bq-rounded-full bq-flex bq-items-center bq-justify-center bq-text-2xl bq-shadow-sm">
                    🍼
                </div>
                <div>
                    <div class="bq-text-xs bq-text-gray-400">每日建議奶量</div>
                    <div class="bq-text-2xl bq-font-black bq-text-orange-600">
                        {{ latestWeight ? `${recommendedMilkGoal} ml` : '750 ml (預設)' }}
                    </div>
                </div>
            </div>

            <!-- Doctor Tip -->
            <div class="bq-bg-gradient-to-r bq-from-indigo-50 bq-to-purple-50 bq-shadow-sm bq-rounded-16 bq-p-5 bq-border bq-border-indigo-100 bq-flex bq-items-start bq-gap-3">
                <div class="bq-text-xl bq-mt-0.5">💡</div>
                <div class="bq-text-xs bq-text-indigo-800 bq-leading-relaxed">
                    <span class="bq-font-bold">小兒科醫師建議：</span><br />
                    嬰兒每日適當的總奶量為：<span class="bq-font-bold">體重 (kg) × 150 ml</span>。
                    適時記錄體重可隨寶寶成長動態調整每日餵食目標。
                </div>
            </div>
        </div>

        <div class="bq-grid bq-grid-cols-1 lg:bq-grid-cols-3 bq-gap-8">
            <!-- Left Side: Chart and History List -->
            <div class="lg:bq-col-span-2 bq-flex bq-flex-col bq-gap-8">
                <!-- Chart Card -->
                <div class="bq-bg-white bq-shadow-sm bq-rounded-16 bq-p-6 bq-border bq-border-gray-100">
                    <h3 class="bq-text-lg bq-font-bold bq-text-gray-800 bq-mb-4">成長趨勢</h3>
                    
                    <!-- SVG Growth Chart -->
                    <div class="chart-wrapper bq-w-full bq-flex bq-justify-center">
                        <div v-if="weightRecords.length === 0" class="bq-py-12 bq-text-center bq-text-gray-400 bq-w-full">
                            <div class="bq-text-4xl bq-mb-2">📈</div>
                            <div>尚無體重記錄，請在右側新增您的第一筆記錄！</div>
                        </div>
                        
                        <svg v-else :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="bq-w-full bq-h-auto" style="max-height: 320px;">
                            <!-- Gradients Definitions -->
                            <defs>
                                <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stop-color="#818CF8" />
                                    <stop offset="100%" stop-color="#EC4899" />
                                </linearGradient>
                                <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#818CF8" stop-opacity="0.25" />
                                    <stop offset="100%" stop-color="#818CF8" stop-opacity="0.0" />
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
                            <path v-if="chartPoints.length >= 2" :d="areaPath" fill="url(#chartAreaGradient)" />

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
                            <g v-for="(p, index) in chartPoints" :key="'point-' + p.id">
                                <!-- Line shadow effect circle -->
                                <circle :cx="p.x" :cy="p.y" r="8" fill="#FFF" stroke="#E2E8F0" stroke-width="1" />
                                <!-- Main point -->
                                <circle :cx="p.x" :cy="p.y" r="4.5" fill="#818CF8" />
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

                <!-- History Log Card -->
                <div class="bq-bg-white bq-shadow-sm bq-rounded-16 bq-p-6 bq-border bq-border-gray-100">
                    <h3 class="bq-text-lg bq-font-bold bq-text-gray-800 bq-mb-4">歷史體重日誌</h3>
                    <div v-if="weightRecords.length === 0" class="bq-py-8 bq-text-center bq-text-gray-400">
                        目前沒有記錄歷史
                    </div>
                    <div v-else class="bq-flex bq-flex-col bq-gap-3">
                        <div 
                            v-for="item in weightRecords" 
                            :key="item.id" 
                            class="bq-bg-slate-50 hover:bq-bg-slate-100/70 bq-border bq-border-slate-100 bq-rounded-12 bq-p-4 bq-flex bq-justify-between bq-items-center bq-transition"
                        >
                            <div class="bq-flex bq-items-center bq-gap-4">
                                <span class="bq-rounded-full bq-w-10 bq-h-10 bq-bg-indigo-50 bq-flex bq-items-center bq-justify-center bq-text-xl">
                                    ⚖️
                                </span>
                                <div>
                                    <div class="bq-font-bold bq-text-gray-800">
                                        {{ item.amount }} kg
                                    </div>
                                    <div class="bq-text-xs bq-text-gray-400 bq-mt-1">
                                        測量時間：{{ formatDate(item.timestamp) }}
                                    </div>
                                    <div v-if="item.note" class="bq-text-xs bq-text-gray-500 bq-mt-1 bq-italic">
                                        「{{ item.note }}」
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                class="bq-text-red-500 hover:bq-text-red-700 bq-text-xs bq-font-bold bq-px-3 bq-py-1.5 hover:bq-bg-red-50 bq-rounded-8 bq-transition"
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
                <div class="bq-bg-white bq-shadow-sm bq-rounded-16 bq-p-6 bq-border bq-border-gray-100 bq-sticky bq-top-24">
                    <h3 class="bq-text-lg bq-font-bold bq-text-gray-800 bq-mb-4">新增體重記錄</h3>
                    <form @submit.prevent="saveWeightEntry" class="bq-flex bq-flex-col bq-gap-4">
                        <!-- Weight -->
                        <div>
                            <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">
                                寶寶體重 (kg)
                            </label>
                            <input 
                                v-model="form.weight" 
                                type="number" 
                                step="0.01" 
                                min="1" 
                                max="30"
                                required
                                class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-indigo-300 bq-text-sm bq-transition" 
                                placeholder="例如：5.4"
                            />
                        </div>

                        <!-- Date & Time -->
                        <div>
                            <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">
                                測量時間
                            </label>
                            <input 
                                v-model="form.time" 
                                type="datetime-local" 
                                required
                                class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-indigo-300 bq-text-sm bq-transition" 
                            />
                        </div>

                        <!-- Notes -->
                        <div>
                            <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">
                                備註 (選填)
                            </label>
                            <input 
                                v-model="form.note" 
                                type="text" 
                                class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-indigo-300 bq-text-sm bq-transition" 
                                placeholder="例如：滿月檢查、洗完澡測量"
                            />
                        </div>

                        <!-- Submit Button -->
                        <button 
                            type="submit" 
                            class="bq-w-full bq-bg-indigo-500 hover:bq-bg-indigo-600 active:bq-scale-98 bq-text-white bq-py-2.5 bq-rounded-10 bq-font-bold bq-transition bq-text-sm bq-shadow-sm bq-mt-2"
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
    setup() {
        const records = ref([]);
        const form = reactive({
            weight: '',
            time: '',
            note: ''
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
        };

        // Load records from IndexedDB and Supabase
        const loadRecords = async () => {
            try {
                records.value = await getRecords();
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
            return records.value.filter(r => r.type === 'weight');
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
            const sorted = [...weightRecords.value].sort((a, b) => a.timestamp - b.timestamp);
            if (sorted.length === 0) return [];

            const weights = sorted.map(r => Number(r.amount));
            const timestamps = sorted.map(r => r.timestamp);

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

            return sorted.map(r => {
                // If only 1 record, position it in the center horizontally
                const x = sorted.length === 1 
                    ? paddingLeft + chartUsableWidth / 2 
                    : paddingLeft + ((r.timestamp - minT) / rangeT) * chartUsableWidth;
                
                const y = paddingTop + chartUsableHeight - ((Number(r.amount) - verticalMin) / rangeW) * chartUsableHeight;
                
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

            const weights = weightRecords.value.map(r => Number(r.amount));
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
                const y = paddingTop + chartUsableHeight - ((w - verticalMin) / rangeW) * chartUsableHeight;
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
            return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
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
            } catch (e) {
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
                } catch (e) {
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

        return {
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
            formatDate
        };
    }
};
</script>

<style scoped>
.chart-wrapper {
    touch-action: pan-y;
}
</style>
