<template>
    <layout-item>
        <!-- 頂部溫馨問候與日期 -->
        <div
            class="bq-mb-6 bq-flex bq-flex-col bq-items-start bq-justify-between bq-gap-4 md:bq-flex-row md:bq-items-center"
        >
            <div>
                <h1
                    class="bq-flex bq-items-center bq-gap-2 bq-text-2xl bq-font-bold bq-text-gray-800"
                >
                    👶 寶寶作息記錄儀
                </h1>
                <p class="bq-mt-1 bq-text-sm bq-text-gray-500">
                    今天也是充滿愛與耐心的一天！讓我們一起記錄寶寶的成長足跡。
                </p>
            </div>
            <div class="bq-flex bq-items-center bq-gap-3">
                <div
                    class="bq-rounded-12 bq-border bq-border-gray-100 bq-bg-white bq-px-4 bq-py-2 bq-text-right bq-shadow-sm"
                >
                    <div class="bq-text-xs bq-text-gray-400">
                        今天是 {{ todayString }}
                    </div>
                    <div
                        v-if="babyAgeDays !== null"
                        class="bq-mt-0.5 bq-text-xs bq-font-bold bq-text-teal-600"
                    >
                        寶寶已出生 {{ babyAgeDays }} 天 (約
                        {{ (babyAgeDays / 30.4).toFixed(1) }} 個月)
                    </div>
                    <div
                        v-else
                        class="bq-mt-0.5 bq-text-xs bq-font-bold bq-text-orange-500"
                    >
                        尚未設定寶寶生日
                    </div>
                </div>
                <button
                    type="button"
                    class="bq-rounded-12 bq-flex bq-h-10 bq-w-10 bq-items-center bq-justify-center bq-border bq-border-gray-200 bq-bg-white bq-text-base bq-shadow-sm bq-transition hover:bq-bg-slate-50"
                    @click="showSettingsDialog = true"
                    title="設定寶寶生日與耐累度"
                >
                    ⚙️
                </button>
            </div>
        </div>

        <!-- 每週體重更新提醒 -->
        <transition name="slide-fade">
            <div
                v-if="showWeeklyWeightReminder"
                class="bq-rounded-16 bq-relative bq-mb-6 bq-overflow-hidden bq-bg-gradient-to-r bq-from-amber-500 bq-to-orange-600 bq-p-5 bq-text-white bq-shadow-md"
            >
                <div
                    class="bq-absolute -bq-bottom-10 -bq-right-10 bq-text-9xl bq-opacity-10"
                >
                    📈
                </div>
                <div
                    class="bq-relative bq-z-10 bq-flex bq-flex-col bq-items-center bq-justify-between bq-gap-4 sm:bq-flex-row"
                >
                    <div class="bq-text-center sm:bq-text-left">
                        <h2 class="bq-text-base bq-font-bold">
                            寶寶又過了一週囉！👶✨
                        </h2>
                        <p
                            class="bq-mt-1 bq-text-xs bq-text-white/90"
                            style="font-size: 0.75rem"
                        >
                            更新當前體重，App
                            將為您自動計算本週最新的『建議奶量』與『生長曲線』喔！📈
                            <span
                                v-if="lastWeightRecord"
                                class="bq-font-semibold"
                            >
                                (距離上次更新已過
                                {{ daysSinceLastWeight }} 天)</span
                            >
                            <span v-else class="bq-font-semibold">
                                (尚未有體重記錄)</span
                            >
                        </p>
                    </div>
                    <button
                        type="button"
                        class="active:bq-scale-98 bq-rounded-10 bq-bg-white bq-px-4 bq-py-2 bq-text-xs bq-font-bold bq-text-orange-700 bq-shadow-sm bq-transition hover:bq-bg-yellow-50"
                        @click="openQuickWeightDialog"
                    >
                        快速更新體重 ⚖️
                    </button>
                </div>
            </div>
        </transition>

        <!-- 實時睡眠計時器 (當寶寶正在睡覺時顯示) -->
        <transition name="slide-fade">
            <div
                v-if="activeSleepStartTime"
                class="bq-rounded-16 bq-relative bq-mb-6 bq-overflow-hidden bq-bg-gradient-to-r bq-from-indigo-500 bq-to-purple-600 bq-p-6 bq-text-white bq-shadow-md"
            >
                <div
                    class="bq-absolute -bq-bottom-10 -bq-right-10 bq-text-9xl bq-opacity-10"
                >
                    💤
                </div>
                <div
                    class="bq-relative bq-z-10 bq-flex bq-flex-col bq-items-center bq-justify-between bq-gap-4 md:bq-flex-row"
                >
                    <div class="bq-text-center md:bq-text-left">
                        <span
                            class="bq-rounded-full bq-bg-white/20 bq-px-3 bq-py-1 bq-text-xs bq-font-bold bq-uppercase bq-tracking-wider"
                        >
                            睡眠計時中
                        </span>
                        <h2 class="bq-mt-2 bq-text-xl bq-font-bold">
                            寶寶正在香甜地睡覺呢... 👶💤
                        </h2>
                        <p class="bq-mt-1 bq-text-sm bq-text-white/80">
                            開始時間：{{
                                formatTimeOnly(activeSleepStartTime)
                            }}
                            (已入睡 {{ sleepTimerString }})
                        </p>
                    </div>
                    <div class="bq-flex bq-gap-3">
                        <button
                            type="button"
                            class="active:bq-scale-98 bq-rounded-10 bq-bg-white bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-indigo-600 bq-shadow-sm bq-transition hover:bq-bg-yellow-50"
                            @click="handleWakeUp"
                        >
                            寶寶醒了 ☀️
                        </button>
                        <button
                            type="button"
                            class="active:bq-scale-98 bq-rounded-10 bq-bg-indigo-600 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-white bq-transition hover:bq-bg-indigo-700"
                            @click="cancelSleepTimer"
                        >
                            取消計時
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- 智能睡眠提示與清醒計時 (當寶寶清醒時顯示) -->
        <transition name="slide-fade">
            <div
                v-if="!activeSleepStartTime"
                class="bq-rounded-16 bq-relative bq-mb-6 bq-overflow-hidden bq-bg-gradient-to-r bq-from-teal-500 bq-to-emerald-600 bq-p-6 bq-text-white bq-shadow-md"
            >
                <div
                    class="bq-absolute -bq-bottom-10 -bq-right-10 bq-text-9xl bq-opacity-10"
                >
                    ☀️
                </div>
                <div
                    class="bq-relative bq-z-10 bq-flex bq-flex-col bq-items-center bq-justify-between bq-gap-4 md:bq-flex-row"
                >
                    <div
                        class="bq-text-center md:bq-text-left"
                        v-if="wakeSuggestion"
                    >
                        <span
                            class="bq-rounded-full bq-bg-white/20 bq-px-3 bq-py-1 bq-text-xs bq-font-bold bq-uppercase bq-tracking-wider"
                        >
                            智慧清醒追蹤
                        </span>
                        <h2 class="bq-mt-2 bq-text-xl bq-font-bold">
                            寶寶目前清醒中 👶☀️
                        </h2>
                        <p class="bq-mt-1 bq-text-sm bq-text-white/80">
                            已清醒：<span class="bq-font-bold">{{
                                wakeDurationString
                            }}</span>
                            {{
                                wakeSuggestion.minutesRemaining > 0
                                    ? `(預計 ${wakeSuggestion.minutesRemaining} 分鐘後該小睡囉！)`
                                    : `(已超出建議清醒時間 ${Math.abs(wakeSuggestion.minutesRemaining)} 分鐘，快帶寶寶去小睡吧！)`
                            }}
                        </p>
                        <p
                            class="bq-mt-1 bq-text-xs bq-text-white/70"
                            style="font-size: 0.75rem"
                        >
                            💡 建議下一次小睡時間：<span class="bq-font-bold">{{
                                wakeSuggestion.suggestedRange
                            }}</span>
                            (依寶寶目前 {{ babyAgeDays }} 天大，耐累程度：{{
                                fatigueToleranceText
                            }}
                            計算)
                        </p>
                    </div>
                    <div class="bq-text-center md:bq-text-left" v-else>
                        <span
                            class="bq-rounded-full bq-bg-white/20 bq-px-3 bq-py-1 bq-text-xs bq-font-bold bq-uppercase bq-tracking-wider"
                        >
                            智慧清醒追蹤
                        </span>
                        <h2 class="bq-mt-2 bq-text-xl bq-font-bold">
                            歡迎使用智慧清醒追蹤 👶✨
                        </h2>
                        <p class="bq-mt-1 bq-text-sm bq-text-white/80">
                            請點選齒輪或右側按鈕設定寶寶的生日，並記錄一筆「睡眠記錄」，系統便會自動推算清醒時間與下一次小睡建議！
                        </p>
                    </div>

                    <div
                        class="bq-flex bq-flex-wrap bq-justify-center bq-gap-3"
                    >
                        <button
                            type="button"
                            class="active:bq-scale-98 bq-rounded-10 bq-bg-white bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-teal-700 bq-shadow-sm bq-transition hover:bq-bg-yellow-50"
                            @click="startSleepTimer"
                        >
                            寶寶睡覺了 💤
                        </button>
                        <button
                            type="button"
                            class="active:bq-scale-98 bq-rounded-10 bq-bg-teal-600 bq-px-4 bq-py-2.5 bq-text-sm bq-font-bold bq-text-white bq-transition hover:bq-bg-teal-700"
                            @click="showSettingsDialog = true"
                        >
                            設定寶寶 ⚙️
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- 寶寶設定對話框 -->
        <v-dialog v-model="showSettingsDialog" max-width="500px">
            <v-card class="bq-rounded-16 bq-overflow-hidden">
                <v-card-title
                    class="bq-flex bq-items-center bq-justify-between bq-bg-gradient-to-r bq-from-teal-100 bq-to-emerald-100 bq-p-4"
                >
                    <span class="bq-font-bold bq-text-gray-800"
                        >⚙️ 寶寶基本設定</span
                    >
                    <button
                        type="button"
                        class="bq-text-gray-500 hover:bq-text-gray-800"
                        @click="showSettingsDialog = false"
                    >
                        ✕
                    </button>
                </v-card-title>

                <v-card-text class="bq-flex bq-flex-col bq-gap-4 bq-p-5">
                    <!-- Birthday -->
                    <div>
                        <label
                            class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >寶寶生日</label
                        >
                        <input
                            v-model="babySettings.birthday"
                            type="date"
                            class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-teal-300 focus:bq-outline-none"
                        />
                        <p
                            class="bq-text-3xs bq-mt-1 bq-text-gray-400"
                            style="font-size: 0.65rem"
                        >
                            設定生日後，系統會自動根據月齡提供小兒科建議的清醒時間。
                        </p>
                    </div>

                    <!-- Fatigue Tolerance -->
                    <div>
                        <label
                            class="bq-mb-2 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >寶寶耐累程度</label
                        >
                        <div class="bq-flex bq-flex-col bq-gap-2">
                            <label
                                v-for="opt in fatigueToleranceOptions"
                                :key="opt.value"
                                class="bq-rounded-10 bq-flex bq-cursor-pointer bq-items-center bq-gap-3 bq-border bq-p-3 bq-transition hover:bq-bg-slate-50"
                                :class="
                                    babySettings.fatigueTolerance === opt.value
                                        ? 'bq-border-teal-500 bq-bg-teal-50/30'
                                        : 'bq-border-gray-200'
                                "
                            >
                                <input
                                    type="radio"
                                    name="fatigueTolerance"
                                    :value="opt.value"
                                    v-model="babySettings.fatigueTolerance"
                                    class="bq-text-teal-600 focus:bq-ring-teal-500"
                                />
                                <div>
                                    <div
                                        class="bq-text-xs bq-font-bold bq-text-gray-700"
                                    >
                                        {{ opt.label }}
                                    </div>
                                    <div
                                        class="bq-text-3xs bq-mt-0.5 bq-text-gray-400"
                                        style="font-size: 0.65rem"
                                    >
                                        {{ opt.description }}
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </v-card-text>

                <v-card-actions
                    class="bq-flex bq-justify-end bq-gap-3 bq-bg-gray-50 bq-p-5"
                >
                    <button
                        type="button"
                        class="active:bq-scale-98 bq-rounded-10 bq-bg-gray-200 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-gray-700 bq-transition hover:bq-bg-gray-300"
                        @click="showSettingsDialog = false"
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        class="active:bq-scale-98 bq-rounded-10 bq-bg-teal-500 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-white bq-shadow-sm bq-transition hover:bq-bg-teal-600"
                        @click="saveBabySettings"
                    >
                        儲存設定
                    </button>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 今日統計資料與操作卡片 -->
        <div class="bq-mb-8 bq-grid bq-grid-cols-1 bq-gap-6 lg:bq-grid-cols-3">
            <!-- 喝奶統計 -->
            <div
                class="bq-rounded-16 bq-relative bq-flex bq-flex-col bq-items-center bq-overflow-hidden bq-border bq-border-gray-100 bq-bg-white bq-p-6 bq-shadow-sm"
            >
                <div
                    class="bq-absolute bq-left-4 bq-top-3 bq-text-sm bq-font-bold bq-text-gray-500"
                >
                    今日喝奶
                </div>
                <div
                    class="bq-relative bq-my-4 bq-flex bq-items-center bq-justify-center"
                    style="width: 140px; height: 140px"
                >
                    <!-- SVG 圓環進度條 -->
                    <svg class="bq-h-full bq-w-full -bq-rotate-90">
                        <circle
                            cx="70"
                            cy="70"
                            r="58"
                            stroke="#F3F4F6"
                            stroke-width="12"
                            fill="transparent"
                        />
                        <circle
                            cx="70"
                            cy="70"
                            r="58"
                            stroke="url(#milkGradient)"
                            stroke-width="12"
                            fill="transparent"
                            :stroke-dasharray="364.4"
                            :stroke-dashoffset="
                                364.4 -
                                (364.4 * Math.min(milkPercent, 100)) / 100
                            "
                            stroke-linecap="round"
                            class="bq-transition-all bq-duration-1000"
                        />
                        <defs>
                            <linearGradient
                                id="milkGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stop-color="#FDBA74" />
                                <stop offset="100%" stop-color="#F472B6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div class="bq-absolute bq-text-center">
                        <div class="bq-text-2xl bq-font-black bq-text-gray-800">
                            {{ todayMilkTotal }}
                        </div>
                        <div class="bq-text-xs bq-text-gray-400">
                            / {{ milkTarget }} ml
                        </div>
                    </div>
                </div>
                <div class="bq-text-center">
                    <div class="bq-text-sm bq-font-medium bq-text-gray-600">
                        已餵奶 {{ todayMilkCount }} 次
                    </div>
                    <div
                        class="bq-mt-1 bq-text-xs bq-font-semibold bq-text-pink-500"
                    >
                        {{ milkPercent }}% 已達成
                    </div>
                    <div
                        v-if="latestWeight"
                        class="bq-mt-0.5 bq-text-gray-400"
                        style="font-size: 0.7rem"
                    >
                        依體重 {{ latestWeight }} kg 計算
                    </div>
                </div>
            </div>

            <!-- 睡眠統計 -->
            <div
                class="bq-rounded-16 bq-relative bq-flex bq-flex-col bq-items-center bq-overflow-hidden bq-border bq-border-gray-100 bq-bg-white bq-p-6 bq-shadow-sm"
            >
                <div
                    class="bq-absolute bq-left-4 bq-top-3 bq-text-sm bq-font-bold bq-text-gray-500"
                >
                    今日睡眠
                </div>
                <div
                    class="bq-relative bq-my-4 bq-flex bq-items-center bq-justify-center"
                    style="width: 140px; height: 140px"
                >
                    <!-- SVG 圓環進度條 -->
                    <svg class="bq-h-full bq-w-full -bq-rotate-90">
                        <circle
                            cx="70"
                            cy="70"
                            r="58"
                            stroke="#F3F4F6"
                            stroke-width="12"
                            fill="transparent"
                        />
                        <circle
                            cx="70"
                            cy="70"
                            r="58"
                            stroke="url(#sleepGradient)"
                            stroke-width="12"
                            fill="transparent"
                            :stroke-dasharray="364.4"
                            :stroke-dashoffset="
                                364.4 -
                                (364.4 * Math.min(sleepPercent, 100)) / 100
                            "
                            stroke-linecap="round"
                            class="bq-transition-all bq-duration-1000"
                        />
                        <defs>
                            <linearGradient
                                id="sleepGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stop-color="#818CF8" />
                                <stop offset="100%" stop-color="#C084FC" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div class="bq-absolute bq-text-center">
                        <div class="bq-text-xl bq-font-black bq-text-gray-800">
                            {{ todaySleepString }}
                        </div>
                        <div class="bq-text-xs bq-text-gray-400">
                            / {{ sleepTargetHours }} 小時
                        </div>
                    </div>
                </div>
                <div class="bq-text-center">
                    <div class="bq-text-sm bq-font-medium bq-text-gray-600">
                        已睡眠 {{ todaySleepCount }} 次
                    </div>
                    <div
                        class="bq-mt-1 bq-text-xs bq-font-semibold bq-text-indigo-500"
                    >
                        {{ sleepPercent }}% 已達成
                    </div>
                </div>
            </div>

            <!-- 快捷記錄與睡眠開關 -->
            <div
                class="bq-rounded-16 bq-flex bq-flex-col bq-justify-center bq-gap-4 bq-border bq-border-gray-100 bq-bg-white bq-p-6 bq-shadow-sm"
            >
                <button
                    class="action-card-btn bq-rounded-12 bq-flex bq-items-center bq-gap-4 bq-bg-gradient-to-r bq-from-orange-100 bq-to-pink-100 bq-p-4 bq-text-left bq-text-gray-800 bq-shadow-sm bq-transition hover:bq-from-orange-200 hover:bq-to-pink-200 hover:bq-shadow"
                    @click="openMilkDialog"
                >
                    <span
                        class="bq-flex bq-h-12 bq-w-12 bq-items-center bq-justify-center bq-rounded-full bq-bg-white bq-text-2xl bq-shadow-sm"
                        >🍼</span
                    >
                    <div>
                        <div class="bq-text-base bq-font-bold">
                            新增餵奶記錄
                        </div>
                        <div class="bq-text-xs bq-text-gray-500">
                            記錄配方奶、母乳或副食品
                        </div>
                    </div>
                </button>

                <button
                    v-if="!activeSleepStartTime"
                    class="action-card-btn bq-rounded-12 bq-flex bq-items-center bq-gap-4 bq-bg-gradient-to-r bq-from-indigo-100 bq-to-purple-100 bq-p-4 bq-text-left bq-text-gray-800 bq-shadow-sm bq-transition hover:bq-from-indigo-200 hover:bq-to-purple-200 hover:bq-shadow"
                    @click="startSleepTimer"
                >
                    <span
                        class="bq-flex bq-h-12 bq-w-12 bq-items-center bq-justify-center bq-rounded-full bq-bg-white bq-text-2xl bq-shadow-sm"
                        >💤</span
                    >
                    <div>
                        <div class="bq-text-base bq-font-bold">
                            寶寶開始睡覺
                        </div>
                        <div class="bq-text-xs bq-text-gray-500">
                            開啟實時睡眠計時器
                        </div>
                    </div>
                </button>

                <button
                    class="action-card-btn bq-rounded-12 bq-flex bq-items-center bq-gap-4 bq-bg-gradient-to-r bq-from-gray-100 bq-to-slate-100 bq-p-4 bq-text-left bq-text-gray-800 bq-shadow-sm bq-transition hover:bq-from-gray-200 hover:bq-to-slate-200 hover:bq-shadow"
                    @click="openSleepDialog"
                >
                    <span
                        class="bq-flex bq-h-12 bq-w-12 bq-items-center bq-justify-center bq-rounded-full bq-bg-white bq-text-2xl bq-shadow-sm"
                        >📝</span
                    >
                    <div>
                        <div class="bq-text-base bq-font-bold">
                            補記睡眠時間
                        </div>
                        <div class="bq-text-xs bq-text-gray-500">
                            手動輸入睡眠起訖時間
                        </div>
                    </div>
                </button>

                <button
                    class="action-card-btn bq-rounded-12 bq-flex bq-items-center bq-gap-4 bq-bg-gradient-to-r bq-from-teal-100 bq-to-emerald-100 bq-p-4 bq-text-left bq-text-gray-800 bq-shadow-sm bq-transition hover:bq-from-teal-200 hover:bq-to-emerald-200 hover:bq-shadow"
                    @click="openVoiceDialog"
                >
                    <span
                        class="bq-flex bq-h-12 bq-w-12 bq-items-center bq-justify-center bq-rounded-full bq-bg-white bq-text-2xl bq-shadow-sm"
                        >🎙️</span
                    >
                    <div>
                        <div class="bq-text-base bq-font-bold">
                            語音智慧記錄
                        </div>
                        <div class="bq-text-xs bq-text-gray-500">
                            說出「餵奶 120cc」或「睡了一小時」
                        </div>
                    </div>
                </button>
            </div>
        </div>

        <!-- 歷史清單區域 -->
        <div
            class="bq-rounded-16 bq-border bq-border-gray-100 bq-bg-white bq-p-6 bq-shadow-sm"
        >
            <div
                class="bq-mb-6 bq-flex bq-flex-col bq-items-start bq-justify-between bq-gap-4 sm:bq-flex-row sm:bq-items-center"
            >
                <h3 class="bq-text-lg bq-font-bold bq-text-gray-800">
                    作息歷史日誌
                </h3>

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
                        class="bq-rounded-8 bq-w-full bq-border bq-border-gray-200 bq-px-3 bq-py-1.5 bq-text-xs focus:bq-border-pink-300 focus:bq-outline-none sm:bq-w-40"
                    />
                </div>
            </div>

            <!-- 歷史日誌列表 -->
            <div
                v-if="filteredRecords.length === 0"
                class="bq-py-12 bq-text-center bq-text-gray-400"
            >
                <div class="bq-mb-2 bq-text-4xl">🍃</div>
                <div>沒有符合條件的作息記錄喔！</div>
            </div>

            <div v-else class="bq-flex bq-flex-col bq-gap-4">
                <div
                    v-for="record in filteredRecords"
                    :key="record.id"
                    class="record-card bq-rounded-12 bq-relative bq-flex bq-flex-col bq-items-start bq-justify-between bq-gap-4 bq-border bq-border-slate-100 bq-bg-slate-50 bq-p-4 bq-transition hover:bq-bg-slate-100/70 hover:bq-shadow-sm md:bq-flex-row md:bq-items-center"
                >
                    <div class="bq-flex bq-items-start bq-gap-4">
                        <!-- 類別 Icon -->
                        <span
                            class="bq-flex bq-h-12 bq-w-12 bq-items-center bq-justify-center bq-rounded-full bq-text-2xl bq-shadow-sm"
                            :class="
                                record.type === 'milk'
                                    ? 'bq-bg-orange-100'
                                    : 'bq-bg-indigo-100'
                            "
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
                                    class="bq-text-2xs bq-rounded-full bq-px-2 bq-py-0.5 bq-font-bold"
                                    :class="
                                        record.type === 'milk'
                                            ? 'bq-bg-orange-200 bq-text-orange-800'
                                            : 'bq-bg-indigo-200 bq-text-indigo-800'
                                    "
                                >
                                    {{
                                        record.type === 'milk' ? '餵奶' : '睡眠'
                                    }}
                                </span>
                            </div>
                            <div class="bq-mt-1 bq-text-xs bq-text-gray-500">
                                <span class="mdi mdi-clock-outline"></span>
                                {{ formatRecordTime(record) }}
                                <span
                                    v-if="record.duration"
                                    class="bq-ml-2 bq-font-semibold bq-text-indigo-600"
                                >
                                    ({{ formatDuration(record.duration) }})
                                </span>
                            </div>
                            <p
                                v-if="record.note"
                                class="bq-mt-2 bq-text-sm bq-italic bq-text-gray-600"
                            >
                                「{{ record.note }}」
                            </p>
                        </div>
                    </div>

                    <!-- 縮圖與操作按鈕 -->
                    <div
                        class="bq-flex bq-w-full bq-items-center bq-justify-between bq-gap-4 md:bq-w-auto md:bq-justify-end"
                    >
                        <!-- 相片縮圖 -->
                        <div
                            v-if="record.photo"
                            class="photo-thumbnail-container"
                        >
                            <img
                                :src="record.photo"
                                class="bq-rounded-8 bq-h-16 bq-w-16 bq-cursor-pointer bq-border bq-border-gray-200 bq-object-cover bq-transition hover:bq-scale-105"
                                alt="寶寶作息相片"
                                @click="viewFullPhoto(record.photo)"
                            />
                        </div>

                        <!-- 刪除按鈕 -->
                        <button
                            type="button"
                            class="bq-rounded-8 bq-px-3 bq-py-1.5 bq-text-xs bq-font-bold bq-text-red-500 bq-transition hover:bq-bg-red-50 hover:bq-text-red-700"
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
                <v-card-title
                    class="bq-flex bq-items-center bq-justify-between bq-bg-gradient-to-r bq-from-orange-100 bq-to-pink-100 bq-p-4"
                >
                    <span class="bq-font-bold bq-text-gray-800"
                        >🍼 記錄餵奶</span
                    >
                    <button
                        type="button"
                        class="bq-text-gray-500 hover:bq-text-gray-800"
                        @click="showMilkDialog = false"
                    >
                        ✕
                    </button>
                </v-card-title>
                <v-card-text class="bq-flex bq-flex-col bq-gap-4 bq-p-5">
                    <!-- 餵奶種類 -->
                    <div>
                        <label
                            class="bq-mb-2 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >喝奶種類</label
                        >
                        <div class="bq-rounded-8 bq-flex bq-bg-gray-100 bq-p-1">
                            <button
                                v-for="t in milkTypes"
                                :key="t.value"
                                type="button"
                                class="bq-rounded-6 bq-flex-1 bq-py-2 bq-text-xs bq-font-bold bq-transition"
                                :class="
                                    milkForm.type === t.value
                                        ? 'bq-bg-white bq-text-gray-800 bq-shadow-sm'
                                        : 'bq-text-gray-500'
                                "
                                @click="milkForm.type = t.value"
                            >
                                {{ t.label }}
                            </button>
                        </div>
                    </div>

                    <!-- 餵奶量 (配方奶/母乳瓶餵) -->
                    <div v-if="milkForm.type !== 'breast_direct'">
                        <label
                            class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >喝奶量 (ml)</label
                        >
                        <input
                            v-model="milkForm.amount"
                            type="number"
                            class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-pink-300 focus:bq-outline-none"
                            placeholder="請輸入毫升數"
                        />
                        <!-- 快速點擊按鈕 -->
                        <div class="bq-mt-2 bq-flex bq-flex-wrap bq-gap-2">
                            <button
                                v-for="amount in quickAmounts"
                                :key="amount"
                                type="button"
                                class="bq-rounded-6 bq-bg-orange-50 bq-px-3 bq-py-1.5 bq-text-xs bq-font-semibold bq-text-orange-700 bq-transition hover:bq-bg-orange-100"
                                @click="milkForm.amount = amount"
                            >
                                {{ amount }} ml
                            </button>
                        </div>
                    </div>

                    <!-- 親餵時間 (親餵時顯示) -->
                    <div v-else class="bq-grid bq-grid-cols-2 bq-gap-4">
                        <div>
                            <label
                                class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                                >左乳時間 (分鐘)</label
                            >
                            <input
                                v-model="milkForm.leftDuration"
                                type="number"
                                class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-pink-300 focus:bq-outline-none"
                                placeholder="分鐘"
                            />
                        </div>
                        <div>
                            <label
                                class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                                >右乳時間 (分鐘)</label
                            >
                            <input
                                v-model="milkForm.rightDuration"
                                type="number"
                                class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-pink-300 focus:bq-outline-none"
                                placeholder="分鐘"
                            />
                        </div>
                    </div>

                    <!-- 記錄時間 -->
                    <div>
                        <label
                            class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >記錄時間</label
                        >
                        <input
                            v-model="milkForm.time"
                            type="datetime-local"
                            class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-pink-300 focus:bq-outline-none"
                        />
                    </div>

                    <!-- 拍照記錄 -->
                    <div>
                        <label
                            class="bq-mb-2 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >拍照留念 (可選)</label
                        >
                        <CameraPicker v-model="milkForm.photo" />
                    </div>

                    <!-- 備註 -->
                    <div>
                        <label
                            class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >備註</label
                        >
                        <input
                            v-model="milkForm.note"
                            type="text"
                            class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-pink-300 focus:bq-outline-none"
                            placeholder="例如：喝奶狀況、吐奶、排便等狀況"
                        />
                    </div>
                </v-card-text>
                <v-card-actions
                    class="bq-flex bq-justify-end bq-gap-3 bq-bg-gray-50 bq-p-5"
                >
                    <button
                        type="button"
                        class="active:bq-scale-98 bq-rounded-10 bq-bg-gray-200 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-gray-700 bq-transition hover:bq-bg-gray-300"
                        @click="showMilkDialog = false"
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        class="active:bq-scale-98 bq-rounded-10 bq-bg-pink-500 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-white bq-shadow-sm bq-transition hover:bq-bg-pink-600"
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
                <v-card-title
                    class="bq-flex bq-items-center bq-justify-between bq-bg-gradient-to-r bq-from-indigo-100 bq-to-purple-100 bq-p-4"
                >
                    <span class="bq-font-bold bq-text-gray-800"
                        >💤 記錄睡眠</span
                    >
                    <button
                        type="button"
                        class="bq-text-gray-500 hover:bq-text-gray-800"
                        @click="showSleepDialog = false"
                    >
                        ✕
                    </button>
                </v-card-title>
                <v-card-text class="bq-flex bq-flex-col bq-gap-4 bq-p-5">
                    <!-- 入睡時間 -->
                    <div>
                        <label
                            class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >開始入睡時間</label
                        >
                        <input
                            v-model="sleepForm.startTime"
                            type="datetime-local"
                            class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-pink-300 focus:bq-outline-none"
                        />
                    </div>

                    <!-- 醒來時間 -->
                    <div>
                        <label
                            class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >醒來時間</label
                        >
                        <input
                            v-model="sleepForm.endTime"
                            type="datetime-local"
                            class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-pink-300 focus:bq-outline-none"
                        />
                    </div>

                    <!-- 拍照記錄 -->
                    <div>
                        <label
                            class="bq-mb-2 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >拍照留念 (可選)</label
                        >
                        <CameraPicker v-model="sleepForm.photo" />
                    </div>

                    <!-- 備註 -->
                    <div>
                        <label
                            class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >備註</label
                        >
                        <input
                            v-model="sleepForm.note"
                            type="text"
                            class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-pink-300 focus:bq-outline-none"
                            placeholder="例如：睡得很安穩、驚醒哭鬧、打呼等"
                        />
                    </div>
                </v-card-text>
                <v-card-actions
                    class="bq-flex bq-justify-end bq-gap-3 bq-bg-gray-50 bq-p-5"
                >
                    <button
                        type="button"
                        class="active:bq-scale-98 bq-rounded-10 bq-bg-gray-200 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-gray-700 bq-transition hover:bq-bg-gray-300"
                        @click="showSleepDialog = false"
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        class="active:bq-scale-98 bq-rounded-10 bq-bg-pink-500 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-white bq-shadow-sm bq-transition hover:bq-bg-pink-600"
                        @click="saveSleepRecord"
                    >
                        儲存記錄
                    </button>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 語音智慧記錄 Dialog -->
        <VoiceRecordDialog
            v-model="showVoiceDialog"
            @save-record="handleVoiceSaveRecord"
        />

        <!-- 3. 查看大圖 Dialog -->
        <v-dialog v-model="showPhotoDialog" max-width="700px">
            <v-card class="bq-rounded-16 bq-overflow-hidden">
                <div
                    class="bq-relative bq-flex bq-items-center bq-justify-center bq-bg-black"
                    style="min-height: 300px"
                >
                    <img
                        :src="photoViewUrl"
                        class="bq-max-h-80vh bq-h-auto bq-w-full bq-object-contain"
                        alt="寶寶大圖"
                    />
                    <button
                        type="button"
                        class="bq-absolute bq-right-3 bq-top-3 bq-flex bq-h-10 bq-w-10 bq-items-center bq-justify-center bq-rounded-full bq-bg-black/60 bq-text-white bq-transition hover:bq-bg-black/80"
                        @click="showPhotoDialog = false"
                    >
                        ✕
                    </button>
                </div>
            </v-card>
        </v-dialog>

        <!-- 4. 快速更新體重 Dialog -->
        <v-dialog v-model="showQuickWeightDialog" max-width="500px">
            <v-card class="bq-rounded-16 bq-overflow-hidden">
                <v-card-title
                    class="bq-flex bq-items-center bq-justify-between bq-bg-gradient-to-r bq-from-amber-100 bq-to-orange-100 bq-p-4"
                >
                    <span class="bq-font-bold bq-text-gray-800"
                        >⚖️ 快速更新寶寶體重</span
                    >
                    <button
                        type="button"
                        class="bq-text-gray-500 hover:bq-text-gray-800"
                        @click="showQuickWeightDialog = false"
                    >
                        ✕
                    </button>
                </v-card-title>

                <v-card-text class="bq-flex bq-flex-col bq-gap-4 bq-p-5">
                    <!-- Weight Input -->
                    <div>
                        <label
                            class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >寶寶目前體重 (kg)</label
                        >
                        <input
                            v-model="quickWeightForm.weight"
                            type="number"
                            step="0.01"
                            placeholder="例如：6.2"
                            class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-orange-300 focus:bq-outline-none"
                        />
                    </div>

                    <!-- Calculator Helper -->
                    <div
                        class="bq-rounded-10 bq-border bq-border-dashed bq-border-orange-200 bq-bg-orange-50/20 bq-p-3"
                    >
                        <button
                            type="button"
                            class="bq-flex bq-items-center bq-gap-1 bq-text-xs bq-font-semibold bq-text-orange-600 hover:bq-text-orange-800"
                            @click="
                                quickWeightForm.enableCalc =
                                    !quickWeightForm.enableCalc
                            "
                        >
                            <span
                                >💡
                                沒有嬰兒專用秤？使用「大人抱著秤」換算助手</span
                            >
                            <span>{{
                                quickWeightForm.enableCalc ? '▼' : '▶'
                            }}</span>
                        </button>

                        <div
                            v-show="quickWeightForm.enableCalc"
                            class="bq-mt-3 bq-flex bq-flex-col bq-gap-2"
                        >
                            <div class="bq-grid bq-grid-cols-2 bq-gap-3">
                                <div>
                                    <label
                                        class="bq-text-2xs bq-mb-1 bq-block bq-text-gray-500"
                                        >1. 大人抱寶寶重 (kg)</label
                                    >
                                    <input
                                        v-model="
                                            quickWeightForm.calcAdultAndBaby
                                        "
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
                                        v-model="quickWeightForm.calcAdultOnly"
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
                                        class="bq-font-bold bq-text-orange-600"
                                        >{{ calculatedWeight }} kg</span
                                    ></span
                                >
                                <button
                                    type="button"
                                    class="active:bq-scale-98 bq-rounded-6 bq-bg-orange-500 bq-px-3 bq-py-1 bq-text-xs bq-font-bold bq-text-white bq-transition hover:bq-bg-orange-600"
                                    :disabled="calculatedWeight <= 0"
                                    @click="applyCalculatedWeight"
                                >
                                    帶入寶寶體重
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Note -->
                    <div>
                        <label
                            class="bq-mb-1 bq-block bq-text-sm bq-font-bold bq-text-gray-600"
                            >備註 (可選)</label
                        >
                        <textarea
                            v-model="quickWeightForm.note"
                            placeholder="例如：打疫苗量體重、吃飽後秤..."
                            rows="2"
                            class="bq-rounded-10 bq-w-full bq-border bq-border-gray-200 bq-px-4 bq-py-2.5 bq-text-sm bq-transition focus:bq-border-orange-300 focus:bq-outline-none"
                        ></textarea>
                    </div>
                </v-card-text>

                <v-card-actions
                    class="bq-flex bq-justify-end bq-gap-3 bq-bg-gray-50 bq-p-5"
                >
                    <button
                        type="button"
                        class="active:bq-scale-98 bq-rounded-10 bq-bg-gray-200 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-gray-700 bq-transition hover:bq-bg-gray-300"
                        @click="showQuickWeightDialog = false"
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        class="active:bq-scale-98 bq-rounded-10 bq-bg-orange-500 bq-px-5 bq-py-2.5 bq-text-sm bq-font-bold bq-text-white bq-shadow-sm bq-transition hover:bq-bg-orange-600"
                        @click="saveQuickWeight"
                    >
                        儲存體重
                    </button>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 5. 體重更新成功 & 建議奶量反饋 Dialog -->
        <v-dialog v-model="showSuccessFeedback" max-width="500px">
            <v-card class="bq-rounded-16 bq-overflow-hidden">
                <v-card-title
                    class="bq-flex bq-items-center bq-justify-between bq-bg-gradient-to-r bq-from-emerald-500 bq-to-teal-600 bq-p-4 bq-text-white"
                >
                    <span class="bq-font-bold"
                        >✨ 更新成功，奶量公式已自動升級！</span
                    >
                    <button
                        type="button"
                        class="bq-text-white/80 hover:bq-text-white"
                        @click="showSuccessFeedback = false"
                    >
                        ✕
                    </button>
                </v-card-title>

                <v-card-text class="bq-p-6 bq-text-center">
                    <div class="bq-mb-4 bq-text-5xl">🍼📈</div>
                    <p
                        class="bq-mb-2 bq-text-base bq-font-medium bq-leading-relaxed bq-text-gray-800"
                    >
                        {{ feedbackMsg }}
                    </p>
                    <p
                        class="bq-text-xs bq-text-gray-400"
                        style="font-size: 0.75rem"
                    >
                        (依小兒科醫生建議「每日總奶量 = 體重 × 150 ml」公式換算)
                    </p>
                </v-card-text>

                <v-card-actions
                    class="bq-flex bq-justify-center bq-bg-gray-50 bq-p-4"
                >
                    <button
                        type="button"
                        class="active:bq-scale-98 bq-rounded-10 bq-bg-emerald-500 bq-px-8 bq-py-2.5 bq-text-sm bq-font-bold bq-text-white bq-shadow-sm bq-transition hover:bq-bg-emerald-600"
                        @click="showSuccessFeedback = false"
                    >
                        太棒了！
                    </button>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </layout-item>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import LayoutItem from '@/components/layout/LayoutItem.vue';
