import Routes from '@/configs/routes';
import emitter from '@/helpers/emitter';
import createAppRouter from '@/foundation/router/createAppRouter';

const routes = [
    {
        path: Routes.HOME.PATH,
        name: Routes.HOME.NAME,
        component: () => import('@/views/MainLayout.vue'),
        children: [
            {
                path: '',
                redirect: { name: Routes.DASHBOARD.OVERVIEW.NAME }
            },
            {
                path: Routes.DASHBOARD.OVERVIEW.PATH,
                name: Routes.DASHBOARD.OVERVIEW.NAME,
                component: () => import('@/views/Dashboard/Overview.vue')
            },
            {
                path: Routes.DASHBOARD.GROWTH.PATH,
                name: Routes.DASHBOARD.GROWTH.NAME,
                component: () => import('@/views/Dashboard/Growth.vue')
            },
            {
                path: Routes.DASHBOARD.HISTORY.PATH,
                name: Routes.DASHBOARD.HISTORY.NAME,
                component: () => import('@/views/Dashboard/History.vue')
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: { name: Routes.HOME.NAME }
    }
];

const router = createAppRouter({
    routes,
    emitter,
    auth: {
        enabled: false,
        ignoreRouteNames: [],
        getAccessToken: () => null,
        onMissingToken: { name: Routes.HOME.NAME }
    }
});

export default router;
