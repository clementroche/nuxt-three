import Events from 'events'

let onMouseDownHandler
let onMouseMoveHandler
let onMouseUpHandler

export default class Draggable {
  constructor(container) {
    if (!container) return
    this.container = container

    this.events = new Events()

    onMouseDownHandler = this.onMouseDown.bind(this)
    onMouseMoveHandler = this.onMouseMove.bind(this)
    onMouseUpHandler = this.onMouseUp.bind(this)

    this.container.addEventListener('mousedown', onMouseDownHandler)
    window.addEventListener('mousemove', onMouseMoveHandler)
    window.addEventListener('mouseup', onMouseUpHandler)
  }

  onMouseDown(e) {
    if (e.which !== 1) return
    this.dragging = true
    this.draggingStartPosition = {
      x: e.pageX,
      y: e.pageY
    }
    this.draggingCurrentPosition = this.draggingStartPosition

    this.events.emit('drag:start', e)
  }

  onMouseMove(e) {
    if (!this.dragging) return

    const lastPosition = this.draggingCurrentPosition || { x: 0, y: 0 }

    this.draggingCurrentPosition = {
      x: e.pageX,
      y: e.pageY
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
    if (e.which !== 1) return
    this.dragging = false
    this.draggingFinishPosition = {
      x: e.pageX,
      y: e.pageY
    }

    this.events.emit('drag:stop', e)
  }

  destroy() {
    this.container.removeEventListener('mousedown', onMouseDownHandler)
    window.addEventListener('mousemove', onMouseMoveHandler)
    window.addEventListener('mouseup', onMouseUpHandler)
  }
}