import CameraPicker from '@/components/CameraPicker.vue';
import VoiceRecordDialog from '@/components/VoiceRecordDialog.vue';
import { saveRecord, getRecords, deleteRecord } from '@/helpers/db.js';
import { syncWithSupabase, subscribeToRealtime } from '@/helpers/sync.js';

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

        // 從資料庫載入寶寶基本設定並更新
        const settingsRecord = records.value.find(
            (r) => r.id === 'baby_settings'
        );
        if (settingsRecord && settingsRecord.note) {
            try {
                const settings = JSON.parse(settingsRecord.note);
                if (settings.birthday) {
                    babySettings.birthday = settings.birthday;
                    localStorage.setItem('baby_birthday', settings.birthday);
                }
                if (settings.fatigueTolerance) {
                    babySettings.fatigueTolerance = settings.fatigueTolerance;
                    localStorage.setItem(
                        'baby_fatigue_tolerance',
                        settings.fatigueTolerance
                    );
                }
            } catch (e) {
                console.error('解析寶寶設定失敗:', e);
            }
        }
    } catch (e) {
        console.error('無法載入作息記錄:', e);
    }
};

let realtimeChannel = null;

let wakeTickInterval = null;

onMounted(async () => {
    // 1. Load local records first for instant display
    await loadRecords();
    checkActiveSleepTimer();

    // 啟動清醒計時滴答
    nowTimestamp.value = Date.now();
    wakeTickInterval = setInterval(() => {
        nowTimestamp.value = Date.now();
    }, 1000);

    // 2. Perform background sync with Supabase and reload records
    try {
        await syncWithSupabase();
        await loadRecords();
    } catch (e) {
        console.error('Background sync failed:', e);
    }

    // 3. Subscribe to realtime updates for multi-user sync
    realtimeChannel = subscribeToRealtime(async () => {
        await syncWithSupabase();
        await loadRecords();
    });
});

