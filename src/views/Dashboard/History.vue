<template>
    <layout-item class="history-page">
        <div class="bq-mx-auto bq-max-w-4xl bq-space-y-6 bq-pb-16 md:bq-pb-0">
            <!-- 頂部返回與標題列 -->
            <div class="bq-flex bq-items-center bq-justify-between">
                <div class="bq-flex bq-items-center bq-gap-2">
                    <button
                        type="button"
                        class="bq-rounded-8 bq-flex bq-h-10 bq-w-10 bq-items-center bq-justify-center bq-bg-white bq-text-xl bq-shadow-sm bq-transition hover:bq-bg-gray-50 active:bq-scale-95"
                        @click="$router.push({ name: 'DashboardOverview' })"
                    >
                        👈
                    </button>
                    <h2 class="bq-text-2xl bq-font-bold bq-text-gray-800">
                        作息歷史日誌
                    </h2>
                </div>
            </div>

            <!-- 歷史清單大卡片 -->
            <div
                class="bq-rounded-16 bq-border bq-border-gray-100 bq-bg-white bq-p-6 bq-shadow-sm"
            >
                <div
                    class="bq-mb-6 bq-flex bq-flex-col bq-items-start bq-justify-between bq-gap-4 sm:bq-flex-row sm:bq-items-center"
                >
                    <div class="bq-text-sm bq-font-medium bq-text-gray-500">
                        共 {{ filteredRecords.length }} 筆記錄
                    </div>

                    <!-- 篩選器與搜尋 -->
                    <div
                        class="bq-flex bq-w-full bq-flex-wrap bq-gap-3 sm:bq-w-auto"
                    >
                        <!-- Tab 切換 -->
                        <div
                            class="bq-rounded-8 bq-flex bq-items-center bq-bg-gray-100 bq-p-1"
                        >
                            <button
                                v-for="tab in filterTabs"
                                :key="tab.value"
                                type="button"
                                class="bq-rounded-6 bq-px-4 bq-py-1.5 bq-text-xs bq-font-bold bq-transition"
                                :class="
                                    filterType === tab.value
                                        ? 'bq-bg-white bq-text-gray-800 bq-shadow-sm'
                                        : 'bq-text-gray-500 hover:bq-text-gray-800'
                                "
                                @click="filterType = tab.value"
                            >
                                {{ tab.label }}
                            </button>
                        </div>

                        <!-- 搜尋框 -->
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="搜尋備註..."
                            class="bq-rounded-8 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2 bq-text-xs focus:bq-border-pink-300 focus:bq-outline-none sm:bq-w-48"
                        />
                    </div>
                </div>

                <!-- 歷史日誌列表 -->
                <div
                    v-if="filteredRecords.length === 0"
                    class="bq-py-16 bq-text-center bq-text-gray-400"
                >
                    <div class="bq-mb-3 bq-text-5xl">🍃</div>
                    <div>沒有符合條件的作息記錄喔！</div>
                </div>

                <div v-else class="bq-flex bq-flex-col bq-gap-4">
                    <div
                        v-for="record in filteredRecords"
                        :key="record.id"
                        class="record-card bq-rounded-16 bq-flex bq-items-center bq-gap-3 bq-border bq-p-4 bq-shadow-sm bq-transition hover:bq-shadow-md"
                        :class="
                            record.type === 'milk'
                                ? 'bq-border-l-4 bq-border-y-gray-100 bq-border-l-amber-400 bq-border-r-gray-100 bq-bg-amber-50/20'
                                : 'bq-border-l-4 bq-border-y-gray-100 bq-border-l-indigo-400 bq-border-r-gray-100 bq-bg-indigo-50/20'
                        "
                    >
                        <!-- 左側資訊區 (Icon + Title/Time/Note) -->
                        <div
                            class="bq-flex bq-min-w-0 bq-flex-1 bq-items-start bq-gap-3.5"
                        >
                            <!-- 類別 Icon -->
                            <span
                                class="bq-flex bq-h-11 bq-w-11 bq-flex-shrink-0 bq-items-center bq-justify-center bq-rounded-full bq-text-xl bq-shadow-sm"
                                :class="
                                    record.type === 'milk'
                                        ? 'bq-bg-amber-100'
                                        : 'bq-bg-indigo-100'
                                "
                            >
                                {{ record.type === 'milk' ? '🍼' : '💤' }}
                            </span>

                            <!-- 內容資訊 -->
                            <div class="bq-min-w-0 bq-flex-1">
                                <div
                                    class="bq-flex bq-flex-wrap bq-items-center bq-gap-2"
                                >
                                    <span
                                        class="bq-text-sm bq-font-bold bq-text-gray-800"
                                    >
                                        {{ getRecordTitle(record) }}
                                    </span>
                                    <!-- 時間標籤 -->
                                    <span
                                        class="bq-rounded-6 bq-bg-gray-100 bq-px-2 bq-py-0.5 bq-text-[10px] bq-font-bold bq-text-gray-500"
                                    >
                                        {{ formatRecordTime(record) }}
                                    </span>
                                    <!-- 時長標籤 (僅睡眠) -->
                                    <span
                                        v-if="record.duration"
                                        class="bq-rounded-6 bq-bg-indigo-100 bq-px-2 bq-py-0.5 bq-text-[10px] bq-font-bold bq-text-indigo-600"
                                    >
                                        {{ formatDuration(record.duration) }}
                                    </span>
                                </div>
                                <!-- 備註框 -->
                                <p
                                    v-if="record.note"
                                    class="bq-rounded-8 bq-mt-2 bq-inline-block bq-max-w-full bq-border bq-border-gray-100/50 bq-bg-white/80 bq-p-2 bq-text-xs bq-italic bq-text-gray-600"
                                >
                                    💬 {{ record.note }}
                                </p>
                            </div>
                        </div>

                        <!-- 右側操作區 (照片縮圖 + 刪除按鈕) -->
                        <div
                            class="bq-ml-auto bq-flex bq-flex-shrink-0 bq-items-center bq-gap-2.5"
                        >
                            <!-- 相片縮圖 -->
                            <div
                                v-if="record.photo"
                                class="photo-thumbnail-container bq-flex-shrink-0"
                            >
                                <img
                                    :src="record.photo"
                                    class="bq-rounded-8 bq-h-12 bq-w-12 bq-cursor-pointer bq-border bq-border-gray-200 bq-object-cover bq-transition hover:bq-scale-105 active:bq-scale-95"
                                    alt="寶寶相片"
                                    @click="viewFullPhoto(record.photo)"
                                />
                            </div>

                            <!-- 刪除按鈕 (手機端垃圾桶樣式) -->
                            <button
                                type="button"
                                class="bq-rounded-8 bq-flex bq-h-9 bq-w-9 bq-items-center bq-justify-center bq-text-lg bq-text-red-400 bq-transition hover:bq-bg-red-50 hover:bq-text-red-600 active:bq-scale-90"
                                @click="confirmDeleteRecord(record.id)"
                                title="刪除"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 查看大圖 Dialog -->
        <v-dialog v-model="showPhotoDialog" max-width="700px">
            <v-card class="bq-rounded-16 bq-overflow-hidden">
                <v-card-title
                    class="bq-flex bq-items-center bq-justify-between bq-bg-gray-100 bq-p-4"
                >
                    <span class="bq-text-sm bq-font-bold bq-text-gray-700"
                        >📸 寶寶回憶相片</span
                    >
                    <button
                        type="button"
                        class="bq-text-gray-500 hover:bq-text-gray-800"
                        @click="showPhotoDialog = false"
                    >
                        ✕
                    </button>
                </v-card-title>
                <v-card-text class="bq-flex bq-justify-center bq-p-0">
                    <img
                        :src="photoViewUrl"
                        class="bq-max-h-[80vh] bq-w-full bq-object-contain"
                        alt="寶寶大圖"
                    />
                </v-card-text>
            </v-card>
        </v-dialog>
    </layout-item>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import LayoutItem from '@/components/layout/LayoutItem.vue';
