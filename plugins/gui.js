import * as dat from 'dat.gui'
import init from 'three-dat.gui'

init(dat)

const gui = new dat.GUI()

gui.camera = gui.addFolder('Caméra')

export default gui
