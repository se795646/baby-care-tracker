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
            // Determine active language (Default to 'zh-TW', use 'en' only if locale is explicitly 'en')
            const activeLang = this.$i18n?.locale === 'en' ? 'en' : 'zh-TW';
            // Force the login service to render in Chinese/English by appending common locale query parameters
            window.location.href = `/login?lang=${activeLang}&locale=${activeLang}&ui_locales=${activeLang}`;
        }
    }
};
</script>
