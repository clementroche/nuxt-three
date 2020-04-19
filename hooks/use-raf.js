import RAF from '@/assets/js/raf'

let raf

const useRAF = () => {
  return raf || (raf = new RAF())
}

export default useRAF
