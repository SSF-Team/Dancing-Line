import * as CANNON from "cannon-es"
import * as THREE from 'three'
import * as ObjectUtil from "@/utils/object"
import Game from "./game"
import Line from "./line"

/*
    物理引擎方法，用于对物理引擎进行初始化、添加对象、获取状态等操作
*/
export default class World {

    public main: CANNON.World
    public line: CANNON.Body

    private game: Game

    private lineStatus: {
        direction: 'x' | 'z'
    } = {
        direction: 'x'
    }

    constructor(game: Game) {
        const line = game.line
        this.game = game
        // 初始化世界
        this.main = new CANNON.World()
        this.main.gravity.set(0, -9.82, 0)
        this.main.broadphase = new CANNON.SAPBroadphase(this.main)
        // 添加 step 回调
        this.main.addEventListener('postStep', (e: any) => { this.run(game, e) })
        // 初始化线
        // 将 line head 创建为刚体
        // PS：Threejs 和 cannon 的坐标系统不太一样
        // 简单地说 Three 是中心的，cannon 是底面的
        // 这儿线长宽高都是 1 所以要偏移 0.5
        const lineHead = new CANNON.Body({
            mass: 1,
            position: ObjectUtil.ThreeVec3ToCannon(line.line?.position),
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
            material: new CANNON.Material({restitution: 0, friction: 0}),
            fixedRotation: true     // 不允许旋转，防止碰撞导致的的方块翻滚
        })
        this.main.addBody(lineHead)
        this.line = lineHead
        console.log('创建线成功：' + lineHead.id)
        
        // 碰撞检测
        lineHead.addEventListener('collide', (e: any) => { this.collide(line, e) })
    }

    public createObject(object: any, type: string, offset = new THREE.Vector3(0, 0, 0)) {
        switch(type) {
            case 'floor': {
                const floorBody = new CANNON.Body({
                    mass: 0,
                    position: ObjectUtil.ThreeVec3ToCannon(object.position, offset),
                    shape: new CANNON.Plane(),
                    material: new CANNON.Material({restitution: 0, friction: 0}),
                    sleepSpeedLimit: 0.1
                })
                floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
                this.main.addBody(floorBody)
                return floorBody.id
            }
            case 'box': {
                const box = object as THREE.Mesh
                const box3 = new THREE.Box3().setFromObject( box )
                const size = box3.getSize(new THREE.Vector3())
                const boxBody = new CANNON.Body({
                    mass: 0,
                    position: ObjectUtil.ThreeVec3ToCannon(box.position, offset),
                    shape: new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)),
                    material: new CANNON.Material({restitution: 0, friction: 0}),
                    sleepSpeedLimit: 0.1,
                    isTrigger: object.userData?.fun === 'trigger'
                })
                this.main.addBody(boxBody)
                return boxBody.id
            }
        }
        return -1
    }

    public removeBody(id: number) {
        const body = this.main.getBodyById(id)
        if(body) {
            this.main.removeBody(body)
        }
    }

    // ====================================

    public start() {
        this.line.velocity.set(this.game.config.lineSpeed ?? 20, 0, 0)
    }
    public stop() {
        this.line.velocity.set(0, 0, 0)
    }

    // 转向
    public turn() {
        const line = this.game.line
        if(!line.drop) {
            this.lineStatus.direction = this.lineStatus.direction === 'x' ? 'z' : 'x'
            if(this.lineStatus.direction == 'x') {
                this.line.velocity.set(this.game.config.lineSpeed ?? 20, 0, 0)
            } else {
                this.line.velocity.set(0, 0, this.game.config.lineSpeed ?? 20)
            }
            line.initLineBody(new THREE.Vector3(
                this.line.position.x,
                this.line.position.y,
                this.line.position.z
            ))
        }
    }

    // ====================================

    // 运行
    private lastY = 0
    private run(game: Game, event: any) {
        const line = game.line
        const nowPosition = line.line?.position.clone()
        // 掉落状态判断
        const cy = Math.floor(this.line.position.y * 100) / 100
        if(cy < this.lastY || this.lastY == 0) {
            line.drop = true
        }
        this.lastY = cy
        // line 的 y 坐标永远同步
        line.line?.position.setY(this.line.position.y)
        if(game.tags.status == 'run') {
            // 同步剩余两个坐标
            line.line?.position.setX(this.line.position.x)
            line.line?.position.setZ(this.line.position.z)
        }
        // console.log(nowPosition?.x + ',' + nowPosition?.z + ' | ' + this.line.position.x + ',' + this.line.position.z)
        let difference = 0
        if(nowPosition) {
            difference = nowPosition.x - this.line.position.x == 0 ? nowPosition.z - this.line.position.z : nowPosition.x - this.line.position.x
        }
        // console.log('差值：' + difference)
        line.runLine(this.line.position.y, this.lineStatus.direction, Math.abs(difference))
    }

    private collide(line: Line, event: any) {
        if(!event.body.isTrigger) {
            const contact = event.contact as CANNON.ContactEquation
            const contactNormal = contact.ni // 接触点的法向量
            const normal = contactNormal

            // 撞击速度
            const impactVelocity = Math.floor(contact.getImpactVelocityAlongNormal())
            
            if(normal.y == -1) {
                if(this.game.tags.status == 'run')
                    line.initLineBody(new THREE.Vector3(
                        this.line.position.x,
                        this.line.position.y,
                        this.line.position.z
                    ))
                line.dropFinish()
            }
            // 其他值只要不是 0 就是碰到了墙
            if((normal.x != 0 || normal.z != 0) && normal.y == 0) {
                console.log('撞墙判定（绝对值）:' 
                    + '(' + contact.bj.id + ')'
                    + normal 
                    + '/' + Math.abs(impactVelocity))
                if(Math.abs(impactVelocity) > 1) {
                    console.log(event)
                    this.game?.die()
                }
            }
        } else {
            // 触发触发器行为
            this.game?.trigger(event.body.id)
        }
    }
}