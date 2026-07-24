import { useRouter } from 'vue-router';
import Routes from '@/configs/routes';

export default function useCustomRoute() {
    const router = useRouter();

    function switchToRoute(routeName, params = {}) {
        router.push({ name: routeName, params });
    }

    function redirectToErrorPage() {
        router.push({ name: Routes.NO_PERMISSION.NAME });
    }

    return { switchToRoute, redirectToErrorPage };
}
