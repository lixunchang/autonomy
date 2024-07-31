import { css } from '@emotion/css'

const LanguageSelect = (props) => {
  return (
    <select
      data-test-id="language-select"
      contentEditable={false}
      className={css`
        font-size: 12px;
        position: absolute;
        right: 5px;
        top: 5px;
        z-index: 1;
      `}
      {...props}
    >
      <option value="css">CSS</option>
      <option value="html">HTML</option>
      <option value="java">Java</option>
      <option value="javascript">JavaScript</option>
      <option value="jsx">JSX</option>
      <option value="markdown">Markdown</option>
      <option value="php">PHP</option>
      <option value="python">Python</option>
      <option value="sql">SQL</option>
      <option value="tsx">TSX</option>
      <option value="typescript">TypeScript</option>
    </select>
  )
}

export default LanguageSelect;