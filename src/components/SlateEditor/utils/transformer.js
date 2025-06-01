import { serialize } from 'remark-slate';

export const slateToMarkdown = (slateValue) => {
  let nodes = slateValue;
  if(typeof slateValue === 'string') {
    // If the input is a string, return it as is
    try {  
      nodes = JSON.parse(slateValue);
    } catch (error) {
      console.error('Error parsing slateValue:', error);
      nodes = []; // Return the original string if parsing fails
    }
  }
  console.log('slateToMarkdown nodes:', nodes, typeof slateValue === 'string');
  return nodes.map(node => {
    switch (node.type) {
      case 'paragraph':
        return node.children.map(n => n.text).join('') + '\n';
      case 'heading-one':
        return `# ${node.children.map(n => n.text).join('')}\n`;
      case 'heading-two':
        return `## ${node.children.map(n => n.text).join('')}\n`;
      case 'heading-three':
        return `### ${node.children.map(n => n.text).join('')}\n`;
      case 'heading-four':
        return `#### ${node.children.map(n => n.text).join('')}\n`;
      case 'heading-five':
        return `##### ${node.children.map(n => n.text).join('')}\n`;
      case 'heading-six':
        return `###### ${node.children.map(n => n.text).join('')}\n`;
      
      case 'block-quote':
        return `> ${node.children.map(n => n.text).join('')}\n`;
      
      case 'code-block':
        const language = node.language || '';
        const code = node.children.map(line => line.children&&line.children[0]?.text || '').join('\n');
        return `\`\`\`${language}\n${code}\n\`\`\`\n`;
      
      case 'numbered-list':
        return node.children.map((item, i) => 
          `${i + 1}. ${item.children&&item.children.map(n => n.text).join('')}`
        ).join('\n') + '\n';
      
      case 'bulleted-list':
        return node.children.map(item =>
          `- ${item.children&&item.children.map(n => n.text).join('')}`
        ).join('\n') + '\n';

      case 'check-list':
        console.log('check-list node:', node);
        return node.children.map(item =>
          `- [${item.checked ? 'x' : ' '}] ${item.children&&item.children.map(n => n.text).join('')}`
        ).join('\n') + '\n';

      case 'image':
        return `![${node.alt || ''}](${node.url})\n`;
      
      case 'table':
        const rows = node.children || [];
        return rows.map((row, i) => {
          const cells = row.children || [];
          const line = cells.map(cell => cell.children[0]?.text || '').join(' | ');
          if (i === 0) {
            const separator = cells.map(() => '---').join(' | ');
            return `| ${line} |\n| ${separator} |`;
          }
          return `| ${line} |`;
        }).join('\n') + '\n';

      default:
        return node.children?.map(n => n.text).join('') + '\n';
    }
  }).join('');
};