<template>
    <div class="bq-flex bq-h-screen bq-items-center bq-justify-center">
        <div class="bq-text-center">
            <h1 class="bq-mb-2 bq-text-2xl bq-font-medium">
                {{ $t('auth.tokenExpired') }}
            </h1>
            <q-btn
                :text="$t('auth.login')"
                btnType="primary"
                size="m"
                @on-click="goToLogin"
            />
        </div>
    </div>
</template>

<script>
import { QBtn } from '@benqcloud/qtify';

export default {
    name: 'TokenExpired',
    expose: [],
    components: { QBtn },
    methods: {
        goToLogin() {
            // TODO: Redirect to your login service
            window.location.href = '/login';
        }
    }
};
</script>
