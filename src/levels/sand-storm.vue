<template>
    <canvas
        id="three"
        @mousedown="viewClick">
    </canvas>
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
    methods: {
        viewClick() {
            if(this.game?.line.isRun()) {
                this.game?.click()
            } else {
                this.game?.start()
            }
        }
    },
    async mounted() {
        // 初始化游戏场景
        const game = new Game({
            skyColor: new THREE.Color('#e0e69e'),
            lineColor: { color: 0xf5504c },
            shadowDeep: 0.3,
            canvaName: 'three',
            camera: {
                pov: 60,
                position: new THREE.Vector3(-9, 22.6, -10),
                rotation: new THREE.Euler(-2, -0.6, -2.3)
            },
            lightPosition: new THREE.Vector3(3, 15, 7),
            // freeCamera: true,
            // lightHelper: true,
            viewHelper: true,
            debug: true
        }, new THREE.Vector3(0, 10.5, 0))
        this.game = game
        // 音乐
        game.addMusic('music/Cheetah Mobile Games - The Desert.mp3', 1)
        // 其他设置
        game.scene.fog = new THREE.Fog(0xe0e69e, 0.010, 100)

        // 加载场景
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        game.loadMap(require('@/assets/levels/sand-storm.json'))

        // 辅助地板
        // let floorGeometry = new THREE.PlaneGeometry(3000, 3000)
        // let floorMaterial = new THREE.MeshPhongMaterial({color: 0xa1a1a1})
        // let floor = new THREE.Mesh(floorGeometry, floorMaterial)
        // floor.rotation.x = -0.5 * Math.PI
        // floor.receiveShadow = true
        // floor.position.y = 9
        // this.game.addObject(floor, 'floor')
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
