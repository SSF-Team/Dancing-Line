<template>
    <div>
        <canvas id="three" @click="viewClick"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default defineComponent({
    name: 'App',
    components: {}, 
    data() {
        return {
            tags: {
                direction: 'x'
            }
        }
    },
    methods: {
        viewClick() {
            console.log('viewClick')
        }
    },
    mounted() {
        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#eee')
        const canva = document.getElementById('three') as HTMLCanvasElement
        const renderer = new THREE.WebGLRenderer({ canvas: canva, antialias: true })
        renderer.shadowMap.enabled = true;
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.x = -5
        camera.position.y = 10
        camera.position.z = -10
        // const controls = new OrbitControls(camera, renderer.domElement)
        // controls.enableDamping = true

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
            // controls.update()
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
        dirLight.position.set(-10, 8, -5)
        dirLight.castShadow = true
        dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
        scene.add(dirLight)
        // 地板
        let floorGeometry = new THREE.PlaneGeometry(3000, 3000)
        let floorMaterial = new THREE.MeshPhongMaterial({color: 0xa1a1a1})
        let floor = new THREE.Mesh(floorGeometry, floorMaterial)
        floor.rotation.x = -0.5 * Math.PI
        floor.receiveShadow = true
        floor.position.y = -0.001
        scene.add(floor)
        // 添加一个立方体
        const geometry = new THREE.BoxGeometry( 1, 1, 1 )
        const material = new THREE.MeshBasicMaterial( {color: 0x007acc} )
        const cube = new THREE.Mesh( geometry, material )
        cube.position.y = 0.5
        cube.traverse((item) => {
            if (item instanceof THREE.Mesh) {
                item.castShadow = true
            }
        })
        scene.add(cube)
        // 再添加一个作为参考
        const material1 = new THREE.MeshBasicMaterial( {color: 0x4dd1ff} )
        const cube1 = new THREE.Mesh( geometry, material1 )
        cube1.position.y = 0.5
        cube1.position.x = 1
        cube1.traverse((item) => {
            if (item instanceof THREE.Mesh) {
                item.castShadow = true
            }
        })
        scene.add(cube1)

        window.requestAnimationFrame(callback);
        function callback() {
            // 让方块向 x 轴移动并且增加长度
            cube.position.x += 0.1
            cube.scale.x += 0.2
            cube1.position.x += 0.2
            window.requestAnimationFrame(callback);
            // 让镜头跟随 cube1 移动并保持原有视角
            camera.position.x = cube1.position.x - 5
            camera.lookAt(cube1.position)
        }

        function makeCube() {
            const geometry = new THREE.BoxGeometry( 1, 1, 1 )
            const material = new THREE.MeshBasicMaterial( {color: 0x007acc} )
            const cube = new THREE.Mesh( geometry, material )
            // 设置位置为 cube 的位置
            cube.position.x = cube1.position.x
            cube.position.y = cube1.position.x
            cube.traverse((item) => {
                if (item instanceof THREE.Mesh) {
                    item.castShadow = true
                }
            })
            scene.add(cube)
            return cube
        }
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
