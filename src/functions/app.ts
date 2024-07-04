import { reactive } from 'vue'

const baseRunTime = { 
    debug: {},
    game: {}
 } as Runtime

export const runTime: Runtime = reactive(baseRunTime)