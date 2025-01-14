<template>
    <transition>
        <div v-if="showIndex <= maxIndex" class="logo">
            <transition>
                <img v-if="showIndex === 0" src="@/assets/img/logo/threejs.svg" alt="threejs">
            </transition>
            <transition>
                <img v-if="showIndex === 2" src="@/assets/img/logo/ssfteam.svg" alt="ssfteam">
            </transition>
        </div>
    </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'LoadingPage',
    data() {
        return {
            showIndex: -1,
            maxIndex: 1 * 2 + 1,
            id: -1,
            times: 0
        }
    },
    mounted() {
        this.id = setInterval(() => {
            if(this.times === 0) {
                this.showIndex++
            }
            if(this.times !== 3) {
                this.times++
            } else {
                this.times = 0
                this.showIndex++
            }
            if(this.showIndex > this.maxIndex) {
                clearInterval(this.id)
            }
        }, 1500)
    }
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 1s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.logo {
    background: #221F20;
    position: absolute;
    height: 100vh;
    width: 100vw;
    z-index: 10;
}
.logo img {
    height: 15%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
