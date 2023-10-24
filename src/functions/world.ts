import * as CANNON from "cannon-es"
import * as THREE from 'three'
import Line from "./line"
import * as ObjectUtil from "@/utils/object"

/*
    物理引擎方法，用于对物理引擎进行初始化、添加对象、获取状态等操作
*/
export default class World {

    public main: CANNON.World
    public line: CANNON.Body | null = null

    private baseLine: Line | null = null

    constructor() {
        // 初始化世界
        this.main = new CANNON.World()
        this.main.gravity.set(0, -9.82, 0)
    }

    public initLine(line: Line) {
        this.baseLine = line
        // 将 line head 创建为刚体
        // PS：Threejs 和 cannon 的坐标系统不太一样
        // 简单地说 Three 是中心的，cannon 是底面的
        // 这儿线长宽高都是 1 所以要偏移 0.5
        const lineHead = new CANNON.Body({
            mass: 1,
            position: ObjectUtil.ThreeVec3ToCannon(line.line?.position),
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
            material: new CANNON.Material({restitution: 0, friction: 0})
        })
        this.main.addBody(lineHead)
        this.line = lineHead
        
        lineHead.addEventListener('collide', (e: any) => {
            line.dropFinish()
            // this.line?.position.set(e.)
            console.log(e)
        })
    }

    public createObject(object: any, type: string, offset = new THREE.Vector3(0, 0, 0)) {
        switch(type) {
            case 'floor': {
                const floorBody = new CANNON.Body({
                    mass: 0,
                    position: ObjectUtil.ThreeVec3ToCannon(object.position, offset),
                    shape: new CANNON.Plane(),
                    material: new CANNON.Material({restitution: 0, friction: 0})
                })
                floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
                this.main.addBody(floorBody)
                break
            }
            case 'box': {
                const box = object as THREE.Mesh
                const size = (box.geometry as THREE.BoxGeometry).parameters
                const boxBody = new CANNON.Body({
                    mass: 0,
                    position: ObjectUtil.ThreeVec3ToCannon(box.position, offset),
                    shape: new CANNON.Box(new CANNON.Vec3(size.width * 0.5, size.height * 0.5, size.depth * 0.5)),
                    material: new CANNON.Material({restitution: 0, friction: 0})
                })
                this.main.addBody(boxBody)
                break
            }
        }
    }

    public step(deltaTime: number) {
        this.main.step(1 / 60, deltaTime, 3)
    }

    public getLine() {
        return ObjectUtil.CannonVec3ToThree(this.line?.position)
    }
}