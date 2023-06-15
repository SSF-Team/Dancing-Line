<template>
    <SandStorm></SandStorm>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SandStorm from './levels/sand-storm.vue'

export default defineComponent({
    name: 'App',
    components: { SandStorm }
});
</script>