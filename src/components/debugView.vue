<template>
    <div class="debug">
        <div>
            <li>Scene</li>
            <li>渲染帧率: {{ debug.fps }}</li>
            <li>帧间耗时: {{ Math.floor(debug.spt * 1000) }} ms</li>
            <li>渲染时长: {{ Math.floor(debug.showTime * 100) / 100 }} s</li>
        </div>
        <div v-if="debug.playTime">
            <li>Game</li>
            <li>游戏时长: {{ Math.floor(debug.playTime * 100) / 100 }} s</li>
        </div>
        <div v-if="debug.audioTime">
            <li>Audio</li>
            <li>播放时间: {{ Math.floor(debug.audioTime * 100) / 100 }} s</li>
            <li>播放进度: {{ Math.floor(game.percent * 100) / 100 }} %</li>
            <li :class="getSoundColor((debug.cAudioDelay ?? 0) * 1000)">
                矫正延迟: {{ Math.floor((debug.cAudioDelay ?? 0) * 1000 * 100) / 100 }} ms</li>
            <li :class="getSoundColor((debug.audioDelay ?? 0) * 1000)">
                原始延迟: {{ Math.floor((debug.audioDelay ?? 0) * 1000 * 100) / 100 }} ms</li>
        </div>
        <div v-if="debug.clickTimes">
            <li>Player</li>
            <li>点击次数: {{ debug.clickTimes }} - {{ Math.floor(debug.clickTimes / (debug.playTime ?? 1))}} cps</li>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { runTime } from '@/functions/app'

export default defineComponent({
    name: 'DebugView',
    data() {
        return {
            debug: runTime.debug,
            game: runTime.game
        }
    },
    methods: {
        getSoundColor(time: number) {
            if(time) {
                if(time > 50 || time < -50) {
                    return 'text-warning'
                } else if(time > 100 || time < -100) {
                    return 'text-danger'
                }
            }
        }
    }
})
</script>

<style scoped>
.text-danger {
    color: #f00;
}
.text-warning {
    color: #ff0;
}

.debug {
    position: absolute;
    z-index: 1;
}
.debug > div {
    background: #00000036;
    border-radius: 7px;
    padding: 5px 10px;
    color: #fff;
    font-size: 0.6rem;
    margin: 5px;
    font-family: 'Fira Code', 'Courier New', Courier, monospace;
}
.debug li {
    list-style: none;
}
</style>