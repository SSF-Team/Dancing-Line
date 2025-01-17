<template>
    <canvas
        id="three"
        @mousedown="viewClick"
        @touchstart="viewClick" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as THREE from 'three'
import Game from '@/functions/game'

export default defineComponent({
    name: 'SandStorm',
    components: {},
    data() {
        return {
            game: null as Game | null,
            lineBodyInfos: [] as {
                x: number, y: number, z:number,
                width: number, height: number, depth: number
             }[]
        }
    },
    async mounted() {
        // 初始化游戏场景
        const game = new Game({
            sceneName: 'SandStorm',
            skyColor: new THREE.Color('#e0e69e'),
            lineColor: { color: 0xf5504c },
            lineSpeed: 17.9,
            shadowDeep: 0.3,
            canvaName: 'three',
            camera: {
                pov: 60,
                position: new THREE.Vector3(-9, 22.6, -10),
                rotation: new THREE.Euler(-2, -0.6, -2.3)
            },
            lightPosition: new THREE.Vector3(3, 15, 7),
            viewHelper: true,
            debug: import.meta.env.MODE === 'development'
        }, new THREE.Vector3(0, 10.5, 0))
        this.game = game
        // 音乐
        game.addMusic('music/Cheetah Mobile Games - The Desert.mp3', 1)
        // 其他设置
        game.scene.fog = new THREE.Fog(0xe0e69e, 0.010, 50)

        // 加载场景
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const map = await import('@/assets/levels/sand-storm.json')
        game.loadMap(map.default)

        // 触发器方法
        const triggerFuns = {
            // 地图清理
            'trigger_rm_start': () => {
                game.removeGroup('Start Point Group')
            },
            'trigger_rm_1': () => {
                game.removeGroup('Part1 Group')
                // 性能检查点
                console.log(this.game?.sound?.seek())
            },
        }
        this.game.setTrigger(triggerFuns)

        // 辅助地板
        const floorY = [
            9,          //第一层
            // 7,          //第二层
            // 6,          //第三层
        ] as number[]
        floorY.forEach(y => {
            const floorGeometry = new THREE.PlaneGeometry(1000, 1000)
            const floorMaterial = new THREE.MeshPhongMaterial({color: 0xa1a1a1})
            const floor = new THREE.Mesh(floorGeometry, floorMaterial)
            floor.rotation.x = -0.5 * Math.PI
            floor.receiveShadow = true
            floor.position.y = y
            this.game?.addObject(floor, 'floor')
        })
    },
    methods: {
        viewClick(e: any) {
            if(this.game?.tags.status === 'run') {
                this.game?.click()
            } else {
                this.game?.start()
            }
            // PS：mousedown 在触屏设备上触发延迟较大，使用 touchstart 会更小一点
            // 防止 touchstart 事件触发后触发 mousedown 事件
            e.preventDefault()
        }
    }
})
</script>

<style scoped>
#three {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
}
</style>
