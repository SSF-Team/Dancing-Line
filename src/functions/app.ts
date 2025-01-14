import type { Runtime } from '@/types/runtime'
import { reactive } from 'vue'

const baseRunTime = {
    debug: {
        audioLoadState: 'none',
    },
    game: {}
 } as Runtime

export const runTime: Runtime = reactive(baseRunTime)
