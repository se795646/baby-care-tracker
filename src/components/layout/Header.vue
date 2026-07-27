<template>
    <header
        class="bq-sticky bq-top-0 bq-z-50 bq-border-b bq-border-gray-100 bq-bg-white bq-px-6 bq-py-4 bq-shadow-sm"
    >
        <div
            class="bq-mx-auto bq-flex bq-max-w-7xl bq-items-center bq-justify-between"
        >
            <!-- Logo & Brand -->
            <div class="bq-flex bq-items-center bq-gap-3">
                <div
                    class="bq-rounded-12 bq-flex bq-h-10 bq-w-10 bq-items-center bq-justify-center bq-bg-gradient-to-tr bq-from-orange-400 bq-to-pink-500 bq-text-xl bq-text-white bq-shadow-md"
                >
                    🍼
                </div>
                <div>
                    <span
                        class="bq-bg-gradient-to-r bq-from-gray-800 bq-to-gray-600 bq-bg-clip-text bq-text-lg bq-font-bold bq-text-transparent"
                    >
                        寶寶作息記錄儀
                    </span>
                </div>
            </div>

            <!-- Navigation (如果你之後想新增其他頁面) -->
            <nav class="bq-hidden bq-items-center bq-gap-1 md:bq-flex">
                <a
                    v-for="item in navItems"
                    :key="item.id"
                    href="#"
                    class="bq-rounded-8 bq-px-4 bq-py-2 bq-text-sm bq-font-bold bq-transition"
                    :class="
                        activeNavItemId === item.id
                            ? 'bq-bg-pink-50 bq-text-pink-600'
                            : 'bq-text-gray-500 hover:bq-bg-gray-50 hover:bq-text-gray-800'
                    "
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
