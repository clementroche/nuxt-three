<template>
  <webgl-image
    ref="image"
    @load="onLoad"
    v-bind="$attrs"
    :uniforms="uniforms"
  />
</template>

<script>
import gsap from 'gsap'

export default {
  data() {
    return {
      uniforms: {
        uOpacity: { value: 0 }
      }
    }
  },
  methods: {
    onLoad() {
      gsap.to(this.uniforms.uOpacity, {
        value: 1,
        duration: 2,
        ease: 'expo.out'
      })
    }
  }
}
</script>

<style></style>
