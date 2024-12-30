<template>
    <div class="debug">
        <div>
            <li>{{ debug.screenName }}</li>
            <li>渲染帧率: {{ debug.fps }}</li>
            <li>帧间耗时: {{ Math.floor(debug.spt * 1000) }} ms</li>
            <li>渲染时长: {{ Math.floor(debug.showTime * 100) / 100 }} s</li>
        </div>
        <div v-if="debug.playTime">
            <li>Game</li>
            <li>游戏时长: {{ Math.floor(debug.playTime * 100) / 100 }} s</li>
        </div>
        <div v-if="debug.audioLoadState !== 'none'">
            <li>Audio</li>
            <li>音频状态: <span :class="getAudioStatColor()">{{ debug.audioTime ? 'playing' : debug.audioLoadState }}</span></li>
            <template v-if="debug.audioTime">
                <li>播放时间: {{ Math.floor(debug.audioTime * 100) / 100 }} s</li>
                <li>播放进度: {{ Math.floor(game.percent * 100) / 100 }} %</li>
                <li :class="getSoundColor((debug.cAudioDelay ?? 0) * 1000)" v-if="debug.cAudioDelay != debug.audioDelay">
                    矫正延迟: {{ Math.floor((debug.cAudioDelay ?? 0) * 1000 * 100) / 100 }} ms</li>
                <li :class="getSoundColor((debug.audioDelay ?? 0) * 1000)">
                    原始延迟: {{ Math.floor((debug.audioDelay ?? 0) * 1000 * 100) / 100 }} ms</li>
            </template>
        </div>
        <div v-if="debug.clickTimes">
            <li>Player</li>
            <li>点击次数: {{ debug.clickTimes }} ( {{ Math.floor(debug.clickTimes / (debug.playTime ?? 1))}} cps )</li>
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
                    return 'text-danger'
                }else if(time > 10 || time < -10) {
                    return 'text-warning'
                }
            }
        },
        getAudioStatColor() {
            const state = this.debug.audioLoadState
            if(this.debug.audioTime) {
                return 'background-playing'
            }else if(state === 'ready') {
                return 'background-success'
            }else if(state === 'setup') {
                return 'background-warning'
            } else if(state === 'error') {
                return 'background-danger'
            }
        }
    }
})
</script>

<style scoped>
.text-danger {
    color: #ff9084;
}
.text-warning {
    color: #ffd787;
}
.text-success {
    color: #a0ff95;
}

.background-danger {
    background: #ec6a5e;
}
.background-warning {
    background: #f4bf4f;
}
.background-success {
    background: #61c654;
}
.background-playing {
    background: #5a90e0;
}

.debug {
    position: absolute;
    z-index: 100;
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
.debug li > span {
    border-radius: 100px;
    padding: 1px 7px;
}
</style>