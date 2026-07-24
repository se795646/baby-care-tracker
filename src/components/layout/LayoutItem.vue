<template>
    <div class="layout-item bq-p-6">
        <slot />
    </div>
</template>

<script>
export default {
    name: 'LayoutItem',
    expose: []
};
</script>

<style scoped>
.layout-item {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}
</style>
