
import {
  Editor,
  Element as SlateElement,
  Node as SlateNode,
} from 'slate';
import { useSlate } from "slate-react"
import { CodeBlockType } from "./BlockCode"
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-java'

import { normalizeTokens } from '../utils/normalize-tokens'

const mergeMaps = (...maps) => {
  const map = new Map()

  for (const m of maps) {
    for (const item of m) {
      map.set(...item)
    }
  }

  return map
}


const getChildNodeToDecorations = ([
  block,
  blockPath,
]) => {
  const nodeToDecorations = new Map()

  const text = block.children.map(line => SlateNode.string(line)).join('\n')
  const language = block.language
  const tokens = Prism.tokenize(text, Prism.languages[language])
  console.log('lang-token', tokens, blockPath)
  const normalizedTokens = normalizeTokens(tokens) // make tokens flat and grouped by line
  const blockChildren = block.children

  for (let index = 0; index < normalizedTokens.length; index++) {
    const tokens = normalizedTokens[index]
    const element = blockChildren[index]

    if (!nodeToDecorations.has(element)) {
      nodeToDecorations.set(element, [])
    }

    let start = 0
    for (const token of tokens) {
      const length = token.content.length
      if (!length) {
        continue
      }

      const end = start + length

      const path = [...blockPath, index, 0]
      const range = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true,
        ...Object.fromEntries(token.types.map(type => [type, true])),
      }
      console.log('lang-range',  range)
      nodeToDecorations.get(element).push(range)

      start = end
    }
  }

  return nodeToDecorations
}

// precalculate editor.nodeToDecorations map to use it inside decorate function then
const SetNodeToDecorations = () => {
  const editor = useSlate()

  const blockEntries = Array.from(
    Editor.nodes(editor, {
      at: [],
      mode: 'highest',
      match: n => SlateElement.isElement(n) && n.type === CodeBlockType,
    })
  )

  const nodeToDecorations = mergeMaps(
    ...blockEntries.map(getChildNodeToDecorations)
  )

  editor.nodeToDecorations = nodeToDecorations

  return null
}

export default SetNodeToDecorations;