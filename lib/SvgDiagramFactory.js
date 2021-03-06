const path = require('path')
const fs = require('fs')

const DiagramParser = require('./DiagramParser')
const LayoutProducer = require('./LayoutProducer')
const ParsersProducersRenderers = require('./ParsersProducersRenderers')
const SvgDiagramRenderer = require('./SvgDiagramRenderer')
const SvgShapeRenderer = require('./SvgShapeRenderer')
const Util = require('./Util')

const builtinPaths = [
  path.resolve(__dirname, 'builtins/Parsers.js'),
  path.resolve(__dirname, 'builtins/LayoutProducers.js'),
  path.resolve(__dirname, 'builtins/Renderers.js'),
]

module.exports = class SvgDiagramFactory {

  constructor(basePath, pluginPathArray) {
    this.basePath = basePath
    this.parsersProducersRenderers = new ParsersProducersRenderers([...builtinPaths, ...pluginPathArray])
    this.convertRelativePathsToAbsolute = false
    this.margin = {
      left: 30,
      right: 30,
      top: 30,
      bottom: 30
    }
    this.defaultSettings = {
      'horizontal-spacer': 20,
      'vertical-spacer': 20,
      'text-width': 5,
      'text-height': 30,
      'grid-align': 'center',
      'grid-valign': 'middle',
    }
  }

  getParsers() {
    return this.parsersProducersRenderers.parsers
  }

  getProducers() {
    return this.parsersProducersRenderers.producers
  }

  getRenderers() {
    return this.parsersProducersRenderers.renderers
  }

  newDiagramRenderer() {
    return new SvgDiagramRenderer(this)
  }

  newLayoutProducer() {
    return new LayoutProducer(this)
  }

  newDiagramParser() {
    return new DiagramParser(this)
  }

  renderDiagram(input, output) {
    input = path.resolve(this.basePath, input)
    const diagramText = fs.readFileSync(input, 'utf-8')
    return this.renderDiagramFromText(diagramText, output, input)
  }

  renderDiagramFromText(diagramText, output = null, input = 'input text') {
    if (output != null) {
      output = path.resolve(this.basePath, output)
    }
    try {
      const diagram = this.newDiagramParser().parseDiagram(diagramText)
      diagram.outputPath = output
      const svg = this.newDiagramRenderer().renderDiagram(diagram)
      if (output != null) {
        fs.writeFileSync(output, svg)
      }
      return svg
    } catch (e) {
      let lineNumber = ''
      if (e.lineNumber) {
        lineNumber = ':' + e.lineNumber
      }
      const errorParsing = `${input}${lineNumber}`
      throw Util.addMessageToError(errorParsing, e)
    }
  }

  notifyListeners(notification, data) {
    this.parsersProducersRenderers.notifyListeners(notification, data)
  }

}
