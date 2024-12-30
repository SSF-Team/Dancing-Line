interface Runtime {
    debug: {
        screenName: string,         // 当前画布名称

        fps: number,                // 帧率
        spt: number,                // 每帧时间
        showTime: number,           // 总渲染时间

        effectTime?: number,        // 有效执行时间
        playTime?: number,          // 游戏运行时间

        audioTime?: number,         // 音频播放时间
        audioDelay?: number,        // 音频延迟
        cAudioDelay?: number,       // 修正后的音频延迟

        clickTimes?: number,         // 点击次数

        audioLoadState?: 'none' | 'setup' | 'ready' | 'error', // 音频加载状态
    },
    game: {
        percent: number,            // 游戏进度
    }
}