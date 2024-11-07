
import { serialize } from 'remark-slate';

export const slateToMarkdown=(value)=>{

  return JSON.parse(value||'[]').map((v) => serialize(v)).join('')
}