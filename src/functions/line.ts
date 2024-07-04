import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'

/**
 * 线主体类，提供线初始化、删除、移动等功能，不支持也不会支持多条线
 */
export default class Line {

    public appendRun: () => void = () => {/**/}

    private scene: THREE.Scene
    private camera: THREE.Camera
    private cameraPosition: THREE.Vector3 = new THREE.Vector3()
    private cameraNewPosition: {position: THREE.Vector3, speend: number} | null = null
    private renderer: THREE.Renderer
    private lightSystem: { object: any, position: THREE.Vector3 }[] = []

    public line: THREE.Mesh | null = null
    public lineList: THREE.Mesh[] = []
    public drop = false

    private lineColor: THREE.MeshPhongMaterialParameters
    private config: SceneConfig

    constructor(scene: THREE.Scene,
                camera: THREE.Camera,
                renderer: THREE.Renderer,
                light: THREE.DirectionalLight,
                position = new THREE.Vector3(0, 0.5, 0),
                config: SceneConfig) {
        this.config = config
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.lineColor = config.lineColor ? config.lineColor : {color: 0x007acc}
        this.lightSystem.push({object: light, position: light.position.clone()})
        this.lightSystem.push({object: light.target, position: light.target.position.clone()})
        this.initHead(position)                         // 初始化舞线头
        if(this.line) {
            // 记录 camera 的初始位置相对于 line 的位置
            this.cameraPosition = this.camera.position.clone().sub(this.line.position)
        }
    }

    public updateConfig(config: SceneConfig) {
        this.config = config
        this.lineColor = config.lineColor ? config.lineColor : {color: 0x007acc}
    }

    /**
     * 移动相机的相对位置
     * @param relative 相对位置
     */
    public moveCamera(relative: THREE.Vector3, speend = 0.1) {
        this.cameraNewPosition = { position: relative, speend: speend }
    }

    public dropFinish() {
        if(this.line) {
            this.initLineBody(this.line.position)
            this.drop = false
        }
    }

    public runLine(y: number, direction: 'x' | 'z', difference: number) {
        if(this.line) {
            const nowLine = this.lineList[this.lineList.length - 1]
            // 让光照系统内的对象都跟随 line 移动
            for(let i = 0; i < this.lightSystem.length; i++) {
                this.lightSystem[i].object.position.copy(this.line.position.clone().add(this.lightSystem[i].position))
                this.lightSystem[i].object.lookAt(this.line.position)
            }
            if (!this.config.freeCamera) {
                if (this.cameraNewPosition == null) {
                    // 让镜头跟随 Line Head 移动
                    this.camera.position.copy(this.line.position.clone().add(this.cameraPosition))
                } else {
                    // 镜头拥有了一个新的位置，向这个位置平滑移动
                    this.camera.position.lerp(this.cameraNewPosition.position, this.cameraNewPosition.speend)
                    if (this.camera.position.distanceTo(this.cameraNewPosition.position) < 0.1) {
                        this.cameraPosition = this.cameraNewPosition.position.clone().sub(this.line.position)
                        this.cameraNewPosition = null
                    }
                }
                // 让镜头看向 line
                // this.camera.lookAt(this.line.position)
                // 让线段向对应方向移动并且增加长度
                if(!this.drop) {
                    if(nowLine && this.lineList.length > 0) {
                        nowLine.position[direction] += difference / 2
                        nowLine.scale[direction] += difference
                    }
                }
            }
            // 如果 lineList 长度大于 x，删除第一个 line
            const maxLineCount = 20
            if(this.lineList.length > maxLineCount) {
                const line = this.lineList.shift()
                if(line)
                    this.scene.remove(line)
            }
        }
        // 追加的运行循环函数
        this.appendRun()
    }
    
    // ========================================

    /**
     * 生成一个新的身体线段
     * @param position 生成坐标
     */
    public initLineBody(position: THREE.Vector3) {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 )
        const material = new THREE.MeshPhongMaterial(this.lineColor)
        const cube = new THREE.Mesh( geometry, material )
        cube.position.copy(position)
        cube.receiveShadow = true
        cube.castShadow = true
        this.scene.add(cube)
        this.lineList.push(cube)
    }

    /**
     * @method init
     * @description 初始化舞线头
     */
    private initHead(position: THREE.Vector3) {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 )
        const material = new THREE.MeshPhongMaterial(this.lineColor)
        const head = new THREE.Mesh( geometry, material )
        head.position.copy(position)
        head.receiveShadow = true
        head.castShadow = true
        this.scene.add(head)
        this.line = head
    }
}