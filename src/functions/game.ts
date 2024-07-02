import * as THREE from 'three'

import World from '@/functions/world'
import Line from '@/functions/line'
import CannonDebugger from 'cannon-es-debugger'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {Howl, Howler} from 'howler'

export default class Game {

    public scene: THREE.Scene
    public renderer: THREE.WebGLRenderer
    public camera: THREE.PerspectiveCamera
    public light: THREE.DirectionalLight
    public sound: Howl | null = null

    public world: World
    public line: Line

    public tags: {
        status: 'run' | 'stop' | 'die',
    } = {
        status: 'stop'
    }

    public config: SceneConfig
    private lineBodyInfos: any[] = []

    constructor(config: SceneConfig, linePosition = new THREE.Vector3(0, 0.5, 0)) {
        this.config = config
        // 初始化场景
        const { scene, renderer, camera, light } = init(config)
        this.scene = scene
        this.renderer = renderer
        this.camera = camera
        this.light = light
        this.scene.onAfterRender = this.run.bind(this)
        // 默认线
        this.line = new Line(this.scene, this.camera, this.renderer, this.light, linePosition, config)
        // 初始化物理引擎
        this.world = new World(this)
        if(config.viewHelper) {
            const cannonDebugger = new (CannonDebugger as any)(scene, this.world.main)
            updateList.push(cannonDebugger)
        }

        // 注册窗口键盘事件
        window.addEventListener('keydown', (e) => {
            if(e.key === ' ') this.click()          // 空格点击

            if(config.debug) {
                if(e.key === 's') {                 // S 停止
                    this.stop()
                    // 追加相机控制器
                    const controls = new OrbitControls(camera, renderer.domElement)
                    controls.enableDamping = true
                    updateList.push(controls)
                    // 更新配置
                    this.config.freeCamera = true
                    this.line.updateConfig(this.config)
                    // 去除场景迷雾
                    this.scene.fog = null
                }
                if(e.key === 'l') {                 // 标点工具
                    const list = this.line.lineList
                    console.log(this.line.line?.position)
                    if(list) {
                        const lastBody = list[list.length - 1] as THREE.Mesh
                        const box = new THREE.Box3().setFromObject( lastBody )
                        const size = box.getSize(new THREE.Vector3())
                        this.lineBodyInfos.push({
                            x: Math.trunc(lastBody.position.x),
                            y: Math.trunc(lastBody.position.y),
                            z: Math.trunc(lastBody.position.z),
                            width: Math.trunc(size.x),
                            height: Math.trunc(size.y),
                            depth: Math.trunc(size.z)
                        })
                    }
                    this.click()
                }
                if(e.key === 'p') {                 // 输出标点信息
                    console.log(this.lineBodyInfos)
                    console.log(JSON.stringify(this.lineBodyInfos))
                    this.lineBodyInfos = []
                }
            }
        })
    }

    public start() {
        if(this.tags.status !== 'die' && !this.config.freeCamera) {
            if(this.sound) this.sound.play()
            this.tags.status = 'run'
            const position = this.line.line?.position.clone()
            if(position)
                this.line.initLineBody(position)
            this.world.start()
        }
    }
    public stop() {
        this.tags.status = 'stop'
        if(this.sound) this.sound.stop()
        // this.world.line?.sleep()
    }
    public click() {
        this.world.turn()
    }
    public die() {
        this.stop()
        this.tags.status = 'die'
    }

    /**
     * 添加对象。如果存在 type 将同时将对象作为刚体添加到物理引擎中
     * @param object 对象
     * @param type 类型（cannon 中的类型名称）
     */
    public addObject(object: any, type?: string, groupPosition?: THREE.Vector3) {
        // 注意：如果是组对象，直接自行将整个组添加到场景中，此处只对内部对象进行处理
        if(!groupPosition)
            this.scene.add(object)
        if(type) {
            this.world.createObject(object, type, groupPosition)
        }
    }

    /**
     * 添加主音乐，不会自动开始
     * @param path 文件路径，注意路径是 public 下的位置或者网络位置也可以
     * @param [volume=0.5] 音量
     */
    public addMusic(path: string, volume = 0.5) {
        this.sound = new Howl({
            src: path,
            html5: true,
            volume: volume
        })
    }

    /**
     * 加载地图
     * @param json 地图数据
     */
    public async loadMap(json: any) {
        const removeTypes = ['DirectionalLight', 'Camera']
        json.scene.object.children = json.scene.object.children.filter((item: any) => {
            return !removeTypes.includes(item.type)
        })
        const loader = new THREE.ObjectLoader()
        const objects = await loader.parse(json.scene)
        // 由于加载到为引用数组，所以需要倒序添加防止数组变化
        for(let i=objects.children.length-1; i>=0; i--) {
            const item = objects.children[i]
            const type = item.type
            if(type === 'Group') {
                const group = item as THREE.Group
                this.scene.add(group)
                for(let i=group.children.length-1; i>=0; i--) {
                    const groupItem = group.children[i]
                    this.addObject(groupItem, groupItem.userData?.type, group.position)
                }
            } else {
                this.addObject(item, item.userData?.type)
            }
        }
    }

    // ===============================================
    private playTime = 0
    private clock = new THREE.Clock()
    private sumSowTime = 0

    private run() {
        const spt = this.clock.getDelta()
        this.sumSowTime += spt
        // 音频对齐检查
        // const swh = this.sound?.seek()
        // if(swh && this.line.isRun()) {
        //     this.playTime += spt
        //     console.log(swh, 1000 / (spt * 1000), this.playTime)
        //     if(Math.abs(Number(this.playTime.toFixed(1)) - Number(swh.toFixed(1))) > 0.3) {
        //         console.log('pause')
        //         // this.sound.pause()
        //     } else {
        //         // this.sound.pause()
        //     }
        // }
        // 运行物理模型
        if(this.tags.status !== 'die')
            this.world.main.fixedStep(1 / 60, spt)
    }
}

/**
 * 初始化场景
 * @param config 场景配置
 * @returns 场景、渲染器、相机、主光源
 */
const updateList: (any | null)[] = []
export function init(config: SceneConfig) {

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

    // DEBUG: 启用相机控制器
    if(config.freeCamera) {
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true

        updateList.push(controls)
    }

    // 主光源，用于产生阴影和明暗关系
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

    // 环境光源，用来抵消太重的阴影
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

    // 窗口大小同步相关逻辑
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

    // 主循环
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

    return { scene, renderer, camera, light }
}