<template>
    <layout-item>
        <!-- 頂部溫馨問候與日期 -->
        <div class="bq-mb-6 bq-flex bq-flex-col md:bq-flex-row bq-justify-between bq-items-start md:bq-items-center bq-gap-4">
            <div>
                <h1 class="bq-text-2xl bq-font-bold bq-text-gray-800 bq-flex bq-items-center bq-gap-2">
                    👶 寶寶作息記錄儀
                </h1>
                <p class="bq-text-sm bq-text-gray-500 bq-mt-1">
                    今天也是充滿愛與耐心的一天！讓我們一起記錄寶寶的成長足跡。
                </p>
            </div>
            <div class="bq-bg-white bq-shadow-sm bq-rounded-12 bq-px-4 bq-py-2 bq-border bq-border-gray-100 bq-text-right">
                <div class="bq-text-xs bq-text-gray-400">今天是</div>
                <div class="bq-text-sm bq-font-bold bq-text-gray-700">{{ todayString }}</div>
            </div>
        </div>

        <!-- 實時睡眠計時器 (當寶寶正在睡覺時顯示) -->
        <transition name="slide-fade">
            <div
                v-if="activeSleepStartTime"
                class="bq-mb-6 bq-bg-gradient-to-r bq-from-indigo-500 bq-to-purple-600 bq-text-white bq-rounded-16 bq-p-6 bq-shadow-md bq-relative bq-overflow-hidden"
            >
                <div class="bq-absolute -bq-right-10 -bq-bottom-10 bq-opacity-10 bq-text-9xl">💤</div>
                <div class="bq-flex bq-flex-col md:bq-flex-row bq-justify-between bq-items-center bq-gap-4 bq-relative bq-z-10">
                    <div class="bq-text-center md:bq-text-left">
                        <span class="bq-bg-white/20 bq-text-xs bq-font-bold bq-px-3 bq-py-1 bq-rounded-full bq-uppercase bq-tracking-wider">
                            睡眠計時中
                        </span>
                        <h2 class="bq-text-xl bq-font-bold bq-mt-2">寶寶正在香甜地睡覺呢... 👶💤</h2>
                        <p class="bq-text-sm bq-text-white/80 bq-mt-1">
                            開始時間：{{ formatTimeOnly(activeSleepStartTime) }} (已入睡 {{ sleepTimerString }})
                        </p>
                    </div>
                    <div class="bq-flex bq-gap-3">
                        <button
                            type="button"
                            class="bq-bg-white hover:bq-bg-yellow-50 active:bq-scale-98 bq-text-indigo-600 bq-px-5 bq-py-2.5 bq-rounded-10 bq-font-bold bq-transition bq-shadow-sm bq-text-sm"
                            @click="handleWakeUp"
                        >
                            寶寶醒了 ☀️
                        </button>
                        <button
                            type="button"
                            class="bq-bg-indigo-600 hover:bq-bg-indigo-700 active:bq-scale-98 bq-text-white bq-px-5 bq-py-2.5 bq-rounded-10 bq-font-bold bq-transition bq-text-sm"
                            @click="cancelSleepTimer"
                        >
                            取消計時
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- 今日統計資料與操作卡片 -->
        <div class="bq-grid bq-grid-cols-1 lg:bq-grid-cols-3 bq-gap-6 bq-mb-8">
            <!-- 喝奶統計 -->
            <div class="bq-bg-white bq-shadow-sm bq-rounded-16 bq-p-6 bq-border bq-border-gray-100 bq-flex bq-flex-col bq-items-center bq-relative bq-overflow-hidden">
                <div class="bq-absolute bq-top-3 bq-left-4 bq-text-sm bq-font-bold bq-text-gray-500">今日喝奶</div>
                <div class="bq-my-4 bq-relative bq-flex bq-items-center bq-justify-center" style="width: 140px; height: 140px;">
                    <!-- SVG 圓環進度條 -->
                    <svg class="bq-w-full bq-h-full -bq-rotate-90">
                        <circle cx="70" cy="70" r="58" stroke="#F3F4F6" stroke-width="12" fill="transparent" />
                        <circle
                            cx="70"
                            cy="70"
                            r="58"
                            stroke="url(#milkGradient)"
                            stroke-width="12"
                            fill="transparent"
                            :stroke-dasharray="364.4"
                            :stroke-dashoffset="364.4 - (364.4 * Math.min(milkPercent, 100)) / 100"
                            stroke-linecap="round"
                            class="bq-transition-all bq-duration-1000"
                        />
                        <defs>
                            <linearGradient id="milkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#FDBA74" />
                                <stop offset="100%" stop-color="#F472B6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div class="bq-absolute bq-text-center">
                        <div class="bq-text-2xl bq-font-black bq-text-gray-800">{{ todayMilkTotal }}</div>
                        <div class="bq-text-xs bq-text-gray-400">/ {{ milkTarget }} ml</div>
                    </div>
                </div>
                <div class="bq-text-center">
                    <div class="bq-text-sm bq-font-medium bq-text-gray-600">已餵奶 {{ todayMilkCount }} 次</div>
                    <div class="bq-text-xs bq-text-pink-500 bq-font-semibold bq-mt-1">{{ milkPercent }}% 已達成</div>
                </div>
            </div>

            <!-- 睡眠統計 -->
            <div class="bq-bg-white bq-shadow-sm bq-rounded-16 bq-p-6 bq-border bq-border-gray-100 bq-flex bq-flex-col bq-items-center bq-relative bq-overflow-hidden">
                <div class="bq-absolute bq-top-3 bq-left-4 bq-text-sm bq-font-bold bq-text-gray-500">今日睡眠</div>
                <div class="bq-my-4 bq-relative bq-flex bq-items-center bq-justify-center" style="width: 140px; height: 140px;">
                    <!-- SVG 圓環進度條 -->
                    <svg class="bq-w-full bq-h-full -bq-rotate-90">
                        <circle cx="70" cy="70" r="58" stroke="#F3F4F6" stroke-width="12" fill="transparent" />
                        <circle
                            cx="70"
                            cy="70"
                            r="58"
                            stroke="url(#sleepGradient)"
                            stroke-width="12"
                            fill="transparent"
                            :stroke-dasharray="364.4"
                            :stroke-dashoffset="364.4 - (364.4 * Math.min(sleepPercent, 100)) / 100"
                            stroke-linecap="round"
                            class="bq-transition-all bq-duration-1000"
                        />
                        <defs>
                            <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#818CF8" />
                                <stop offset="100%" stop-color="#C084FC" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div class="bq-absolute bq-text-center">
                        <div class="bq-text-xl bq-font-black bq-text-gray-800">{{ todaySleepString }}</div>
                        <div class="bq-text-xs bq-text-gray-400">/ {{ sleepTargetHours }} 小時</div>
                    </div>
                </div>
                <div class="bq-text-center">
                    <div class="bq-text-sm bq-font-medium bq-text-gray-600">已睡眠 {{ todaySleepCount }} 次</div>
                    <div class="bq-text-xs bq-text-indigo-500 bq-font-semibold bq-mt-1">{{ sleepPercent }}% 已達成</div>
                </div>
            </div>

            <!-- 快捷記錄與睡眠開關 -->
            <div class="bq-bg-white bq-shadow-sm bq-rounded-16 bq-p-6 bq-border bq-border-gray-100 bq-flex bq-flex-col bq-justify-center bq-gap-4">
                <button
                    class="action-card-btn bq-bg-gradient-to-r bq-from-orange-100 bq-to-pink-100 hover:bq-from-orange-200 hover:bq-to-pink-200 bq-text-gray-800 bq-p-4 bq-rounded-12 bq-flex bq-items-center bq-gap-4 bq-transition bq-shadow-sm hover:bq-shadow bq-text-left"
                    @click="openMilkDialog"
                >
                    <span class="bq-bg-white bq-rounded-full bq-w-12 bq-h-12 bq-flex bq-items-center bq-justify-center bq-text-2xl bq-shadow-sm">🍼</span>
                    <div>
                        <div class="bq-font-bold bq-text-base">新增餵奶記錄</div>
                        <div class="bq-text-xs bq-text-gray-500">記錄配方奶、母乳或副食品</div>
                    </div>
                </button>

                <button
                    v-if="!activeSleepStartTime"
                    class="action-card-btn bq-bg-gradient-to-r bq-from-indigo-100 bq-to-purple-100 hover:bq-from-indigo-200 hover:bq-to-purple-200 bq-text-gray-800 bq-p-4 bq-rounded-12 bq-flex bq-items-center bq-gap-4 bq-transition bq-shadow-sm hover:bq-shadow bq-text-left"
                    @click="startSleepTimer"
                >
                    <span class="bq-bg-white bq-rounded-full bq-w-12 bq-h-12 bq-flex bq-items-center bq-justify-center bq-text-2xl bq-shadow-sm">💤</span>
                    <div>
                        <div class="bq-font-bold bq-text-base">寶寶開始睡覺</div>
                        <div class="bq-text-xs bq-text-gray-500">開啟實時睡眠計時器</div>
                    </div>
                </button>

                <button
                    class="action-card-btn bq-bg-gradient-to-r bq-from-gray-100 bq-to-slate-100 hover:bq-from-gray-200 hover:bq-to-slate-200 bq-text-gray-800 bq-p-4 bq-rounded-12 bq-flex bq-items-center bq-gap-4 bq-transition bq-shadow-sm hover:bq-shadow bq-text-left"
                    @click="openSleepDialog"
                >
                    <span class="bq-bg-white bq-rounded-full bq-w-12 bq-h-12 bq-flex bq-items-center bq-justify-center bq-text-2xl bq-shadow-sm">📝</span>
                    <div>
                        <div class="bq-font-bold bq-text-base">補記睡眠時間</div>
                        <div class="bq-text-xs bq-text-gray-500">手動輸入睡眠起訖時間</div>
                    </div>
                </button>
            </div>
        </div>

        <!-- 歷史清單區域 -->
        <div class="bq-bg-white bq-shadow-sm bq-rounded-16 bq-p-6 bq-border bq-border-gray-100">
            <div class="bq-flex bq-flex-col sm:bq-flex-row bq-justify-between bq-items-start sm:bq-items-center bq-gap-4 bq-mb-6">
                <h3 class="bq-text-lg bq-font-bold bq-text-gray-800">作息歷史日誌</h3>
                
                <!-- 篩選器與搜尋 -->
                <div class="bq-flex bq-flex-wrap bq-gap-3 bq-w-full sm:bq-w-auto">
                    <!-- Tab 切換 -->
                    <div class="bq-bg-gray-100 bq-p-1 bq-rounded-8 bq-flex bq-items-center">
                        <button
                            v-for="tab in filterTabs"
                            :key="tab.value"
                            type="button"
                            class="bq-px-4 bq-py-1.5 bq-rounded-6 bq-text-xs bq-font-bold bq-transition"
                            :class="filterType === tab.value ? 'bq-bg-white bq-text-gray-800 bq-shadow-sm' : 'bq-text-gray-500 hover:bq-text-gray-800'"
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
                        class="bq-text-xs bq-px-3 bq-py-1.5 bq-border bq-border-gray-200 bq-rounded-8 focus:bq-outline-none focus:bq-border-pink-300 bq-w-full sm:bq-w-40"
                    />
                </div>
            </div>

            <!-- 歷史日誌列表 -->
            <div v-if="filteredRecords.length === 0" class="bq-py-12 bq-text-center bq-text-gray-400">
                <div class="bq-text-4xl bq-mb-2">🍃</div>
                <div>沒有符合條件的作息記錄喔！</div>
            </div>

            <div v-else class="bq-flex bq-flex-col bq-gap-4">
                <div
                    v-for="record in filteredRecords"
                    :key="record.id"
                    class="record-card bq-bg-slate-50 hover:bq-bg-slate-100/70 bq-border bq-border-slate-100 bq-rounded-12 bq-p-4 bq-flex bq-flex-col md:bq-flex-row bq-justify-between bq-items-start md:bq-items-center bq-gap-4 bq-transition hover:bq-shadow-sm bq-relative"
                >
                    <div class="bq-flex bq-items-start bq-gap-4">
                        <!-- 類別 Icon -->
                        <span
                            class="bq-rounded-full bq-w-12 bq-h-12 bq-flex bq-items-center bq-justify-center bq-text-2xl bq-shadow-sm"
                            :class="record.type === 'milk' ? 'bq-bg-orange-100' : 'bq-bg-indigo-100'"
                        >
                            {{ record.type === 'milk' ? '🍼' : '💤' }}
                        </span>

                        <!-- 記錄資訊 -->
                        <div>
                            <div class="bq-flex bq-items-center bq-gap-2">
                                <span class="bq-font-bold bq-text-gray-800">
                                    {{ getRecordTitle(record) }}
                                </span>
                                <span
                                    class="bq-text-2xs bq-font-bold bq-px-2 bq-py-0.5 bq-rounded-full"
                                    :class="record.type === 'milk' ? 'bq-bg-orange-200 bq-text-orange-800' : 'bq-bg-indigo-200 bq-text-indigo-800'"
                                >
                                    {{ record.type === 'milk' ? '餵奶' : '睡眠' }}
                                </span>
                            </div>
                            <div class="bq-text-xs bq-text-gray-500 bq-mt-1">
                                <span class="mdi mdi-clock-outline"></span>
                                {{ formatRecordTime(record) }}
                                <span v-if="record.duration" class="bq-ml-2 bq-text-indigo-600 bq-font-semibold">
                                    ({{ formatDuration(record.duration) }})
                                </span>
                            </div>
                            <p v-if="record.note" class="bq-text-sm bq-text-gray-600 bq-mt-2 bq-italic">
                                「{{ record.note }}」
                            </p>
                        </div>
                    </div>

                    <!-- 縮圖與操作按鈕 -->
                    <div class="bq-flex bq-items-center bq-gap-4 bq-w-full md:bq-w-auto bq-justify-between md:bq-justify-end">
                        <!-- 相片縮圖 -->
                        <div v-if="record.photo" class="photo-thumbnail-container">
                            <img
                                :src="record.photo"
                                class="bq-w-16 bq-h-16 bq-object-cover bq-rounded-8 bq-cursor-pointer bq-border bq-border-gray-200 hover:bq-scale-105 bq-transition"
                                alt="寶寶作息相片"
                                @click="viewFullPhoto(record.photo)"
                            />
                        </div>

                        <!-- 刪除按鈕 -->
                        <button
                            type="button"
                            class="bq-text-red-500 hover:bq-text-red-700 bq-text-xs bq-font-bold bq-px-3 bq-py-1.5 hover:bq-bg-red-50 bq-rounded-8 bq-transition"
                            @click="confirmDeleteRecord(record.id)"
                        >
                            刪除
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ─── 彈跳視窗 ─── -->

        <!-- 1. 新增喝奶記錄 Dialog -->
        <v-dialog v-model="showMilkDialog" max-width="500px" persistent>
            <v-card class="bq-rounded-16 bq-overflow-hidden">
                <v-card-title class="bq-bg-gradient-to-r bq-from-orange-100 bq-to-pink-100 bq-p-4 bq-flex bq-justify-between bq-items-center">
                    <span class="bq-font-bold bq-text-gray-800">🍼 記錄餵奶</span>
                    <button type="button" class="bq-text-gray-500 hover:bq-text-gray-800" @click="showMilkDialog = false">✕</button>
                </v-card-title>
                <v-card-text class="bq-p-5 bq-flex bq-flex-col bq-gap-4">
                    <!-- 餵奶種類 -->
                    <div>
                        <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-2">喝奶種類</label>
                        <div class="bq-bg-gray-100 bq-p-1 bq-rounded-8 bq-flex">
                            <button
                                v-for="t in milkTypes"
                                :key="t.value"
                                type="button"
                                class="bq-flex-1 bq-py-2 bq-rounded-6 bq-text-xs bq-font-bold bq-transition"
                                :class="milkForm.type === t.value ? 'bq-bg-white bq-text-gray-800 bq-shadow-sm' : 'bq-text-gray-500'"
                                @click="milkForm.type = t.value"
                            >
                                {{ t.label }}
                            </button>
                        </div>
                    </div>

                    <!-- 餵奶量 (配方奶/母乳瓶餵) -->
                    <div v-if="milkForm.type !== 'breast_direct'">
                        <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">喝奶量 (ml)</label>
                        <input
                            v-model="milkForm.amount"
                            type="number"
                            class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-pink-300 bq-text-sm bq-transition"
                            placeholder="請輸入毫升數"
                        />
                        <!-- 快速點擊按鈕 -->
                        <div class="bq-flex bq-flex-wrap bq-gap-2 bq-mt-2">
                            <button
                                v-for="amount in quickAmounts"
                                :key="amount"
                                type="button"
                                class="bq-text-xs bq-bg-orange-50 hover:bq-bg-orange-100 bq-text-orange-700 bq-px-3 bq-py-1.5 bq-rounded-6 bq-transition bq-font-semibold"
                                @click="milkForm.amount = amount"
                            >
                                {{ amount }} ml
                            </button>
                        </div>
                    </div>

                    <!-- 親餵時間 (親餵時顯示) -->
                    <div v-else class="bq-grid bq-grid-cols-2 bq-gap-4">
                        <div>
                            <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">左乳時間 (分鐘)</label>
                            <input
                                v-model="milkForm.leftDuration"
                                type="number"
                                class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-pink-300 bq-text-sm bq-transition"
                                placeholder="分鐘"
                            />
                        </div>
                        <div>
                            <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">右乳時間 (分鐘)</label>
                            <input
                                v-model="milkForm.rightDuration"
                                type="number"
                                class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-pink-300 bq-text-sm bq-transition"
                                placeholder="分鐘"
                            />
                        </div>
                    </div>

                    <!-- 記錄時間 -->
                    <div>
                        <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">記錄時間</label>
                        <input
                            v-model="milkForm.time"
                            type="datetime-local"
                            class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-pink-300 bq-text-sm bq-transition"
                        />
                    </div>

                    <!-- 拍照記錄 -->
                    <div>
                        <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-2">拍照留念 (可選)</label>
                        <CameraPicker v-model="milkForm.photo" />
                    </div>

                    <!-- 備註 -->
                    <div>
                        <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">備註</label>
                        <input
                            v-model="milkForm.note"
                            type="text"
                            class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-pink-300 bq-text-sm bq-transition"
                            placeholder="例如：喝奶狀況、吐奶、排便等狀況"
                        />
                    </div>
                </v-card-text>
                <v-card-actions class="bq-p-5 bq-bg-gray-50 bq-flex bq-justify-end bq-gap-3">
                    <button
                        type="button"
                        class="bq-bg-gray-200 hover:bq-bg-gray-300 active:bq-scale-98 bq-text-gray-700 bq-px-5 bq-py-2.5 bq-rounded-10 bq-font-bold bq-transition bq-text-sm"
                        @click="showMilkDialog = false"
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        class="bq-bg-pink-500 hover:bq-bg-pink-600 active:bq-scale-98 bq-text-white bq-px-5 bq-py-2.5 bq-rounded-10 bq-font-bold bq-transition bq-text-sm bq-shadow-sm"
                        @click="saveMilkRecord"
                    >
                        儲存記錄
                    </button>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 2. 新增睡眠記錄 Dialog -->
        <v-dialog v-model="showSleepDialog" max-width="500px" persistent>
            <v-card class="bq-rounded-16 bq-overflow-hidden">
                <v-card-title class="bq-bg-gradient-to-r bq-from-indigo-100 bq-to-purple-100 bq-p-4 bq-flex bq-justify-between bq-items-center">
                    <span class="bq-font-bold bq-text-gray-800">💤 記錄睡眠</span>
                    <button type="button" class="bq-text-gray-500 hover:bq-text-gray-800" @click="showSleepDialog = false">✕</button>
                </v-card-title>
                <v-card-text class="bq-p-5 bq-flex bq-flex-col bq-gap-4">
                    <!-- 入睡時間 -->
                    <div>
                        <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">開始入睡時間</label>
                        <input
                            v-model="sleepForm.startTime"
                            type="datetime-local"
                            class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-pink-300 bq-text-sm bq-transition"
                        />
                    </div>

                    <!-- 醒來時間 -->
                    <div>
                        <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">醒來時間</label>
                        <input
                            v-model="sleepForm.endTime"
                            type="datetime-local"
                            class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-pink-300 bq-text-sm bq-transition"
                        />
                    </div>

                    <!-- 拍照記錄 -->
                    <div>
                        <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-2">拍照留念 (可選)</label>
                        <CameraPicker v-model="sleepForm.photo" />
                    </div>

                    <!-- 備註 -->
                    <div>
                        <label class="bq-block bq-text-sm bq-font-bold bq-text-gray-600 bq-mb-1">備註</label>
                        <input
                            v-model="sleepForm.note"
                            type="text"
                            class="bq-w-full bq-px-4 bq-py-2.5 bq-border bq-border-gray-200 bq-rounded-10 focus:bq-outline-none focus:bq-border-pink-300 bq-text-sm bq-transition"
                            placeholder="例如：睡得很安穩、驚醒哭鬧、打呼等"
                        />
                    </div>
                </v-card-text>
                <v-card-actions class="bq-p-5 bq-bg-gray-50 bq-flex bq-justify-end bq-gap-3">
                    <button
                        type="button"
                        class="bq-bg-gray-200 hover:bq-bg-gray-300 active:bq-scale-98 bq-text-gray-700 bq-px-5 bq-py-2.5 bq-rounded-10 bq-font-bold bq-transition bq-text-sm"
                        @click="showSleepDialog = false"
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        class="bq-bg-pink-500 hover:bq-bg-pink-600 active:bq-scale-98 bq-text-white bq-px-5 bq-py-2.5 bq-rounded-10 bq-font-bold bq-transition bq-text-sm bq-shadow-sm"
                        @click="saveSleepRecord"
                    >
                        儲存記錄
                    </button>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 3. 查看大圖 Dialog -->
        <v-dialog v-model="showPhotoDialog" max-width="700px">
            <v-card class="bq-rounded-16 bq-overflow-hidden">
                <div class="bq-relative bq-bg-black bq-flex bq-items-center bq-justify-center" style="min-height: 300px;">
                    <img :src="photoViewUrl" class="bq-w-full bq-h-auto bq-max-h-80vh bq-object-contain" alt="寶寶大圖" />
                    <button
                        type="button"
                        class="bq-absolute bq-top-3 bq-right-3 bq-bg-black/60 hover:bq-bg-black/80 bq-text-white bq-rounded-full bq-w-10 bq-h-10 bq-flex bq-items-center bq-justify-center bq-transition"
                        @click="showPhotoDialog = false"
                    >
                        ✕
                    </button>
                </div>
            </v-card>
        </v-dialog>
    </layout-item>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import LayoutItem from '@/components/layout/LayoutItem.vue';
