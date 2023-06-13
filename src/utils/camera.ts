import * as THREE from 'three'

// 相机操作相关工具类

/**
 * 移动相机的相对位置
 * @param line 相机绑定的舞线
 * @param relative  相对位置
 * @param speend 速度，默认 0.1。越小越慢。
 */
export function moveCamera(line: any | null, relative: THREE.Vector3, speend = 0.1) {
    line?.moveCamera(relative, speend)
}

export default {
    moveCamera
}