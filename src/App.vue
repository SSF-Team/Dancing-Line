<template>
    <div>
        <canvas id="three" @click="viewClick"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import line from '@/functions/line'
import trigger from '@/functions/trigger'

export default defineComponent({
    name: 'App',
    components: {}, 
    data() {
        return {
            line: null as line | null,
            tags: {
                direction: 'x'
            }
        }
    },
    methods: {
        viewClick() {
            this.line?.click()
        }
    },
    mounted() {
        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#eee')
        const canva = document.getElementById('three') as HTMLCanvasElement
        const renderer = new THREE.WebGLRenderer({ canvas: canva, antialias: true })
        renderer.shadowMap.enabled = true;
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.x = -10
        camera.position.y = 20
        camera.position.z = -5
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true

        function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
            const canvas = renderer.domElement
            var width = window.innerWidth
            var height = window.innerHeight
            var canvasPixelWidth = canvas.width / window.devicePixelRatio
            var canvasPixelHeight = canvas.height / window.devicePixelRatio

            const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height
            if (needResize) {
                renderer.setSize(width, height, false)
            }
            return needResize
        }

        function animate() {
            controls.update()
            renderer.render(scene, camera)
            requestAnimationFrame(animate)
            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement
                camera.aspect = canvas.clientWidth / canvas.clientHeight
                camera.updateProjectionMatrix()
            }   
        }
        animate()

        // 环境光
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
        dirLight.position.set(100, 50, 100)
        dirLight.castShadow = true
        scene.add(dirLight)
        const light = new THREE.AmbientLight( 0x404040 );
        scene.add( light );
        // 地板
        let floorGeometry = new THREE.PlaneGeometry(3000, 3000)
        let floorMaterial = new THREE.MeshPhongMaterial({color: 0xa1a1a1})
        let floor = new THREE.Mesh(floorGeometry, floorMaterial)
        floor.rotation.x = -0.5 * Math.PI
        floor.receiveShadow = true
        floor.position.y = -0.001
        scene.add(floor)

        // 一个10*10 高度 5 的立方体，某一边在 0,0,0
        // let cubeGeometry = new THREE.BoxGeometry(10, 10, 10)
        // let cubeMaterial = new THREE.MeshPhongMaterial({color: 0xa1a1a1})
        // let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
        // cube.castShadow = true
        // cube.receiveShadow = true
        // cube.position.set(0, 5, 0)
        // scene.add(cube)

        // let cubeGeometry11 = new THREE.BoxGeometry(1, 1, 1)
        // let cubeMaterial11 = new THREE.MeshPhongMaterial({color: 0x00ff00})
        // let cube11 = new THREE.Mesh(cubeGeometry11, cubeMaterial11)
        // cube11.castShadow = true
        // cube11.position.set((10 / 0.1) * 0.2, 0.5, 0)
        // scene.add(cube11)

        // let cube12 = new THREE.Mesh(cubeGeometry11, cubeMaterial11)
        // cube12.castShadow = true
        // cube12.position.set(0, 10.5, 0)
        // scene.add(cube12)
        
        // 创建舞线，在立方体上面的中央
        this.line = new line(scene, camera, renderer);
        this.line.run()

        // // 创建触发器
        // this.line.addTrigger(new trigger(new THREE.Vector3(0, 10.5, 0), [3, 3, 3], () => {
        //     CameraUtil.moveCamera(this.line, new THREE.Vector3(5, 10, 15), 0.01)
        // }))

        // 掉落触发器
        // this.line.addTrigger(new trigger(new THREE.Vector3(5, 10.5, 0), [3, 3, 3], () => {
        //     this.line?.setDrop(true)
        // }))                                          //     |    落点    |            
        // // 落地触发器，下降速度为 0.1                       高度  速度 前进速度
        // this.line.addTrigger(new trigger(new THREE.Vector3((10 / 0.1) * 0.2, 0.5, 0), [3, 3, 3], () => {
        //     this.line?.setDrop(false, 0.5)
        // }))
    }
});
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
