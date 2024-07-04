import * as THREE from 'three'

import World from '@/functions/world'
import Line from '@/functions/line'
import CannonDebugger from 'cannon-es-debugger'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {Howl, Howler} from 'howler'
import { runTime } from '@/functions/app'

/**
 * 游戏类
 * 负责控制整个游戏的运行，包括场景、物理引擎、音频等
 * 它同时控制了物理引擎的 World 类和主线的 Line 类
 * =======================================
 * 游戏主流程：游戏状态 status 写作 s
 * game.start()：s = 'run'
 *         -> game.run()        // 游戏启动后由 world 的 fixedStep 循环进行全部的主循环
 *     world.run()
 *         -> line.runLine()    // 在 world step 中对线条的渲染进行更新
 *     world.collide()          // 在 world step 中对碰撞进行检测，撞击、物品拾取等都在这里处理
 * =======================================
 */
export default class Game {

    public scene: THREE.Scene
    public renderer: THREE.WebGLRenderer
    public camera: THREE.PerspectiveCamera
    public light: THREE.DirectionalLight
    public sound: Howl | null = null

    public world: World
    public line: Line

    public config: SceneConfig
    public tags: {
        status: 'run' | 'stop' | 'die',
        fps: number
    } = {
        status: 'stop',
        fps: 0
    }
    
    private lineBodyInfos: any[] = []

    private clock = new THREE.Clock()
    private sumSowTime = 0
    private playTime = 0
    private effectiveTime = 0
    private clickTimes = 0
    

    // 触发器映射表，由于 connon 的触发器没法设置名字，所以将创建出来的 id 与名字进行映射
    private triggerMap: { [key: number]: string } = {}
    private triggerFuns: { [key: string]: () => void } = {
        'trigger_die': () => { this.die() }     // 触发死亡
    }

    /**
     * 初始化游戏
     * @param config 场景配置
     * @param linePosition 线的位置
     */
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
        window.addEventListener('keydown', () => { this.keyController(event) })
        // 注册窗口焦点事件
        // window.addEventListener('blur', () => { this.stop() })
    }

    /**
     * 主循环
     */
    private debugSum = {
        sumTime: 0,
        fps: 0
    }
    private run() {
        const spt = this.clock.getDelta()                   // 渲染间隔间隔时间
        this.sumSowTime += spt                              // 总渲染时间
        this.tags.fps = Math.floor(1 / spt * 100) / 100     // 帧率
        const swh = this.sound?.seek()              // 音频播放时间

        // 数据上报
        if(this.sumSowTime % 0.5 < 0.01) {
            runTime.debug.fps = Math.floor(this.debugSum.fps / this.debugSum.sumTime)
        } else {
            this.debugSum.sumTime ++
            // 每 0.5 秒计算一次帧率和渲染时间平均值
            this.debugSum.fps += this.tags.fps
        }
        if(this.sumSowTime % 0.1 < 0.01) {
            runTime.debug.spt = spt
            runTime.debug.showTime = this.sumSowTime
            runTime.debug.audioTime = this.sound?.seek()
            runTime.debug.playTime = this.playTime

            runTime.debug.effectTime = this.effectiveTime

            if(swh) runTime.debug.audioDelay = swh - this.playTime
            if(swh) runTime.debug.cAudioDelay = swh - this.effectiveTime

            // 游戏进度：音频播放进度
            if(this.sound) {
                runTime.game.percent = (this.sound.seek() / this.sound.duration()) * 100
            }
        }
        // 音频对齐检查
        let passShow = false
        if(swh && this.tags.status == 'run') {
            this.playTime += spt                    // 游戏运行时间
            // 如果播放进度快于渲染进度，暂停音频
            if(Math.floor((swh - this.effectiveTime) * 1000) > 50) {
                this.sound?.seek(this.playTime)
                this.effectiveTime = swh
            }
            if(Math.floor((swh - this.effectiveTime) * 1000) < -50) {
                passShow = true
            } else {
                this.effectiveTime += spt
            }
        }
        // 运行物理模型
        if(this.tags.status !== 'die' && !passShow)
            this.world.main.fixedStep()
            // this.world.main.step(1 / 60, spt, 3)
        // 处理触发器移除
        for(const key in this.triggerMap) {
            if(this.triggerMap[key].indexOf('remove-') === 0) {
                delete this.triggerMap[key]
                this.world.removeBody(Number(key))
            }
        }
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
            this.world.stop()
    }
    public click() {
        this.world.turn()
        if(this.tags.status == 'run') {
            runTime.debug.clickTimes = ++ this.clickTimes
        }
    }
    public die() {
        this.stop()
        this.tags.status = 'die'
    }

    /**
     * 触发触发器
     * @param id 触发器 id
     */
    public trigger(id: number) {
        const name = this.triggerMap[id]
        console.log('触发触发器：' + name)
        if(name && this.triggerFuns[name]) {
            this.triggerFuns[name]()
            this.triggerMap[id] = 'remove-' + name
        }
    }

    // 初始化功能 ====================================

    /**
     * 添加对象。如果存在 type 将同时将对象作为刚体添加到物理引擎中
     * @param object 对象
     * @param type 类型（cannon 中的类型名称）
     */
    public addObject(object: any, type?: string, groupPosition?: THREE.Vector3) {
        // 注意：如果是组对象，直接自行将整个组添加到场景中，此处只对内部对象进行处理
        // 非 debug 模式下不显示触发器
        if(object.userData?.fun === 'trigger' && !this.config.debug) {
            object.visible = false
        }
        // 添加到场景
        if(!groupPosition)
            this.scene.add(object)
        if(type) {
            const worldItemId = this.world.createObject(object, type, groupPosition)
            // 记录一些特殊对象
            if(object.userData?.fun == 'trigger') {
                console.log('添加触发器：' + object.name + ' -> ' + worldItemId)
                this.triggerMap[worldItemId] = object.name
            }
            return -1
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
                    this.addObject(groupItem, groupItem.userData.type, group.position)
                }
            } else {
                this.addObject(item, item.userData?.type)
            }
        }
    }

    /**
     * 设置触发器函数
     * @param funs 触发器函数
     */
    public setTrigger(funs: { [key: string]: () => void }) {
        for(const key in funs) {
            this.triggerFuns[key] = funs[key]
        }
    }

    // 触发器功能 ====================================

    public removeGroup(name: string) {
        const group = this.scene.getObjectByName(name)
        if(group) {
            this.scene.remove(group)
        }
    }

    // 其他 ====================================

    private keyController(e: any) {
        const key = e.key
        switch(key) {
            case ' ':
            case 'z':
            case 'x': this.click(); break
            case 's': {
                if(this.config.debug) {
                    this.stop()
                    // 追加相机控制器
                    const controls = new OrbitControls(this.camera, this.renderer.domElement)
                    controls.enableDamping = true
                    updateList.push(controls)
                    // 更新配置
                    this.config.freeCamera = true
                    this.line.updateConfig(this.config)
                    // 去除场景迷雾
                    this.scene.fog = null
                    // 看向原点，防止找不到地图
                    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
                }
                break
            }
            case 'k':
            case 'l': {
                if(this.config.debug) {
                    const list = this.line.lineList
                    console.log(this.line.line?.position)
                    if (list) {
                        const lastBody = list[list.length - 1] as THREE.Mesh
                        const box = new THREE.Box3().setFromObject(lastBody)
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
                break
            }
            case 'p': {
                if(this.config.debug) {
                    console.log(this.lineBodyInfos)
                    console.log(JSON.stringify(this.lineBodyInfos))
                    this.lineBodyInfos = []
                }
                break
            }
        }
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