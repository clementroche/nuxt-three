import Events from 'events'

export default class Dragger {
  constructor(container) {
    if (!container) return
    this.container = container

    this.events = new Events()

    this.onMouseDownHandler = this.onMouseDown.bind(this)
    this.onMouseMoveHandler = this.onMouseMove.bind(this)
    this.onMouseUpHandler = this.onMouseUp.bind(this)

    this.container.addEventListener('mousedown', this.onMouseDownHandler, false)
    window.addEventListener('mousemove', this.onMouseMoveHandler, false)
    window.addEventListener('mouseup', this.onMouseUpHandler, false)

    this.container.addEventListener(
      'touchstart',
      this.onMouseDownHandler,
      false
    )
    window.addEventListener('touchmove', this.onMouseMoveHandler, false)
    window.addEventListener('touchend', this.onMouseUpHandler, false)
  }

  onMouseDown(e) {
    this.dragging = true

    const evt = e.targetTouches ? e.targetTouches[0] : e

    this.draggingStartPosition = {
      x: evt.pageX,
      y: evt.pageY
    }
    this.draggingCurrentPosition = this.draggingStartPosition

    this.events.emit('drag:start', e)
  }

  onMouseMove(e) {
    if (!this.dragging) return

    const lastPosition = this.draggingCurrentPosition || { x: 0, y: 0 }

    const evt = e.targetTouches ? e.targetTouches[0] : e

    this.draggingCurrentPosition = {
      x: evt.pageX,
      y: evt.pageY
    }

    this.deltaPosition = {
      x: lastPosition.x - this.draggingCurrentPosition.x,
      y: lastPosition.y - this.draggingCurrentPosition.y
    }

    this.events.emit('drag:move', {
      deltaX: this.deltaPosition.x,
      deltaY: this.deltaPosition.y,
      event: e
    })
  }

  onMouseUp(e) {
    this.dragging = false

    const evt = e.targetTouches ? e.targetTouches[0] : e

    this.draggingFinishPosition = {
      x: evt.pageX,
      y: evt.pageY
    }

    this.events.emit('drag:stop', e)
  }

  destroy() {
    this.container.removeEventListener('mousedown', this.onMouseDownHandler)
    window.removeEventListener('mousemove', this.onMouseMoveHandler)
    window.removeEventListener('mouseup', this.onMouseUpHandler)

    this.container.removeEventListener('touchstart', this.onMouseDownHandler)
    window.removeEventListener('touchmove', this.onMouseMoveHandler)
    window.removeEventListener('touchend', this.onMouseUpHandler)
  }
}
