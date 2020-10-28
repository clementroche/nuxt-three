import boundingRect from '@/mixins/bounding-rect'
import scrollMixin from '@/mixins/scroll'

export default {
  mixins: [boundingRect, scrollMixin],
  computed: {
    distanceToPageCenter() {
      return this.boundingRect
        ? {
            x:
              this.boundingRect.left +
              this.boundingRect.width / 2 +
              this.scrollPosition.x -
              this.initialScroll.x -
              this.$viewport.width / 2,
            y:
              this.boundingRect.top +
              this.boundingRect.height / 2 -
              (this.scrollPosition.y - this.initialScroll.y) -
              this.$viewport.height / 2
          }
        : undefined
    },
    parallax() {
      return this.distanceToPageCenter
        ? {
            x: this.distanceToPageCenter.x / (this.$viewport.width / 2),
            y: this.distanceToPageCenter.y / (this.$viewport.height / 2)
          }
        : { x: 0, y: 0 }
    }
  }
}
