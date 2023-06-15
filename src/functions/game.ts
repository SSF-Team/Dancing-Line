import World from '@/functions/world'
import Line from '@/functions/line'
import * as THREE from 'three'
import trigger from './trigger'
import CannonDebugger from 'cannon-es-debugger'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class Game {

    public scene: THREE.Scene
    public renderer: THREE.WebGLRenderer
    public camera: THREE.PerspectiveCamera
    public light: THREE.DirectionalLight
    public sound: THREE.Audio

    public world: World
    public line: Line

    private config: SceneConfig

    constructor(config: SceneConfig, linePosition = new THREE.Vector3(0, 0.5, 0)) {
        this.config = config
        // 初始化物理引擎
        this.world = new World()
        // 初始化场景
        const { scene, renderer, camera, light, sound } = init(config, this.world)
        this.scene = scene
        this.renderer = renderer
        this.camera = camera
        this.light = light
        this.sound = sound
        this.scene.onAfterRender = this.run.bind(this)
        // 默认线
        this.line = new Line(this.scene, this.camera, this.renderer, this.light, linePosition, config)
        // 初始化线物理引擎模型
        this.world.initLine(this.line)
    }

    public start() {
        if(!this.config.freeCamera) {
            this.line.run()
            this.sound.play()
        }
    }
    public stop() {
        this.line.stop()
        this.sound.stop()
    }
    public click() {
        this.line.click()
    }
    
    /**
     * 添加虚拟触发器
     * @param position 坐标
     * @param size 大小
     * @param callback 回调方法
     */
    public addTrigger(position: THREE.Vector3, size: number[], callback: (line: Line) => void) {
        this.line.addTrigger(new trigger(position, size, callback))
    }

    /**
     * 添加对象。如果存在 type 将同时将对象作为刚体添加到物理引擎中
     * @param object 对象
     * @param type 类型（cannon 中的类型名称）
     */
    public addObject(object: any, type?: string) {
        this.scene.add(object)
        if(type) this.world.createObject(object, type)
    }

    /**
     * 添加主音乐，不会自动开始
     * @param path 文件路径，注意路径是 public 下的位置或者网络位置也可以
     * @param [volume=0.5] 音量
     */
    public addMusic(path: string, volume = 0.5) {
        const audioLoader = new THREE.AudioLoader()
        const sound = this.sound
        audioLoader.load( path, function( buffer ) {
            sound.setBuffer(buffer)
            sound.setLoop(true)
            sound.setVolume(volume)
        });
    }

    // ===============================================

    private run() {
        // 运行线逻辑
        this.line.runLine()
        // 运行物理模型
        this.world.main.step(1 / 60, this.line.deltaTime, 3)
        if(this.line.line) {
            // 同步 Y 轴到渲染引擎
            this.line.line.position.setY(this.world.getLine().y)
            // 锁定线在渲染引擎中的旋转轴
            this.world.line?.quaternion.set(0, 0, 0, 1)
            // 同步 X、Z 轴到物理模型
            this.world.line?.position.set(this.line.line.position.x, this.world.getLine().y, this.line.line.position.z)
        }
        // console.log(this.world.getLine())
    }
}

/**
 * 初始化场景
 * @param config 场景配置
 * @returns 场景、渲染器、相机
 */
export function init(config: SceneConfig, world: World) {
    const updateList: (any | null)[] = []

    // 场景基础
    const scene = new THREE.Scene()
    scene.background = config.skyColor
    const canva = document.getElementById(config.canvaName) as HTMLCanvasElement
    const renderer = new THREE.WebGLRenderer({ canvas: canva, antialias: true })
    renderer.shadowMap.enabled = true

    // 相机
    const camera = new THREE.PerspectiveCamera(config.camera.pov, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.copy(config.camera.position ? config.camera.position : new THREE.Vector3(-10, 20, -5))
    camera.rotation.copy(config.camera.rotation ? config.camera.rotation : new THREE.Euler(0, 0, 0))
    const listener = new THREE.AudioListener()
    camera.add(listener)
    const sound = new THREE.Audio(listener)

    // DEBUG: 启用相机控制器
    if(config.freeCamera) {
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true

        updateList.push(controls)
    }

    // // 主光源，用于产生阴影和明暗关系
    const light = new THREE.DirectionalLight(0xFFFFFF, 1)
    light.castShadow = true
    if(config.lightPosition)
        light.position.copy(config.lightPosition)
    else
        light.position.set(0, 10, 0)
    light.target.position.set(-5, 0, -5)
    light.shadow.mapSize = new THREE.Vector2(2048, 2048)
    scene.add(light)
    scene.add(light.target)

    // 环境光源，用来抵消阴影
    const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0x000000, config.shadowDeep ? config.shadowDeep : 0.7)
    scene.add(hemisphereLight)

    const shadowCamera = light.shadow.camera
    shadowCamera.left = -50
    shadowCamera.right = 50
    shadowCamera.top = 50
    shadowCamera.bottom = -50
    shadowCamera.updateProjectionMatrix()

    // DEBUG: 启用光源辅助器
    if (config.lightHelper) {
        const lightHelper = new THREE.DirectionalLightHelper(light)
        scene.add(lightHelper)
        const shadowHelper = new THREE.CameraHelper(shadowCamera)
        scene.add(shadowHelper)

        updateList.push(lightHelper)
        updateList.push(shadowHelper)
    }

    // DEBUG：物理引擎调试工具
    if(config.viewHelper) {
        const cannonDebugger = new (CannonDebugger as any)(scene, world.main)
        updateList.push(cannonDebugger)
    }

    function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
        const canvas = renderer.domElement
        const width = window.innerWidth
        const height = window.innerHeight
        const canvasPixelWidth = canvas.width / window.devicePixelRatio
        const canvasPixelHeight = canvas.height / window.devicePixelRatio

        const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height
        if (needResize) {
            renderer.setSize(width, height, false)
        }
        return needResize
    }

    function animate() {
        for(let i=0; i<updateList.length; i++) {
            const object = updateList[i]
            if(object != null) object.update()
        }
        renderer.render(scene, camera)
        requestAnimationFrame(animate)
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement
            camera.aspect = canvas.clientWidth / canvas.clientHeight
            camera.updateProjectionMatrix()
        }
    }
    animate()

    return { scene, renderer, camera, light, sound }
}