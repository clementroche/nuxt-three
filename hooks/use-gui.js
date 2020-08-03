let gui

const useGUI = () => {
  if (!gui) {
    const dat = require('dat.gui')
    const init = require('three-dat.gui')
    init(dat)

    dat.GUI.prototype._addFolder = function(name) {
      if (this.__folders[name]) {
        return this.__folders[name]
      } else {
        return this.addFolder(name)
      }
    }

    gui = new dat.GUI()
    // camera
    gui.camera = gui.addFolder('Camera')

    // rendering
    gui.rendering = gui.addFolder('Rendering')

    // postprocessing
    gui.postprocessing = gui.addFolder('Post-processing')
  }

  return gui
}

export default useGUI
