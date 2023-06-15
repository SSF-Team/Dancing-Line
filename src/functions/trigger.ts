import * as THREE from 'three';
import Line from './line';

/**
 * 区域触发器，用于在固定位置触发事件回调。每个触发器只能被触发一次并且不区分 enter 还是 leave
 */
export default class trigger {

    public callback: (line: Line) => void;

    private position: THREE.Vector3;
    private size: number[];
    private isLineIn = false;

    constructor(position: THREE.Vector3, size: number[] , callback: (line: Line) => void) {
        this.position = position;
        this.size = size;
        this.callback = callback;
    }

    public check(position: THREE.Vector3) {
        // 线头的大小是 1 * 1 * 1，判断线头是否在触发器内
        if(position.x >= this.position.x - this.size[0] / 2 && position.x <= this.position.x + this.size[0] / 2) {
            if(position.y >= this.position.y - this.size[1] / 2 && position.y <= this.position.y + this.size[1] / 2) {
                if(position.z >= this.position.z - this.size[2] / 2 && position.z <= this.position.z + this.size[2] / 2) {
                    if(!this.isLineIn) {
                        this.isLineIn = true
                        return true
                    }
                }
            }
        }
        return false
    }
}