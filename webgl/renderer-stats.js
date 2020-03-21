class RenderingStats {
  constructor() {
    this.dom = document.createElement('div')
    this.dom.style.cssText =
      'position:fixed;bottom:0;left:0;opacity:0.9;z-index:10000;background:#000;color:#fff;padding:8px;'

    document.body.appendChild(this.dom)
  }

  update(info) {
    this.info = info
    const { render, memory, programs } = this.info
    this.dom.innerHTML = `<div>calls: ${render.calls}</div><div>triangles: ${render.triangles}</div><div>geometries: ${memory.geometries}</div><div>textures: ${memory.textures}</div><div>programs: ${programs.length}</div>`
  }
}

export default new RenderingStats()
