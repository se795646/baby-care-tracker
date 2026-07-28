<template>
    <div class="main-layout bq-pb-16 md:bq-pb-0">
        <app-header
            :userName="userName"
            :userEmail="userEmail"
            :navList="navList"
            :activeNavItemId="activeNavItemId"
            @on-logout="handleLogout"
            @click-nav-item="handleNavClick"
        />
        <v-main class="main-content">
            <router-view />
        </v-main>

        <!-- 行動端底部導覽列 (Bottom Navigation Bar) -->
        <div
            class="bq-pb-safe bq-fixed bq-bottom-0 bq-left-0 bq-right-0 bq-z-40 bq-flex bq-h-16 bq-border-t bq-border-gray-100 bq-bg-white/95 bq-px-4 bq-shadow-[0_-4px_12px_rgba(0,0,0,0.03)] bq-backdrop-blur-md md:bq-hidden"
        >
            <button
                v-for="item in mobileNavItems"
                :key="item.id"
                type="button"
                class="bq-flex bq-flex-1 bq-flex-col bq-items-center bq-justify-center bq-gap-1 bq-py-1 bq-transition-all bq-duration-200"
                :class="
                    activeNavItemId === item.id
                        ? 'bq-scale-105 bq-text-pink-500'
                        : 'bq-text-gray-400 hover:bq-text-gray-600'
                "
                @click="handleMobileNavClick(item)"
            >
                <span
                    class="bq-text-xl bq-transition-transform"
                    :class="
                        activeNavItemId === item.id
                            ? 'bq-translate-y-[-2px]'
                            : ''
                    "
                >
                    {{ item.icon }}
                </span>
                <span class="bq-text-[10px] bq-font-bold">
                    {{ item.title }}
                </span>
            </button>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import AppHeader from '@/components/layout/Header.vue';
import {
    getNavList,
    NAV_ROUTE_MAP,
    DEFAULT_NAV_ID
} from '@/configs/navigation';

export default {
    name: 'MainLayout',
    expose: [],
    components: { AppHeader },
    data() {
        return {
            activeNavItemId: DEFAULT_NAV_ID
        };
    },
    computed: {
        ...mapGetters('personal', ['member', 'isInfoReady']),
        navList() {
            return getNavList(this.$t.bind(this));
        },
        mobileNavItems() {
            return [
                { id: 1, title: '作息概覽', icon: '🍼' },
                { id: 2, title: '成長曲線', icon: '📈' }
            ];
        },
        userName() {
            return this.member?.name || '';
        },
        userEmail() {
            return this.member?.email || '';
        }
    },
    watch: {
        '$route.name': {
            handler(routeName) {
                const entry = Object.entries(NAV_ROUTE_MAP).find(
                    ([, name]) => name === routeName
                );
                if (entry) {
                    this.activeNavItemId = Number(entry[0]);
                }
            },
            immediate: true
        }
    },
    created() {
        this.getMyInfoByApi();
    },
    methods: {
        ...mapActions('personal', ['getMyInfoByApi', 'logout']),
        handleNavClick(navItem) {
            const routeName = NAV_ROUTE_MAP[navItem.id];
            if (routeName && this.$route.name !== routeName) {
                this.$router.push({ name: routeName });
            }
        },
        handleMobileNavClick(item) {
            const routeName = NAV_ROUTE_MAP[item.id];
            if (routeName && this.$route.name !== routeName) {
                this.$router.push({ name: routeName });
            }
        },
        handleLogout() {
            this.logout();
            this.$router.push({ name: 'TokenExpired' });
        }
    }
};
</script>

<style scoped>
.main-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-content {
    flex: 1;
    background-color: #f9f9f9;
}
</style>
