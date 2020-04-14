let gui

const useGUI = () => {
  if (!gui) {
    const dat = require('dat.gui')
    const init = require('three-dat.gui')
    init(dat)

    gui = new dat.GUI()
    // camera
    gui.camera = gui.addFolder('Camera')

    // rendering
    gui.rendering = gui.addFolder('Rendering')

    // postprocessing
    gui.postprocessing = gui.rendering.addFolder('Post-processing')
  }

  return gui
}

export default useGUI