import CameraPicker from '@/components/CameraPicker.vue';
import { saveRecord, getRecords, deleteRecord } from '@/helpers/db.js';

// ─── 今日日期相關 ───
const todayString = computed(() => {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}`;
});

// ─── 數據來源與狀態 ───
const records = ref([]);
const searchQuery = ref('');
const filterType = ref('all');
const filterTabs = [
    { label: '全部', value: 'all' },
    { label: '餵奶 🍼', value: 'milk' },
    { label: '睡眠 💤', value: 'sleep' }
];

// 載入作息記錄
const loadRecords = async () => {
    try {
        records.value = await getRecords();
    } catch (e) {
        console.error('無法載入作息記錄:', e);
    }
};

onMounted(() => {
    loadRecords();
    checkActiveSleepTimer();
});

// ─── 今日統計計算 ───
const milkTarget = 1000; // 今日目標奶量 ml
const sleepTargetHours = 12; // 今日目標睡眠小時

// 獲取今天日期的零點時間戳
const getTodayZeroTimestamp = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

const todayRecords = computed(() => {
    const todayZero = getTodayZeroTimestamp();
    return records.value.filter((r) => r.timestamp >= todayZero);
});

// 今日喝奶總量
const todayMilkTotal = computed(() => {
    return todayRecords.value
        .filter((r) => r.type === 'milk' && r.amount)
        .reduce((sum, r) => sum + Number(r.amount), 0);
});

// 今日喝奶次數
const todayMilkCount = computed(() => {
    return todayRecords.value.filter((r) => r.type === 'milk').length;
});

// 今日喝奶百分比
const milkPercent = computed(() => {
    return Math.round((todayMilkTotal.value / milkTarget) * 100) || 0;
});

// 今日睡眠總時長 (分鐘)
const todaySleepMinutes = computed(() => {
    return todayRecords.value
        .filter((r) => r.type === 'sleep' && r.duration)
        .reduce((sum, r) => sum + Number(r.duration), 0);
});

// 今日睡眠時長字串
const todaySleepString = computed(() => {
    const mins = todaySleepMinutes.value;
    if (mins < 60) return `${mins}分`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return remainMins > 0 ? `${hrs}時${remainMins}分` : `${hrs}時`;
});

// 今日睡眠次數
const todaySleepCount = computed(() => {
    return todayRecords.value.filter((r) => r.type === 'sleep').length;
});

// 今日睡眠百分比
const sleepPercent = computed(() => {
    const targetMins = sleepTargetHours * 60;
    return Math.round((todaySleepMinutes.value / targetMins) * 100) || 0;
});

// ─── 歷史記錄過濾 ───
const filteredRecords = computed(() => {
    let list = records.value;

    // 類別過濾
    if (filterType.value !== 'all') {
        list = list.filter((r) => r.type === filterType.value);
    }

    // 搜尋關鍵字過濾
    if (searchQuery.value.trim() !== '') {
        const query = searchQuery.value.toLowerCase();
        list = list.filter(
            (r) =>
                r.note?.toLowerCase().includes(query) ||
                getRecordTitle(r).toLowerCase().includes(query)
        );
    }

    return list;
});

// ─── 記錄標題與時間格式化 ───
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
            const left = record.leftDuration ? `${record.leftDuration}分` : '0分';
            const right = record.rightDuration ? `${record.rightDuration}分` : '0分';
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

const formatTimeOnly = (timestamp) => {
    const d = new Date(timestamp);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
};

const formatDuration = (mins) => {
    if (mins < 60) return `${mins}分鐘`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return remainMins > 0 ? `${hrs}小時${remainMins}分鐘` : `${hrs}小時`;
};

// ─── 實時睡眠計時器功能 ───
const activeSleepStartTime = ref(null);
const sleepTimerVal = ref(0); // 單位：秒
let sleepInterval = null;

const sleepTimerString = computed(() => {
    const totalSecs = sleepTimerVal.value;
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
        return `${hrs}小時${pad(mins)}分${pad(secs)}秒`;
    }
    return `${mins}分${pad(secs)}秒`;
});

// 開始睡眠計時
const startSleepTimer = () => {
    const now = Date.now();
    activeSleepStartTime.value = now;
    localStorage.setItem('baby_sleep_start_time', String(now));
    startInterval(now);
};

// 檢查是否有進行中的睡眠
const checkActiveSleepTimer = () => {
    const stored = localStorage.getItem('baby_sleep_start_time');
    if (stored) {
        const startTime = Number(stored);
        activeSleepStartTime.value = startTime;
        startInterval(startTime);
    }
};

const startInterval = (startTime) => {
    if (sleepInterval) clearInterval(sleepInterval);
    sleepTimerVal.value = Math.floor((Date.now() - startTime) / 1000);
    sleepInterval = setInterval(() => {
        sleepTimerVal.value = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
};

// 寶寶醒了 (點擊完成計時)
const handleWakeUp = () => {
    const now = Date.now();
    const start = activeSleepStartTime.value;

    // 開啟睡眠 Dialog 並預填時間
    openSleepDialog();
    sleepForm.startTime = formatDatetimeLocal(start);
    sleepForm.endTime = formatDatetimeLocal(now);
};

// 取消睡眠計時
const cancelSleepTimer = () => {
    if (confirm('確定要取消這次的睡眠計時嗎？已記錄的時間將不會被儲存。')) {
        stopSleepTimer();
    }
};

const stopSleepTimer = () => {
    if (sleepInterval) {
        clearInterval(sleepInterval);
        sleepInterval = null;
    }
    activeSleepStartTime.value = null;
    localStorage.removeItem('baby_sleep_start_time');
};

onBeforeUnmount(() => {
    if (sleepInterval) clearInterval(sleepInterval);
});

// ─── 餵奶記錄 Dialog 處理 ───
const showMilkDialog = ref(false);
const milkTypes = [
    { label: '配方奶 🍼', value: 'formula' },
    { label: '母乳瓶餵 🍼', value: 'breast_bottle' },
    { label: '母乳親餵 👩‍🍼', value: 'breast_direct' },
    { label: '副食品 🥣', value: 'solid' }
];
const quickAmounts = [60, 90, 120, 150, 180, 210, 240];

const milkForm = reactive({
    type: 'formula',
    amount: 120,
    leftDuration: '',
    rightDuration: '',
    time: '',
    photo: '',
    note: ''
});

const openMilkDialog = () => {
    milkForm.type = 'formula';
    milkForm.amount = 120;
    milkForm.leftDuration = '';
    milkForm.rightDuration = '';
    milkForm.time = formatDatetimeLocal(Date.now());
    milkForm.photo = '';
    milkForm.note = '';
    showMilkDialog.value = true;
};

const saveMilkRecord = async () => {
    // 檢查欄位
    if (milkForm.type !== 'breast_direct' && !milkForm.amount) {
        alert('請輸入喝奶量！');
        return;
    }
    if (
        milkForm.type === 'breast_direct' &&
        !milkForm.leftDuration &&
        !milkForm.rightDuration
    ) {
        alert('請填寫親餵時間！');
        return;
    }

    const timestamp = new Date(milkForm.time).getTime();
    const record = {
        id: `milk-${Date.now()}`,
        type: 'milk',
        milkType: milkForm.type,
        amount: milkForm.type === 'breast_direct' ? 0 : Number(milkForm.amount),
        leftDuration: milkForm.type === 'breast_direct' ? Number(milkForm.leftDuration) : 0,
        rightDuration: milkForm.type === 'breast_direct' ? Number(milkForm.rightDuration) : 0,
        timestamp,
        photo: milkForm.photo,
        note: milkForm.note
    };

    try {
        await saveRecord(record);
        await loadRecords();
        showMilkDialog.value = false;
    } catch (e) {
        alert('儲存失敗，請重試');
    }
};

// ─── 睡眠記錄 Dialog 處理 ───
const showSleepDialog = ref(false);
const sleepForm = reactive({
    startTime: '',
    endTime: '',
    photo: '',
    note: ''
});

const openSleepDialog = () => {
    const now = Date.now();
    sleepForm.startTime = formatDatetimeLocal(now - 3600000); // 預設一小時前
    sleepForm.endTime = formatDatetimeLocal(now);
    sleepForm.photo = '';
    sleepForm.note = '';
    showSleepDialog.value = true;
};

const saveSleepRecord = async () => {
    const start = new Date(sleepForm.startTime).getTime();
    const end = new Date(sleepForm.endTime).getTime();

    if (start >= end) {
        alert('醒來時間必須晚於開始入睡時間！');
        return;
    }

    const duration = Math.round((end - start) / 60000); // 轉換為分鐘

    const record = {
        id: `sleep-${Date.now()}`,
        type: 'sleep',
        timestamp: start, // 以入睡時間作為記錄時間點
        endTime: end,
        duration,
        photo: sleepForm.photo,
        note: sleepForm.note
    };

    try {
        await saveRecord(record);
        await loadRecords();
        stopSleepTimer(); // 如果是從實時睡眠計時器過來的，清除計時器
        showSleepDialog.value = false;
    } catch (e) {
        alert('儲存失敗，請重試');
    }
};

// ─── 刪除記錄 ───
const confirmDeleteRecord = async (id) => {
    if (confirm('確定要刪除這筆作息記錄嗎？刪除後將無法還原喔！')) {
        try {
            await deleteRecord(id);
            await loadRecords();
        } catch (e) {
            alert('刪除失敗，請重試');
        }
    }
};

// ─── 查看大圖 ───
const showPhotoDialog = ref(false);
const photoViewUrl = ref('');

const viewFullPhoto = (photoUrl) => {
    photoViewUrl.value = photoUrl;
    showPhotoDialog.value = true;
};

// ─── 輔助函數 ───
// 格式化為 datetime-local 所需格式：YYYY-MM-DDThh:mm
const formatDatetimeLocal = (timestamp) => {
    const d = new Date(timestamp);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${MM}-${DD}T${hh}:${mm}`;
};
</script>

<style scoped>
.action-card-btn {
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.action-card-btn:active {
    transform: scale(0.98);
}

.record-card {
    transition: all 0.2s ease-in-out;
}

.record-card:hover {
    transform: translateY(-2px);
}

/* Slide Fade Transition */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}
</style>
