interface SceneConfig {
    skyColor: THREE.Color           // 背景色
    lineColor?: THREE.MeshPhongMaterialParameters
    lineSpeed?: number              // 舞线速度（0.1）
    shadowDeep?: number             // 阴影深度（环境亮度 0.7）

    canvaName: string               // 画布名称
    camera: {
        pov: number                // 相机视场
        position?: THREE.Vector3   // 相机初始位置（-10, 20, -5）
        rotation?: THREE.Euler     // 相机旋转参数（0, 0, 0）
    }
    lightPosition?: THREE.Vector3    // 光源初始位置（0, 10, 0）

    freeCamera?: boolean             // DEBUG: 是否自由视角
    lightHelper?: boolean            // DEBUG: 是否启用光源镜头辅助器
    viewHelper?: boolean            // DEBUG: 刚体框架辅助

    debug?: boolean                  // DEBUG: 是否启用调试模式（追加调试功能）
}