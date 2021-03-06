const SvgShapeRenderer = require('./SvgShapeRenderer')
const Util = require('./Util')

const zeroMargin = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0
}

module.exports = class SvgDiagramRenderer {

  constructor(diagramFactory) {
    this.diagramFactory = diagramFactory
    this.context = {
      basePath: diagramFactory.basePath,
      renderers: diagramFactory.getRenderers(),
      convertRelativeToAbsolute: diagramFactory.convertRelativePathsToAbsolute,
    }
  }

  renderDiagram(diagram) {
    return renderDiagram(diagram, this.context)
  }

}

function renderDiagram(diagram, context) {
  const {layers,
          elementSizeAndPositions,
          globalStyles,
          styles,
          margin,
          x1,
          y1,
          width,
          height,
          debug,
          outputPath} = diagram
  const shapeRenderer = new SvgShapeRenderer(context, styles, outputPath, debug)
  const {renderedData} = shapeRenderer.renderShapeToSvg({
    layers,
    elementSizeAndPositions,
    margin,
  }, true)

  let buf = ''
  buf += '<?xml version="1.0" encoding="UTF-8"?>\n'
  buf += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'

  buf += `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${x1} ${y1} ${width} ${height}" width="${width}" height="${height}" style="background-color: #fff">`

  buf += renderFonts(diagram.fonts, context, outputPath)

  buf += '<style>'
  for (var key of Object.keys(globalStyles)) {
    buf += `${key} { ${globalStyles[key]} }`
  }
  for (var key of Object.keys(styles)) {
    const style = styles[key]
    if (style.val != null) {
      buf += `.${style.name} { ${style.val} }`
    }
  }
  buf += '</style>'

  buf += renderedData

  buf += '</svg>'

  return buf
}

function renderFonts(fonts, context, outputPath) {
  let buf = ''
  if (fonts.length === 0) {
    return buf
  }

  buf += '<defs>'
  buf += '  <style type="text/css">'

  for (var font of fonts) {
    if (font.imports != null) {
      for (var i of font.imports) {
        buf += `@import url("${i.trim()}");`
      }
    } else {
      const url = Util.relativeAbsoluteOrRemoteUrl(font.src, context.basePath, outputPath, context.convertRelativeToAbsolute)
      buf += '@font-face {'
      buf += ` font-family: '${font.family}';`
      buf += ` src: url('${url}');`
      buf += '}'
    }
  }

  buf += '  </style>'
  buf += '</defs>'

  return buf
}
