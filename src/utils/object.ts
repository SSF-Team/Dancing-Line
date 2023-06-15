import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export function ThreeVec3ToCannon(vec = new THREE.Vector3(0, 0, 0)) {
    return new CANNON.Vec3(
        vec.x, vec.y, vec.z
    )
}
export function CannonVec3ToThree(vec = new CANNON.Vec3(0, 0, 0)) {
    return new THREE.Vector3(
        vec.x, vec.y, vec.z
    )
}

export function makeBox(size: number[], position: number[], color: THREE.MeshPhongMaterialParameters) {
    if(position.length == 3 && size.length == 3) {
        const box = new THREE.Mesh( new THREE.BoxGeometry(size[0], size[1], size[2]), new THREE.MeshPhongMaterial(color) )
        box.position.copy(new THREE.Vector3(position[0], position[1], position[2]))
        box.receiveShadow = true
        box.castShadow = true
        return box
    }
    return null
}

export function makeBoxs(info: { x: number, y: number, z:number, width: number, height: number, depth: number }[], color: THREE.MeshPhongMaterialParameters) {
    const boxs = [] as THREE.Mesh[]
    for(let i=0; i<info.length; i++) {
        const boxInfo = info[i]
        const box = new THREE.Mesh( new THREE.BoxGeometry(boxInfo.width, boxInfo.height, boxInfo.depth), new THREE.MeshPhongMaterial(color) )
        box.position.copy(new THREE.Vector3(boxInfo.x, boxInfo.y, boxInfo.z))
        box.receiveShadow = true
        box.castShadow = true
        boxs.push(box)
    }
    return boxs
}