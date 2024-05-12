import { Image } from './images';


export default function formatter(props) {
  const { attributes, children, element } = props;
  const { type, children:ccc, url, style, ...rest} = element;
  const styles = {...style, ...rest};
  console.log('element-type', element, styles)
  switch (element.type) {
    /**
     * 图片
     */
    case 'image':
      return <Image style={styles} {...props} />;
    /**
     * markdown 快捷
     */
    case 'heading-one':
      return <h1 style={styles} {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 style={styles} {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 style={styles} {...attributes}>{children}</h3>;
    case 'heading-four':
      return <h4 style={styles} {...attributes}>{children}</h4>;
    case 'heading-five':
      return <h5 style={styles} {...attributes}>{children}</h5>;
    case 'heading-six':
      return <h6 style={styles} {...attributes}>{children}</h6>;
    case 'bulleted-list':
      return <ul style={styles} {...attributes}>{children}</ul>;
    case 'numbered-list':
      return <ol style={styles} {...attributes}>{children}</ol>;
    case 'list-item':
      return <li style={styles} {...attributes}>{children}</li>;
    case 'block-quote':
      return <blockquote style={styles} {...attributes}>{children}</blockquote>;
    default:
      return <p style={styles} {...attributes}>{children}</p>;
  }
}

export function formatChildren({ attributes, children, leaf }){
  const {text, url, bold, code, italic, underline, ...styles} = leaf;
  if (bold) {
    children = <strong>{children}</strong>
  }

  if (code) {
    children = <code>{children}</code>
  }

  if (italic) {
    children = <em>{children}</em>
  }

  if (underline) {
    children = <u>{children}</u>
  }

  return <span style={styles} {...attributes}>{children}</span>
}
