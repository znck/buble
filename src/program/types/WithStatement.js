import Node from '../Node.js'

export default class WithStatement extends Node {
  transpile (code, transforms) {
    if (transforms.stripWith) {
      this.program.inWith = (this.program.inWith || 0) + 1
      // remove surrounding with block
      const context = code.slice(this.object.start, this.object.end)
      code.remove(this.start, this.body.start + 1)
      code.remove(this.end - 1, this.end)
      code.insertRight(this.start, `var __vue_context__ = ${context}`)
      super.transpile(code, transforms)
      this.program.inWith--
    } else {
      super.transpile(code, transforms)
    }
  }
}
