import * as dat from 'dat.gui'
import init from 'three-dat.gui'

init(dat)

const gui = new dat.GUI()

// camera
gui.camera = gui.addFolder('Camera')

// rendering
gui.rendering = gui.addFolder('Rendering')

// postprocessing
gui.postprocessing = gui.rendering.addFolder('Post-processing')

export default gui