import { getRecords, deleteRecord } from '@/helpers/db.js';
import { syncWithSupabase } from '@/helpers/sync.js';

const records = ref([]);
const searchQuery = ref('');
const filterType = ref('all');
const filterTabs = [
    { label: '全部', value: 'all' },
    { label: '餵奶 🍼', value: 'milk' },
    { label: '睡眠 💤', value: 'sleep' }
];

// 載入記錄
const loadRecords = async () => {
    try {
        records.value = await getRecords();
    } catch (e) {
        console.error('載入歷史記錄失敗:', e);
    }
};

onMounted(() => {
    loadRecords();
});

// 篩選後記錄
const filteredRecords = computed(() => {
    let list = records.value.filter(
        (r) => r.type === 'milk' || r.type === 'sleep'
    );

    // 類別篩選
    if (filterType.value !== 'all') {
        list = list.filter((r) => r.type === filterType.value);
    }

    // 關鍵字搜尋
    const query = searchQuery.value.trim().toLowerCase();
    if (query) {
        list = list.filter(
            (r) =>
                r.note?.toLowerCase().includes(query) ||
                getRecordTitle(r).toLowerCase().includes(query)
        );
    }

    return list;
});

// 記錄標題與時間格式化
const getRecordTitle = (record) => {
    if (record.type === 'milk') {
        const typeMap = {
            formula: '配方奶',
            breast_bottle: '母乳(瓶餵)',
            breast_direct: '母乳(親餵)',
            solid: '副食品'
        };
        const typeName = typeMap[record.milkType] || '喝奶';
        if (record.milkType === 'breast_direct') {
            const left = record.leftDuration
                ? `${record.leftDuration}分`
                : '0分';
            const right = record.rightDuration
                ? `${record.rightDuration}分`
                : '0分';
            return `${typeName} (左 ${left} / 右 ${right})`;
        }
        return `${typeName} ${record.amount} ml`;
    } else if (record.type === 'sleep') {
        return '寶寶睡覺';
    }
    return '作息記錄';
};

const formatRecordTime = (record) => {
    const d = new Date(record.timestamp);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
};

const formatDuration = (mins) => {
    if (mins < 60) return `${mins}分鐘`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return remainMins > 0 ? `${hrs}小時${remainMins}分鐘` : `${hrs}小時`;
};

// 刪除記錄
const confirmDeleteRecord = async (id) => {
    if (confirm('確定要刪除這筆作息記錄嗎？刪除後將無法還原喔！')) {
        try {
            await deleteRecord(id);
            await loadRecords();
            syncWithSupabase().then(() => loadRecords());
        } catch {
            alert('刪除失敗，請重試');
        }
    }
};

// 查看大圖
const showPhotoDialog = ref(false);
const photoViewUrl = ref('');

const viewFullPhoto = (photoUrl) => {
    photoViewUrl.value = photoUrl;
    showPhotoDialog.value = true;
};
</script>

<style scoped>
.history-page {
    background-color: #f9f9f9;
}
.record-card {
    border-left: 4px solid transparent;
}
.record-card:hover {
    border-left-color: #ec4899; /* pink-500 */
}
</style>
