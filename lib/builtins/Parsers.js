const C = require('../Const')

addListener(C.notificationParserInitialized, parserInitialized)

registerParser(C.circle, parserCircle)
registerParser(C.ellipse, parserEllipse)
registerParser(C.line, parserLine)
registerParser(C.rect, parserRect)
registerParser(C.polygon, parserPolygon)
registerParser(C.text, parserText)
registerParser(C.path, parserPath)
registerParser(C.image, parserImage)
registerParser(C.shape, parserShape)

function parserInitialized(spec) {
  spec.globalStyles = {
    'text': 'font: 12px sans-serif;',
    'rect': 'fill: none',
    'ellipse': 'fill: none',
    '.-pln-diagram-at': 'dominant-baseline: hanging;',
    '.-pln-diagram-am': 'dominant-baseline: middle;',
    '.-pln-diagram-ab': 'dominant-baseline: alphabetic;',
    '.-pln-diagram-al': 'text-anchor: start;',
    '.-pln-diagram-ac': 'text-anchor: middle;',
    '.-pln-diagram-ar': 'text-anchor: end;',
  }
}

function parserCircle(line, inputFile, variables) {
  const {key, tokens} = parseKeyContent(line, inputFile, 1, variables)
  const r = fillOrFloat(tokens[0], inputFile)
  return {
    key: key,
    type: C.ellipse,
    width: r * 2,
    height: r * 2,
  }
}

function parserEllipse(line, inputFile, variables) {
  const {key, tokens} = parseKeyContent(line, inputFile, 2, variables)
  const params = {}
  const rx = fillOrFloat(Util.extractParams(tokens[0], params, 'fillWidth'), inputFile, true)
  let width
  if (rx === 'fill') {
    width = 'fill'
  } else {
    width = rx * 2
  }
  const ry = fillOrFloat(Util.extractParams(tokens[1], params, 'fillHeight'), inputFile, true)
  let height
  if (ry === 'fill') {
    height = 'fill'
  } else {
    height = ry * 2
  }
  return {
    key,
    type: C.ellipse,
    width,
    height,
    params,
  }
}

function parserLine(line, inputFile, variables) {
  const {key, tokens} = parseKeyContent(line, inputFile, 2, variables, true)
  const params = {}
  return {
    key,
    type: C.line,
    width: fillOrFloat(Util.extractParams(tokens[0], params, 'fillWidth'), inputFile, true),
    height: fillOrFloat(Util.extractParams(tokens[1], params, 'fillHeight'), inputFile, true),
    params
  }
}

function parserRect(line, inputFile, variables) {
  const {key, tokens} = parseKeyContent(line, inputFile, 2, variables, true)
  const params = {}
  return {
    key,
    type: C.rect,
    width: fillOrFloat(Util.extractParams(tokens[0], params, 'fillWidth'), inputFile, true),
    height: fillOrFloat(Util.extractParams(tokens[1], params, 'fillHeight'), inputFile, true),
    params
  }
}

function parserText(line, inputFile, variables, settings) {
  const {key, tokens, contentLines, content} = parseKeyContent(line, inputFile, 3, variables)

  const params = {}

  let width = settings['text-width']
  let height = settings['text-height']
  if (tokens[0] !== undefined
      && tokens[1] !== undefined
      && (!isNaN(tokens[0]) || tokens[0] === 'fill')
      && (!isNaN(tokens[1]) || tokens[1] === 'fill')) {
    width = fillOrFloat(Util.extractParams(tokens[0], params, 'fillWidth'), inputFile, true)
    height = fillOrFloat(Util.extractParams(tokens[1], params, 'fillHeight'), inputFile, true)
    let firstLineArr = contentLines[0].split(' ')
    let count = 0
    while (true) {
      // Remove the size tokens from contentLines
      let token = firstLineArr.shift()
      if (token != '') {
        count++
      }
      if (count === 2) {
        break
      }
    }
    contentLines[0] = firstLineArr.join(' ')
  }
  return {
    key,
    type: C.text,
    width: width,
    height: height,
    params,
    text: contentLines,
  }
}

function parserPolygon(line, inputFile, variables) {
  const {key, tokens, content} = parseKeyContent(line, inputFile, 0, variables)

  let points = []
  let maxX = 0
  let maxY = 0
  for (var coord of content.split(/[ \t]+/)) {
    let ca = coord.split(',')
    ca[0] = parseFloat(ca[0])
    ca[1] = parseFloat(ca[1])
    if (isNaN(ca[0]) || isNaN(ca[1])) {
      inputFile.userError(`Invalid coords: ${coord}`)
    }
    points.push(ca)
    if (ca[0] > maxX) {
      maxX = ca[0]
    }
    if (ca[1] > maxY) {
      maxY = ca[1]
    }
  }

  const width = maxX
  const height = maxY

  return {
    key,
    type: C.polygon,
    width,
    height,
    points,
  }
}

function parserPath(line, inputFile, variables) {
  const {key, tokens, content} = parseKeyContent(line, inputFile, 2, variables)

  const params = {}
  const width = fillOrFloat(Util.extractParams(tokens[0], params, 'fillWidth'), inputFile, true)
  const height = fillOrFloat(Util.extractParams(tokens[1], params, 'fillHeight'), inputFile, true)

  return {
    key,
    type: C.path,
    width,
    height,
    path: content,
    params
  }
}

function parserImage(line, inputFile, variables) {
  const {key, tokens} = parseKeyContent(line, inputFile, 3, variables)
  const params = {}
  return {
    key,
    type: C.image,
    width: fillOrFloat(Util.extractParams(tokens[0], params, 'fillWidth'), inputFile, true),
    height: fillOrFloat(Util.extractParams(tokens[1], params, 'fillHeight'), inputFile, true),
    url: tokens[2],
    params
  }
}

function parserShape(line, inputFile, variables) {
  const {key, tokens} = parseKeyContent(line, inputFile, 3, variables, true)
  const params = {}
  const shape = Util.extractParams(tokens[0], params, 'shape')
  return {
    key,
    type: C.shape,
    shape: shape,
    width: fillOrFloat(Util.extractParams(tokens[1], params, 'fillWidth'), inputFile, true, null),
    height: fillOrFloat(Util.extractParams(tokens[2], params, 'fillHeight'), inputFile, true, null),
    params,
    layout: null, // Will be filled in by the ShapeParser
  }
}
