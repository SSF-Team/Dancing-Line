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
import { makeBox as newBox, makeBoxs as newBoxs } from '@/utils/object'

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
    mounted() {
        // 注册一些调试功能
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            switch(e.key) {
                case 'l': {
                    const list = this.game?.line.lineList
                    console.log(this.game?.line.line?.position)
                    if(list) {
                        const lastBody = list[list.length - 1] as THREE.Mesh
                        var box = new THREE.Box3().setFromObject( lastBody )
                        var size = box.getSize(new THREE.Vector3())
                        this.lineBodyInfos.push({
                            x: Math.trunc(lastBody.position.x),
                            y: Math.trunc(lastBody.position.y),
                            z: Math.trunc(lastBody.position.z),
                            width: Math.trunc(size.x),
                            height: Math.trunc(size.y),
                            depth: Math.trunc(size.z)
                        })
                    }
                    this.game?.click()
                    break
                }
                case 'p': {
                    console.log(this.lineBodyInfos)
                    break
                }
                case 's': {
                    this.game?.stop()
                }
            }
        })

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
            viewHelper: true
        }, new THREE.Vector3(0, 10.5, 0))
        this.game = game
        // 音乐
        // game.addMusic('music/Cheetah Mobile Games - The Desert.mp3', 1)
        // 其他设置
        game.scene.fog = new THREE.Fog(0xe0e69e, 0.010, 100)

        // 颜色
        const baseFloor = { color: 0xd2da8f } as THREE.MeshPhongMaterialParameters
        const baseFloor1 = { color: 0xdde764 } as THREE.MeshPhongMaterialParameters
        const baseFloor2 = { color: 0xdfe87d } as THREE.MeshPhongMaterialParameters
        
        // 起点
        this.game.addObject(newBox([30, 10, 30], [-13, 5   , -13], baseFloor), 'box')
        this.game.addObject(newBox([30, 10, 30], [-10, 3   , -20], baseFloor1))
        this.game.addObject(newBox([30, 1 , 30], [-15, 10.5, -19], baseFloor2))
        this.game.addObject(newBox([30, 1 , 30], [-20, 10.5, -15], baseFloor2))
        this.game.addObject(newBox([30, 10, 30], [-18, 12  , -27], baseFloor1))
        // 段 1
        const groupRoodPart1 = new THREE.Group();
        let boxInfo = [{"x":17,"y":-18,"z":0,"width":17,"height":50,"depth":3},{"x":24,"y":-18,"z":3.5,"width":3,"height":50,"depth":9.5},{"x":26.5,"y":-18,"z":7,"width":7.5,"height":50,"depth":3},{"x":29,"y":-18,"z":9,"width":3,"height":50,"depth":6.5},{"x":34,"y":-18,"z":11,"width":12,"height":50,"depth":3},{"x":39,"y":-18,"z":13.5,"width":3,"height":50,"depth":8},{"x":41,"y":-18,"z":16,"width":7,"height":50,"depth":3},{"x":43,"y":-18,"z":18,"width":3,"height":50,"depth":7},{"x":45,"y":-18,"z":20,"width":7,"height":50,"depth":3},{"x":47,"y":-18,"z":22.5,"width":3,"height":50,"depth":8},{"x":49,"y":-18,"z":25,"width":7,"height":50,"depth":3},{"x":51,"y":-18,"z":30,"width":3,"height":50,"depth":13},{"x":55,"y":-18,"z":35,"width":9,"height":50,"depth":3},{"x":59,"y":-18,"z":39,"width":3,"height":50,"depth":11},{"x":61,"y":-18,"z":44,"width":7,"height":50,"depth":3},{"x":63,"y":-18,"z":46,"width":3,"height":50,"depth":7},{"x":68,"y":-18,"z":48,"width":11,"height":50,"depth":3},{"x":72,"y":-18,"z":50,"width":3,"height":50,"depth":5},{"x":74,"y":-18,"z":51,"width":7,"height":50,"depth":3},{"x":76,"y":-18,"z":54,"width":3,"height":50,"depth":6},{"x":78,"y":-18,"z":56,"width":7,"height":50,"depth":3},{"x":80,"y":-18,"z":59,"width":3,"height":50,"depth":6}]
        let boxs = newBoxs(boxInfo, baseFloor)
        for(let i=0; i<boxs.length; i++) {
            groupRoodPart1.add(boxs[i])
        }
        this.game.addObject(groupRoodPart1, 'group box')

        this.game.addObject(newBox([7, 60, 7], [34, -18,  0], baseFloor2))
        this.game.addObject(newBox([7, 60, 7], [37, -18, 27], baseFloor2))
        this.game.addObject(newBox([7, 60, 7], [60, -18, 27], baseFloor2))
        this.game.addObject(newBox([7, 60, 7], [67, -18, 60], baseFloor2))
        // 段 2
        this.game.addObject(newBox([140, 50, 70], [165, -24, 83  ], baseFloor), 'box')
        this.game.addObject(newBox([50, 50, 40 ], [110, -24, 33  ], baseFloor))
        this.game.addObject(newBox([70, 3 , 30 ], [124, 2.5, 33  ], baseFloor2), 'box')
        this.game.addObject(newBox([25, 5 , 13 ], [115, 3  , 49  ], baseFloor2), 'box')
        this.game.addObject(newBox([6 , 2 , 6  ], [104, 2  , 54.5], baseFloor1), 'box')

        const groupRoodPart2 = new THREE.Group();
        groupRoodPart2.add(newBox([19, 2, 25  ], [0      , 0, 4.5          ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [5      , 0, 7.5          ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [10     , 0, 15.5         ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [14     , 0, 19           ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [19     , 0, 30           ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [22     , 0, 35           ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [24.5   , 0, 46.5         ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [28.5   , 0, 50           ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [38.5   , 0, 54           ], baseFloor2))
        groupRoodPart2.add(newBox([3.5, 2, 3.5], [46     , 0, 36           ], baseFloor))
        groupRoodPart2.add(newBox([19, 2, 25  ], [5  + 24, 0, 7.5  - 26    ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [10 + 24, 0, 15.5 - 26    ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [14 + 24, 0, 19   - 26    ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 25  ], [19 + 24, 0, 30   - 26    ], baseFloor2))
        groupRoodPart2.add(newBox([19, 2, 40  ], [22 + 24, 0, 35   - 26    ], baseFloor2))
        groupRoodPart2.position.set(109.5, 2, 70.5)
        this.game.addObject(groupRoodPart2, 'group box')

        boxInfo = [
            {
                "x": 117,
                "y": 0.5,
                "z": 59,
                "width": 11,
                "height": 1,
                "depth": 1
            },
            {
                "x": 122,
                "y": 0.5,
                "z": 61,
                "width": 1,
                "height": 1,
                "depth": 4
            },
            {
                "x": 125,
                "y": 0.5,
                "z": 62,
                "width": 5,
                "height": 1,
                "depth": 1
            },
            {
                "x": 127,
                "y": 0.5,
                "z": 67,
                "width": 1,
                "height": 1,
                "depth": 10
            },
            {
                "x": 129,
                "y": 0.5,
                "z": 71,
                "width": 5,
                "height": 1,
                "depth": 1
            },
            {
                "x": 131,
                "y": 0.5,
                "z": 73,
                "width": 1,
                "height": 1,
                "depth": 4
            },
            {
                "x": 134,
                "y": 0.5,
                "z": 75,
                "width": 5,
                "height": 1,
                "depth": 1
            },
            {
                "x": 136,
                "y": 0.5,
                "z": 81,
                "width": 1,
                "height": 1,
                "depth": 11
            },
            {
                "x": 138,
                "y": 0.5,
                "z": 86,
                "width": 4,
                "height": 1,
                "depth": 1
            },
            {
                "x": 140,
                "y": 0.5,
                "z": 88,
                "width": 1,
                "height": 1,
                "depth": 5
            },
            {
                "x": 142,
                "y": 0.5,
                "z": 90,
                "width": 5,
                "height": 1,
                "depth": 1
            },
            {
                "x": 144,
                "y": 0.5,
                "z": 97,
                "width": 1,
                "height": 1,
                "depth": 13
            },
            {
                "x": 145,
                "y": 0.5,
                "z": 103,
                "width": 3,
                "height": 1,
                "depth": 1
            },
            {
                "x": 146,
                "y": 0.5,
                "z": 105,
                "width": 1,
                "height": 1,
                "depth": 4
            },
            {
                "x": 148,
                "y": 0.5,
                "z": 107,
                "width": 4,
                "height": 1,
                "depth": 1
            },
            {
                "x": 150,
                "y": 0.5,
                "z": 108,
                "width": 1,
                "height": 1,
                "depth": 4
            },
            {
                "x": 154,
                "y": 0.5,
                "z": 110,
                "width": 10,
                "height": 1,
                "depth": 1
            },
            {
                "x": 159,
                "y": 0.5,
                "z": 112,
                "width": 1,
                "height": 1,
                "depth": 5
            },
            {
                "x": 161,
                "y": 0.5,
                "z": 114,
                "width": 5,
                "height": 1,
                "depth": 1
            }
        ]
        boxs = newBoxs(boxInfo, baseFloor)
        for(let i=0; i<boxs.length; i++) {
            this.game.addObject(boxs[i], 'box')
        }
        
        // 辅助地板
        // let floorGeometry = new THREE.PlaneGeometry(3000, 3000)
        // let floorMaterial = new THREE.MeshPhongMaterial({color: 0xa1a1a1})
        // let floor = new THREE.Mesh(floorGeometry, floorMaterial)
        // floor.rotation.x = -0.5 * Math.PI
        // floor.receiveShadow = true
        // floor.position.y = 1
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
