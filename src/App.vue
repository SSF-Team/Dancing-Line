<template>
    <DebugView></DebugView>
    <div>
        <SandStorm></SandStorm>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SandStorm from './levels/sand-storm.vue'
import DebugView from './components/debugView.vue'

export default defineComponent({
    name: 'App',
    components: { SandStorm, DebugView }
});
</script>