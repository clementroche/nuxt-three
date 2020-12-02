import Events from 'events'
import gsap from 'gsap'

let frame

const useFrame = () => {
  if (frame) return frame
  frame = new Events()

  gsap.ticker.add((time, deltaTime, frameIndex) => {
    const props = { time, deltaTime, frameIndex }
    frame.emit('statsBegin', props)

    frame.emit('beforeFrame', props)
    frame.emit('frame', props)
    frame.emit('afterFrame', props)

    frame.emit('beforeRender', props)
    frame.emit('render', props)
    frame.emit('afterRender', props)

    frame.emit('statsEnd', props)
  })

  return frame
}

export default useFrame
