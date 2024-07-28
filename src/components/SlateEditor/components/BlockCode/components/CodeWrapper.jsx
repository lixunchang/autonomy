
import {
  ReactEditor,
  useSlateStatic,
} from 'slate-react';
import { CodeBlockType, CodeLineType } from '..';
import { css } from '@emotion/css';
import { Transforms } from 'slate'
import LanguageSelect from './LanguageSelect';

const CodeWrapper = (props) => {
  const { attributes, children, element } = props;
  const editor = useSlateStatic()

  if (element.type === CodeBlockType) {
    const setLanguage = (language) => {
      const path = ReactEditor.findPath(editor, element)
      Transforms.setNodes(editor, { language }, { at: path })
    }

    return (
      <div
        {...attributes}
        className={css(`
        font-family: monospace;
        font-size: 16px;
        line-height: 20px;
        margin-top: 0;
        background: rgba(0, 20, 60, .03);
        padding: 5px 13px;
      `)}
        style={{ position: 'relative' }}
        spellCheck={false}
      >
        <LanguageSelect
          value={element.language}
          onChange={e => setLanguage(e.target.value)}
        />
        {children}
      </div>
    )
  }

  if (element.type === CodeLineType) {
    return (
      <div {...attributes} style={{ position: 'relative' }}>
        {children}
      </div>
    )
  }

  const Tag = editor.isInline(element) ? 'span' : 'div'
  return (
    <Tag {...attributes} style={{ position: 'relative' }}>
      {children}
    </Tag>
  )
}


export default CodeWrapper;