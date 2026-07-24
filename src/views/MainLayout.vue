<template>
    <div class="main-layout">
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
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import AppHeader from '@/components/layout/Header.vue';
import { getNavList, NAV_ROUTE_MAP, DEFAULT_NAV_ID } from '@/configs/navigation';

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
