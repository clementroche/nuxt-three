import Events from 'events'
import gsap from '@/libs/gsap-bonus/gsap-core.js'

let frame

const useFrame = () => {
  if (frame) return frame
  frame = new Events()

  gsap.ticker.add((time, deltaTime, frm) => {
    const props = { time, deltaTime, frame: frm }
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
