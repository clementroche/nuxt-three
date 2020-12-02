import useFrame from '@/hooks/use-frame'

export default {
  mounted() {
    const frame = useFrame()
    if (this.onBeforeFrame) frame.on('beforeFrame', this.onBeforeFrame)
    if (this.onFrame) frame.on('frame', this.onFrame)
    if (this.onAfterFrame) frame.on('afterFrame', this.onAfterFrame)
    if (this.onAfterRender) frame.on('afterRender', this.onAfterRender)
  },
  beforeDestroy() {
    const frame = useFrame()
    if (this.onBeforeFrame) frame.off('beforeFrame', this.onBeforeFrame)
    if (this.onFrame) frame.off('frame', this.onFrame)
    if (this.onAfterFrame) frame.off('afterFrame', this.onAfterFrame)
    if (this.onAfterRender) frame.on('afterRender', this.onAfterRender)
  }
}