// ─── 今日統計計算 ───
// 獲取最新體重
const latestWeight = computed(() => {
    const weightRecords = records.value.filter((r) => r.type === 'weight');
    if (weightRecords.length > 0) {
        return Number(weightRecords[0].amount);
    }
    return null;
});

// 動態目標奶量 (最新體重 * 150 ml，若無記錄則預設 750 ml)
const milkTarget = computed(() => {
    if (latestWeight.value) {
        return Math.round(latestWeight.value * 150);
    }
    return 750;
});

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
    return Math.round((todayMilkTotal.value / milkTarget.value) * 100) || 0;
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
    } else {
        // 首頁日誌的 'all' 指的是餵奶與睡眠記錄，不包含體重記錄
        list = list.filter((r) => r.type === 'milk' || r.type === 'sleep');
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
    if (wakeTickInterval) clearInterval(wakeTickInterval);
    if (realtimeChannel) {
        realtimeChannel.unsubscribe();
    }
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
        leftDuration:
            milkForm.type === 'breast_direct'
                ? Number(milkForm.leftDuration)
                : 0,
        rightDuration:
            milkForm.type === 'breast_direct'
                ? Number(milkForm.rightDuration)
                : 0,
        timestamp,
        photo: milkForm.photo,
        note: milkForm.note
    };

    try {
        await saveRecord(record);
        await loadRecords();
        showMilkDialog.value = false;
        // Trigger background sync with Supabase
        syncWithSupabase().then(() => loadRecords());
    } catch {
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
        // Trigger background sync with Supabase
        syncWithSupabase().then(() => loadRecords());
    } catch {
        alert('儲存失敗，請重試');
    }
};

