<template>
    <DebugView />
    <LoadingPage v-show="!isDev" />
    <div>
        <SandStorm />
    </div>
    <!-- <div class="homeMenu">
        <canvas id="homeLine"></canvas>
        <div>
            <Card class="mainMenu">
                <p>Dancing Line</p>
                <span>-- Fan works Version --</span>
                <div>
                    <button @click="changeLable('start')">开始</button>
                    <button @click="changeLable('config')">设置</button>
                    <button @click="changeLable('thanks')">鸣谢</button>
                </div>
            </Card>
        </div>
    </div> -->
</template>

<script lang="ts">
import * as THREE from 'three'
import Game from '@/functions/game'

import { defineComponent } from 'vue'

import DebugView from './components/debugView.vue'
import LoadingPage from './pages/LoadingPage.vue'
import SandStorm from './levels/sand-storm.vue'

export default defineComponent({
    name: 'App',
    components: { DebugView, LoadingPage, SandStorm },
    data() {
        return {
            isDev: import.meta.env.DEV,
            // isDev: false,
            game: null as Game | null,
            nowLabel: 'start'
        }
    },
    async mounted() {
        this.game = new Game({
            fullScreen: false,
            canvaName: 'homeLine',
            sceneName: '主页视图',

            skyColor: new THREE.Color('#98b0cb'),
            lineColor: { color: 0xffffff },
            lineSpeed: 0,
            shadowDeep: 0.3,
            camera: {
                pov: 60,
                position: new THREE.Vector3(11.5, 59, -13),
                lookLine: true
            },
            lightPosition: new THREE.Vector3(5, 15, 5),
            debug: this.isDev
        }, new THREE.Vector3(0, 50, 0))
        this.game.world.line.mass = 17

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const homeMap = await import('./assets/levels/home.json')
        this.game.loadMap(homeMap.default)

        const changeLableFun = () => {
            // 清除 line 下坠的速度
            if(this.game) {
                this.game.world.line.velocity.y = 0
                const trigger = this.game.findTrigger('trigger_' + this.nowLabel) ??
                    this.game.findTrigger('trigger_start')
                if(trigger) {
                    // 把 line 移动到触发器的位置 y - 2
                    this.game.world.line.position.y = trigger.position.y - 2
                }
            }
        }
        const triggerFuns = {
            'trigger_start': changeLableFun,
            'trigger_config': changeLableFun,
            'trigger_none': changeLableFun
        }
        this.game.setTrigger(triggerFuns)
    },
    methods: {
        changeLable(name: string) {
            if(this.game && this.nowLabel !== name) {
                this.nowLabel = name
                const line = this.game.world.line
                // 将 line 往下移一个单位
                line.position.y -= 1
            }
        }
    }
});
</script>

<style scoped>
.homeMenu {
    flex-direction: row;
    align-items: center;
    display: flex;
    height: 100vh;
    width: 100vw;
}
.homeMenu canvas {
    height: 100%;
    width: 55%;
}
.homeMenu > div {
    background: #98b0cb;
    height: 100%;
    flex: 1;
}

.mainMenu {
    border-radius: 7px 0 0 7px;
    height: calc(100% - 100px);
    margin-top: 30px;
    margin-right: 0;
}
</style>
