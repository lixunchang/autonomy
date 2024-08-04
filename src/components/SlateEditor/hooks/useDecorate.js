import { useCallback } from "react"
import { CodeLineType } from "../components/BlockCode"
import {
  Element as SlateElement,
} from 'slate';

const useDecorate = (editor) => {
  return useCallback(
    ([node, path]) => {
      if (SlateElement.isElement(node) && node.type === CodeLineType) {
        const ranges = (editor.nodeToDecorations && editor.nodeToDecorations.get(node)) || []
        return ranges
      }

      return []
    },
    [editor.nodeToDecorations]
  )
}


export default useDecorate;