// ─── 語音智慧記錄處理 ───
const showVoiceDialog = ref(false);
const openVoiceDialog = () => {
    showVoiceDialog.value = true;
};

const handleVoiceSaveRecord = async (parsedResult) => {
    if (!parsedResult) return;

    let record = null;
    if (parsedResult.type === 'milk') {
        const timestamp = Date.now();
        record = {
            id: `milk-${Date.now()}`,
            type: 'milk',
            milkType: parsedResult.milkType,
            amount:
                parsedResult.milkType === 'breast_direct'
                    ? 0
                    : Number(parsedResult.amount),
            leftDuration:
                parsedResult.milkType === 'breast_direct'
                    ? Number(parsedResult.leftDuration)
                    : 0,
            rightDuration:
                parsedResult.milkType === 'breast_direct'
                    ? Number(parsedResult.rightDuration)
                    : 0,
            timestamp,
            photo: '',
            note: parsedResult.note
        };
    } else if (parsedResult.type === 'sleep') {
        const end = Date.now();
        const start = end - parsedResult.duration * 60 * 1000;
        record = {
            id: `sleep-${Date.now()}`,
            type: 'sleep',
            timestamp: start,
            endTime: end,
            duration: parsedResult.duration,
            photo: '',
            note: parsedResult.note
        };
    }

    if (record) {
        try {
            await saveRecord(record);
            await loadRecords();
            if (record.type === 'sleep') {
                stopSleepTimer();
            }
            syncWithSupabase().then(() => loadRecords());
        } catch {
            alert('語音記錄儲存失敗，請重試');
        }
    }
};

