import gsap from 'gsap'
import RAF from '@/assets/js/raf'

let raf

const useRAF = () => {
  if (!raf) {
    raf = new RAF()

    gsap.ticker.lagSmoothing(0)
    gsap.globalTimeline.pause()

    raf.add(
      'gsap',
      (clock) => {
        const time = gsap.globalTimeline.time()
        gsap.globalTimeline.time(time + clock.deltaTime)
      },
      -10
    )
  }
  return raf
}

export default useRAF
