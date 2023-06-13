import * as THREE from 'three'
import trigger from './trigger'

/**
 * 线主体类，提供线初始化、删除、移动等功能，不支持也不会支持多条线
 */
export default class line {

    public appendRun: () => void = () => {/**/}

    private scene: THREE.Scene
    private camera: THREE.Camera
    private cameraPosition: THREE.Vector3 = new THREE.Vector3()
    private cameraNewPosition: {position: THREE.Vector3, speend: number} | null = null

    private renderer: THREE.Renderer

    public line: THREE.Mesh | null = null
    private lineList: THREE.Mesh[] = []

    private triggerList: trigger[] = []

    private tags: {
        direction: 'x' | 'z',
        run: boolean,
        drop?: boolean
    } = {
        direction: 'x',
        run: false
    }

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer, position = new THREE.Vector3(0, 0.5, 0)) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.initHead(position)                         // 初始化舞线头
        if(this.line) {
            this.initLineBody(this.line.position)       // 初始化第一段舞线
            // 记录 camera 的初始位置相对于 line 的位置
            this.cameraPosition = this.camera.position.clone().sub(this.line.position)
        }

        this.scene.onAfterRender = this.runLine.bind(this)
    }

    public run() {
        this.tags.run = true
    }
    public stop() {
        this.tags.run = false
    }

    /**
     * 更换方向
     */
    public changeDirection() {
        this.tags.direction = this.tags.direction === 'x' ? 'z' : 'x'
        // 在当前 line 位置新建一个 line
        if(this.line) {
            const position = this.line.position.clone()
            this.initLineBody(position)
        }
        // 如果 lineList 长度大于 10，删除第一个 line
        if(this.lineList.length > 10) {
            const line = this.lineList.shift()
            if(line)
                this.scene.remove(line)
        }
    }
    public click() {
        this.changeDirection()
    }

    /**
     * 添加触发器
     * @param trigger 触发器
     */
    public addTrigger(trigger: trigger) {
        this.triggerList.push(trigger)
    }

    /**
     * 移动相机的相对位置
     * @param relative 相对位置
     */
    public moveCamera(relative: THREE.Vector3, speend = 0.1) {
        this.cameraNewPosition = { position: relative, speend: speend }
    }

    public setDrop(isDrop: boolean, y = -1) {
        this.tags.drop = isDrop
        // 纠正高度
        if(y >= 0) this.line?.position.setY(y)
        if(!isDrop) {
            // 创建一个新的 line
            if(this.line) {
                const position = this.line.position.clone()
                this.initLineBody(position)
            }
        }
    }

    // ========================================

    private runLine() {
        if(this.line) {
            const nowLine = this.lineList[this.lineList.length - 1]
            if(this.cameraNewPosition == null) {
                // 让镜头跟随 Line Head 移动
                this.camera.position.copy(this.line.position.clone().add(this.cameraPosition))
                this.camera.lookAt(this.line.position)
            } else {
                // 镜头拥有了一个新的位置，向这个位置平滑移动
                this.camera.position.lerp(this.cameraNewPosition.position, this.cameraNewPosition.speend)
                if(this.camera.position.distanceTo(this.cameraNewPosition.position) < 0.1) {
                    this.cameraPosition = this.cameraNewPosition.position.clone().sub(this.line.position)
                    this.cameraNewPosition = null
                }
            }
            // 让镜头看向 line
            this.camera.lookAt(this.line.position)
            if(this.tags.run) { 
                // 让线段向对应方向移动并且增加长度
                this.line.position[this.tags.direction] += 0.2
                if(!this.tags.drop) {
                    nowLine.position[this.tags.direction] += 0.1
                    nowLine.scale[this.tags.direction] += 0.2
                }
            }
        }
        // 检查是否掉落
        if(this.tags.drop && this.line) {
            this.line.position.y -= 0.1
        }
        // 检查触发器
        this.triggerList.forEach((item) => {
            const result = item.check(this.line?.position || new THREE.Vector3())
            if(result) {
                item.callback(this.line)
                // 移除触发器
                this.triggerList.splice(this.triggerList.indexOf(item), 1)
            }
        })
        // 追加的运行循环函数
        this.appendRun()
    }

    /**
     * 生成一个新的身体线段
     * @param position 生成坐标
     */
    private initLineBody(position: THREE.Vector3) {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 )
        const material = new THREE.MeshBasicMaterial( {color: 0x007acc} )
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
        const material = new THREE.MeshBasicMaterial( {color: 0x007acc} )
        const head = new THREE.Mesh( geometry, material )
        head.position.copy(position)
        head.receiveShadow = true
        head.castShadow = true
        this.scene.add(head)
        this.line = head
    }
}