// ─── 刪除記錄 ───
const confirmDeleteRecord = async (id) => {
    if (confirm('確定要刪除這筆作息記錄嗎？刪除後將無法還原喔！')) {
        try {
            await deleteRecord(id);
            await loadRecords();
            // Trigger background sync with Supabase
            syncWithSupabase().then(() => loadRecords());
        } catch {
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

// ─── 智慧清醒追蹤與寶寶設定邏輯 ───
const nowTimestamp = ref(Date.now());
const showSettingsDialog = ref(false);

const babySettings = reactive({
    birthday: localStorage.getItem('baby_birthday') || '',
    fatigueTolerance: localStorage.getItem('baby_fatigue_tolerance') || 'normal'
});

const fatigueToleranceOptions = [
    {
        value: 'sensitive',
        label: '容易累 (建議提前 15 分鐘睡)',
        description: '適合清醒後容易鬧脾氣、哭鬧的寶寶'
    },
    { value: 'normal', label: '標準', description: '依照月齡標準推薦清醒時間' },
    {
        value: 'tolerant',
        label: '耐累 (建議延後 15 分鐘睡)',
        description: '適合體力較佳、可清醒較久的寶寶'
    }
];

const fatigueToleranceText = computed(() => {
    const opt = fatigueToleranceOptions.find(
        (o) => o.value === babySettings.fatigueTolerance
    );
    return opt ? opt.label : '標準';
});

const saveBabySettings = async () => {
    localStorage.setItem('baby_birthday', babySettings.birthday);
    localStorage.setItem(
        'baby_fatigue_tolerance',
        babySettings.fatigueTolerance
    );

    // 同步儲存至資料庫的 records 資料表（id 為 'baby_settings', type 為 'setting'）
    try {
        const settingsPayload = {
            id: 'baby_settings',
            type: 'setting',
            timestamp: Date.now(),
            note: JSON.stringify({
                birthday: babySettings.birthday,
                fatigueTolerance: babySettings.fatigueTolerance
            }),
            updatedAt: Date.now(),
            synced: false
        };
        await saveRecord(settingsPayload);

        // 觸發背景同步並重新整理載入
        syncWithSupabase().then(() => loadRecords());
    } catch (e) {
        console.error('儲存設定至資料庫失敗:', e);
    }

    showSettingsDialog.value = false;
};

// 每週體重更新提醒邏輯與快速對話框
const showQuickWeightDialog = ref(false);
const showSuccessFeedback = ref(false);
const feedbackMsg = ref('');

const quickWeightForm = reactive({
    weight: '',
    note: '',
    enableCalc: false,
    calcAdultAndBaby: '',
    calcAdultOnly: ''
});

const lastWeightRecord = computed(() => {
    const weightRecords = records.value.filter((r) => r.type === 'weight');
    return weightRecords.length > 0 ? weightRecords[0] : null;
});

const daysSinceLastWeight = computed(() => {
    if (!lastWeightRecord.value) return 999;
    const diffMs = nowTimestamp.value - lastWeightRecord.value.timestamp;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

const showWeeklyWeightReminder = computed(() => {
    return daysSinceLastWeight.value >= 7;
});

const calculatedWeight = computed(() => {
    const bab = Number(quickWeightForm.calcAdultAndBaby);
    const ad = Number(quickWeightForm.calcAdultOnly);
    if (bab && ad && bab > ad) {
        return Number((bab - ad).toFixed(2));
    }
    return 0;
});

const applyCalculatedWeight = () => {
    if (calculatedWeight.value > 0) {
        quickWeightForm.weight = calculatedWeight.value;
    }
};

const openQuickWeightDialog = () => {
    quickWeightForm.weight = '';
    quickWeightForm.note = '';
    quickWeightForm.enableCalc = false;
    quickWeightForm.calcAdultAndBaby = '';
    quickWeightForm.calcAdultOnly = '';
    showQuickWeightDialog.value = true;
};

const saveQuickWeight = async () => {
    const weightVal = Number(quickWeightForm.weight);
    if (!weightVal || weightVal <= 0) {
        alert('請輸入有效的寶寶體重！');
        return;
    }

    const record = {
        id: `weight-${Date.now()}`,
        type: 'weight',
        amount: weightVal,
        timestamp: Date.now(),
        note: quickWeightForm.note || null
    };

    try {
        await saveRecord(record);
        await loadRecords();
        showQuickWeightDialog.value = false;

        // Calculate milk target change for feedback
        const newTarget = Math.round(weightVal * 150);
        const singleMeal = Math.round(newTarget / 6);

        feedbackMsg.value = `體重已更新為 ${weightVal} kg！系統已自動為您將每日建議總奶量調整為 ${newTarget} ml（若每日餵 6 餐，單餐建議約 ${singleMeal} ml）。`;
        showSuccessFeedback.value = true;

        // Trigger background sync
        syncWithSupabase().then(() => loadRecords());
    } catch {
        alert('儲存失敗，請重試');
    }
};

// 計算寶寶年齡 (天數)
const babyAgeDays = computed(() => {
    if (!babySettings.birthday) return null;
    const birth = new Date(babySettings.birthday);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    birth.setHours(0, 0, 0, 0);
    const diffTime = today - birth;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
});

// 根據月齡推算預設建議清醒時間 (分鐘)
const defaultWakeWindow = computed(() => {
    const days = babyAgeDays.value;
    if (days === null) {
        // 若未設定生日，預設帶入 3 個月大的引導值 (60～90分鐘)
        return { min: 60, max: 90 };
    }
    if (days <= 30) return { min: 45, max: 60 }; // 0-1 個月
    if (days <= 90) return { min: 60, max: 90 }; // 1-3 個月
    if (days <= 180) return { min: 90, max: 120 }; // 3-6 個月
    if (days <= 270) return { min: 120, max: 150 }; // 6-9 個月
    if (days <= 365) return { min: 150, max: 180 }; // 9-12 個月
    return { min: 180, max: 240 }; // 1歲以上
});

// 家長自訂耐累度微調量 (分鐘)
const fatigueToleranceOffset = computed(() => {
    if (babySettings.fatigueTolerance === 'sensitive') return -15;
    if (babySettings.fatigueTolerance === 'tolerant') return 15;
    return 0;
});

// 最新的一筆已結束睡眠記錄
const lastCompletedSleep = computed(() => {
    const sleepRecords = records.value.filter(
        (r) => r.type === 'sleep' && r.endTime
    );
    return sleepRecords.length > 0 ? sleepRecords[0] : null;
});

// 計算已清醒時長 (分鐘)
const wakeDurationMinutes = computed(() => {
    if (!lastCompletedSleep.value) return 0;
    const wokeUpAt = Number(lastCompletedSleep.value.endTime);
    const diffMs = nowTimestamp.value - wokeUpAt;
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
});

// 格式化已清醒時長字串
const wakeDurationString = computed(() => {
    const totalMins = wakeDurationMinutes.value;
    if (totalMins < 60) return `${totalMins} 分鐘`;
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs} 小時 ${mins} 分鐘`;
});

// 計算智慧睡眠建議 (下一次建議小睡的區間與剩餘時間)
const wakeSuggestion = computed(() => {
    if (!lastCompletedSleep.value) return null;
    const wokeUpAt = Number(lastCompletedSleep.value.endTime);

    // 計算考慮了耐累程度後的最終建議清醒區間 (分鐘)
    const offset = fatigueToleranceOffset.value;
    const windowMin = defaultWakeWindow.value.min + offset;
    const windowMax = defaultWakeWindow.value.max + offset;

    const suggestStartTimestamp = wokeUpAt + windowMin * 60 * 1000;
    const suggestEndTimestamp = wokeUpAt + windowMax * 60 * 1000;

    const minutesRemaining = Math.floor(
        (suggestStartTimestamp - nowTimestamp.value) / (60 * 1000)
    );

    const formatTime = (ts) => {
        const d = new Date(ts);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    return {
        suggestedRange: `${formatTime(suggestStartTimestamp)} ~ ${formatTime(suggestEndTimestamp)}`,
        minutesRemaining
    };
});

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
