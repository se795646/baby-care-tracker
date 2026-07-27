<template>
    <header class="bq-bg-white bq-border-b bq-border-gray-100 bq-py-4 bq-px-6 bq-shadow-sm bq-sticky bq-top-0 bq-z-50">
        <div class="bq-max-w-7xl bq-mx-auto bq-flex bq-justify-between bq-items-center">
            <!-- Logo & Brand -->
            <div class="bq-flex bq-items-center bq-gap-3">
                <div class="bq-bg-gradient-to-tr bq-from-orange-400 bq-to-pink-500 bq-w-10 bq-h-10 bq-rounded-12 bq-flex bq-items-center bq-justify-center bq-text-xl bq-shadow-md bq-text-white">
                    🍼
                </div>
                <div>
                    <span class="bq-text-lg bq-font-bold bq-bg-gradient-to-r bq-from-gray-800 bq-to-gray-600 bq-bg-clip-text bq-text-transparent">
                        寶寶作息記錄儀
                    </span>
                </div>
            </div>

            <!-- Navigation (如果你之後想新增其他頁面) -->
            <nav class="bq-hidden md:bq-flex bq-items-center bq-gap-1">
                <a
                    v-for="item in navItems"
                    :key="item.id"
                    href="#"
                    class="bq-px-4 bq-py-2 bq-rounded-8 bq-text-sm bq-font-bold bq-transition"
                    :class="activeNavItemId === item.id 
                        ? 'bq-bg-pink-50 bq-text-pink-600' 
                        : 'bq-text-gray-500 hover:bq-bg-gray-50 hover:bq-text-gray-800'"
                    @click.prevent="$emit('click-nav-item', item)"
                >
                    {{ item.title }}
                </a>
            </nav>

        </div>
    </header>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    userName: {
        type: String,
        default: ''
    },
    userEmail: {
        type: String,
        default: ''
    },
    navList: {
        type: Array,
        default: () => []
    },
    activeNavItemId: {
        type: Number,
        default: 1
    }
});

defineEmits(['on-logout', 'click-nav-item']);

const navItems = computed(() => {
    if (props.navList && props.navList[0] && props.navList[0].items) {
        return props.navList[0].items;
    }
    return [{ id: 1, title: '作息概覽與記錄' }];
});
</script>

<style scoped>
.bq-text-3xs {
    font-size: 0.65rem;
}
</style>
