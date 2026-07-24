<template>
    <div class="bq-flex bq-h-screen bq-items-center bq-justify-center">
        <q-page-error-status
            title="No Permission"
            description="You do not have permission to access this page."
        />
    </div>
</template>

<script>
import { QPageErrorStatus } from '@benqcloud/qtify';

export default {
    name: 'NoPermissionPage',
    expose: [],
    components: { QPageErrorStatus }
};
</script>
